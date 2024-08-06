import { Binary64 } from "./Binary64";
import { UInt64 } from "./UInt64";

export class Int64 extends Binary64 {

	public constructor(low: number = 0, high: number = 0) {
		super(low, high);
	}

	public static fromNumber(n: number): Int64 {
		return new Int64(n, Math.floor(n / 4294967296));
	}

	public static parseInt64(str: String, radix: number = 0): Int64 {
		var digit: number = 0;
		var negative: boolean = str.search(/^\-/) == 0;
		var i: number = negative ? 1 : 0;
		if (radix == 0) {
			if (str.search(/^\-?0x/) == 0) {
				radix = 16;
				i += 2;
			}
			else {
				radix = 10;
			}
		}
		if (radix < 2 || radix > 36) {
			throw new Error();
		}
		str = str.toLowerCase();
		for (var result: Int64 = new Int64(); i < str.length;) {
			digit = str.charCodeAt(i);
			if (digit >= Binary64.CHAR_CODE_0 && digit <= Binary64.CHAR_CODE_9) {
				digit -= Binary64.CHAR_CODE_0;
			}
			else {
				if (!(digit >= Binary64.CHAR_CODE_A && digit <= Binary64.CHAR_CODE_Z)) {
					throw new Error();
				}
				digit -= Binary64.CHAR_CODE_A;
				digit += 10;
			}
			if (digit >= radix) {
				throw new Error();
			}
			result.mul(radix);
			result.add(digit);
			i++;
		}
		if (negative) {
			result.bitwiseNot();
			result.add(1);
		}
		return result;
	}

	public static make(low: number, high: number): Int64 {
		return new Int64(low, high);
	}

	public static shl(a: Int64, b: number): Int64 {
		var i: Int64 = null!;
		b &= 63;
		if (b == 0) {
			i = a.copy();
		}
		else if (b < 32) {
			i = Int64.make(a.high << b | a.low >>> 32 - b, a.low << b);
		}
		else {
			i = Int64.make(a.low << b - 32, 0);
		}
		return i;
	}

	public static shr(a: Int64, b: number): Int64 {
		var i: Int64 = null!;
		b &= 63;
		if (b == 0) {
			i = a.copy();
		}
		else if (b < 32) {
			i = Int64.make(a.high >> b, a.high << 32 - b | a.low >>> b);
		}
		else {
			i = Int64.make(a.high >> 31, a.high >> b - 32);
		}
		return i;
	}

	public static ushr(a: Int64, b: number): Int64 {
		var i: Int64 = null!;
		b &= 63;
		if (b == 0) {
			i = a.copy();
		}
		else if (b < 32) {
			i = Int64.make(a.high >>> b, a.high << 32 - b | a.low >>> b);
		}
		else {
			i = Int64.make(0, a.high >>> b - 32);
		}
		return i;
	}

	public static xor(a: Int64, b: Int64): Int64 {
		return Int64.make(a.high ^ b.high, a.low ^ b.low);
	}

	public static and(a: Int64, b: Int64): Int64 {
		return Int64.make(a.high & b.high, a.low & b.low);
	}

	public static flip(a: Int64): Int64 {
		var i: Int64 = Int64.xor(a, Int64.fromNumber(-1));
		i.add(1);
		return i;
	}

	public set high(value: number) {
		this.internalHigh = value;
	}

	public get high(): number {
		return this.internalHigh;
	}

	public toNumber(): number {
		return this.high * 4294967296 + this.low;
	}

	public toString(radix: number = 10): String {
		var digit: number = 0;
		if (radix < 2 || radix > 36) {
			throw new Error();
		}
		switch (this.high) {
			case 0:
				return this.low.toString(radix);
			case -1:
				if ((this.low & 2147483648) == 0) {
					return (this.low | 2147483648 - 2147483648).toString(radix);
				}
				return this.low.toString(radix);
				break;
			default:
				if (this.low == 0 && this.high == 0) {
					return "0";
				}
				var digitChars: Array<number> = [];
				var copyOfThis: UInt64 = new UInt64(this.low, this.high);
				if (this.high < 0) {
					copyOfThis.bitwiseNot();
					copyOfThis.add(1);
				}
				do {
					digit = copyOfThis.div(radix);
					if (digit < 10) {
						digitChars.push(digit + Binary64.CHAR_CODE_0);
					}
					else {
						digitChars.push(digit - 10 + Binary64.CHAR_CODE_A);
					}
				}
				while (copyOfThis.high != 0);

				if (this.high < 0) {
					return "-" + copyOfThis.low.toString(radix) + String.fromCharCode.apply(String, digitChars.reverse());
				}
				return copyOfThis.low.toString(radix) + String.fromCharCode.apply(String, digitChars.reverse());
		}
	}

	public copy(): Int64 {
		return Int64.make(this.low, this.high);
	}
}
