import fs from "fs";
import path from "path";
import { AS_EXTENSION, DIR_TYPES, E_DIR_TYPES } from "./constants";
import { GetAnkPath, IsTranslatableFile } from "./functions";

export type TBrowserFileData = { name: string, fullpath: string, ankpath: string, dir: string, type: E_DIR_TYPES };

export class FilesBrowser {

    private directoryType: E_DIR_TYPES = null;
    private filesList: Array<TBrowserFileData> = [];

    public browseDirectory(directory: string): Array<TBrowserFileData> {

        const filesName = fs.readdirSync(directory);

        for (const fileName of filesName) {

            const filePath = path.posix.join(directory, fileName);
            const ankPath = GetAnkPath(filePath);
            const fileStat = fs.statSync(filePath);
            this.directoryType = this.getDirectoryType(filePath);
            
            if (fileStat.isDirectory()) {
                this.browseDirectory(filePath);
            } else if (fileStat.isFile()) {
                if (path.posix.extname(filePath) == AS_EXTENSION && IsTranslatableFile(fileName)) {
                    this.addFile(this.parseName(fileName), filePath, ankPath, directory, this.directoryType);
                }
            }

        }

        return this.filesList;

    }

    public parseName(fileName: string): string {
        return path.parse(fileName).name;
    }

    public getDirectoryType(filePath: string): E_DIR_TYPES {
        for (let i = 0; i < DIR_TYPES.length; i++) {
            const dirType = DIR_TYPES[i];
            if (filePath.startsWith(dirType.path)) {
                return dirType.name;
            }
        }
        return null;
    }

    public addFile(name: string, fullpath: string, ankpath: string, dir: string, type: E_DIR_TYPES): void {
        this.filesList.push({
            name: name,
            fullpath: fullpath,
            ankpath: ankpath,
            dir: dir,
            type: type // is "messages" or "types"
        });
    }

}