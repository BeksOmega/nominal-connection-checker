/* eslint-disable new-cap */
/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {AbstractParseTreeVisitor} from 'antlr4ts/tree';
import {BoundContext, BoundsListContext, ConstrainedContext, ExplicitContext, LeftLowerBoundsContext, ParamsListContext, RightLowerBoundsContext, TypeContext, UnconstrainedContext, UpperBoundsContext} from './TypeParser';
import {ExplicitInstantiation, GenericInstantiation, TypeInstantiation} from '../type_instantiation';
import {TypeVisitor} from './TypeVisitor1';

export class SimpleTypeVisitor extends
  AbstractParseTreeVisitor<TypeInstantiation> implements
  TypeVisitor {
  protected defaultResult(): TypeInstantiation {
    return undefined;
  }

  visitType(ctx: TypeContext): TypeInstantiation {
    if (ctx.explicit()) return this.visitExplicit(ctx.explicit());
    if (ctx.unconstrained()) return this.visitUnconstrained(ctx.unconstrained());
    if (ctx.constrained()) return this.visitConstrained(ctx.constrained());
  }

  visitExplicit(ctx: ExplicitContext): ExplicitInstantiation {
    return new ExplicitInstantiation(
        ctx.EID().toString(),
        ctx.paramsList() ? this.visitParamsList(ctx.paramsList()) : []);
  }

  visitUnconstrained(ctx: UnconstrainedContext): GenericInstantiation {
    return new GenericInstantiation(ctx.GID().toString());
  }

  visitConstrained(ctx: ConstrainedContext): GenericInstantiation {
    let lowerBounds = [];
    if (ctx.rightLowerBounds()) {
      lowerBounds = this.visitRightLowerBounds(ctx.rightLowerBounds());
    }
    if (ctx.leftLowerBounds()) {
      lowerBounds = this.visitLeftLowerBounds(ctx.leftLowerBounds());
    }
    let upperBounds = [];
    if (ctx.upperBounds()) {
      upperBounds = this.visitUpperBounds(ctx.upperBounds());
    }
    return new GenericInstantiation(
        ctx.GID().toString(), lowerBounds, upperBounds);
  }

  visitParamsList(ctx: ParamsListContext): TypeInstantiation[] {
    return ctx.type().map(t => this.visit(t));
  }

  visitRightLowerBounds(ctx: RightLowerBoundsContext): TypeInstantiation[] {
    return this.visitBoundsList(ctx.boundsList());
  }

  visitLeftLowerBounds(ctx: LeftLowerBoundsContext): TypeInstantiation[] {
    return this.visitBoundsList(ctx.boundsList());
  }

  visitUpperBounds(ctx: UpperBoundsContext): TypeInstantiation[] {
    return this.visitBoundsList(ctx.boundsList());
  }

  visitBoundsList(ctx: BoundsListContext): TypeInstantiation[] {
    return ctx.bound().map(b => this.visit(b));
  }

  visitBound(ctx: BoundContext): TypeInstantiation {
    if (ctx.explicit()) return this.visit(ctx.explicit());
    if (ctx.unconstrained()) return this.visit(ctx.unconstrained());
  }
}
