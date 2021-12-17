/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ExplicitInstantiation, GenericInstantiation, TypeInstantiation} from './type_instantiation';
import {IncompatibleType, NotFinalized} from './exceptions';
import {ParameterDefinition, Variance} from './parameter_definition';
import {TypeDefinition} from './type_definition';
import {combine, removeDuplicates} from './utils';

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
      Map<string, Map<string, ExplicitInstantiation[]>> = new Map();

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
    Map<string, Map<string, ExplicitInstantiation[]>> = new Map();

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
        (t1, t2) => t1.hasDescendant(t2.name),
        (t) => t.parents,
        this.getNearestCommonAncestorsOfPair.bind(this),
        this.removeAncestors());
  }

  private initNearestCommonDescendants() {
    this.initNearestCommon(
        this.nearestCommonDescendants,
        (t, unvisited) => t.children.some(c => unvisited.has(c.name)),
        (t1, t2) => t1.hasAncestor(t2.name),
        (t) => t.children,
        this.getNearestCommonDescendantsOfPair.bind(this),
        this.removeDescendants());
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
  private removeAncestors() {
    return (t1: TypeInstantiation, i: number, arr: TypeInstantiation[]) =>
      arr.every(
          t2 => t1.name == t2.name ||
            !this.getTypeDef(t1.name).hasDescendant(t2.name));
  }

  /**
   * Returns a filter function which removes any TypeInstantiations that also
   * have ancestors in the array.
   */
  private removeDescendants() {
    return (t1: TypeInstantiation, i: number, arr: TypeInstantiation[]) =>
      arr.every(
          t2 => t1.name == t2.name ||
            !this.getTypeDef(t1.name).hasAncestor(t2.name));
  }

  /**
   * Adds a new type definition with the given name (and optional parameter
   * definitions) to this type hierarchy, and returns the type definition.
   */
  addTypeDef(n: string, ps: ParameterDefinition[] = []): TypeDefinition {
    const d = new TypeDefinition(this, n, ps);
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
      if (!t.lowerBounds.every(b => this.typeIsCompatible(b))) return false;
      if (!t.upperBounds.every(b => this.typeIsCompatible(b))) return false;
      if (!t.hasLowerBound || !t.hasUpperBound) return true;
      const ncas = this.getNearestCommonAncestors(...t.lowerBounds);
      const ncds = this.getNearestCommonDescendants(...t.upperBounds);
      return ncds.some(
          ncd => ncas.some(nca => this.typeFulfillsType(nca, ncd)));
    } else if (t instanceof ExplicitInstantiation) {
      if (!this.typeDefsMap.has(t.name)) return false;
      const td = this.getTypeDef(t.name);
      return td.params.length == t.params.length &&
          t.params.every(p => this.typeIsCompatible(p));
    }
    return false;
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
      return this.explicitFulfillsExplicit(a, b);
    }
    if (a instanceof GenericInstantiation &&
        b instanceof GenericInstantiation) {
      return this.constrainedGenericFulfillsConstrainedGeneric(a, b);
    }

    // One must be generic and the other must be explicit.
    if (a instanceof ExplicitInstantiation) {
      return this.explicitFulfillsConstrainedGeneric(
          a, b as GenericInstantiation);
    }
    return this.typeFulfillsType(
        a, new GenericInstantiation('', [], [b as ExplicitInstantiation]));
  }

  private explicitFulfillsExplicit(
      a: ExplicitInstantiation,
      b: ExplicitInstantiation
  ) {
    const aDef = this.getTypeDef(a.name);
    const bDef = this.getTypeDef(b.name);

    if (!aDef.hasAncestor(b.name)) return false;

    const subParams = aDef.getParamsForAncestor(b.name, a.params);
    return b.params.every((superParam, i) => {
      const subParam = subParams[i];
      const paramDef = bDef.params[i];
      // If the super param is a constrained generic, ignore variance.
      if (superParam instanceof GenericInstantiation) {
        return this.typeFulfillsType(subParam, superParam);
      }
      const subGen = subParam instanceof GenericInstantiation;
      switch (paramDef.variance) {
        case Variance.CO:
          return subGen ?
            this.typeFulfillsType(
                subParam, new GenericInstantiation(
                    '', [], [superParam as ExplicitInstantiation])) :
            this.typeFulfillsType(subParam, superParam);
        case Variance.CONTRA:
          return subGen ?
            this.typeFulfillsType(
                subParam, new GenericInstantiation(
                    '', [superParam as ExplicitInstantiation])) :
            this.typeFulfillsType(superParam, subParam);
        case Variance.INV:
          return this.typeFulfillsType(subParam, superParam) &&
              this.typeFulfillsType(superParam, subParam);
      }
    });
  }

  private constrainedGenericFulfillsConstrainedGeneric(
      a: GenericInstantiation,
      b: GenericInstantiation
  ): boolean {
    const ncas = this.getNearestCommonAncestors(
        ...a.lowerBounds, ...b.lowerBounds);
    const ncds = this.getNearestCommonDescendants(
        ...a.upperBounds, ...b.upperBounds);
    const lowersUnify = !!ncas.length;
    const uppersUnify = !!ncds.length;
    return (uppersUnify && !a.hasLowerBound && !b.hasLowerBound) ||
        (lowersUnify && !a.hasUpperBound && !b.hasUpperBound) ||
        ncds.some(ncd => ncas.some(nca => this.typeFulfillsType(nca, ncd)));
  }

  private explicitFulfillsConstrainedGeneric(
      e: ExplicitInstantiation,
      g: GenericInstantiation,
  ): boolean {
    const lCompat = !g.hasLowerBound ||
        g.lowerBounds.every(b => this.typeFulfillsType(b, e));
    const uCompat = !g.hasUpperBound ||
        g.upperBounds.every(b => this.typeFulfillsType(e, b));
    return lCompat && uCompat;
  }

  getNearestCommonAncestors(
      ...types: TypeInstantiation[]
  ): TypeInstantiation[] {
    return this.getNearestCommon(
        types,
        this.getNearestCommonAncestorsOfPair.bind(this),
        (t, c, ps) => t.getParamsForAncestor(c.name, ps).map(p => [p]),
        this.getNearestCommonAncestors.bind(this),
        this.getNearestCommonDescendants.bind(this),
        (t) => t.parents);
  }

  getNearestCommonDescendants(
      ...types: TypeInstantiation[]
  ): TypeInstantiation[] {
    return this.getNearestCommon(
        types,
        this.getNearestCommonDescendantsOfPair.bind(this),
        (t, c, ps) => t.getParamsForDescendant(c.name, ps),
        this.getNearestCommonDescendants.bind(this),
        this.getNearestCommonAncestors.bind(this),
        () => []);
  }

  /**
   * Returns the nearest common ancestors/descendants of the given types,
   * depending on what functions are passed to getNC and getNCOfPair.
   */
  private getNearestCommon(
      types: TypeInstantiation[],
      getNCOfPair: (a, b) => ExplicitInstantiation[],
      getParamsForCommon:
        (t: TypeDefinition, c: TypeDefinition, ps: TypeInstantiation[]) =>
          TypeInstantiation[][],
      unifyCovariant: (...TypeInstantiation) => TypeInstantiation[],
      unifyContravariant: (...TypeInstantiation) => TypeInstantiation[],
      getAlternativeCommons: (TypeDefinition) => ExplicitInstantiation[],
  ): TypeInstantiation[] {
    if (!this.finalized) throw new NotFinalized();
    types.forEach(t => {
      if (!this.typeIsCompatible(t)) throw new IncompatibleType(t);
    });

    if (types.length == 0) return [];
    if (types.length == 1) return [this.removeGenericNames(types[0])];
    types = types.filter(t =>
      t instanceof ExplicitInstantiation ||
      t instanceof GenericInstantiation && t.isConstrained);
    if (types.length == 0) return [new GenericInstantiation()];

    let result;
    if (types.some(t => t instanceof GenericInstantiation)) {
      result = this.getNearestCommonWithGenerics(
          types, unifyCovariant, unifyContravariant);
    } else {
      result = this.getNearestCommonOfExplicits(
        types as ExplicitInstantiation[],
        getNCOfPair,
        getParamsForCommon,
        unifyCovariant,
        unifyContravariant,
        getAlternativeCommons);
    }
    // We can get incompatible types if lower bounds unify above upper bounds.
    return result.filter(t => this.typeIsCompatible(t));
  }

  /**
   * Returns the nearest common ancestors/descendants of the given type list,
   * which will include some constrained generic types.
   */
  private getNearestCommonWithGenerics(
      types: TypeInstantiation[],
      unifyCovariant: (...types) => TypeInstantiation[],
      unifyContravariant: (...types) => TypeInstantiation[]
  ): GenericInstantiation[] {
    const lcs = unifyContravariant(...this.getLowerBounds(...types)) as
        ExplicitInstantiation[];
    const ucs = unifyCovariant(...this.getUpperBounds(...types)) as
        ExplicitInstantiation[];
    if (!lcs.length) return ucs.map(uc => new GenericInstantiation('', [], [uc]));
    if (!ucs.length) return lcs.map(lc => new GenericInstantiation('', [lc]));
    return lcs.flatMap(lc => ucs.map(uc =>
      new GenericInstantiation('', [lc], [uc])));
  }

  /**
   * Returns the nearest common ancestors/descendants of the given type list,
   * which only includes explicit types.
   */
  private getNearestCommonOfExplicits(
      types: ExplicitInstantiation[],
      getNCOfPair: (a, b) => ExplicitInstantiation[],
      getParamsForCommon:
          (t: TypeDefinition, c: TypeDefinition, ps: TypeInstantiation[]) =>
          TypeInstantiation[][],
      unifyCovariant: (...TypeInstantiation) => TypeInstantiation[],
      unifyContravariant: (...TypeInstantiation) => TypeInstantiation[],
      getAlternativeCommons: (TypeDefinition) => ExplicitInstantiation[],
  ): ExplicitInstantiation[] {
    const commonOuters = types.reduce(
        (ncs, type) =>
          ncs.flatMap(nc => getNCOfPair(type, nc)).filter(removeDuplicates()),
        [types[0]]);

    const commons = [];
    // We have to use this kind of loop b/c we append to the commons array.
    for (let i = 0; i < commonOuters.length; i++) {
      const co = commonOuters[i];
      const coDef = this.getTypeDef(co.name);
      if (!coDef.hasParams()) {
        commons.push(co);
        continue;
      }
      // Typescript can't deal w/ heterogeneous arrays :/
      const commonParams: any = this.getCommonParamTypes(
          types, coDef, getParamsForCommon, unifyCovariant, unifyContravariant);
      if (!commonParams.length) return [];
      commonParams[0] = commonParams[0].map(v => [v]);
      const combos: TypeInstantiation[][] = combine(commonParams);
      if (combos.length) {
        commons.push(...combos.map(c => new ExplicitInstantiation(co.name, c)));
      } else {
        // If this commonType didn't unify, maybe some related type will.
        commonOuters.push(...getAlternativeCommons(coDef));
      }
    }
    return commons.filter(removeDuplicates()).filter(this.removeAncestors());
  }

  /**
   *  Returns an array of arrays of common types for each of the parameters of
   *  the commonType based on the parameters of the types. An empty subarray
   *  means a common type for that parameter could not be found.
   */
  private getCommonParamTypes(
      types: ExplicitInstantiation[],
      commonType: TypeDefinition,
      getParamsForCommon:
          (t: TypeDefinition, c: TypeDefinition, ps: TypeInstantiation[]) =>
            TypeInstantiation[][],
      unifyCovariant: (...TypeInstantiation) => TypeInstantiation[],
      unifyContravariant: (...TypeInstantiation) => TypeInstantiation[],
  ): ExplicitInstantiation[][] {
    const paramsLists = commonType.params.map(_ => []);
    for (const t of types) {
      const def = this.getTypeDef(t.name);
      const ps = getParamsForCommon(def, commonType, t.params);
      if (!ps.length) return [];
      ps.forEach((p, i) => {
        paramsLists[i].push(...p);
      });
    }

    return paramsLists.map((list, i) => {
      switch (commonType.params[i].variance) {
        case Variance.CO:
          return unifyCovariant(...list);
        case Variance.CONTRA:
          return unifyContravariant(...list);
        case Variance.INV: {
          const [first, ...rest] = list;
          if (rest.every(t => t.isEquivalentTo(first))) {
            return first instanceof GenericInstantiation ?
              [new GenericInstantiation(
                  '', first.lowerBounds, first.upperBounds)] :
              [first];
          }
          return [];
        }
      }
    });
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


  /**
   * Returns the lower bounds of the given set of types. If none of the types
   * are lower bound generics, this returns an empty array. Otherwise it returns
   * an array of all of the lower bounds, and any explicit types.
   */
  private getLowerBounds(
      ...types: TypeInstantiation[]
  ): ExplicitInstantiation[] {
    if (types.some(t => t instanceof GenericInstantiation && t.hasLowerBound)) {
      return types.reduce((bs, t) => {
        if (t instanceof ExplicitInstantiation) return [...bs, t];
        if (t instanceof GenericInstantiation) return [...bs, ...(t.lowerBounds)];
        return bs;
      }, []);
    }
    return [];
  }

  /**
   * Returns the upper bounds of the given set of types. If none of the types
   * are upper bound generics, this returns an empty array. Otherwise it returns
   * an array of all of the upper bounds, and any explicit types.
   */
  private getUpperBounds(
      ...types: TypeInstantiation[]
  ): ExplicitInstantiation[] {
    if (types.some(t => t instanceof GenericInstantiation && t.hasUpperBound)) {
      return types.reduce((bs, t) => {
        if (t instanceof ExplicitInstantiation) return [...bs, t];
        if (t instanceof GenericInstantiation) return [...bs, ...t.upperBounds];
        return bs;
      }, []);
    }
    return [];
  }

  /**
   * Returns the nearest common ancestor(s) of the given type pair, as defined
   * in the nearestCommonAncestors array.
   */
  private getNearestCommonAncestorsOfPair(
      a: ExplicitInstantiation, b: ExplicitInstantiation
  ): ExplicitInstantiation[] {
    return this.nearestCommonAncestors.get(a.name).get(b.name);
  }

  /**
   * Returns the nearest common descendant(s) of the given type pair, as defined
   * in the nearestCommonDescendants array.
   */
  private getNearestCommonDescendantsOfPair(
      a: ExplicitInstantiation, b: ExplicitInstantiation
  ): ExplicitInstantiation[] {
    return this.nearestCommonDescendants.get(a.name).get(b.name);
  }
}
