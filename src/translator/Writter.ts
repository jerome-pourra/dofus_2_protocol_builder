import fs from "fs";
import { Translator, TypePublicVar } from "./Translator";
import { GetRelativePath } from "../functions";
import { BASE_DIR_AS, BASE_DIR_TS, E_DIR_TYPES, INCLUDE_IMPORTS_PATH } from "../constants";

export class Writter {

    public content: string;
    public translator: Translator;

    constructor(translator: Translator) {
        this.content = "";
        this.translator = translator;
    }

    public build() {
        this.content += this.buildImports();
        this.content += this.buildClass();
    }

    public write() {

        let writePath = this.translator.fileData.fullpath.replace(BASE_DIR_AS, BASE_DIR_TS).replace(".as", ".ts");
        let splitPath = writePath.split("/");
        let splitDirectory = splitPath.slice(0, splitPath.length - 1);
        let writeDirectory = splitDirectory.join("/");

        if (!fs.existsSync(writeDirectory)) {
            fs.mkdirSync(writeDirectory, { recursive: true });
        }
        fs.writeFileSync(writePath, this.content);

    }

    private buildImports() {
        let foundExtends = false;
        let content = "";
        if (this.translator.importList.length > 0) {
            this.translator.importList.forEach(importItem => {
                if (this.translator.extends === importItem.class) {
                    foundExtends = true;
                }
                let className = importItem.class;
                let toFullPath = BASE_DIR_AS + "/scripts/" + importItem.pathList.join("/");
                if (className in INCLUDE_IMPORTS_PATH) {
                    toFullPath = BASE_DIR_AS + "/scripts/" + INCLUDE_IMPORTS_PATH[className] + className;
                } else {
                    // console.log("To:", toFullPath);
                }
                let fromFullPath = this.translator.fileData.fullpath;
                let relativePath = GetRelativePath(fromFullPath, toFullPath);
                // console.log("From:", fromFullPath, "To:", toFullPath, "Relative:", relativePath);
                
                content += `import { ${className} } from "${relativePath}";\n`;
            });
        }

        if (this.translator.extends && !foundExtends) {
            content += `import { ${this.translator.extends} } from "./${this.translator.extends}";\n`;
        }

        content += "\n";
        return content;
    }

    private buildClass() {
        let content = "";
        content += `${this.buildClassInfos()}`;
        content += `${this.buildProtocol()}`;
        content += `${this.buildVarList()}`;
        content += `${this.buildConstructor()}`;
        content += `${this.buildInitializer()}`;
        content += `${this.buildPack()}`;
        content += `${this.buildUnpack()}`;
        content += `${this.buildDeserialize()}`;
        content += `${this.buildDeserializeByteBoxes()}`;
        content += `${this.buildDeserializeAsClass()}`;
        content += `${this.buildInternalMethods()}`;
        content += `}`;
        return content;
    }

    private buildClassInfos() {
        let content = "";
        content += `export class ${this.translator.class}`;
        content += this.translator.extends ? ` extends ${this.translator.extends}` : ``;
        content += `\n`;
        content += `{\n`;
        content += `\n`;
        return content;
    }

    private buildProtocol() {
        let content = "";
        if (this.translator.protocol) {
            content += `\tpublic static readonly protocolId: number = ${this.translator.protocol};\n`;
            content += `\n`;
        }
        return content;
    }

    private buildVarList() {
        let content = "";
        if (this.translator.varList.length > 0) {
            this.translator.varList.forEach(varInfo => {
                if (varInfo.type) {
                    content += "\t" + this.buildVarType(varInfo);
                } else if (varInfo.typeVector) {
                    content += "\t" + this.buildVarTypeVector(varInfo);
                } else {
                    content += "\t" + this.buildVarNoType(varInfo);
                }
            });
            content += `\n`;
        }
        return content;
    }

    private buildVarNoType(varInfo: TypePublicVar) {
        let content = `public ${varInfo.name}`;
        if (varInfo.value) content += ` = ${varInfo.value}`;
        content += ";\n";
        return content;
    }

    private buildVarType(varInfo: TypePublicVar) {
        let content = `public ${varInfo.name}`;
        content += `: ${varInfo.type}`;
        if (varInfo.value) content += ` = ${varInfo.value}`;
        content += ";\n";
        return content;
    }

    private buildVarTypeVector(varInfo: TypePublicVar) {
        let content = `public ${varInfo.name}: ${varInfo.typeVector}`;
        // content += `: ${varInfo.typeVector}`;
        if (varInfo.subTypeVector) content += `<${varInfo.subTypeVector}>`;
        else content += `<any>`;
        if (varInfo.value) content += ` = ${varInfo.value}`;
        content += ";\n";
        return content;
    }

    private buildConstructor() {
        let content = "";
        content += `    public constructor()\n`;
        content += `    {\n`;
        content += `${this.translator.construct.content ?? ""}\n`;
        content += `    }\n`;
        content += `\n`;
        return content;
    }

    private buildInitializer() {
        let content = "";
        content += `    ${this.translator.initializer.method}\n`;
        content += `    {\n`;
        content += `${this.translator.initializer.content ?? ""}\n`;
        content += `    }\n`;
        content += `\n`;
        return content
    }

    private buildPack() {
        let content = "";
        if (this.translator.fileData.type == E_DIR_TYPES.MESSAGES) {
            content += `    public override pack(output: ICustomDataOutput)\n`;
            content += `    {\n`;
            content += `${this.translator.pack ?? ""}\n`;
            content += `    }\n`;
            content += `\n`;
        }
        return content;
    }

    private buildUnpack() {
        let content = "";
        if (this.translator.fileData.type == E_DIR_TYPES.MESSAGES) {
            content += `    public override unpack(input: ICustomDataInput, length: number)\n`;
            content += `    {\n`;
            content += `${this.translator.unpack ?? ""}\n`;
            content += `    }\n`;
            content += `\n`;
        }
        return content;
    }

    private buildDeserialize() {
        let content = "";
        content += `    public deserialize(input: ICustomDataInput)\n`;
        content += `    {\n`;
        content += `        this.deserializeAs_${this.translator.class}(input);\n`;
        content += `    }\n`;
        content += `\n`;
        return content;
    }

    private buildDeserializeByteBoxes() {
		let content = "";
		if (this.translator.byteBoxes) {
			content += `    public deserializeByteBoxes(input: ICustomDataInput)\n`;
			content += `    {\n`;
            content += `${this.translator.byteBoxes.content ?? ""}\n`;
			content += `    }\n`;
			content += `\n`;
		}
        return content;
    }

    private buildDeserializeAsClass() {
        let content = "";
        content += `    private deserializeAs_${this.translator.class}(input: ICustomDataInput)\n`;
        content += `    {\n`;
        content += `${this.translator.deserializer.content ?? ""}\n`;
        content += `    }\n`;
        content += `\n`;
        return content;
    }

    private buildInternalMethods() {

        let internalMethods = this.translator.deserializer.internalMethods;
        let internalMethodsCount = Object.keys(internalMethods).length;

        if (internalMethodsCount > 0) {
            let contentList: Array<string> = [];
            for (const methodName in internalMethods) {
                const methodContent = internalMethods[methodName];
                let content = "";
                content += `    private ${methodName}(input: ICustomDataInput)\n`;
                content += `    {\n`;
                content += `${methodContent}\n`;
                content += `    }`;
                contentList.push(content);
            }
            return contentList.join("\n\n") + "\n\n";
        }

        return "";

    }

}