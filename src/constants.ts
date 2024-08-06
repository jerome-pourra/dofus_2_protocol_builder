export const MESSAGE_LIST = Array<{ id: string, class: string, path: string }>();
export const TYPES_LIST = Array<{ id: string, class: string, path: string }>();

export const AS_EXTENSION = ".as";

export const BASE_DIR_AS = "__exported";
export const BASE_DIR_TS = "__imported";

export const EXCLUDE_FILES = [
	"MessageReceiver.as",
	"ProtocolTypeManager.as",
];

export const INCLUDE_IMPORTS = [

	"ICustomDataInput",
	"ICustomDataOutput",
	"INetworkMessage",
    "INetworkType",
    "NetworkMessage",

	"BooleanByteWrapper",

	"Binary64",
	"Int64",
	"UInt64",

    "MessageReceiver",
	"ProtocolTypeManager",

];

export const INCLUDE_IMPORTS_PATH = {

    ICustomDataInput: "com/ankamagames/jerakine/network/",
    ICustomDataOutput: "com/ankamagames/jerakine/network/",
	INetworkMessage: "com/ankamagames/jerakine/network/",
    INetworkType: "com/ankamagames/jerakine/network/",
    NetworkMessage: "com/ankamagames/jerakine/network/",

    BooleanByteWrapper: "com/ankamagames/jerakine/network/utils/",

    Binary64: "com/ankamagames/jerakine/network/utils/types/",
    Int64: "com/ankamagames/jerakine/network/utils/types/",
    UInt64: "com/ankamagames/jerakine/network/utils/types/",

    MessageReceiver: "com/ankamagames/dofus/network/",
    ProtocolTypeManager: "com/ankamagames/dofus/network/",

};

export enum E_DIR_TYPES { MESSAGES = "messages", TYPES = "types" };

export const DIR_TYPES = [
	{ name: E_DIR_TYPES.MESSAGES, path: BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/messages" },
	{ name: E_DIR_TYPES.TYPES, path: BASE_DIR_AS + "/scripts/com/ankamagames/dofus/network/types" }
];