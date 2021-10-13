/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeDefinition} from './type_definition';
import {ExplicitInstantiation, GenericInstantiation, TypeInstantiation} from './type_instantiation';
import {removeDuplicates} from './utils';
import {IncompatibleType, NotFinalized} from './exceptions';

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
   * A map of type names to maps of type names to lists of TypeInstantiations
   * that are the nearest common descendants of the two types. You can think of
   * this like a two-dimensional array where both axes contain all of the type
   * names.
   *
   * A nearest common descendant of two types x and y is defined as:
   * A descendant type of both x and y that has no ancestor which is also an
   * descendant of both x and y.
   */
  private readonly nearestCommonDescendants:
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
    this.initNearestCommonDescendants();
    this.finalized = true;
  }

  private initNearestCommonAncestors() {
    this.initNearestCommon(
        this.nearestCommonAncestors,
        (t, unvisited) => t.parents.some(p => unvisited.has(p.name)),
        (t1, t2) => t1.hasDescendant(t2.createInstance()),
        (t) => t.parents,
        this.getNearestCommonAncestorsOfPair.bind(this),
        this.removeDescendants());
  }

  private initNearestCommonDescendants() {
    this.initNearestCommon(
        this.nearestCommonDescendants,
        (t, unvisited) => t.children.some(c => unvisited.has(c.name)),
        (t1, t2) => t1.hasAncestor(t2.createInstance()),
        (t) => t.children,
        this.getNearestCommonDescendantsOfPair.bind(this),
        this.removeAncestors());
  }

  /**
   * Initializes the given nearestCommonMap so the nearest common
   * relatives (ancestors/descendants) of two types can be accessed in
   * constant time.
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
  private initNearestCommon(
      nearestCommonMap: Map<string, Map<string, TypeInstantiation[]>>,
      hasUnvisitedRelatives:
          (t: TypeDefinition, u: Map<string, TypeDefinition>) => boolean,
      typeIsNearestCommonOfPair:
          (t1: TypeDefinition, t2: TypeDefinition) => boolean,
      getDirectRelatives:
        (t: TypeDefinition) => readonly TypeInstantiation[],
      getNearestCommonsOfPair:
        (t1: TypeInstantiation, t2: TypeInstantiation) => TypeInstantiation[],
      removeNonNearestRelatives:
          (t: TypeInstantiation, i: number, a: TypeInstantiation[]) => boolean,
  ) {
    const unvisited = new Map(this.typeDefsMap);
    while (unvisited.size) {
      unvisited.forEach((t: TypeDefinition) => {
        if (hasUnvisitedRelatives(t, unvisited)) return;
        unvisited.delete(t.name);
        nearestCommonMap.set(
            t.name,
            this.createNearestCommonMap(
                t,
                typeIsNearestCommonOfPair,
                getDirectRelatives,
                getNearestCommonsOfPair,
                removeNonNearestRelatives));
      });
    }
  }

  /**
   * Creates a map of type names to arrays of TypeInstantiations which are the
   * nearest common ancestors/descendants of the type represented by the name
   * and the type passed to this method.
   */
  private createNearestCommonMap(
      t1,
      typeIsNearestCommonOfPair:
        (t1: TypeDefinition, t2: TypeDefinition) => boolean,
      getDirectRelatives:
        (t: TypeDefinition) => readonly TypeInstantiation[],
      getNearestCommonsOfPair:
        (t1: TypeInstantiation, t2: TypeInstantiation) => TypeInstantiation[],
      removeNonNearestRelatives:
        (t: TypeInstantiation, i: number, a: TypeInstantiation[]) => boolean,
  ) {
    const map = new Map();
    this.typeDefsMap.forEach((t2: TypeDefinition) => {
      if (typeIsNearestCommonOfPair(t1, t2)) {
        map.set(t2.name, [t1.createInstance()]);
      } else {
        map.set(
            t2.name,
            getDirectRelatives(t1)
                .flatMap(pi => getNearestCommonsOfPair(pi, t2.createInstance()))
                .filter(removeDuplicates())
                .filter(removeNonNearestRelatives));
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
   * Returns a filter function which removes any TypeInstantiations that also
   * have ancestors in the array.
   */
  private removeAncestors() {
    return (t1, i, arr) =>
      arr.every(
          (t2, j) => i == j || !this.getTypeDef(t1.name).hasAncestor(t2));
  }

  /**
   * Adds a new type definition with the given name to this type hierarchy, and
   * returns the type definition.
   */
  addTypeDef(n: string): TypeDefinition {
    const d = new TypeDefinition(this, n);
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
    if (t instanceof GenericInstantiation) {
      if (t.lowerBounds.length &&
          !t.lowerBounds.every(b => this.typeIsCompatible(b))) {
        return false;
      }
      if (t.upperBounds.length &&
        !t.upperBounds.every(b => this.typeIsCompatible(b))) {
        return false;
      }
      if (!t.lowerBounds.length || !t.upperBounds.length) {
        return true;
      }
      const ncas = this.getNearestCommonAncestors(...t.lowerBounds);
      const ncds = this.getNearestCommonDescendants(...t.upperBounds);
      return ncds.some(
          ncd => ncas.some(nca => this.typeFulfillsType(nca, ncd)));
    }
    return this.typeDefsMap.has(t.name);
  }

  /**
   * Returns true if the first type fulfills the second type, as defined by the
   * relationships within this type hierarchy.
   */
  typeFulfillsType(a: TypeInstantiation, b: TypeInstantiation): boolean {
    if (!this.typeIsCompatible(a)) throw new IncompatibleType(a);
    if (!this.typeIsCompatible(b)) throw new IncompatibleType(b);

    if (a instanceof GenericInstantiation && !a.isConstrained ||
        b instanceof GenericInstantiation && !b.isConstrained) {
      return true;
    }
    if (a instanceof ExplicitInstantiation &&
      b instanceof ExplicitInstantiation) {
      return this.typeDefsMap.get(a.name).hasAncestor(b);
    }
    if (a instanceof GenericInstantiation &&
        b instanceof GenericInstantiation) {
      return this.constrainedGenericFulfillsConstrainedGeneric(a, b);
    }

    // One must be generic and the other must be explicit.
    return a instanceof ExplicitInstantiation ?
      this.explicitFulfillsConstrainedGeneric(
          a, (b as GenericInstantiation)) :
      this.explicitFulfillsConstrainedGeneric(
          (b as ExplicitInstantiation), (a as GenericInstantiation));
  }

  private constrainedGenericFulfillsConstrainedGeneric(
      a: GenericInstantiation,
      b: GenericInstantiation
  ): boolean {
    const ncas = this.getNearestCommonAncestors(
        ...a.lowerBounds, ...b.lowerBounds);
    const ncds = this.getNearestCommonDescendants(
        ...a.upperBounds, ...b.upperBounds);
    return (!!ncds.length && !a.lowerBounds.length && !b.lowerBounds.length) ||
        (!!ncas.length && !a.upperBounds.length && !b.upperBounds.length) ||
        ncds.some(ncd => ncas.some(nca => this.typeFulfillsType(nca, ncd)));
  }

  private explicitFulfillsConstrainedGeneric(
      e: ExplicitInstantiation,
      g: GenericInstantiation,
  ): boolean {
    const lCompat = !g.lowerBounds.length ||
        g.lowerBounds.every(b => this.typeFulfillsType(b, e));
    const uCompat = !g.upperBounds.length ||
      g.upperBounds.every(b => this.typeFulfillsType(e, b));
    return lCompat && uCompat;
  }

  getNearestCommonAncestors(
      ...types: TypeInstantiation[]
  ): TypeInstantiation[] {
    if (!this.finalized) throw new NotFinalized();
    types.forEach(t => {
      if (!this.typeIsCompatible(t)) throw new IncompatibleType(t);
    });

    if (types.length == 0) return [];
    types = types.filter(t => t instanceof ExplicitInstantiation);
    if (types.length == 0) return [new GenericInstantiation()];
    if (types.length == 1) return types;

    return types.reduce(
        (ncas, type) =>
          ncas.flatMap(nca => this.getNearestCommonAncestorsOfPair(type, nca))
              .filter(removeDuplicates()),
        [types[0]]);
  }

  getNearestCommonDescendants(
      ...types: TypeInstantiation[]
  ): TypeInstantiation[] {
    if (!this.finalized) throw new NotFinalized();
    types.forEach(t => {
      if (!this.typeIsCompatible(t)) throw new IncompatibleType(t);
    });

    if (types.length == 0) return [];
    types = types.filter(t => t instanceof ExplicitInstantiation);
    if (types.length == 0) return [new GenericInstantiation()];
    if (types.length == 1) return types;

    return types.reduce(
        (ncds, type) =>
          ncds.flatMap(ncd => this.getNearestCommonDescendantsOfPair(type, ncd))
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

  /**
   * Returns the nearest common descendant(s) of the given type pair, as defined
   * in the nearestCommonDescendants array.
   */
  private getNearestCommonDescendantsOfPair(
      a: TypeInstantiation, b: TypeInstantiation) {
    return this.nearestCommonDescendants.get(a.name).get(b.name);
  }
}
