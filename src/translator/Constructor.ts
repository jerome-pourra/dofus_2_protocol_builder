import { Translator } from "./Translator";
import { TranslatorTypes } from "./TranslatorTypes";
import { Indent } from "../functions";

export class Constructor {

	public content: string;
	public translator: Translator;

	constructor(content: string, translator: Translator) {
		this.content = content;
		this.translator = translator;
		this.translateSuper();
		this.translateValues();
	}

	public translateSuper() {

		let regexp = new RegExp(/super\(([A-Za-z0-9]*)\);/g);
		let matches = regexp.exec(this.content);

		if (matches !== null) {
			this.content = this.content.replace(regexp, "");
			if (this.translator.extends) {
				this.content = `super(${matches[1]});\n` + this.content; // Deplace le constructeur super() en première instruction
			}
		}

	}

	public translateValues() {
		let regexp = new RegExp(/this\.([A-Za-z0-9_]+)\s*=\s*new\s*(?:(Vector)\.<([A-z0-9]+)>)(\(.+\))?/g);
		this.content = this.content.replace(regexp, (match: string, vProp: string, vName: string, vType: string, vParams: string) => {

			let cName = "";
			let cType = "";
			let cParams = "";

			if (vName) cName = `${TranslatorTypes.FromName(vName)}`;
			if (vType) cType = `<${TranslatorTypes.FromName(vType)}>`;

			// Supprime le paramètre fixed lors de l'instantation d'un nouveau tableau
			// Input 	> this.xxx = new Vector<Type>(length, fixed);
			// Output 	> this.xxx = new Vector<Type>(length);
			if (vParams) {
				cParams = vParams;
				if (vName === "Vector") {
					cParams = vParams.substring(1, vParams.length - 1);
					let splitted = cParams.split(",");
					if (splitted.length > 1) {
						cParams = "(" + splitted[0] + ")";
					}
				}
			};

			return `this.${vProp} = ${cName}${cType}${cParams}`;

		});
		this.content = Indent(this.content, 2);
	}

}