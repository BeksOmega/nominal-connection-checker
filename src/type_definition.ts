/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ParameterDefinition} from './parameter_definition';
import {TypeHierarchy} from './type_hierarchy';
import {ExplicitInstantiation, TypeInstantiation} from './type_instantiation';
import {IncompatibleType} from './exceptions';

export class TypeDefinition {
  private readonly parents_: TypeInstantiation[] = [];
  private readonly children_: TypeInstantiation[] = [];
  private readonly ancestors_: TypeInstantiation[] = [];
  private readonly descendants_: TypeInstantiation[] = [];
  private readonly params_: ParameterDefinition[] = [];

  constructor(
      readonly hierarchy: TypeHierarchy,
      readonly name: string
  ) {
    this.ancestors_.push(this.createInstance());
    this.descendants_.push(this.createInstance());
  }

  get parents() {
    return (this.parents_ as readonly TypeInstantiation[]);
  }

  get children() {
    return (this.children_ as readonly TypeInstantiation[]);
  }

  get ancestors() {
    return (this.ancestors_ as readonly TypeInstantiation[]);
  }

  get descendants() {
    return (this.descendants_ as readonly TypeInstantiation[]);
  }

  get params() {
    return (this.params_ as readonly ParameterDefinition[]);
  }

  hasParent(t: TypeInstantiation): boolean {
    return this.parents_.some(p => p.equals(t));
  }

  hasChild(t: TypeInstantiation): boolean {
    return this.children_.some(c => c.equals(t));
  }

  hasAncestor(t: TypeInstantiation): boolean {
    return this.ancestors_.some(a => a.equals(t));
  }

  hasDescendant(t: TypeInstantiation): boolean {
    return this.descendants_.some(d => d.equals(t));
  }

  addParent(t: TypeInstantiation) {
    if (!this.hierarchy.typeIsCompatible(t)) throw new IncompatibleType(t);
    if (this.hasParent(t)) return;
    this.parents_.push(t);
    this.addAncestor(t);
    const td = this.hierarchy.getTypeDef(t.name);
    td.ancestors_.forEach(a => this.addAncestor(a));
    td.addChild(this.createInstance());
  }

  private addChild(t: TypeInstantiation) {
    if (this.hasChild(t)) return;
    this.children_.push(t);
    this.addDescendant(t);
    const td = this.hierarchy.getTypeDef(t.name);
    td.descendants_.forEach(d => this.addDescendant(d));
  }

  private addAncestor(t: TypeInstantiation) {
    if (this.hasAncestor(t)) return;
    this.ancestors_.push(t);
    this.children_.forEach(
        c => this.hierarchy.getTypeDef(c.name).addAncestor(t));
  }

  private addDescendant(t: TypeInstantiation) {
    if (this.hasDescendant(t)) return;
    this.descendants_.push(t);
    this.parents_.forEach(
        p => this.hierarchy.getTypeDef(p.name).addDescendant(t));
  }

  createInstance(): ExplicitInstantiation{
    return new ExplicitInstantiation(this.name);
  }
}
