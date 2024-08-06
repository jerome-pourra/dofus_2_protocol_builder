import fs from "fs";
import { TranslatorTypes } from "./TranslatorTypes";
import { Deserializer } from "./Deserializer";
import { GetBracketContent, GetRelativePath, Indent } from "../functions";
import { Constructor } from "./Constructor";
import { ByteBoxes } from "./ByteBoxes";
import { BASE_DIR_AS, INCLUDE_IMPORTS } from "../constants";
import { TBrowserFileData } from "../FilesBrowser";
import path from "path";
import { Initializer } from "./Initializer";
import { Serializer } from "./Serializer";

export type TypePublicVar = { name: string, type?: string, typeVector?: string, subTypeVector?: string, value?: string };
export type TypeImport = { class: string, pathList: Array<string> };

export class Translator extends TranslatorTypes {

	public fileData: TBrowserFileData;
	public content: string;

	public useTypes: Array<string> = Array<string>();
	public importList: Array<TypeImport> = Array<TypeImport>();
	public class: string;
	public extends: string;
	public implements: Array<string>;
	public protocol: string;
	public varList: Array<TypePublicVar> = [];
	public construct: Constructor;
    public pack?: string;
    public unpack?: string;
    public initializer?: Initializer;
    public serializer?: Serializer;
	public deserializer: Deserializer;
	public byteBoxes: ByteBoxes;

	public constructor(fileData: TBrowserFileData) {

		super();
		this.fileData = fileData;
		this.content = fs.readFileSync(this.fileData.fullpath, "utf-8");

		this.setImports();
		this.setSpecialImports();
		this.setInfos();
		this.setProtocol();
		this.setVarList();
		this.setConstructor();
        this.setInitializer();
        // this.setPack();
        this.setUnpack();
        // this.setSerializeAs();
		this.setDeserializeAs();
		this.setDeserializeByteBoxes();

	}

	public setImports() {

		let regexp = new RegExp(/import\s+(com\.ankamagames\.dofus\.network\.(?:types|messages|enums)\.[\.A-Za-z0-9]+)/g);
		let matches = regexp.exec(this.content);

		while (matches !== null) {

			if (matches.length === 2) {

				let pathList = matches[1].split(".");
				let className = pathList[pathList.length - 1];

				this.importList.push({
					class: className,
					pathList: pathList
				});

			}

			matches = regexp.exec(this.content);

		}

	}

	public setSpecialImports() {

		let regexp = new RegExp("import\\s+[\\.A-Za-z0-9]*\\.(" + INCLUDE_IMPORTS.join("|") + ")\\s*;", "g");
		let matches = regexp.exec(this.content);

		while (matches !== null) {

			let className = matches[1];

			this.importList.push({
				class: className,
				pathList: [className]
			});

			matches = regexp.exec(this.content);

		}

	}

	public addImport(className: string, pathList: Array<string> = []) {
		this.importList.push({
			class: className,
			pathList: pathList,
		});
	}

	public isImported(className: string): boolean {
		for (let i = 0; i < this.importList.length; i++) {
			let importItem = this.importList[i];
			if (importItem.class === className) {
				return true;
			}
		}
		return false;
	}

	public setInfos() {

		let regexp = new RegExp(/(class|extends|implements)\s+([A-Za-z0-9]+)/g);
		let matches = regexp.exec(this.content);

		while (matches !== null) {

			if (matches.length === 3) {
				switch (matches[1]) {
					case "class":
						this.class = matches[2];
						break;
					case "extends":
						this.extends = matches[2];
						this.addUseType(this.extends);
						break;
					case "implements":
                        this.implements = matches[2].split(",").map((implement: string) => {
                            return implement.trim();
                        });
						break;
				}
			}

			matches = regexp.exec(this.content);

		}

	}

	public setProtocol() {

		let regexp = new RegExp(/protocolId\D+([0-9]+)/);
		let matches = regexp.exec(this.content);

		if (matches !== null) {
			this.protocol = matches[1];
		} else {
			console.error("ProtocolTranslator.setProtocol() -> le protocolId n'a pas été trouvé fichier:" + this.fileData.fullpath);
		}

	}

