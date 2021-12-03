// Generated from Type.g4 by ANTLR 4.5.3
// jshint ignore: start
const antlr4 = require('antlr4/index');
const TypeVisitor = require('./TypeVisitor2').TypeVisitor2;

const grammarFileName = 'Type.g4';

const serializedATN = ['\u0003\u0430\ud6d1\u8206\uad2d\u4417\uaef1\u8d80\uaadd',
  '\u0003\nL\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t\u0004',
  '\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0004\b',
  '\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0003\u0002\u0003\u0002',
  '\u0003\u0002\u0005\u0002\u001a\n\u0002\u0003\u0003\u0003\u0003\u0005',
  '\u0003\u001e\n\u0003\u0003\u0004\u0003\u0004\u0003\u0005\u0003\u0005',
  '\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005',
  '\u0005\u0005*\n\u0005\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006',
  '\u0007\u00060\n\u0006\f\u0006\u000e\u00063\u000b\u0006\u0003\u0006\u0003',
  '\u0006\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b\u0003\b\u0003\b\u0003',
  '\t\u0003\t\u0003\t\u0003\n\u0003\n\u0003\n\u0007\nC\n\n\f\n\u000e\n',
  'F\u000b\n\u0003\u000b\u0003\u000b\u0005\u000bJ\n\u000b\u0003\u000b\u0002',
  '\u0002\f\u0002\u0004\u0006\b\n\f\u000e\u0010\u0012\u0014\u0002\u0002',
  'I\u0002\u0019\u0003\u0002\u0002\u0002\u0004\u001b\u0003\u0002\u0002',
  '\u0002\u0006\u001f\u0003\u0002\u0002\u0002\b)\u0003\u0002\u0002\u0002',
  '\n+\u0003\u0002\u0002\u0002\f6\u0003\u0002\u0002\u0002\u000e9\u0003',
  '\u0002\u0002\u0002\u0010<\u0003\u0002\u0002\u0002\u0012?\u0003\u0002',
  '\u0002\u0002\u0014I\u0003\u0002\u0002\u0002\u0016\u001a\u0005\u0004',
  '\u0003\u0002\u0017\u001a\u0005\u0006\u0004\u0002\u0018\u001a\u0005\b',
  '\u0005\u0002\u0019\u0016\u0003\u0002\u0002\u0002\u0019\u0017\u0003\u0002',
  '\u0002\u0002\u0019\u0018\u0003\u0002\u0002\u0002\u001a\u0003\u0003\u0002',
  '\u0002\u0002\u001b\u001d\u0007\t\u0002\u0002\u001c\u001e\u0005\n\u0006',
  '\u0002\u001d\u001c\u0003\u0002\u0002\u0002\u001d\u001e\u0003\u0002\u0002',
  '\u0002\u001e\u0005\u0003\u0002\u0002\u0002\u001f \u0007\b\u0002\u0002',
  ' \u0007\u0003\u0002\u0002\u0002!"\u0007\b\u0002\u0002"*\u0005\f\u0007',
  '\u0002#$\u0007\b\u0002\u0002$*\u0005\u0010\t\u0002%&\u0005\u000e\b\u0002',
  '&\'\u0007\b\u0002\u0002\'(\u0005\u0010\t\u0002(*\u0003\u0002\u0002\u0002',
  ')!\u0003\u0002\u0002\u0002)#\u0003\u0002\u0002\u0002)%\u0003\u0002\u0002',
  '\u0002*\t\u0003\u0002\u0002\u0002+,\u0007\u0003\u0002\u0002,1\u0005',
  '\u0002\u0002\u0002-.\u0007\u0004\u0002\u0002.0\u0005\u0002\u0002\u0002',
  '/-\u0003\u0002\u0002\u000203\u0003\u0002\u0002\u00021/\u0003\u0002\u0002',
  '\u000212\u0003\u0002\u0002\u000224\u0003\u0002\u0002\u000231\u0003\u0002',
  '\u0002\u000245\u0007\u0005\u0002\u00025\u000b\u0003\u0002\u0002\u0002',
  '67\u0007\u0006\u0002\u000278\u0005\u0012\n\u00028\r\u0003\u0002\u0002',
  '\u00029:\u0005\u0012\n\u0002:;\u0007\u0007\u0002\u0002;\u000f\u0003',
  '\u0002\u0002\u0002<=\u0007\u0007\u0002\u0002=>\u0005\u0012\n\u0002>',
  '\u0011\u0003\u0002\u0002\u0002?D\u0005\u0014\u000b\u0002@A\u0007\u0004',
  '\u0002\u0002AC\u0005\u0014\u000b\u0002B@\u0003\u0002\u0002\u0002CF\u0003',
  '\u0002\u0002\u0002DB\u0003\u0002\u0002\u0002DE\u0003\u0002\u0002\u0002',
  'E\u0013\u0003\u0002\u0002\u0002FD\u0003\u0002\u0002\u0002GJ\u0005\u0006',
  '\u0004\u0002HJ\u0005\u0004\u0003\u0002IG\u0003\u0002\u0002\u0002IH\u0003',
  '\u0002\u0002\u0002J\u0015\u0003\u0002\u0002\u0002\b\u0019\u001d)1DI'].join('');


const atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

const decisionsToDFA = atn.decisionToState.map( function(ds, index) {
  return new antlr4.dfa.DFA(ds, index);
});

const sharedContextCache = new antlr4.PredictionContextCache();

const literalNames = [null, '\'[\'', '\',\'', '\']\'', '\'>:\'', '\'<:\''];

const symbolicNames = [null, null, null, null, null, null, 'GID', 'EID',
  'WS'];

const ruleNames = ['type', 'explicit', 'unconstrained', 'constrained', 'paramsList',
  'rightLowerBounds', 'leftLowerBounds', 'upperBounds',
  'boundsList', 'bound'];

function TypeParser(input) {
  antlr4.Parser.call(this, input);
  this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
  this.ruleNames = ruleNames;
  this.literalNames = literalNames;
  this.symbolicNames = symbolicNames;
  return this;
}

TypeParser.prototype = Object.create(antlr4.Parser.prototype);
TypeParser.prototype.constructor = TypeParser;

Object.defineProperty(TypeParser.prototype, 'atn', {
  get: function() {
    return atn;
  },
});

TypeParser.EOF = antlr4.Token.EOF;
TypeParser.T__0 = 1;
TypeParser.T__1 = 2;
TypeParser.T__2 = 3;
TypeParser.T__3 = 4;
TypeParser.T__4 = 5;
TypeParser.GID = 6;
TypeParser.EID = 7;
TypeParser.WS = 8;

TypeParser.RULE_type = 0;
TypeParser.RULE_explicit = 1;
TypeParser.RULE_unconstrained = 2;
TypeParser.RULE_constrained = 3;
TypeParser.RULE_paramsList = 4;
TypeParser.RULE_rightLowerBounds = 5;
TypeParser.RULE_leftLowerBounds = 6;
TypeParser.RULE_upperBounds = 7;
TypeParser.RULE_boundsList = 8;
TypeParser.RULE_bound = 9;

function TypeContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_type;
  return this;
}

TypeContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
TypeContext.prototype.constructor = TypeContext;

TypeContext.prototype.explicit = function() {
  return this.getTypedRuleContext(ExplicitContext, 0);
};

TypeContext.prototype.unconstrained = function() {
  return this.getTypedRuleContext(UnconstrainedContext, 0);
};

TypeContext.prototype.constrained = function() {
  return this.getTypedRuleContext(ConstrainedContext, 0);
};

TypeContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitType(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.TypeContext = TypeContext;

TypeParser.prototype.type = function() {
  const localctx = new TypeContext(this, this._ctx, this.state);
  this.enterRule(localctx, 0, TypeParser.RULE_type);
  try {
    this.state = 23;
    this._errHandler.sync(this);
    const la_ = this._interp.adaptivePredict(this._input, 0, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 20;
        this.explicit();
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 21;
        this.unconstrained();
        break;

      case 3:
        this.enterOuterAlt(localctx, 3);
        this.state = 22;
        this.constrained();
        break;
    }
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function ExplicitContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_explicit;
  return this;
}

ExplicitContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ExplicitContext.prototype.constructor = ExplicitContext;

ExplicitContext.prototype.EID = function() {
  return this.getToken(TypeParser.EID, 0);
};

ExplicitContext.prototype.paramsList = function() {
  return this.getTypedRuleContext(ParamsListContext, 0);
};

ExplicitContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitExplicit(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.ExplicitContext = ExplicitContext;

TypeParser.prototype.explicit = function() {
  const localctx = new ExplicitContext(this, this._ctx, this.state);
  this.enterRule(localctx, 2, TypeParser.RULE_explicit);
  let _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 25;
    this.match(TypeParser.EID);
    this.state = 27;
    _la = this._input.LA(1);
    if (_la===TypeParser.T__0) {
      this.state = 26;
      this.paramsList();
    }
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function UnconstrainedContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_unconstrained;
  return this;
}

UnconstrainedContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UnconstrainedContext.prototype.constructor = UnconstrainedContext;

UnconstrainedContext.prototype.GID = function() {
  return this.getToken(TypeParser.GID, 0);
};

UnconstrainedContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitUnconstrained(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.UnconstrainedContext = UnconstrainedContext;

TypeParser.prototype.unconstrained = function() {
  const localctx = new UnconstrainedContext(this, this._ctx, this.state);
  this.enterRule(localctx, 4, TypeParser.RULE_unconstrained);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 29;
    this.match(TypeParser.GID);
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function ConstrainedContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_constrained;
  return this;
}

ConstrainedContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ConstrainedContext.prototype.constructor = ConstrainedContext;

ConstrainedContext.prototype.GID = function() {
  return this.getToken(TypeParser.GID, 0);
};

ConstrainedContext.prototype.rightLowerBounds = function() {
  return this.getTypedRuleContext(RightLowerBoundsContext, 0);
};

ConstrainedContext.prototype.upperBounds = function() {
  return this.getTypedRuleContext(UpperBoundsContext, 0);
};

ConstrainedContext.prototype.leftLowerBounds = function() {
  return this.getTypedRuleContext(LeftLowerBoundsContext, 0);
};

ConstrainedContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitConstrained(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.ConstrainedContext = ConstrainedContext;

TypeParser.prototype.constrained = function() {
  const localctx = new ConstrainedContext(this, this._ctx, this.state);
  this.enterRule(localctx, 6, TypeParser.RULE_constrained);
  try {
    this.state = 39;
    this._errHandler.sync(this);
    const la_ = this._interp.adaptivePredict(this._input, 2, this._ctx);
    switch (la_) {
      case 1:
        this.enterOuterAlt(localctx, 1);
        this.state = 31;
        this.match(TypeParser.GID);
        this.state = 32;
        this.rightLowerBounds();
        break;

      case 2:
        this.enterOuterAlt(localctx, 2);
        this.state = 33;
        this.match(TypeParser.GID);
        this.state = 34;
        this.upperBounds();
        break;

      case 3:
        this.enterOuterAlt(localctx, 3);
        this.state = 35;
        this.leftLowerBounds();
        this.state = 36;
        this.match(TypeParser.GID);
        this.state = 37;
        this.upperBounds();
        break;
    }
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function ParamsListContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_paramsList;
  return this;
}

ParamsListContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ParamsListContext.prototype.constructor = ParamsListContext;

ParamsListContext.prototype.type = function(i) {
  if (i===undefined) {
    i = null;
  }
  if (i===null) {
    return this.getTypedRuleContexts(TypeContext);
  } else {
    return this.getTypedRuleContext(TypeContext, i);
  }
};

ParamsListContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitParamsList(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.ParamsListContext = ParamsListContext;

TypeParser.prototype.paramsList = function() {
  const localctx = new ParamsListContext(this, this._ctx, this.state);
  this.enterRule(localctx, 8, TypeParser.RULE_paramsList);
  let _la = 0; // Token type
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 41;
    this.match(TypeParser.T__0);
    this.state = 42;
    this.type();
    this.state = 47;
    this._errHandler.sync(this);
    _la = this._input.LA(1);
    while (_la===TypeParser.T__1) {
      this.state = 43;
      this.match(TypeParser.T__1);
      this.state = 44;
      this.type();
      this.state = 49;
      this._errHandler.sync(this);
      _la = this._input.LA(1);
    }
    this.state = 50;
    this.match(TypeParser.T__2);
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function RightLowerBoundsContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_rightLowerBounds;
  return this;
}

RightLowerBoundsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
RightLowerBoundsContext.prototype.constructor = RightLowerBoundsContext;

RightLowerBoundsContext.prototype.boundsList = function() {
  return this.getTypedRuleContext(BoundsListContext, 0);
};

RightLowerBoundsContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitRightLowerBounds(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.RightLowerBoundsContext = RightLowerBoundsContext;

TypeParser.prototype.rightLowerBounds = function() {
  const localctx = new RightLowerBoundsContext(this, this._ctx, this.state);
  this.enterRule(localctx, 10, TypeParser.RULE_rightLowerBounds);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 52;
    this.match(TypeParser.T__3);
    this.state = 53;
    this.boundsList();
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function LeftLowerBoundsContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_leftLowerBounds;
  return this;
}

LeftLowerBoundsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
LeftLowerBoundsContext.prototype.constructor = LeftLowerBoundsContext;

LeftLowerBoundsContext.prototype.boundsList = function() {
  return this.getTypedRuleContext(BoundsListContext, 0);
};

LeftLowerBoundsContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitLeftLowerBounds(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.LeftLowerBoundsContext = LeftLowerBoundsContext;

TypeParser.prototype.leftLowerBounds = function() {
  const localctx = new LeftLowerBoundsContext(this, this._ctx, this.state);
  this.enterRule(localctx, 12, TypeParser.RULE_leftLowerBounds);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 55;
    this.boundsList();
    this.state = 56;
    this.match(TypeParser.T__4);
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function UpperBoundsContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_upperBounds;
  return this;
}

UpperBoundsContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
UpperBoundsContext.prototype.constructor = UpperBoundsContext;

UpperBoundsContext.prototype.boundsList = function() {
  return this.getTypedRuleContext(BoundsListContext, 0);
};

UpperBoundsContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitUpperBounds(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.UpperBoundsContext = UpperBoundsContext;

TypeParser.prototype.upperBounds = function() {
  const localctx = new UpperBoundsContext(this, this._ctx, this.state);
  this.enterRule(localctx, 14, TypeParser.RULE_upperBounds);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 58;
    this.match(TypeParser.T__4);
    this.state = 59;
    this.boundsList();
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function BoundsListContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_boundsList;
  return this;
}

BoundsListContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
BoundsListContext.prototype.constructor = BoundsListContext;

BoundsListContext.prototype.bound = function(i) {
  if (i===undefined) {
    i = null;
  }
  if (i===null) {
    return this.getTypedRuleContexts(BoundContext);
  } else {
    return this.getTypedRuleContext(BoundContext, i);
  }
};

BoundsListContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitBoundsList(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.BoundsListContext = BoundsListContext;

TypeParser.prototype.boundsList = function() {
  const localctx = new BoundsListContext(this, this._ctx, this.state);
  this.enterRule(localctx, 16, TypeParser.RULE_boundsList);
  try {
    this.enterOuterAlt(localctx, 1);
    this.state = 61;
    this.bound();
    this.state = 66;
    this._errHandler.sync(this);
    let _alt = this._interp.adaptivePredict(this._input, 4, this._ctx);
    while (_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
      if (_alt===1) {
        this.state = 62;
        this.match(TypeParser.T__1);
        this.state = 63;
        this.bound();
      }
      this.state = 68;
      this._errHandler.sync(this);
      _alt = this._interp.adaptivePredict(this._input, 4, this._ctx);
    }
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};

function BoundContext(parser, parent, invokingState) {
  if (parent===undefined) {
	    parent = null;
  }
  if (invokingState===undefined || invokingState===null) {
    invokingState = -1;
  }
  antlr4.ParserRuleContext.call(this, parent, invokingState);
  this.parser = parser;
  this.ruleIndex = TypeParser.RULE_bound;
  return this;
}

BoundContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
BoundContext.prototype.constructor = BoundContext;

BoundContext.prototype.unconstrained = function() {
  return this.getTypedRuleContext(UnconstrainedContext, 0);
};

BoundContext.prototype.explicit = function() {
  return this.getTypedRuleContext(ExplicitContext, 0);
};

BoundContext.prototype.accept = function(visitor) {
  if ( visitor instanceof TypeVisitor ) {
    return visitor.visitBound(this);
  } else {
    return visitor.visitChildren(this);
  }
};


TypeParser.BoundContext = BoundContext;

TypeParser.prototype.bound = function() {
  const localctx = new BoundContext(this, this._ctx, this.state);
  this.enterRule(localctx, 18, TypeParser.RULE_bound);
  try {
    this.state = 71;
    switch (this._input.LA(1)) {
      case TypeParser.GID:
        this.enterOuterAlt(localctx, 1);
        this.state = 69;
        this.unconstrained();
        break;
      case TypeParser.EID:
        this.enterOuterAlt(localctx, 2);
        this.state = 70;
        this.explicit();
        break;
      default:
        throw new antlr4.error.NoViableAltException(this);
    }
  } catch (re) {
    	if (re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
  } finally {
    this.exitRule();
  }
  return localctx;
};


exports.TypeParser = TypeParser;
