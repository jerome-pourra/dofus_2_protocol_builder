import fs from "fs";
import path from "path";
import { BASE_DIR_AS, BASE_DIR_TS, EXCLUDE_FILES } from "./constants";

export function IsTranslatableFile(filename: string) {
    return !EXCLUDE_FILES.includes(filename);
}

export function GetRelativePath(from: string, to: string) {

    const stats = fs.statSync(from);
    if (stats.isFile()) {
        from = path.posix.dirname(from);
    }

    let relPath = path.posix.relative(from, to);
    if (!relPath.startsWith("./")) {
        relPath = "./" + relPath;
    }

    return relPath;

}

export function GetAnkPath(fullpath: string) {
    // Remove "__exported/scripts/" or "__imported/scripts/" from the fullpath
    let regexp = new RegExp(`(${BASE_DIR_AS}|${BASE_DIR_TS})\/scripts\/`, "g");
    return fullpath.replace(regexp, "");
}

export function GetBracketContent(content: string, startAt?: number) {

    if (startAt) {
        content = content.slice(startAt);
    }

    let result = null;
    let level = 0;
    let start = -1;

    for (let i = 0; i < content.length; i++) {

        if (content[i] === "{") { // Commence la capture au niveau 0
            if (level === 0) {
                start = i + 1;
            }
            level++;
        } else if (content[i] === "}") {
            level--;
            if (level === 0 && start !== -1) { // Si retour au niveau zero stop la capture
                result = content.substring(start, i);
                break;
            }
        }

    }

    return result;

}

export function Indent(content: string, indentLvl: number = 1, separator: string = "\r\n") {

    let indentValue = "    ";
    let indentRegex = new RegExp(/^\s*\{\s*$/);
    let undentRegex = new RegExp(/^\s*\}\s*$/);
    let lines = content.split(separator);

    for (let index = 0; index < lines.length; index++) {
        const line = lines[index].trim();
        if (line.length === 0) {
            lines.splice(index, 1);
            index--;
        } else {
            if (indentRegex.exec(line)) {
                lines[index] = indentValue.repeat(indentLvl) + line.trim();
                indentLvl++;
            } else if (undentRegex.exec(line)) {
                indentLvl--;
                lines[index] = indentValue.repeat(indentLvl) + line.trim();
            } else {
                lines[index] = indentValue.repeat(indentLvl) + line.trim();
            }
        }
    }
    return lines.join(separator);
}