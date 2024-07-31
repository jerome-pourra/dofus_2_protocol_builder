"__IMPORTS__"
// @ts-ignore
import { ICustomDataInput } from "../../../../ICustomDataInput";
// @ts-ignore
import { INetworkMessage } from "./../../../../INetworkMessage";

export class MessageReceiver {

	private static readonly _types: Array<new () => INetworkMessage> = Array<new () => INetworkMessage>();

	static {
		"__IDS__"
	}

    public static getType(id: number): string {
        let type = MessageReceiver._types[id];
        if (type) {
            return type.name;
        }
        return "UNKNOWN";
    }

	public static parse(input: ICustomDataInput, messageId: number, messageLength: number): INetworkMessage {
		let messageType: new () => INetworkMessage = MessageReceiver._types[messageId];
		if (!messageType) {
			throw new Error("Unknown packet received (ID " + messageId + ", length " + messageLength + ")");
		}
		let message: INetworkMessage = new messageType();
		message.unpack(input, messageLength);
		return message;
	}

}