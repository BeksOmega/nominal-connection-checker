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
    const t = this.getCheck(c);
    if (t instanceof ExplicitInstantiation) return [t];

    const s = c.getSourceBlock();
    const c2 = s.outputConnection || s.previousConnection;
    // TODO: Tests for this.
    if (!c2 || !this.getCheck(c2).equals(t) || !c2.targetConnection) {
      return [new GenericInstantiation('')];
    }
    const pTypes = this.getTypesOfConnection(c2.targetConnection);
    // TODO: How do we handle multiple types?
    if (pTypes[0] instanceof ExplicitInstantiation) {
      return [new GenericInstantiation('', [], pTypes)];
    }
    return pTypes;
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

  private getInputConnections(b: Block): Connection[] {
    return b.inputList.map(i => i.connection);
  }

  private getCheck(c: Connection) {
    return parseType(c.getCheck()[0]);
  }
}