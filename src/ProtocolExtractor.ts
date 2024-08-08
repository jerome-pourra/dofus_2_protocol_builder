import fs from "fs";

export enum ExtractTypeEnum {
    MESSAGES = "_messagesTypes",
    TYPES = "_typesTypes"
}

export type ProtocolExtracted = {id: number, name: string};
export type ProtocolListExtracted = Array<ProtocolExtracted>;

export class ProtocolExtractor {

    public static getContent(path: string): string {
        return fs.readFileSync(path).toString("utf-8");
    }

    public static extract(content: string, type: ExtractTypeEnum): ProtocolListExtracted {

        let extract: ProtocolListExtracted = new Array<{id: number, name: string}>();
        let regexp = new RegExp(`${type}\\[(\\d+)\\]\\s*=\\s*([a-zA-Z]+);`, "g");
        let matches = regexp.exec(content);

        while (matches !== null) {
            extract.push({
                id: parseInt(matches[1]),
                name: matches[2]
            });
            matches = regexp.exec(content);
        }

        return extract;

    }

}