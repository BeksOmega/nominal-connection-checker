/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {Block, Connection} from 'blockly';
import {TypeHierarchy} from './type_hierarchy';
import {ExplicitInstantiation, GenericInstantiation, TypeInstantiation} from './type_instantiation';
import {combine} from './utils';
import {parseType} from './type_parser';

export class ConnectionTyper {
  constructor(
      readonly hierarchy: TypeHierarchy,
  ) {}

  getTypesOfConnection(c: Connection): TypeInstantiation[] {
    if (c.isSuperior()) return this.getTypesOfInput(c);
    return this.hierarchy.getNearestCommonAncestors(
        ...this.getTypesOfOutput(c));
  }

  private getTypesOfInput(c: Connection): TypeInstantiation[] {
    const t = this.getCheck(c);
    const gens = this.getGenericsOfType(t);
    if (!gens.length) return [t];

    const s = c.getSourceBlock();
    const c2 = s.outputConnection || s.previousConnection;
    const ot = this.getCheck(c2);
    if (!c2 || !c2.targetConnection ||
        !gens.some(g => this.typeContainsGeneric(ot, g))) {
      return [new GenericInstantiation('')];
    }
    const pts = this.getTypesOfConnection(c2.targetConnection);
    // TOOD: Is this how they array should work? Or should we be mapping each
    //   explicit to a new param type?
    return gens.reduce(
        (accts, g) =>
          accts.flatMap(
              a => this.replaceGenericWithTypes(
                  a, g, pts.flatMap(p => this.getTypesBoundToGeneric(p, ot, g)))),
        [t]);
  }

  private getTypesOfOutput(c: Connection): TypeInstantiation[] {
    const t = this.getCheck(c);
    if (t instanceof ExplicitInstantiation) {
      return [t];
    } else if (t instanceof GenericInstantiation) {
      const s = c.getSourceBlock();
      const matches = this.getInputConnections(s).reduce((acc, c2) => {
        if (!this.getCheck(c2).equals(t) || !c2.targetConnection) return acc;
        // TODO: Not sure if we need to do an explicit test like inputs.
        return [...acc, ...this.getTypesOfOutput(c2.targetConnection, )];
      }, [] as TypeInstantiation[]);
      if (matches.length) return matches;
      return [new GenericInstantiation(
          '', t.unfilteredLowerBounds, t.unfilteredUpperBounds)];
    }
  }

  private getGenericsOfType(t: TypeInstantiation): GenericInstantiation[] {
    if (t instanceof GenericInstantiation) {
      return [t];
    } else if (t instanceof ExplicitInstantiation) {
      return t.params
          // TODO: Handle duplicate generics.
          // TODO: Handle bounds in duplicate generics.
          .flatMap(ot => this.getGenericsOfType(ot));
    }
  }

  private typeContainsGeneric(t: TypeInstantiation, g: GenericInstantiation) {
    if (t instanceof GenericInstantiation) {
      return t.isEquivalentTo(g);
    } else if (t instanceof ExplicitInstantiation) {
      return t.params.some(p => this.typeContainsGeneric(p, g));
    }
  }

  private getTypesBoundToGeneric(
      t: TypeInstantiation,
      ref: TypeInstantiation,
      g: GenericInstantiation
  ): TypeInstantiation[] {
    if (ref instanceof GenericInstantiation) {
      return ref.isEquivalentTo(g) ? [t] : null;
    }
    if (ref instanceof ExplicitInstantiation &&
        t instanceof ExplicitInstantiation) {
      const mapped = this.hierarchy.getTypeDef(t.name)
          .getParamsForDescendant(ref.name, t.params);
      // TODO: Tests for nested params.
      return ref.params.flatMap(
          // TODO: Is this how we should be handling multiple mappings for at
          // generic?
          (rp, i) => mapped[i].flatMap(
              m => this.getTypesBoundToGeneric(m, rp, g)));
    }
    return [];
  }

  private replaceGenericWithTypes(
      t: TypeInstantiation,
      g: GenericInstantiation,
      news: TypeInstantiation[],
  ): TypeInstantiation[] {
    if (t instanceof GenericInstantiation) {
      if (t.isEquivalentTo(g)) return news.map(n => n.clone());
      return [t];
    }
    if (t instanceof ExplicitInstantiation) {
      // TODO: All this needs to be tested w/ multiple params as well.
      if (!t.params.length) return [t];
      // Typescript can't deal w/ heterogeneous arrays :/
      const mapped: any = t.params.map(
          p => this.replaceGenericWithTypes(p, g, news));
      mapped[0] = mapped[0].map(v => [v]);
      const combos: TypeInstantiation[][] = combine(mapped);
      return combos.map(c => new ExplicitInstantiation(t.name, c));
    }
  }

  private getInputConnections(b: Block): Connection[] {
    return b.inputList.map(i => i.connection);
  }

  private getCheck(c: Connection): TypeInstantiation {
    return parseType(c.getCheck()[0]);
  }
}
