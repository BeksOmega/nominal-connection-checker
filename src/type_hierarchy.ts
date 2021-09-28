/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeDefinition} from './type_definition';
import {TypeInstantiation} from './type_instantiation';

export class TypeHierarchy {
  private typeDefsMap = new Map();

  /**
   * Adds a new type definition with the given name to this type hierarchy, and
   * returns the type definition.
   */
  addTypeDef(n: string): TypeDefinition {
    const d = new TypeDefinition(this, n)
    this.typeDefsMap.set(n, d);
    return d;
  }

  /**
   * Returns the type definition with the given name if it exists, undefined
   * otherwise.
   */
  getTypeDef(n: string) {
    return this.typeDefsMap.get(n);
  }

  /**
   * Returns true if the given type instantiation is compatible with the type
   * definitions that exist in this hierarchy (eg all types are defined, have
   * the correct number of parameters, etc). False otherwise.
   */
  typeIsCompatible(t: TypeInstantiation): boolean {
    return this.typeDefsMap.has(t.name);
  }

  /**
   * Returns true if the first type fulfills the second type, as defined by the
   * relationships within this type hierarchy.
   */
  typeFulfillsType(a: TypeInstantiation, b: TypeInstantiation): boolean {
    return this.typeDefsMap.get(a.name).hasAncestor(b);
  }
}
