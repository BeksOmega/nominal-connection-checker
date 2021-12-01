// Generated from src/type-parser/Type.g4 by ANTLR 4.9.0-SNAPSHOT


import {ATN} from 'antlr4ts/atn/ATN';
import {ATNDeserializer} from 'antlr4ts/atn/ATNDeserializer';
import {FailedPredicateException} from 'antlr4ts/FailedPredicateException';
import {NotNull} from 'antlr4ts/Decorators';
import {NoViableAltException} from 'antlr4ts/NoViableAltException';
import {Override} from 'antlr4ts/Decorators';
import {Parser} from 'antlr4ts/Parser';
import {ParserRuleContext} from 'antlr4ts/ParserRuleContext';
import {ParserATNSimulator} from 'antlr4ts/atn/ParserATNSimulator';
import {ParseTreeListener} from 'antlr4ts/tree/ParseTreeListener';
import {ParseTreeVisitor} from 'antlr4ts/tree/ParseTreeVisitor';
import {RecognitionException} from 'antlr4ts/RecognitionException';
import {RuleContext} from 'antlr4ts/RuleContext';
// import { RuleVersion } from "antlr4ts/RuleVersion";
import {TerminalNode} from 'antlr4ts/tree/TerminalNode';
import {Token} from 'antlr4ts/Token';
import {TokenStream} from 'antlr4ts/TokenStream';
import {Vocabulary} from 'antlr4ts/Vocabulary';
import {VocabularyImpl} from 'antlr4ts/VocabularyImpl';

import * as Utils from 'antlr4ts/misc/Utils';

import {TypeVisitor} from './TypeVisitor';


export class TypeParser extends Parser {
    static readonly T__0 = 1;
    static readonly T__1 = 2;
    static readonly T__2 = 3;
    static readonly T__3 = 4;
    static readonly T__4 = 5;
    static readonly GID = 6;
    static readonly EID = 7;
    static readonly WS = 8;
    static readonly RULE_top = 0;
    static readonly RULE_type = 1;
    static readonly RULE_explicit = 2;
    static readonly RULE_unconstrained = 3;
    static readonly RULE_constrained = 4;
    static readonly RULE_paramsList = 5;
    static readonly RULE_rightLowerBounds = 6;
    static readonly RULE_leftLowerBounds = 7;
    static readonly RULE_upperBounds = 8;
    static readonly RULE_boundsList = 9;
    static readonly RULE_bound = 10;
    // tslint:disable:no-trailing-whitespace
    static readonly ruleNames: string[] = [
      'top', 'type', 'explicit', 'unconstrained', 'constrained', 'paramsList',
      'rightLowerBounds', 'leftLowerBounds', 'upperBounds', 'boundsList', 'bound',
    ];

    private static readonly _LITERAL_NAMES: Array<string | undefined> = [
      undefined, '\'[\'', '\',\'', '\']\'', '\'>:\'', '\'<:\'',
    ];
    private static readonly _SYMBOLIC_NAMES: Array<string | undefined> = [
      undefined, undefined, undefined, undefined, undefined, undefined, 'GID',
      'EID', 'WS',
    ];
    static readonly VOCABULARY: Vocabulary = new VocabularyImpl(TypeParser._LITERAL_NAMES, TypeParser._SYMBOLIC_NAMES, []);

    // @Override
    // @NotNull
    get vocabulary(): Vocabulary {
      return TypeParser.VOCABULARY;
    }
    // tslint:enable:no-trailing-whitespace

    // @Override
    get grammarFileName(): string {
      return 'Type.g4';
    }

    // @Override
    get ruleNames(): string[] {
      return TypeParser.ruleNames;
    }

    // @Override
    get serializedATN(): string {
      return TypeParser._serializedATN;
    }

    protected createFailedPredicateException(predicate?: string, message?: string): FailedPredicateException {
      return new FailedPredicateException(this, predicate, message);
    }

