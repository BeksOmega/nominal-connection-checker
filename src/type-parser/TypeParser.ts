// Generated from Type.g4 by ANTLR 4.9.0-SNAPSHOT


import { ATN } from "antlr4ts/atn/ATN";
import { ATNDeserializer } from "antlr4ts/atn/ATNDeserializer";
import { FailedPredicateException } from "antlr4ts/FailedPredicateException";
import { NotNull } from "antlr4ts/Decorators";
import { NoViableAltException } from "antlr4ts/NoViableAltException";
import { Override } from "antlr4ts/Decorators";
import { Parser } from "antlr4ts/Parser";
import { ParserRuleContext } from "antlr4ts/ParserRuleContext";
import { ParserATNSimulator } from "antlr4ts/atn/ParserATNSimulator";
import { ParseTreeListener } from "antlr4ts/tree/ParseTreeListener";
import { ParseTreeVisitor } from "antlr4ts/tree/ParseTreeVisitor";
import { RecognitionException } from "antlr4ts/RecognitionException";
import { RuleContext } from "antlr4ts/RuleContext";
//import { RuleVersion } from "antlr4ts/RuleVersion";
import { TerminalNode } from "antlr4ts/tree/TerminalNode";
import { Token } from "antlr4ts/Token";
import { TokenStream } from "antlr4ts/TokenStream";
import { Vocabulary } from "antlr4ts/Vocabulary";
import { VocabularyImpl } from "antlr4ts/VocabularyImpl";

import * as Utils from "antlr4ts/misc/Utils";

import { TypeVisitor } from "./TypeVisitor1";


export class TypeParser extends Parser {
	public static readonly T__0 = 1;
	public static readonly T__1 = 2;
	public static readonly T__2 = 3;
	public static readonly T__3 = 4;
	public static readonly T__4 = 5;
	public static readonly GID = 6;
	public static readonly EID = 7;
	public static readonly WS = 8;
	public static readonly RULE_type = 0;
	public static readonly RULE_explicit = 1;
	public static readonly RULE_unconstrained = 2;
	public static readonly RULE_constrained = 3;
	public static readonly RULE_paramsList = 4;
	public static readonly RULE_rightLowerBounds = 5;
	public static readonly RULE_leftLowerBounds = 6;
	public static readonly RULE_upperBounds = 7;
	public static readonly RULE_boundsList = 8;
	public static readonly RULE_bound = 9;
	// tslint:disable:no-trailing-whitespace
	public static readonly ruleNames: string[] = [
		"type", "explicit", "unconstrained", "constrained", "paramsList", "rightLowerBounds", 
		"leftLowerBounds", "upperBounds", "boundsList", "bound",
	];

