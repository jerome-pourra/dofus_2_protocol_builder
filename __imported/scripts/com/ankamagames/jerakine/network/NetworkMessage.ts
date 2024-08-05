import { ICustomDataInput } from "./ICustomDataInput";
import { ICustomDataOutput } from "./ICustomDataOutput";
import { INetworkMessage } from "./INetworkMessage";

export abstract class NetworkMessage implements INetworkMessage {
    public constructor() {}
	public pack(param1: ICustomDataOutput): void {};
	public unpack(param1: ICustomDataInput, param2: number): void {};
	get isInitialized(): boolean { return true; };
	get unpacked(): boolean { return true; };
	set unpacked(param1: boolean) { };
}