    constructor(input: TokenStream) {
      super(input);
      this._interp = new ParserATNSimulator(TypeParser._ATN, this);
    }
    // @RuleVersion(0)
    top(): TopContext {
      const _localctx: TopContext = new TopContext(this._ctx, this.state);
      this.enterRule(_localctx, 0, TypeParser.RULE_top);
      try {
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 22;
          this.type();
          this.state = 23;
          this.match(TypeParser.EOF);
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    type(): TypeContext {
      const _localctx: TypeContext = new TypeContext(this._ctx, this.state);
      this.enterRule(_localctx, 2, TypeParser.RULE_type);
      try {
        this.state = 28;
        this._errHandler.sync(this);
        switch ( this.interpreter.adaptivePredict(this._input, 0, this._ctx) ) {
          case 1:
            this.enterOuterAlt(_localctx, 1);
            {
              this.state = 25;
              this.explicit();
            }
            break;

          case 2:
            this.enterOuterAlt(_localctx, 2);
            {
              this.state = 26;
              this.unconstrained();
            }
            break;

          case 3:
            this.enterOuterAlt(_localctx, 3);
            {
              this.state = 27;
              this.constrained();
            }
            break;
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    explicit(): ExplicitContext {
      const _localctx: ExplicitContext = new ExplicitContext(this._ctx, this.state);
      this.enterRule(_localctx, 4, TypeParser.RULE_explicit);
      let _la: number;
      try {
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 30;
          this.match(TypeParser.EID);
          this.state = 32;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
          if (_la === TypeParser.T__0) {
            {
              this.state = 31;
              this.paramsList();
            }
          }
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    unconstrained(): UnconstrainedContext {
      const _localctx: UnconstrainedContext = new UnconstrainedContext(this._ctx, this.state);
      this.enterRule(_localctx, 6, TypeParser.RULE_unconstrained);
      try {
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 34;
          this.match(TypeParser.GID);
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    constrained(): ConstrainedContext {
      const _localctx: ConstrainedContext = new ConstrainedContext(this._ctx, this.state);
      this.enterRule(_localctx, 8, TypeParser.RULE_constrained);
      try {
        this.state = 44;
        this._errHandler.sync(this);
        switch ( this.interpreter.adaptivePredict(this._input, 2, this._ctx) ) {
          case 1:
            this.enterOuterAlt(_localctx, 1);
            {
              this.state = 36;
              this.match(TypeParser.GID);
              this.state = 37;
              this.rightLowerBounds();
            }
            break;

          case 2:
            this.enterOuterAlt(_localctx, 2);
            {
              this.state = 38;
              this.match(TypeParser.GID);
              this.state = 39;
              this.upperBounds();
            }
            break;

          case 3:
            this.enterOuterAlt(_localctx, 3);
            {
              this.state = 40;
              this.leftLowerBounds();
              this.state = 41;
              this.match(TypeParser.GID);
              this.state = 42;
              this.upperBounds();
            }
            break;
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    paramsList(): ParamsListContext {
      const _localctx: ParamsListContext = new ParamsListContext(this._ctx, this.state);
      this.enterRule(_localctx, 10, TypeParser.RULE_paramsList);
      let _la: number;
      try {
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 46;
          this.match(TypeParser.T__0);
          this.state = 47;
          this.type();
          this.state = 52;
          this._errHandler.sync(this);
          _la = this._input.LA(1);
          while (_la === TypeParser.T__1) {
            {
              {
                this.state = 48;
                this.match(TypeParser.T__1);
                this.state = 49;
                this.type();
              }
            }
            this.state = 54;
            this._errHandler.sync(this);
            _la = this._input.LA(1);
          }
          this.state = 55;
          this.match(TypeParser.T__2);
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    rightLowerBounds(): RightLowerBoundsContext {
      const _localctx: RightLowerBoundsContext = new RightLowerBoundsContext(this._ctx, this.state);
      this.enterRule(_localctx, 12, TypeParser.RULE_rightLowerBounds);
      try {
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 57;
          this.match(TypeParser.T__3);
          this.state = 58;
          this.boundsList();
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    leftLowerBounds(): LeftLowerBoundsContext {
      const _localctx: LeftLowerBoundsContext = new LeftLowerBoundsContext(this._ctx, this.state);
      this.enterRule(_localctx, 14, TypeParser.RULE_leftLowerBounds);
      try {
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 60;
          this.boundsList();
          this.state = 61;
          this.match(TypeParser.T__4);
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    upperBounds(): UpperBoundsContext {
      const _localctx: UpperBoundsContext = new UpperBoundsContext(this._ctx, this.state);
      this.enterRule(_localctx, 16, TypeParser.RULE_upperBounds);
      try {
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 63;
          this.match(TypeParser.T__4);
          this.state = 64;
          this.boundsList();
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    boundsList(): BoundsListContext {
      const _localctx: BoundsListContext = new BoundsListContext(this._ctx, this.state);
      this.enterRule(_localctx, 18, TypeParser.RULE_boundsList);
      try {
        let _alt: number;
        this.enterOuterAlt(_localctx, 1);
        {
          this.state = 66;
          this.bound();
          this.state = 71;
          this._errHandler.sync(this);
          _alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
          while (_alt !== 2 && _alt !== ATN.INVALID_ALT_NUMBER) {
            if (_alt === 1) {
              {
                {
                  this.state = 67;
                  this.match(TypeParser.T__1);
                  this.state = 68;
                  this.bound();
                }
              }
            }
            this.state = 73;
            this._errHandler.sync(this);
            _alt = this.interpreter.adaptivePredict(this._input, 4, this._ctx);
          }
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }
    // @RuleVersion(0)
    bound(): BoundContext {
      const _localctx: BoundContext = new BoundContext(this._ctx, this.state);
      this.enterRule(_localctx, 20, TypeParser.RULE_bound);
      try {
        this.state = 76;
        this._errHandler.sync(this);
        switch (this._input.LA(1)) {
          case TypeParser.GID:
            this.enterOuterAlt(_localctx, 1);
            {
              this.state = 74;
              this.unconstrained();
            }
            break;
          case TypeParser.EID:
            this.enterOuterAlt(_localctx, 2);
            {
              this.state = 75;
              this.explicit();
            }
            break;
          default:
            throw new NoViableAltException(this);
        }
      } catch (re) {
        if (re instanceof RecognitionException) {
          _localctx.exception = re;
          this._errHandler.reportError(this, re);
          this._errHandler.recover(this, re);
        } else {
          throw re;
        }
      } finally {
        this.exitRule();
      }
      return _localctx;
    }

    static readonly _serializedATN: string =
        '\x03\uC91D\uCABA\u058D\uAFBA\u4F53\u0607\uEA8B\uC241\x03\nQ\x04\x02\t' +
        '\x02\x04\x03\t\x03\x04\x04\t\x04\x04\x05\t\x05\x04\x06\t\x06\x04\x07\t' +
        '\x07\x04\b\t\b\x04\t\t\t\x04\n\t\n\x04\v\t\v\x04\f\t\f\x03\x02\x03\x02' +
        '\x03\x02\x03\x03\x03\x03\x03\x03\x05\x03\x1F\n\x03\x03\x04\x03\x04\x05' +
        '\x04#\n\x04\x03\x05\x03\x05\x03\x06\x03\x06\x03\x06\x03\x06\x03\x06\x03' +
        '\x06\x03\x06\x03\x06\x05\x06/\n\x06\x03\x07\x03\x07\x03\x07\x03\x07\x07' +
        '\x075\n\x07\f\x07\x0E\x078\v\x07\x03\x07\x03\x07\x03\b\x03\b\x03\b\x03' +
        '\t\x03\t\x03\t\x03\n\x03\n\x03\n\x03\v\x03\v\x03\v\x07\vH\n\v\f\v\x0E' +
        '\vK\v\v\x03\f\x03\f\x05\fO\n\f\x03\f\x02\x02\x02\r\x02\x02\x04\x02\x06' +
        '\x02\b\x02\n\x02\f\x02\x0E\x02\x10\x02\x12\x02\x14\x02\x16\x02\x02\x02' +
        '\x02M\x02\x18\x03\x02\x02\x02\x04\x1E\x03\x02\x02\x02\x06 \x03\x02\x02' +
        '\x02\b$\x03\x02\x02\x02\n.\x03\x02\x02\x02\f0\x03\x02\x02\x02\x0E;\x03' +
        '\x02\x02\x02\x10>\x03\x02\x02\x02\x12A\x03\x02\x02\x02\x14D\x03\x02\x02' +
        '\x02\x16N\x03\x02\x02\x02\x18\x19\x05\x04\x03\x02\x19\x1A\x07\x02\x02' +
        '\x03\x1A\x03\x03\x02\x02\x02\x1B\x1F\x05\x06\x04\x02\x1C\x1F\x05\b\x05' +
        '\x02\x1D\x1F\x05\n\x06\x02\x1E\x1B\x03\x02\x02\x02\x1E\x1C\x03\x02\x02' +
        '\x02\x1E\x1D\x03\x02\x02\x02\x1F\x05\x03\x02\x02\x02 "\x07\t\x02\x02' +
        '!#\x05\f\x07\x02"!\x03\x02\x02\x02"#\x03\x02\x02\x02#\x07\x03\x02\x02' +
        '\x02$%\x07\b\x02\x02%\t\x03\x02\x02\x02&\'\x07\b\x02\x02\'/\x05\x0E\b' +
        '\x02()\x07\b\x02\x02)/\x05\x12\n\x02*+\x05\x10\t\x02+,\x07\b\x02\x02,' +
        '-\x05\x12\n\x02-/\x03\x02\x02\x02.&\x03\x02\x02\x02.(\x03\x02\x02\x02' +
        '.*\x03\x02\x02\x02/\v\x03\x02\x02\x0201\x07\x03\x02\x0216\x05\x04\x03' +
        '\x0223\x07\x04\x02\x0235\x05\x04\x03\x0242\x03\x02\x02\x0258\x03\x02\x02' +
        '\x0264\x03\x02\x02\x0267\x03\x02\x02\x0279\x03\x02\x02\x0286\x03\x02\x02' +
        '\x029:\x07\x05\x02\x02:\r\x03\x02\x02\x02;<\x07\x06\x02\x02<=\x05\x14' +
        '\v\x02=\x0F\x03\x02\x02\x02>?\x05\x14\v\x02?@\x07\x07\x02\x02@\x11\x03' +
        '\x02\x02\x02AB\x07\x07\x02\x02BC\x05\x14\v\x02C\x13\x03\x02\x02\x02DI' +
        '\x05\x16\f\x02EF\x07\x04\x02\x02FH\x05\x16\f\x02GE\x03\x02\x02\x02HK\x03' +
        '\x02\x02\x02IG\x03\x02\x02\x02IJ\x03\x02\x02\x02J\x15\x03\x02\x02\x02' +
        'KI\x03\x02\x02\x02LO\x05\b\x05\x02MO\x05\x06\x04\x02NL\x03\x02\x02\x02' +
        'NM\x03\x02\x02\x02O\x17\x03\x02\x02\x02\b\x1E".6IN';
    static __ATN: ATN;
    static get _ATN(): ATN {
      if (!TypeParser.__ATN) {
        TypeParser.__ATN = new ATNDeserializer().deserialize(Utils.toCharArray(TypeParser._serializedATN));
      }

      return TypeParser.__ATN;
    }
}

export class TopContext extends ParserRuleContext {
  type(): TypeContext {
    return this.getRuleContext(0, TypeContext);
  }
  EOF(): TerminalNode {
    return this.getToken(TypeParser.EOF, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_top;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitTop) {
      return visitor.visitTop(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class TypeContext extends ParserRuleContext {
  explicit(): ExplicitContext | undefined {
    return this.tryGetRuleContext(0, ExplicitContext);
  }
  unconstrained(): UnconstrainedContext | undefined {
    return this.tryGetRuleContext(0, UnconstrainedContext);
  }
  constrained(): ConstrainedContext | undefined {
    return this.tryGetRuleContext(0, ConstrainedContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_type;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitType) {
      return visitor.visitType(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class ExplicitContext extends ParserRuleContext {
  EID(): TerminalNode {
    return this.getToken(TypeParser.EID, 0);
  }
  paramsList(): ParamsListContext | undefined {
    return this.tryGetRuleContext(0, ParamsListContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_explicit;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitExplicit) {
      return visitor.visitExplicit(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class UnconstrainedContext extends ParserRuleContext {
  GID(): TerminalNode {
    return this.getToken(TypeParser.GID, 0);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_unconstrained;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitUnconstrained) {
      return visitor.visitUnconstrained(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class ConstrainedContext extends ParserRuleContext {
  GID(): TerminalNode {
    return this.getToken(TypeParser.GID, 0);
  }
  rightLowerBounds(): RightLowerBoundsContext | undefined {
    return this.tryGetRuleContext(0, RightLowerBoundsContext);
  }
  upperBounds(): UpperBoundsContext | undefined {
    return this.tryGetRuleContext(0, UpperBoundsContext);
  }
  leftLowerBounds(): LeftLowerBoundsContext | undefined {
    return this.tryGetRuleContext(0, LeftLowerBoundsContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_constrained;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitConstrained) {
      return visitor.visitConstrained(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class ParamsListContext extends ParserRuleContext {
  type(): TypeContext[];
  type(i: number): TypeContext;
  type(i?: number): TypeContext | TypeContext[] {
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
  get ruleIndex(): number {
    return TypeParser.RULE_paramsList;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitParamsList) {
      return visitor.visitParamsList(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class RightLowerBoundsContext extends ParserRuleContext {
  boundsList(): BoundsListContext {
    return this.getRuleContext(0, BoundsListContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_rightLowerBounds;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitRightLowerBounds) {
      return visitor.visitRightLowerBounds(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class LeftLowerBoundsContext extends ParserRuleContext {
  boundsList(): BoundsListContext {
    return this.getRuleContext(0, BoundsListContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_leftLowerBounds;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitLeftLowerBounds) {
      return visitor.visitLeftLowerBounds(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class UpperBoundsContext extends ParserRuleContext {
  boundsList(): BoundsListContext {
    return this.getRuleContext(0, BoundsListContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_upperBounds;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitUpperBounds) {
      return visitor.visitUpperBounds(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class BoundsListContext extends ParserRuleContext {
  bound(): BoundContext[];
  bound(i: number): BoundContext;
  bound(i?: number): BoundContext | BoundContext[] {
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
  get ruleIndex(): number {
    return TypeParser.RULE_boundsList;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitBoundsList) {
      return visitor.visitBoundsList(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


export class BoundContext extends ParserRuleContext {
  unconstrained(): UnconstrainedContext | undefined {
    return this.tryGetRuleContext(0, UnconstrainedContext);
  }
  explicit(): ExplicitContext | undefined {
    return this.tryGetRuleContext(0, ExplicitContext);
  }
  constructor(parent: ParserRuleContext | undefined, invokingState: number) {
    super(parent, invokingState);
  }
  // @Override
  get ruleIndex(): number {
    return TypeParser.RULE_bound;
  }
  // @Override
  accept<Result>(visitor: TypeVisitor<Result>): Result {
    if (visitor.visitBound) {
      return visitor.visitBound(this);
    } else {
      return visitor.visitChildren(this);
    }
  }
}


