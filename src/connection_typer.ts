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
    if (!c2 || !c2.targetConnection) return [new GenericInstantiation('')];
    const ot = this.getCheck(c2);
    if (!gens.some(g => this.typeContainsGeneric(ot, g))) {
      return [this.removeGenericNames(t)];
    }
    const tts = this.getTypesOfInput(c2.targetConnection);
    // TOOD: Is this how they array should work? Or should we be mapping each
    //   explicit to a new param type?
    const mapper = (t, r, ps) =>
      this.hierarchy.getTypeDef(t).getParamsForDescendant(r, ps);
    const mapped = gens
        .map(g =>
          tts.flatMap(tt => this.getTypesBoundToGeneric(tt, ot, g, mapper)))
        .map(a => a.length ? a : [new GenericInstantiation('')]);
    return gens.reduce((accts, g, i) =>
      accts.flatMap(a => this.replaceGenericWithTypes(a, g, mapped[i])), [t]);
  }

  private getTypesOfOutput(c: Connection): TypeInstantiation[] {
    const t = this.getCheck(c);
    const gens = this.getGenericsOfType(t);
    if (!gens.length) {
      return [t];
    }

    const s = c.getSourceBlock();
    const ics = this.getInputConnections(s)
        .filter(c => c.targetConnection)
        .filter(c => gens.some(g => this.typeContainsGeneric(this.getCheck(c), g)));
    if (!ics.length) {
      return [this.removeGenericNames(t)];
    }
    const its = ics.map(c => this.getCheck(c));
    const ttss = ics.map(c => this.getTypesOfOutput(c.targetConnection));
    const mapper = (t, r, ps) =>
      this.hierarchy.getTypeDef(t).getParamsForAncestor(r, ps).map(t => [t]);
    const mapped = gens
        .map(g =>
          its.flatMap((it, i) =>
            ttss[i].flatMap(tt =>
              this.getTypesBoundToGeneric(tt, it, g, mapper))))
        .map(a => a.length ? a : [new GenericInstantiation('')]);
    return gens.reduce((accts, g, i) =>
      accts.flatMap(a => this.replaceGenericWithTypes(a, g, mapped[i])), [t]);

    // if (t instanceof ExplicitInstantiation) {
    //   return [t];
    // } else if (t instanceof GenericInstantiation) {
    //   const s = c.getSourceBlock();
    //   const matches = this.getInputConnections(s).reduce((acc, c2) => {
    //     if (!this.getCheck(c2).equals(t) || !c2.targetConnection) return acc;
    //     // TODO: Not sure if we need to do an explicit test like inputs.
    //     return [...acc, ...this.getTypesOfOutput(c2.targetConnection, )];
    //   }, [] as TypeInstantiation[]);
    //   if (matches.length) return matches;
    //   return [new GenericInstantiation(
    //       '', t.unfilteredLowerBounds, t.unfilteredUpperBounds)];
    // }
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
      return t.name == g.name;
    } else if (t instanceof ExplicitInstantiation) {
      return t.params.some(p => this.typeContainsGeneric(p, g));
    }
  }

  private getTypesBoundToGeneric(
      t: TypeInstantiation,
      ref: TypeInstantiation,
      g: GenericInstantiation,
      mapType: (t: string, ref: string, ps: TypeInstantiation[]) =>
        TypeInstantiation[][]
  ): TypeInstantiation[] {
    if (ref instanceof GenericInstantiation) {
      return ref.name == g.name ? [t] : [];
    }
    if (ref instanceof ExplicitInstantiation &&
        t instanceof ExplicitInstantiation) {
      const mapped = mapType(t.name, ref.name, t.params);
      // TODO: Tests for nested params.
      return ref.params.flatMap(
          // TODO: Is this how we should be handling multiple mappings for at
          // generic?
          (rp, i) => mapped[i].flatMap(
              m => this.getTypesBoundToGeneric(m, rp, g, mapType)));
    }
    return [];
  }

  // TODO: Change this to take in a single type.
  private replaceGenericWithTypes(
      t: TypeInstantiation,
      g: GenericInstantiation,
      news: TypeInstantiation[],
  ): TypeInstantiation[] {
    if (t instanceof GenericInstantiation) {
      if (t.name == g.name) return news.map(n => n.clone());
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

  private removeGenericNames(t: TypeInstantiation): TypeInstantiation {
    if (t instanceof GenericInstantiation) {
      return new GenericInstantiation(
          '', t.unfilteredLowerBounds, t.unfilteredUpperBounds);
    } else if (t instanceof ExplicitInstantiation) {
      return new ExplicitInstantiation(
          t.name, t.params.map(p => this.removeGenericNames(p)));
    }
  }

  private getInputConnections(b: Block): Connection[] {
    const cs = b.inputList.map(i => i.connection);
    if (b.nextConnection) cs.push(b.nextConnection);
    return cs;
  }

  private getCheck(c: Connection): TypeInstantiation {
    return parseType(c.getCheck()[0]);
  }
}
