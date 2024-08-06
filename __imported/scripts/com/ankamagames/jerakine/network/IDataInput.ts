export interface IDataInput {

    readBoolean(): boolean;
    readByte(): number;
    readUnsignedByte(): number;
    readInt(): number;
    readUnsignedInt(): number;
    readShort(): number;
    readUnsignedShort(): number;
    readLong(): bigint;
    readUnsignedLong(): bigint;
    readFloat(): number;
    readDouble(): number;
    readUTF(): string;
    
    readBytes(param1: Buffer, param2: number, param3: number): void;
    readMultiByte(param1: number, param2: BufferEncoding): string;
    readObject(): any;

}