	private static readonly _LITERAL_NAMES: Array<string | undefined> = [
		undefined, "'['", "','", "']'", "'>:'", "'<:'",
	];
	private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
		undefined, undefined, undefined, undefined, undefined, undefined, "GID", 
		"EID", "WS",
	];
	public static readonly VOCABULARY: Vocabulary = new VocabularyImpl(TypeParser._LITERAL_NAMES, TypeParser._SYMBOLIC_NAMES, []);

	// @Override
	// @NotNull
	public get vocabulary(): Vocabulary {
		return TypeParser.VOCABULARY;
	}
	// tslint:enable:no-trailing-whitespace

	// @Override
	public get grammarFileName(): string { return "Type.g4"; }

	// @Override
	public get ruleNames(): string[] { return TypeParser.ruleNames; }

	// @Override
	public get serializedATN(): string { return TypeParser._serializedATN; }

	protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
		return new FailedPredicateException(this, predicate, message);
	}

	constructor(input: TokenStream) {
		super(input);
		this._interp = new ParserATNSimulator(TypeParser._ATN, this);
	}
	// @RuleVersion(0)
	public type(): TypeContext {
		let _localctx: TypeContext = new TypeContext(this._ctx, this.state);
		this.enterRule(_localctx, 0, TypeParser.RULE_type);
		try {
			this.state = 23;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 0, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 20;
				this.explicit();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 21;
				this.unconstrained();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 22;
				this.constrained();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public explicit(): ExplicitContext {
		let _localctx: ExplicitContext = new ExplicitContext(this._ctx, this.state);
		this.enterRule(_localctx, 2, TypeParser.RULE_explicit);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 25;
			this.match(TypeParser.EID);
			this.state = 27;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			if (_la === TypeParser.T__0) {
				{
				this.state = 26;
				this.paramsList();
				}
			}

			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public unconstrained(): UnconstrainedContext {
		let _localctx: UnconstrainedContext = new UnconstrainedContext(this._ctx, this.state);
		this.enterRule(_localctx, 4, TypeParser.RULE_unconstrained);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 29;
			this.match(TypeParser.GID);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public constrained(): ConstrainedContext {
		let _localctx: ConstrainedContext = new ConstrainedContext(this._ctx, this.state);
		this.enterRule(_localctx, 6, TypeParser.RULE_constrained);
		try {
			this.state = 39;
			this._errHandler.sync(this);
			switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
			case 1:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 31;
				this.match(TypeParser.GID);
				this.state = 32;
				this.rightLowerBounds();
				}
				break;

			case 2:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 33;
				this.match(TypeParser.GID);
				this.state = 34;
				this.upperBounds();
				}
				break;

			case 3:
				this.enterOuterAlt(_localctx, 3);
				{
				this.state = 35;
				this.leftLowerBounds();
				this.state = 36;
				this.match(TypeParser.GID);
				this.state = 37;
				this.upperBounds();
				}
				break;
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public paramsList(): ParamsListContext {
		let _localctx: ParamsListContext = new ParamsListContext(this._ctx, this.state);
		this.enterRule(_localctx, 8, TypeParser.RULE_paramsList);
		let _la: number;
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 41;
			this.match(TypeParser.T__0);
			this.state = 42;
			this.type();
			this.state = 47;
			this._errHandler.sync(this);
			_la = this._input.LA(1);
			while (_la === TypeParser.T__1) {
				{
				{
				this.state = 43;
				this.match(TypeParser.T__1);
				this.state = 44;
				this.type();
				}
				}
				this.state = 49;
				this._errHandler.sync(this);
				_la = this._input.LA(1);
			}
			this.state = 50;
			this.match(TypeParser.T__2);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public rightLowerBounds(): RightLowerBoundsContext {
		let _localctx: RightLowerBoundsContext = new RightLowerBoundsContext(this._ctx, this.state);
		this.enterRule(_localctx, 10, TypeParser.RULE_rightLowerBounds);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 52;
			this.match(TypeParser.T__3);
			this.state = 53;
			this.boundsList();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public leftLowerBounds(): LeftLowerBoundsContext {
		let _localctx: LeftLowerBoundsContext = new LeftLowerBoundsContext(this._ctx, this.state);
		this.enterRule(_localctx, 12, TypeParser.RULE_leftLowerBounds);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 55;
			this.boundsList();
			this.state = 56;
			this.match(TypeParser.T__4);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public upperBounds(): UpperBoundsContext {
		let _localctx: UpperBoundsContext = new UpperBoundsContext(this._ctx, this.state);
		this.enterRule(_localctx, 14, TypeParser.RULE_upperBounds);
		try {
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 58;
			this.match(TypeParser.T__4);
			this.state = 59;
			this.boundsList();
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public boundsList(): BoundsListContext {
		let _localctx: BoundsListContext = new BoundsListContext(this._ctx, this.state);
		this.enterRule(_localctx, 16, TypeParser.RULE_boundsList);
		try {
			let _alt: number;
			this.enterOuterAlt(_localctx, 1);
			{
			this.state = 61;
			this.bound();
			this.state = 66;
			this._errHandler.sync(this);
			_alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
			while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
				if (_alt === 1) {
					{
					{
					this.state = 62;
					this.match(TypeParser.T__1);
					this.state = 63;
					this.bound();
					}
					}
				}
				this.state = 68;
				this._errHandler.sync(this);
				_alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
			}
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}
	// @RuleVersion(0)
	public bound(): BoundContext {
		let _localctx: BoundContext = new BoundContext(this._ctx, this.state);
		this.enterRule(_localctx, 18, TypeParser.RULE_bound);
		try {
			this.state = 71;
			this._errHandler.sync(this);
			switch (this._input.LA(1)) {
			case TypeParser.GID:
				this.enterOuterAlt(_localctx, 1);
				{
				this.state = 69;
				this.unconstrained();
				}
				break;
			case TypeParser.EID:
				this.enterOuterAlt(_localctx, 2);
				{
				this.state = 70;
				this.explicit();
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
		}
		catch (re) {
			if (re instanceof RecognitionException) {
				_localctx.exception = re;
				this._errHandler.reportError(this, re);
				this._errHandler.recover(this, re);
			} else {
				throw re;
			}
		}
		finally {
			this.exitRule();
		}
		return _localctx;
	}

	public static readonly _serializedATN: string =
		"\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\nL\x04\x02\t" +
		"\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07\t" +
		"\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x03\x02\x03\x02\x03\x02\x05" +
		"\x02\x1A\n\x02\x03\x03\x03\x03\x05\x03\x1E\n\x03\x03\x04\x03\x04\x03\x05" +
		"\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x03\x05\x05\x05*\n\x05" +
		"\x03\x06\x03\x06\x03\x06\x03\x06\x07\x060\n\x06\f\x06\x0E\x063\v\x06\x03" +
		"\x06\x03\x06\x03\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03\t\x03\t\x03" +
		"\t\x03\n\x03\n\x03\n\x07\nC\n\n\f\n\x0E\nF\v\n\x03\v\x03\v\x05\vJ\n\v" +
		"\x03\v\x02\x02\x02\f\x02\x02\x04\x02\x06\x02\b\x02\n\x02\f\x02\x0E\x02" +
		"\x10\x02\x12\x02\x14\x02\x02\x02\x02I\x02\x19\x03\x02\x02\x02\x04\x1B" +
		"\x03\x02\x02\x02\x06\x1F\x03\x02\x02\x02\b)\x03\x02\x02\x02\n+\x03\x02" +
		"\x02\x02\f6\x03\x02\x02\x02\x0E9\x03\x02\x02\x02\x10<\x03\x02\x02\x02" +
		"\x12?\x03\x02\x02\x02\x14I\x03\x02\x02\x02\x16\x1A\x05\x04\x03\x02\x17" +
		"\x1A\x05\x06\x04\x02\x18\x1A\x05\b\x05\x02\x19\x16\x03\x02\x02\x02\x19" +
		"\x17\x03\x02\x02\x02\x19\x18\x03\x02\x02\x02\x1A\x03\x03\x02\x02\x02\x1B" +
		"\x1D\x07\t\x02\x02\x1C\x1E\x05\n\x06\x02\x1D\x1C\x03\x02\x02\x02\x1D\x1E" +
		"\x03\x02\x02\x02\x1E\x05\x03\x02\x02\x02\x1F \x07\b\x02\x02 \x07\x03\x02" +
		"\x02\x02!\"\x07\b\x02\x02\"*\x05\f\x07\x02#$\x07\b\x02\x02$*\x05\x10\t" +
		"\x02%&\x05\x0E\b\x02&\'\x07\b\x02\x02\'(\x05\x10\t\x02(*\x03\x02\x02\x02" +
		")!\x03\x02\x02\x02)#\x03\x02\x02\x02)%\x03\x02\x02\x02*\t\x03\x02\x02" +
		"\x02+,\x07\x03\x02\x02,1\x05\x02\x02\x02-.\x07\x04\x02\x02.0\x05\x02\x02" +
		"\x02/-\x03\x02\x02\x0203\x03\x02\x02\x021/\x03\x02\x02\x0212\x03\x02\x02" +
		"\x0224\x03\x02\x02\x0231\x03\x02\x02\x0245\x07\x05\x02\x025\v\x03\x02" +
		"\x02\x0267\x07\x06\x02\x0278\x05\x12\n\x028\r\x03\x02\x02\x029:\x05\x12" +
		"\n\x02:;\x07\x07\x02\x02;\x0F\x03\x02\x02\x02<=\x07\x07\x02\x02=>\x05" +
		"\x12\n\x02>\x11\x03\x02\x02\x02?D\x05\x14\v\x02@A\x07\x04\x02\x02AC\x05" +
		"\x14\v\x02B@\x03\x02\x02\x02CF\x03\x02\x02\x02DB\x03\x02\x02\x02DE\x03" +
		"\x02\x02\x02E\x13\x03\x02\x02\x02FD\x03\x02\x02\x02GJ\x05\x06\x04\x02" +
		"HJ\x05\x04\x03\x02IG\x03\x02\x02\x02IH\x03\x02\x02\x02J\x15\x03\x02\x02" +
		"\x02\b\x19\x1D)1DI";
	public static __ATN: ATN;
	public static get _ATN(): ATN {
		if (!TypeParser.__ATN) {
			TypeParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(TypeParser._serializedATN));
		}

		return TypeParser.__ATN;
	}

}

export class TypeContext extends ParserRuleContext {
	public explicit(): ExplicitContext | undefined {
		return this.tryGetRuleContext(0, ExplicitContext);
	}
	public unconstrained(): UnconstrainedContext | undefined {
		return this.tryGetRuleContext(0, UnconstrainedContext);
	}
	public constrained(): ConstrainedContext | undefined {
		return this.tryGetRuleContext(0, ConstrainedContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_type; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitType) {
			return visitor.visitType(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ExplicitContext extends ParserRuleContext {
	public EID(): TerminalNode { return this.getToken(TypeParser.EID, 0); }
	public paramsList(): ParamsListContext | undefined {
		return this.tryGetRuleContext(0, ParamsListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_explicit; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitExplicit) {
			return visitor.visitExplicit(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UnconstrainedContext extends ParserRuleContext {
	public GID(): TerminalNode { return this.getToken(TypeParser.GID, 0); }
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_unconstrained; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitUnconstrained) {
			return visitor.visitUnconstrained(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ConstrainedContext extends ParserRuleContext {
	public GID(): TerminalNode { return this.getToken(TypeParser.GID, 0); }
	public rightLowerBounds(): RightLowerBoundsContext | undefined {
		return this.tryGetRuleContext(0, RightLowerBoundsContext);
	}
	public upperBounds(): UpperBoundsContext | undefined {
		return this.tryGetRuleContext(0, UpperBoundsContext);
	}
	public leftLowerBounds(): LeftLowerBoundsContext | undefined {
		return this.tryGetRuleContext(0, LeftLowerBoundsContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_constrained; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitConstrained) {
			return visitor.visitConstrained(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class ParamsListContext extends ParserRuleContext {
	public type(): TypeContext[];
	public type(i: number): TypeContext;
	public type(i?: number): TypeContext | TypeContext[] {
		if (i === undefined) {
			return this.getRuleContexts(TypeContext);
		} else {
			return this.getRuleContext(i, TypeContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_paramsList; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitParamsList) {
			return visitor.visitParamsList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class RightLowerBoundsContext extends ParserRuleContext {
	public boundsList(): BoundsListContext {
		return this.getRuleContext(0, BoundsListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_rightLowerBounds; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitRightLowerBounds) {
			return visitor.visitRightLowerBounds(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class LeftLowerBoundsContext extends ParserRuleContext {
	public boundsList(): BoundsListContext {
		return this.getRuleContext(0, BoundsListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_leftLowerBounds; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitLeftLowerBounds) {
			return visitor.visitLeftLowerBounds(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class UpperBoundsContext extends ParserRuleContext {
	public boundsList(): BoundsListContext {
		return this.getRuleContext(0, BoundsListContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_upperBounds; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitUpperBounds) {
			return visitor.visitUpperBounds(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BoundsListContext extends ParserRuleContext {
	public bound(): BoundContext[];
	public bound(i: number): BoundContext;
	public bound(i?: number): BoundContext | BoundContext[] {
		if (i === undefined) {
			return this.getRuleContexts(BoundContext);
		} else {
			return this.getRuleContext(i, BoundContext);
		}
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_boundsList; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitBoundsList) {
			return visitor.visitBoundsList(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


export class BoundContext extends ParserRuleContext {
	public unconstrained(): UnconstrainedContext | undefined {
		return this.tryGetRuleContext(0, UnconstrainedContext);
	}
	public explicit(): ExplicitContext | undefined {
		return this.tryGetRuleContext(0, ExplicitContext);
	}
	constructor(parent: ParserRuleContext | undefined, invokingState: number) {
		super(parent, invokingState);
	}
	// @Override
	public get ruleIndex(): number { return TypeParser.RULE_bound; }
	// @Override
	public accept<Result>(visitor: TypeVisitor<Result>): Result {
		if (visitor.visitBound) {
			return visitor.visitBound(this);
		} else {
			return visitor.visitChildren(this);
		}
	}
}


