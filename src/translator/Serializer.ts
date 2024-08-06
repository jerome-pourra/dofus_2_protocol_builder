import { TranslatorCast, TranslatorTypes } from "./TranslatorTypes";
import { GetBracketContent, Indent } from "../functions";
import { Translator } from "./Translator";

export class Serializer {

    public content: string;
    public translator: Translator;

    constructor(content: string, translator: Translator) {
        this.content = content;
        this.translator = translator;
        this.translateVars();
    }

    public translateVars() {

        // Remplacement des uint|int|number(xyz) par xyz
        let regexpCast1 = new RegExp(`:\s*(${TranslatorCast.RegexpList()})`, "g");
        this.content = this.content.replace(regexpCast1, (match: string, vType: string, vValue: string) => {
            // Know import ?
            return ": " + TranslatorTypes.FromName(vType);
        });

        let regexpCast = new RegExp(`(${TranslatorCast.RegexpList()})\\((.+?)\\)`, "g");
        this.content = this.content.replace(regexpCast, (match: string, vType: string, vValue: string) => {
            return vValue;
        });

        this.content = Indent(this.content, 2);

    }

}