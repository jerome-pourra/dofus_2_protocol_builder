import { TranslatorCast, TranslatorTypes } from "./TranslatorTypes";
import { GetBracketContent, Indent } from "../functions";
import { Translator } from "./Translator";

export class Deserializer {

    public content: string;
    public translator: Translator;
    public internalMethods: Array<{ [key: string]: string }> = [];

    constructor(content: string, translator: Translator) {
        this.content = content;
        this.translator = translator;
        this.setInternalMethods();
        this.translateVars();
    }

    public setInternalMethods() {

        let regexp = new RegExp(/this\.(_[A-Za-z0-9]+)\(input\)/g);
        let matches = regexp.exec(this.content);

        while (matches !== null) {
            this.setInternalMethodContent(matches[1]);
            matches = regexp.exec(this.content);
        }

    }

    private setInternalMethodContent(method: string) {

        let regexp = new RegExp(`private\\s+function\\s+${method}`, "g");
        let matches = regexp.exec(this.translator.content);

        if (matches !== null) {
            let content = GetBracketContent(this.translator.content, matches.index);
            content = Indent(content, 2);
            this.internalMethods[method] = content;
        } else {
            console.error("ProtocolTranslator.setInternalMethodContent() -> aucune méthode:" + method + " n'a été trouvé fichier:" + this.translator.fileData.fullpath);
        }

    }

    public translateVars() {

        // Remplacement des var par let et ajout du type
        let regexp = new RegExp(/var\s+([A-Za-z0-9_]+)\s*:\s*([A-Za-z0-9_]+)\s*=\s*([^;]+)/g);
        this.content = this.content.replace(regexp, (match: string, vName: string, vType: string, vValue: string) => {

            if (vValue === "null") {
                return "let " + vName + ": " + TranslatorTypes.FromName(vType);
            } else {

                // Remplacement des uint|int|number(xyz) par xyz
                let regexpCast = new RegExp(`(${TranslatorCast.RegexpList()})\\((.+?)\\)`, "g");
                vValue = vValue.replace(regexpCast, (match: string, vType: string, vValue: string) => {
                    return vValue;
                });

                return "let " + vName + ": " + TranslatorTypes.FromName(vType) + " = " + vValue;
            }

        });

        // Remplacement des uint|int|number(xyz) par xyz
        let regexpCast = new RegExp(`(${TranslatorCast.RegexpList()})\\((.+?)\\)`, "g");
        this.content = this.content.replace(regexpCast, (match: string, vType: string, vValue: string) => {
            return vValue;
        });

        this.content = Indent(this.content, 2);

    }

}