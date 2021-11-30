// Generated from Type.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { CharStream } from "antlr4ts/CharStream";
import { Lexer } from "antlr4ts/Lexer";
import { LexerATNSimulator } from "antlr4ts/atn/LexerATNSimulator";
import { NotNull } from "antlr4ts/Decorators";
import { Override } from "antlr4ts/Decorators";
import { RuleContext } from "antlr4ts/RuleContext";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";


export class TypeLexer extends Lexer {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly GID = 6;
	public static readonly EID = 7;
	public static readonly WS = 8;

	// tslint:disable:no-trailing-whitespace
	public static readonly channelNames: string[] = [
		"DEFAULT_TOKEN_CHANNEL", "HIDDEN",
	];

	// tslint:disable:no-trailing-whitespace
	public static readonly modeNames: string[] = [
		"DEFAULT_MODE",
	];

	public static readonly ruleNames: string[] = [
		"T__0", "T__1", "T__2", "T__3", "T__4", "GID", "EID", "WS",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'['", "','", "']'", "'>:'", "'<:'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, "GID", 
		"EID", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(TypeLexer._LITERAL_NAMES, TypeLexer._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return TypeLexer.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace


	constructor(input: CharStream) {
		super(input);
		this._interp = new LexerATNSimulator(TypeLexer._ATN, this);
	}

	// @Override
	public get grammarFileName(): string { return "Type.g4"; }

	// @Override
	public get ruleNames(): string[] { return TypeLexer.ruleNames; }

	// @Override
	public get serializedATN(): string { return TypeLexer._serializedATN; }

	// @Override
	public get channelNames(): string[] { return TypeLexer.channelNames; }

	// @Override
	public get modeNames(): string[] { return TypeLexer.modeNames; }

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x02\n.\b\x01\x04" +
		"\x02\t\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04" +
		"\x07\t\x07\x04\b\t\b\x04\t\t\t\x03\x02\x03\x02\x03\x03\x03\x03\x03\x04" +
		"\x03\x04\x03\x05\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x07\x03\x07" +
		"\x03\b\x03\b\x06\b$\n\b\r\b\x0E\b%\x03\t\x06\t)\n\t\r\t\x0E\t*\x03\t\x03" +
		"\t\x02\x02\x02\n\x03\x02\x03\x05\x02\x04\x07\x02\x05\t\x02\x06\v\x02\x07" +
		"\r\x02\b\x0F\x02\t\x11\x02\n\x03\x02\x05\x04\x02C\\c|\x06\x022;C\\aac" +
		"|\x04\x02\v\v\"\"\x02/\x02\x03\x03\x02\x02\x02\x02\x05\x03\x02\x02\x02" +
		"\x02\x07\x03\x02\x02\x02\x02\t\x03\x02\x02\x02\x02\v\x03\x02\x02\x02\x02" +
		"\r\x03\x02\x02\x02\x02\x0F\x03\x02\x02\x02\x02\x11\x03\x02\x02\x02\x03" +
		"\x13\x03\x02\x02\x02\x05\x15\x03\x02\x02\x02\x07\x17\x03\x02\x02\x02\t" +
		"\x19\x03\x02\x02\x02\v\x1C\x03\x02\x02\x02\r\x1F\x03\x02\x02\x02\x0F!" +
		"\x03\x02\x02\x02\x11(\x03\x02\x02\x02\x13\x14\x07]\x02\x02\x14\x04\x03" +
		"\x02\x02\x02\x15\x16\x07.\x02\x02\x16\x06\x03\x02\x02\x02\x17\x18\x07" +
		"_\x02\x02\x18\b\x03\x02\x02\x02\x19\x1A\x07@\x02\x02\x1A\x1B\x07<\x02" +
		"\x02\x1B\n\x03\x02\x02\x02\x1C\x1D\x07>\x02\x02\x1D\x1E\x07<\x02\x02\x1E" +
		"\f\x03\x02\x02\x02\x1F \t\x02\x02\x02 \x0E\x03\x02\x02\x02!#\t\x02\x02" +
		"\x02\"$\t\x03\x02\x02#\"\x03\x02\x02\x02$%\x03\x02\x02\x02%#\x03\x02\x02" +
		"\x02%&\x03\x02\x02\x02&\x10\x03\x02\x02\x02\')\t\x04\x02\x02(\'\x03\x02" +
		"\x02\x02)*\x03\x02\x02\x02*(\x03\x02\x02\x02*+\x03\x02\x02\x02+,\x03\x02" +
		"\x02\x02,-\b\t\x02\x02-\x12\x03\x02\x02\x02\x05\x02%*\x03\b\x02\x02";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TypeLexer.__ATN) {
			TypeLexer.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(TypeLexer._serializedATN));
		}

		return TypeLexer.__ATN;
	}

}

