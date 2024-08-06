export class Binary64 {

	public static readonly CHAR_CODE_0: number = "0".charCodeAt(0);
	public static readonly CHAR_CODE_9: number = "9".charCodeAt(0);
	public static readonly CHAR_CODE_A: number = "a".charCodeAt(0);
	public static readonly CHAR_CODE_Z: number = "z".charCodeAt(0);

	public low: number;
	public internalHigh: number;

	public constructor(low: number = 0, high: number = 0) {
		this.low = low;
		this.internalHigh = high;
	}

	public div(n: number): number {
		var modHigh: number = 0;
		modHigh = this.internalHigh % n;
		var mod: number = (this.low % n + modHigh * 6) % n;
		this.internalHigh /= n;
		var newLow: number = (modHigh * 4294967296 + this.low) / n;
		this.internalHigh += newLow / 4294967296;
		this.low = newLow;
		return mod;
	}

	public mul(n: number): void {
		var newLow: number = this.low * n;
		this.internalHigh *= n;
		this.internalHigh += newLow / 4294967296;
		this.low *= n;
	}

	public add(n: number): void {
		var newLow: number = this.low + n;
		this.internalHigh += newLow / 4294967296;
		this.low = newLow;
	}

	public bitwiseNot(): void {
		this.low = ~this.low;
		this.internalHigh = ~this.internalHigh;
	}
}
