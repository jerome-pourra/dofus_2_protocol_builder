"__IMPORTS__"

export class ProtocolTypeManager {

	private static readonly _types: Array<{ new(): any }> = Array<{ new(): any }>();
	
	static {
"__IDS__"
	}

	public static getInstance<T>(base: { new(): T }, typeId: number): T {
		let objType: { new(): T } = ProtocolTypeManager._types[typeId];
		if (!objType) {
			throw new Error("Type with id " + typeId + " is unknown.");
		}
		let obj: T = new objType();
		if (!(obj instanceof base)) {
			throw new Error("Type " + typeId + " is not a " + base + ".");
		}
		return obj;
	}

}