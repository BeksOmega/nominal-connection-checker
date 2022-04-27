// Generated from Type.g4 by ANTLR 4.9.0-SNAPSHOT


import {ParseTreeVisitor} from 'antlr4ts/tree/ParseTreeVisitor';

import {TopContext} from './TypeParser';
import {TypeContext} from './TypeParser';
import {ExplicitContext} from './TypeParser';
import {UnconstrainedContext} from './TypeParser';
import {ConstrainedContext} from './TypeParser';
import {ParamsListContext} from './TypeParser';
import {RightLowerBoundsContext} from './TypeParser';
import {LeftLowerBoundsContext} from './TypeParser';
import {UpperBoundsContext} from './TypeParser';
import {BoundsListContext} from './TypeParser';
import {BoundContext} from './TypeParser';


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `TypeParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface TypeVisitor<Result> extends ParseTreeVisitor<Result> {
  /**
   * Visit a parse tree produced by `TypeParser.top`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitTop?: (ctx: TopContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.type`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitType?: (ctx: TypeContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.explicit`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExplicit?: (ctx: ExplicitContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.unconstrained`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUnconstrained?: (ctx: UnconstrainedContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.constrained`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitConstrained?: (ctx: ConstrainedContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.paramsList`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParamsList?: (ctx: ParamsListContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.rightLowerBounds`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRightLowerBounds?: (ctx: RightLowerBoundsContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.leftLowerBounds`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLeftLowerBounds?: (ctx: LeftLowerBoundsContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.upperBounds`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUpperBounds?: (ctx: UpperBoundsContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.boundsList`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBoundsList?: (ctx: BoundsListContext) => Result;

  /**
   * Visit a parse tree produced by `TypeParser.bound`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBound?: (ctx: BoundContext) => Result;
}

