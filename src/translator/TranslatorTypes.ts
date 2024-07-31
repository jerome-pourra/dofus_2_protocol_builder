export class TranslatorTypes {

    public static Undefined: Array<{ [key: string]: number }> = [];
    public static LastTypeKnown = null;

    private static readonly TYPES = {

        // Nombres
        "uint": "number",
        "int": "number",
        "float": "number",
        "double": "number",
        "Number": "number",

        // Chaines
        "char": "string",
        "String": "string",

        // Boolean
        "bool": "boolean",
        "Boolean": "boolean",

        // Vector
        "Vector": "Array",
        "ByteArray": "Buffer"

    };

    public static FromName(type: string) {

        if (type !== undefined) {
            if (type in TranslatorTypes.TYPES) {
                TranslatorTypes.LastTypeKnown = true;
                return TranslatorTypes.TYPES[type]; // C'est un type connu
            } else {
                TranslatorTypes.LastTypeKnown = false;
                TranslatorTypes.AddUndefinedType(type); // On ajoute le type à la liste des inconnus
            }
        } else {
            TranslatorTypes.LastTypeKnown = null;
        }

        return type; // C'est un type custom ou inconnu au bataillon ! On renvoi tel quel !

    }

    public static IsLastTypeKnown() {
        if (TranslatorTypes.LastTypeKnown === null || TranslatorTypes.LastTypeKnown) {
            return true
        } else {
            return false;
        }
    }

    public static AddUndefinedType(type: string) {
        if (type in TranslatorTypes.Undefined) {
            TranslatorTypes.Undefined[type]++;
        } else {
            TranslatorTypes.Undefined[type] = 1;
        }
    }

}

export class TranslatorCast {

    public static Undefined: Array<{ [key: string]: number }> = [];
    public static LastTypeKnown = null;

    private static readonly CAST = ["uint", "int"];

    public static RegexpList() {
        return this.CAST.join("|");
    }

    public static FromName(type: string) {

        if (type !== undefined) {
            if (type in TranslatorCast.CAST) {
                TranslatorCast.LastTypeKnown = true;
                return TranslatorCast.CAST[type]; // C'est un type connu
            } else {
                TranslatorCast.LastTypeKnown = false;
                TranslatorCast.AddUndefinedType(type); // On ajoute le type à la liste des inconnus
            }
        } else {
            TranslatorCast.LastTypeKnown = null;
        }

        return type; // C'est un type custom ou inconnu au bataillon ! On renvoi tel quel !

    }

    public static IsLastTypeKnown() {
        if (TranslatorCast.LastTypeKnown === null || TranslatorCast.LastTypeKnown) {
            return true
        } else {
            return false;
        }
    }

    public static AddUndefinedType(type: string) {
        if (type in TranslatorCast.Undefined) {
            TranslatorCast.Undefined[type]++;
        } else {
            TranslatorCast.Undefined[type] = 1;
        }
    }

}