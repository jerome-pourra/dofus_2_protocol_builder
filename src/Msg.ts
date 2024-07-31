export class MessageReceiver {

    public static types: Array<any> = [];

    static {
		this.types[8863] = "PaginationAnswerAbstractMessage";
    }

	public static getInstance<Generic>(prototype: new() => Generic, typeId: number): Generic {
		return new prototype();
	}

    public static getType(id: number): any | null {
        if (id in MessageReceiver.types) {
            return MessageReceiver.types[id];
        }
        return null;
    } 

}