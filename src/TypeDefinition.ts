/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ParameterDefinition} from './ParameterDefinition';
import {TypeHierarchy} from './TypeHierarchy';
import {TypeInstantiation} from './TypeInstantiation';
import {IncompatibleType} from "./exceptions";

export class TypeDefinition {
  private hierarchy: TypeHierarchy;
  readonly name: string;
  // TODO: Add readonly accessors.
  readonly parents: TypeInstantiation[] = [];
  readonly children: TypeInstantiation[] = [];
  readonly ancestors: TypeInstantiation[] = [];
  readonly descendants: TypeInstantiation[] = [];
  readonly params: ParameterDefinition[] = [];

  constructor(hierarchy: TypeHierarchy, name: string) {
    this.hierarchy = hierarchy;
    this.name = name;
    this.ancestors.push(this.createInstance());
    this.descendants.push(this.createInstance());
  }

  hasParent(t: TypeInstantiation): boolean {
    return this.parents.some(p => p.equals(t));
  }

  hasChild(t: TypeInstantiation): boolean {
    return this.children.some(c => c.equals(t));
  }

  hasAncestor(t: TypeInstantiation): boolean {
    return this.ancestors.some(a => a.equals(t));
  }

  hasDescendant(t: TypeInstantiation): boolean {
    return this.descendants.some(d => d.equals(t));
  }

  addParent(t: TypeInstantiation) {
    if (!this.hierarchy.typeIsCompatible(t)) throw new IncompatibleType(t);
    if (this.hasParent(t)) return;
    this.parents.push(t);
    this.addAncestor(t);
    const td = this.hierarchy.getTypeDef(t.name);
    td.ancestors.forEach(a => this.addAncestor(a));
    td.addChild(this.createInstance());
  }

  private addChild(t: TypeInstantiation) {
    if (this.hasChild(t)) return;
    this.children.push(t);
    this.addDescendant(t);
    const td = this.hierarchy.getTypeDef(t.name);
    td.descendants.forEach(d => this.addDescendant(d));
  }

  private addAncestor(t: TypeInstantiation) {
    if (this.hasAncestor(t)) return;
    this.ancestors.push(t);
    this.children.forEach(
        c => this.hierarchy.getTypeDef(c.name).addAncestor(t));
  }

  private addDescendant(t: TypeInstantiation) {
    if (this.hasDescendant(t)) return;
    this.descendants.push(t);
    this.parents.forEach(
        p => this.hierarchy.getTypeDef(p.name).addDescendant(t));
  }

  private createInstance(): TypeInstantiation {
    return new TypeInstantiation(this.name);
  }
}
