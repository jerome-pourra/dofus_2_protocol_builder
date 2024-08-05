import path from "path";
import { BASE_DIR_AS } from "../constants";
import { Indent } from "../functions";
import { Translator } from "./Translator";
import { TranslatorCast, TranslatorTypes } from "./TranslatorTypes";

export class Initializer {

    public method: string;
    public content: string;
    public translator: Translator;

    public constructor(method: string, content: string, translator: Translator) {
        this.method = method;
        this.content = content;
        this.translator = translator;
        this.translateMethod();
        this.translateVars();
    }

    private translateMethod() {
        // (filenameHash:String = "", type:uint = 0, value:String = "")
        let regexp = new RegExp(/(\w+)\s*:\s*(Vector).<(\w+)>\s*=\s*([^,\)]+)|(\w+)\s*:\s*(\w+)\s*=\s*([^,]*)/g);
        this.method = this.method.replace(regexp, (match, vName1, vType1, vSubType1, vValue1, vName2, vType2, vValue2) => {
            if (vType1 === "Vector") {
                let aaa = TranslatorTypes.FromName(vSubType1);
                if (!TranslatorTypes.IsLastTypeKnown()) {
                    if (!this.translator.isImported(vSubType1)) {
                        let dirname = path.posix.dirname(this.translator.fileData.fullpath).replace(BASE_DIR_AS + "/scripts/", "").split("/");
                        this.translator.addImport(vSubType1, [...dirname, vSubType1]);
                    }
                }
                return vName1 + ": " + TranslatorTypes.FromName(vType1) + "<" + aaa + "> = " + vValue1;
            } else {
                let aaa = TranslatorTypes.FromName(vType2);
                if (!TranslatorTypes.IsLastTypeKnown()) {
                    if (!this.translator.isImported(vType2)) {
                        let dirname = path.posix.dirname(this.translator.fileData.fullpath).replace(BASE_DIR_AS + "/scripts/", "").split("/");
                        this.translator.addImport(vType2, [...dirname, vType2]);
                    }
                }
                return vName2 + ": " + aaa + " = " + vValue2;
            }
        });
        this.method = `public init${this.translator.class}(${this.method}): ${this.translator.class}`;
    }

    private translateVars() {
        this.content = this.content.replace("this._isInitialized = true;\r\n", "");
        this.content = Indent(this.content, 2);
    }

}