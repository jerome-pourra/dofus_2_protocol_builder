import { Translator } from "./translator/Translator";
import { TranslatorTypes } from "./translator/TranslatorTypes";
import { FilesBrowser } from "./FilesBrowser";
import { BASE_DIR_AS, BASE_DIR_TS, E_DIR_TYPES, INCLUDE_IMPORTS_PATH, MESSAGE_LIST, TYPES_LIST } from "./constants";
import { Writter } from "./translator/Writter";
import path from "path";
import { GetRelativePath } from "./functions";
import fs from "fs";

// let base = BASE_DIR_AS + "/scripts/"
// let fullBaseFrom = base + "com/ankamagames/dofus/network/types/game/achievement/AchievementStartedObjective.as";
// let fullBaseTo = base + "com/ankamagames/dofus/network/types/game/achievement/Blabla.ts";

// // let dir = path.dirname(base + "com/ankamagames/dofus/network/types/game/achievement/AchievementStartedObjective.as");
// let rel = GetRelativePath(fullBaseFrom, fullBaseTo);
// console.log(rel);

// let relPath = GetRelativePath(BASE_DIR_NORMALIZED + "/scripts/com/ankamagames/dofus/network/types/game/achievement/AchievementStartedObjective.as", INCLUDE_IMPORTS_PATH.INetworkMessage);
// console.log(relPath);
// new FilesBrowser().browseDirectory(BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/messages/common/basic");
// process.exit();


// __imported/scripts/com/ankamagames/dofus/network/messages/game/alliance/summary/AllianceSummaryRequestMessage.ts

let filesBrowser = new FilesBrowser();
// let filesList = filesBrowser.browseDirectory(BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/messages/security");
// let filesList = filesBrowser.browseDirectory(BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/messages/common/basic");
let filesList = filesBrowser.browseDirectory(BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/");

filesList.forEach(file => {

    let translator = new Translator(file);
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

console.log("Message list : ", MESSAGE_LIST);
console.log("Protocol list : ", TYPES_LIST);
console.log("Unknown types : ", TranslatorTypes.Undefined);

const TEMPLATES_INFOS = [
	{name: "MessageReceiver.ts", path: "src/templates/MessageReceiver.ts", associated: MESSAGE_LIST},
	{name: "ProtocolTypeManager.ts", path: "src/templates/ProtocolTypeManager.ts", associated: TYPES_LIST},
];

TEMPLATES_INFOS.forEach(templateInfos => {

	let content = fs.readFileSync(templateInfos.path, "utf-8");
	let replaceIMPORTS = "";
	let replaceIDS = "";

	templateInfos.associated.forEach(data => {
		let importFrom = GetRelativePath("__exported/scripts/com/ankamagames/dofus/network", data.path);
		replaceIMPORTS += `import { ${data.class} } from "${importFrom}";\n`;
		replaceIDS += `\t\tthis._types[${data.id}] = ${data.class};\n`;
	});

	content = content.replace(/"__IMPORTS__"/, replaceIMPORTS);
	content = content.replace(/"__IDS__"/, replaceIDS);
	// console.log(content, replaceIMPORTS, replaceIDS);
	
	if (!fs.existsSync(BASE_DIR_TS + "/scripts/com/ankamagames/dofus/network")) {
		fs.mkdirSync(BASE_DIR_TS + "/scripts/com/ankamagames/dofus/network", { recursive: true });
	}
	fs.writeFileSync(BASE_DIR_TS + "/scripts/com/ankamagames/dofus/network/" + templateInfos.name, content);

});