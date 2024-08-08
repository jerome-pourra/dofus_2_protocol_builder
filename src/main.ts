import fs from "fs";
import { Translator } from "./translator/Translator";
import { TranslatorTypes } from "./translator/TranslatorTypes";
import { FilesBrowser } from "./FilesBrowser";
import { BASE_DIR_AS, BASE_DIR_TS, E_DIR_TYPES, MESSAGE_LIST, TYPES_LIST } from "./constants";
import { Writter } from "./translator/Writter";
import { GetRelativePath } from "./functions";
import { ExtractTypeEnum, ProtocolExtractor } from "./ProtocolExtractor";

// TODO a refacto
let extractMessages = ProtocolExtractor.extract(
    ProtocolExtractor.getContent(BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/MessageReceiver.as"), 
    ExtractTypeEnum.MESSAGES
);

let extractProtocol = ProtocolExtractor.extract(
    ProtocolExtractor.getContent(BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/ProtocolTypeManager.as"),
    ExtractTypeEnum.TYPES
);

let filesBrowser = new FilesBrowser();
let filesList = filesBrowser.browseDirectory(BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/");

filesList.forEach(file => {

    let translator = null;

    if (file.type == E_DIR_TYPES.MESSAGES) {
        translator = new Translator(file, extractMessages)
    } else if (file.type == E_DIR_TYPES.TYPES) {
        translator = new Translator(file, extractProtocol)
    }

    let writter = new Writter(translator);
    writter.build();
    writter.write();
    
    if (file.type == E_DIR_TYPES.MESSAGES) {
        MESSAGE_LIST.push({ id: translator.protocol, class: translator.class, path: file.dir + "/" + file.name });
    } else if (file.type == E_DIR_TYPES.TYPES) {
        TYPES_LIST.push({ id: translator.protocol, class: translator.class, path: file.dir + "/" + file.name });
    }

    // console.log(translator.toJSON());

});

// console.log("Message list : ", MESSAGE_LIST);
// console.log("Protocol list : ", TYPES_LIST);
console.log("Unknown types : ", TranslatorTypes.Undefined);

const TEMPLATES_INFOS = [
	{name: "MessageReceiver.ts", path: "src/templates/MessageReceiver.ts", associated: MESSAGE_LIST},
	{name: "ProtocolTypeManager.ts", path: "src/templates/ProtocolTypeManager.ts", associated: TYPES_LIST},
];

TEMPLATES_INFOS.forEach(templateInfos => {

	let content = fs.readFileSync(templateInfos.path, "utf-8");
	let replaceImports: Array<string> = new Array<string>();
	let replaceIds: Array<string> = new Array<string>();

	templateInfos.associated.forEach(data => {
		let importFrom = GetRelativePath("__exported/scripts/com/ankamagames/dofus/network", data.path);
		replaceImports.push(`import { ${data.class} } from "${importFrom}";`);
		replaceIds.push(`\t\tthis._types[${data.id}] = ${data.class};`);
	});

	content = content.replace(/"__IMPORTS__"/, replaceImports.join("\n"));
	content = content.replace(/"__IDS__"/, replaceIds.join("\n"));
	
	if (!fs.existsSync(BASE_DIR_TS + "/scripts/com/ankamagames/dofus/network")) {
		fs.mkdirSync(BASE_DIR_TS + "/scripts/com/ankamagames/dofus/network", { recursive: true });
	}
	fs.writeFileSync(BASE_DIR_TS + "/scripts/com/ankamagames/dofus/network/" + templateInfos.name, content);

});