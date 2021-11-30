// Generated from Type.g4 by ANTLR 4.9.0-SNAPSHOT


import {ParseTreeVisitor} from 'antlr4ts/tree/ParseTreeVisitor';

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
import {ExplicitInstantiation, GenericInstantiation, TypeInstantiation} from "../type_instantiation";


/**
 * This interface defines a complete generic visitor for a parse tree produced
 * by `TypeParser`.
 *
 * @param <Result> The return type of the visit operation. Use `void` for
 * operations with no return type.
 */
export interface TypeVisitor extends ParseTreeVisitor<TypeInstantiation> {
  /**
   * Visit a parse tree produced by `TypeParser.type`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitType?: (ctx: TypeContext) => TypeInstantiation;

  /**
   * Visit a parse tree produced by `TypeParser.explicit`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitExplicit?: (ctx: ExplicitContext) => ExplicitInstantiation;

  /**
   * Visit a parse tree produced by `TypeParser.unconstrained`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUnconstrained?: (ctx: UnconstrainedContext) => GenericInstantiation;

  /**
   * Visit a parse tree produced by `TypeParser.constrained`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitConstrained?: (ctx: ConstrainedContext) => GenericInstantiation;

  /**
   * Visit a parse tree produced by `TypeParser.paramsList`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitParamsList?: (ctx: ParamsListContext) => TypeInstantiation[];

  /**
   * Visit a parse tree produced by `TypeParser.rightLowerBounds`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitRightLowerBounds?: (ctx: RightLowerBoundsContext) => TypeInstantiation[];

  /**
   * Visit a parse tree produced by `TypeParser.leftLowerBounds`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitLeftLowerBounds?: (ctx: LeftLowerBoundsContext) => TypeInstantiation[];

  /**
   * Visit a parse tree produced by `TypeParser.upperBounds`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitUpperBounds?: (ctx: UpperBoundsContext) => TypeInstantiation[];

  /**
   * Visit a parse tree produced by `TypeParser.boundsList`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBoundsList?: (ctx: BoundsListContext) => TypeInstantiation[];

  /**
   * Visit a parse tree produced by `TypeParser.bound`.
   * @param ctx the parse tree
   * @return the visitor result
   */
  visitBound?: (ctx: BoundContext) => TypeInstantiation;
}

