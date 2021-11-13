/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ParameterDefinition, Variance} from './parameter_definition';
import {TypeHierarchy} from './type_hierarchy';
import {ExplicitInstantiation, GenericInstantiation, TypeInstantiation} from './type_instantiation';
import {IncompatibleType, IncompatibleVariance} from './exceptions';

export class TypeDefinition {
  private readonly parents_: ExplicitInstantiation[] = [];
  private readonly children_: ExplicitInstantiation[] = [];
  private readonly ancestors_: ExplicitInstantiation[] = [];
  private readonly descendants_: ExplicitInstantiation[] = [];
  private readonly ancestorParamsMap_: Map<string, TypeInstantiation[]> =
      new Map();

  constructor(
      readonly hierarchy: TypeHierarchy,
      readonly name: string,
      private readonly params_: ParameterDefinition[] = []
  ) {
    this.ancestors_.push(this.createInstance());
    this.ancestorParamsMap_.set(
        name, params_.map(p => new GenericInstantiation(p.name)));
    this.descendants_.push(this.createInstance());
  }

  get parents() {
    return (this.parents_ as readonly ExplicitInstantiation[]);
  }

  get children() {
    return (this.children_ as readonly ExplicitInstantiation[]);
  }

  get ancestors() {
    return (this.ancestors_ as readonly ExplicitInstantiation[]);
  }

  get descendants() {
    return (this.descendants_ as readonly ExplicitInstantiation[]);
  }

  get params() {
    return (this.params_ as readonly ParameterDefinition[]);
  }

  hasParent(t: string): boolean {
    return this.parents_.some(p => p.name == t);
  }

  hasChild(t: string): boolean {
    return this.children_.some(c => c.name == t);
  }

  hasAncestor(t: string): boolean {
    return this.ancestors_.some(a => a.name == t);
  }

  hasDescendant(t: string): boolean {
    return this.descendants_.some(d => d.name == t);
  }

  hasParams(): boolean {
    return !!this.params_.length;
  }

  addParent(t: ExplicitInstantiation) {
    if (!this.hierarchy.typeIsCompatible(t)) throw new IncompatibleType(t);
    this.checkCompatibleVariances(t);
    if (this.hasParent(t.name)) return;
    this.parents_.push(t);
    this.ancestorParamsMap_.set(t.name, t.params);
    this.addAncestor(t, this);
    const td = this.hierarchy.getTypeDef(t.name);
    td.ancestors_.forEach(a => this.addAncestor(a, td));
    td.addChild(this.createInstance(), t);
  }

  private checkCompatibleVariances(t: ExplicitInstantiation) {
    const tDef = this.hierarchy.getTypeDef(t.name);
    t.params.forEach((pInst, i) => {
      if (pInst instanceof ExplicitInstantiation) return;
      const p = this.getParam(pInst.name);
      const sp = tDef.params[i];
      if (p.variance == Variance.CO && sp.variance != Variance.CO ||
          p.variance == Variance.CONTRA && sp.variance != Variance.CONTRA) {
        throw new IncompatibleVariance(
            this.name, t.name, p.name, sp.name, p.variance, sp.variance);
      }
    });
  }

  private addChild(t: ExplicitInstantiation, me: ExplicitInstantiation) {
    if (this.hasChild(t.name)) return;
    this.children_.push(t);
    this.addDescendant(t, this);
    const td = this.hierarchy.getTypeDef(t.name);
    td.descendants_.forEach(d => this.addDescendant(d, td));
  }

  private addAncestor(a: ExplicitInstantiation, parent: TypeDefinition) {
    if (this.hasAncestor(a.name)) return;
    this.ancestors_.push(a);
    const parentToAncestor = parent.getParamsForAncestor(a.name);
    const thisToParent = this.getParamsForAncestor(parent.name);
    const replaceFn = (p) => {
      if (p instanceof GenericInstantiation) {
        return thisToParent[parent.getIndexOfParam(p.name)];
      } else {
        p.params = p.params.map(replaceFn);
        return p;
      }
    };
    const thisToAncestor = parentToAncestor.map(replaceFn);
    this.ancestorParamsMap_.set(a.name, thisToAncestor);
    this.children_.forEach(
        c => this.hierarchy.getTypeDef(c.name).addAncestor(a, this));
  }

  private addDescendant(d: ExplicitInstantiation, child: TypeDefinition) {
    if (this.hasDescendant(d.name)) return;
    this.descendants_.push(d);
    this.parents_.forEach(
        p => this.hierarchy.getTypeDef(p.name).addDescendant(d, this));
  }

  getParam(n: string): ParameterDefinition {
    for (const p of this.params_) {
      if (p.name == n) return p;
    }
    return null;
  }

  getIndexOfParam(n: string): number {
    for (let i = 0; i < this.params_.length; i++) {
      if (this.params_[i].name == n) return i;
    }
    return -1;
  }

  /**
   * Mapping of the names of the ancestors params to our params.
   */
  getParamsForAncestor(
      n: string, actual: TypeInstantiation[] = undefined
  ): TypeInstantiation[] {
    const ps = this.ancestorParamsMap_.get(n).map(p => p.clone());
    if (!actual) return ps;
    const replaceFn = (p, i, a) => {
      if (p instanceof GenericInstantiation) {
        a[i] = actual[this.getIndexOfParam(p.name)];
      } else {
        p.params.forEach(replaceFn);
      }
    };
    ps.forEach(replaceFn);
    return ps;
  }

  /**
   * Mapping of the names of the descendant params to our params. And empty
   * array signals that a mapping could not be found.
   */
  getParamsForDescendant(
      n: string, actual: TypeInstantiation[]): TypeInstantiation[][] {
    const d = this.hierarchy.getTypeDef(n);
    const dToThis = d.getParamsForAncestor(this.name);
    if (!dToThis.every((m, i) => this.mappingIsValid(m, actual[i]))) return [];
    return d.params.map(p => {
      const all = dToThis.flatMap((m, i) =>
        this.getBindingsFor(p.name, m, actual[i]));
      return all.length ? all : [new GenericInstantiation('')];
    });
  }

  private mappingIsValid(ref, actual) {
    if (ref instanceof ExplicitInstantiation) {
      if (!(actual instanceof ExplicitInstantiation)) return false;
      if (ref.name != actual.name) return false;
      return ref.params.every((m, i) => this.mappingIsValid(m, actual.params[i]));
    }
    return true;
  }

  // Should only be called if mappingIsValid() is true.
  private getBindingsFor(
      s: string,
      ref: TypeInstantiation,
      actual: TypeInstantiation,
  ): TypeInstantiation[] {
    if (ref instanceof ExplicitInstantiation) {
      return ref.params.flatMap((p, i) =>
        this.getBindingsFor(s, p, (actual as ExplicitInstantiation).params[i]));
    }
    return ref.name == s ? [actual] : [];
  }

  createInstance(): ExplicitInstantiation {
    return new ExplicitInstantiation(
        this.name, this.params_.map(p => new GenericInstantiation(p.name)));
  }
}
