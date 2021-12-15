/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {Block, Connection} from 'blockly';
import {TypeHierarchy} from './type_hierarchy';
import {ExplicitInstantiation, GenericInstantiation, TypeInstantiation} from './type_instantiation';
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
    return this.getTypesOfConnectionInternal(
        c,
        b => [b.outputConnection || b.previousConnection],
        c => this.getTypesOfInput(c),
        (t, r, ps) => this.hierarchy.getTypeDef(t).getParamsForDescendant(r, ps));
  }

  private getTypesOfOutput(c: Connection): TypeInstantiation[] {
    return this.getTypesOfConnectionInternal(
        c,
        b => this.getInputConnections(b),
        c => this.getTypesOfOutput(c),
        (t, r, ps) =>
          this.hierarchy.getTypeDef(t).getParamsForAncestor(r, ps).map(t => [t]));
  }

  private getTypesOfConnectionInternal(
      c: Connection,
      getAssociatedConnections: (b: Block) => Connection[],
      getTargetTypes: (c: Connection) => TypeInstantiation[],
      mapParams:
          (t: string, r: string, ps: TypeInstantiation[]) => TypeInstantiation[][]
  ): TypeInstantiation[] {
    const t = this.getCheck(c);
    const gens = this.getGenericsOfType(t);
    if (!gens.length) return [t];

    const acs = getAssociatedConnections(c.getSourceBlock())
        .filter(c => c)
        .filter(c => c.targetConnection)
        .filter(c => gens.some(g => this.typeContainsGeneric(this.getCheck(c), g)));
    if (!acs.length) return [this.removeGenericNames(t)];

    const ats = acs.map(c => this.getCheck(c));
    const ttss = acs.map(c => getTargetTypes(c.targetConnection));
    const boundTypes: TypeInstantiation[][] = gens
        .map(g =>
          ats.flatMap((at, i) =>
            ttss[i].flatMap(tt =>
              this.getTypesBoundToGeneric(tt, at, g, mapParams))))
        .map(b => b.length ? b : [new GenericInstantiation('')]);
    return gens.reduce((accts, g, i) =>
      accts.flatMap(a =>
        boundTypes[i].map(b =>
          this.replaceGenericWithType(a, g, b))), [t]);
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
          (rp, i) => mapped[i].flatMap(
              m => this.getTypesBoundToGeneric(m, rp, g, mapType)));
    }
    return [];
  }

  private replaceGenericWithType(
      t: TypeInstantiation,
      g: GenericInstantiation,
      n: TypeInstantiation,
  ): TypeInstantiation {
    if (t instanceof GenericInstantiation) {
      return t.name == g.name ? n.clone() : t;
    }
    if (t instanceof ExplicitInstantiation) {
      if (!t.params.length) return t;
      return new ExplicitInstantiation(
          t.name, t.params.map(p => this.replaceGenericWithType(p, g, n)));
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
