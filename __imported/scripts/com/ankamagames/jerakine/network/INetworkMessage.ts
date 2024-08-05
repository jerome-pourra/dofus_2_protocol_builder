import { ICustomDataInput } from "./ICustomDataInput";
import { ICustomDataOutput } from "./ICustomDataOutput";

export interface INetworkMessage {
    pack(param1: ICustomDataOutput): void;
    unpack(param1: ICustomDataInput, param2: number): void;
    get isInitialized(): boolean;
    get unpacked(): boolean;
    set unpacked(param1: boolean);
}