	public setVarList() {

		let regexp = new RegExp(/public\s+var\s+([A-Za-z0-9_]+)\s*:\s*(?:(Vector)\.<([A-z0-9]+)>|([A-Za-z0-9]+))(?:\s*=\s*(["'A-Za-z0-9]+))?/g);
		let matches = regexp.exec(this.content);

		while (matches !== null) {

			let name = matches[1];
			let dirname = path.posix.dirname(this.fileData.fullpath).replace(BASE_DIR_AS + "/scripts/", "").split("/");

			let typeVector = TranslatorTypes.FromName(matches[2]);
			if (!TranslatorTypes.IsLastTypeKnown()) {
				if (!this.isImported(typeVector)) {
					this.addImport(typeVector, [...dirname, typeVector]);
				}
			}

			let subTypeVector = TranslatorTypes.FromName(matches[3]);
			if (!TranslatorTypes.IsLastTypeKnown()) {
				if (!this.isImported(subTypeVector)) {
					this.addImport(subTypeVector, [...dirname, subTypeVector]);
				}
			}

			let type = TranslatorTypes.FromName(matches[4]);
			if (!TranslatorTypes.IsLastTypeKnown()) {
				if (!this.isImported(type)) {
					this.addImport(type, [...dirname, type]);
				}
			}

			let publicVar: TypePublicVar = {
				name: matches[1],
				typeVector: TranslatorTypes.FromName(matches[2]),
				subTypeVector: TranslatorTypes.FromName(matches[3]),
				type: TranslatorTypes.FromName(matches[4]),
				value: matches[5],
			};

			this.varList.push(publicVar);
			matches = regexp.exec(this.content);

		}

	}

	public setConstructor() {

		let regexp = new RegExp(`public\\s+function\\s+${this.class}`);
		let matches = regexp.exec(this.content);

		if (matches !== null) {
			let content = GetBracketContent(this.content, matches.index);
			this.construct = new Constructor(content, this);
		} else {
			console.error("ProtocolTranslator.setConstructor() -> aucun constructeur n'a été trouvé fichier:" + this.fileData.fullpath);
		}

	}

    public setSerializeAs() {

        let regexp = new RegExp(`public\\s+function\\s+serializeAs_${this.class}`, "g");
		let matches = regexp.exec(this.content);

		if (matches !== null) {
			let content = GetBracketContent(this.content, matches.index);
			this.serializer = new Serializer(content, this);
		} else {
			console.error("ProtocolTranslator.setSerializeAs() -> aucune méthode de sérialization n'a été trouvé fichier:" + this.fileData.fullpath);
		}

    }

	public setDeserializeAs() {

		let regexp = new RegExp(`public\\s+function\\s+deserializeAs_${this.class}`, "g");
		let matches = regexp.exec(this.content);

		if (matches !== null) {
			let content = GetBracketContent(this.content, matches.index);
			this.deserializer = new Deserializer(content, this);
		} else {
			console.error("ProtocolTranslator.setDeserializeAs() -> aucune méthode de désérialization n'a été trouvé fichier:" + this.fileData.fullpath);
		}

	}

	public setDeserializeByteBoxes() {

		let regexp = new RegExp(/private\s+function\s+deserializeByteBoxes/);
		let matches = regexp.exec(this.content);

		if (matches !== null) {
			let content = GetBracketContent(this.content, matches.index);
			this.byteBoxes = new ByteBoxes(content);
		}

	}

    public setPack() {

        let regexp = new RegExp(/override\s+public\s+function\s+pack/);
        let matches = regexp.exec(this.content);

        if (matches !== null) {
            let content = GetBracketContent(this.content, matches.index);
            this.pack = Indent(content, 2);
        }

    }

    public setUnpack() {

        let regexp = new RegExp(/override\s+public\s+function\s+unpack/);
        let matches = regexp.exec(this.content);

        if (matches !== null) {
            let content = GetBracketContent(this.content, matches.index);
            this.unpack = Indent(content, 2);
        }

    }

    public setInitializer() {

        let regexp = new RegExp(`public\\s+function\\s+init${this.class}\\((.*)\\)\\s*:\\s${this.class}`, "g");
		let matches = regexp.exec(this.content);
        // console.log(matches[1]);
        

		if (matches !== null) {
			let content = GetBracketContent(this.content, matches.index);
			this.initializer = new Initializer(matches[1], content, this);
            // console.log(this.initializer);
            
		} else {
			console.error("ProtocolTranslator.setInitializer() -> aucune méthode d'initialisation n'a été trouvé fichier:" + this.fileData.fullpath);
		}

    }

	public addUseType(type: string) {
		if (!this.useTypes.includes(type)) {
			this.useTypes.push(type);
		}
	}

	public toJSON() {
		return JSON.stringify({
			file: this.fileData.fullpath,
			class: this.class,
			extends: this.extends,
			implements: this.implements,
			protocol: this.protocol,
			importList: this.importList,
			varList: this.varList,
			internalMethods: this.deserializer.internalMethods
		}, null, 2);
	}

}