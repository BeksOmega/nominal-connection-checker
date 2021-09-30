/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeDefinition} from './type_definition';
import {TypeInstantiation} from './type_instantiation';
import {removeDuplicates} from './utils';
import {NotFinalized} from './exceptions';

export class TypeHierarchy {
  /**
   * A map of type names to TypeDefinitions.
   */
  private readonly typeDefsMap: Map<string, TypeDefinition> = new Map();

  /**
   * A map of type names to maps of type names to lists of TypeInstantiations
   * that are the nearest common ancestors of the two types. You can think of
   * this like a two-dimensional array where both axes contain all of the type
   * names.
   *
   * A nearest common ancestor of two types x and y is defined as:
   * An ancestor type of both x and y that has no descendant which is also an
   * ancestor of both x and y.
   */
  private readonly nearestCommonAncestors:
      Map<string, Map<string, TypeInstantiation[]>> = new Map();

  /**
   * Whether this type hierarchy has had finalize() called on it or not.
   */
  private finalized = false;

  /**
   * Handles any processing that needs to be done on the type hierarchy
   * post-configuration. Eg figuring out the nearest common ancestors of every
   * pair of types.
   */
  finalize() {
    this.initNearestCommonAncestors();
    this.finalized = true;
  }

  /**
   * Initializes the nearestCommonAncestors graph so the nearest common
   * ancestors of two types can be accessed in inconstant time.
   *
   * Implements the pre-processing algorithm defined in:
   * Czumaj, Artur, Miroslaw Kowaluk and and Andrzej Lingas. "Faster algorithms
   * for finding lowest common ancestors in directed acyclic graphs."
   * Theoretical Computer Science, 380.1-2 (2007): 37-46.
   * https://bit.ly/2SrCRs5
   *
   * Operates in O(nm) where n is the number of nodes and m is the number of
   * edges.
   */
  private initNearestCommonAncestors() {
    const unvisited = new Map(this.typeDefsMap);
    while (unvisited.size) {
      unvisited.forEach((t: TypeDefinition) => {
        if (t.parents.some(p => unvisited.has(p.name))) return;
        unvisited.delete(t.name);
        this.nearestCommonAncestors.set(
            t.name, this.createNearestCommonAncestorMap(t));
      });
    }
  }

  /**
   * Creates a map of type names to arrays of TypeInstantiations which are the
   * nearest common ancestors of the type represented by the name and the type
   * passed to this method.
   */
  private createNearestCommonAncestorMap(
      t1: TypeDefinition
  ): Map<string, TypeInstantiation[]> {
    const map = new Map();
    this.typeDefsMap.forEach((t2: TypeDefinition) => {
      const t2i = t2.createInstance();
      if (t1.hasDescendant(t2i)) {
        map.set(t2.name, [t1.createInstance()]);
      } else {
        map.set(
            t2.name,
            t1.parents
                .flatMap(pi => this.getNearestCommonAncestorsOfPair(pi, t2i))
                .filter(removeDuplicates())
                .filter(this.removeDescendants()));
      }
    });
    return map;
  }

  /**
   * Returns a filter function which removes any TypeInstantiations that also
   * have descendants in the array.
   */
  private removeDescendants() {
    return (t1, i, arr) =>
      arr.every(
          (t2, j) => i == j || !this.getTypeDef(t1.name).hasDescendant(t2));
  }

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
  getTypeDef(n: string): TypeDefinition {
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

  /**
   * Returns the nearest common ancestor(s) of the given types.
   */
  getNearestCommonAncestors(
      ...types: TypeInstantiation[]
  ): TypeInstantiation[] {
    if (!this.finalized) throw new NotFinalized();
    if (types.length < 2) return types;

    return types.reduce(
        (ncas, type) =>
          ncas.flatMap(nca => this.getNearestCommonAncestorsOfPair(type, nca))
              .filter(removeDuplicates()),
        [types[0]]);
  }

  /**
   * Returns the nearest common ancestor(s) of the given type pair, as defined
   * in the nearestCommonAncestors array.
   */
  private getNearestCommonAncestorsOfPair(
      a: TypeInstantiation, b: TypeInstantiation) {
    return this.nearestCommonAncestors.get(a.name).get(b.name);
  }
}
