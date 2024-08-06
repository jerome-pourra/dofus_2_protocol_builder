import { ICustomDataInput } from "./ICustomDataInput";
import { ICustomDataOutput } from "./ICustomDataOutput";
import { INetworkMessage } from "./INetworkMessage";

export abstract class NetworkMessage implements INetworkMessage {
    
    public abstract getMessageId(): number;
	public abstract pack(param1: ICustomDataOutput): void;
	public abstract unpack(param1: ICustomDataInput, param2: number): void;

}