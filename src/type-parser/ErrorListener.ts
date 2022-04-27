/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ANTLRErrorListener, RecognitionException, Recognizer, Token} from 'antlr4ts';
import {ParseError} from '../exceptions';

export class ErrorListener implements ANTLRErrorListener<never> {
  syntaxError(
      recognizer: Recognizer<never, never>,
      offendingSymbol: never,
      line: number,
      charPositionInLine: number,
      msg: string,
      e: RecognitionException
  ) {
    throw new ParseError(msg);
  }
}
