/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeInstantiation} from './type_instantiation';
import {TypeLexer} from './type-parser/TypeLexer';
import {TypeParser} from './type-parser/TypeParser';
import {SimpleTypeVisitor} from './type-parser/SimpleTypeVisitor';
import {ANTLRInputStream, CommonTokenStream} from 'antlr4ts';
import {ErrorListener} from './type-parser/ErrorListener';

export function parseType(str: string): TypeInstantiation {
  const inputStream = new ANTLRInputStream(str);
  const lexer = new TypeLexer(inputStream);
  lexer.removeErrorListeners();
  lexer.addErrorListener(new ErrorListener());
  const tokenStream = new CommonTokenStream(lexer);
  const parser = new TypeParser(tokenStream);
  parser.removeErrorListeners();
  parser.addErrorListener(new ErrorListener());
  const visitor = new SimpleTypeVisitor();
  return visitor.visit(parser.top());
}
