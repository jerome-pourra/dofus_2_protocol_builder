import { Indent } from "../functions";
import { TranslatorCast, TranslatorTypes } from "./TranslatorTypes";

export class ByteBoxes {

    public content: string;

    constructor(content: string) {
        this.content = content;
        this.translateContent();
    }

    public translateContent() {
        let regexp = new RegExp(/var\s+([A-Za-z0-9_]+)\s*:\s*([A-Za-z0-9_]+)\s*=\s*([^;]+)/g);
        this.content = this.content.replace(regexp, (match, vName, vType, vValue) => {

            // Remplacement des uint|int|number(xyz) par xyz
            let regexpCast = new RegExp(`(${TranslatorCast.RegexpList()})\\((.+?)\\)`, "g");
            vValue = vValue.replace(regexpCast, (match: string, vType: string, vValue: string) => {
                return vValue;
            });

			return "let " + vName + ": " + TranslatorTypes.FromName(vType) + " = " + vValue;

        });
        this.content = Indent(this.content, 2);
    }

}