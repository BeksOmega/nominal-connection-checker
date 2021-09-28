/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeDefinition} from './type_definition';
import {TypeInstantiation} from './type_instantiation';

export class TypeHierarchy {
  private typeDefsMap = new Map();

  addTypeDef(n: string) {
    const d = new TypeDefinition(this, n)
    this.typeDefsMap.set(n, d);
    return d;
  }

  getTypeDef(n: string) {
    return this.typeDefsMap.get(n);
  }

  typeIsCompatible(t: TypeInstantiation): boolean {
    return this.typeDefsMap.has(t.name);
  }
}
