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
    td.addChild(this.createInstance());
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

  private addChild(t: ExplicitInstantiation) {
    if (this.hasChild(t.name)) return;
    this.children_.push(t);
    this.addDescendant(t);
    const td = this.hierarchy.getTypeDef(t.name);
    td.descendants_.forEach(d => this.addDescendant(d));
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

  private addDescendant(t: ExplicitInstantiation) {
    if (this.hasDescendant(t.name)) return;
    this.descendants_.push(t);
    this.parents_.forEach(
        p => this.hierarchy.getTypeDef(p.name).addDescendant(t));
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
   * @param n
   * @param actual
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

  createInstance(): ExplicitInstantiation {
    return new ExplicitInstantiation(
        this.name, this.params_.map(p => new GenericInstantiation(p.name)));
  }
}
