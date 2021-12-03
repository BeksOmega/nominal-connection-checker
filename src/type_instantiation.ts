/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

export interface TypeInstantiation {
  readonly name: string;
  equals: (t: TypeInstantiation) => boolean;
  isEquivalentTo: (t: TypeInstantiation) => boolean;
  clone: () => TypeInstantiation;
}

export class ExplicitInstantiation implements TypeInstantiation {
  readonly hasParams: boolean;

  constructor(
      readonly name: string,
      readonly params: TypeInstantiation[] = []
  ) {
    this.hasParams = !!params.length;
  }

  /**
   * Returns true if this type instance has the same name and parameters of the
   * provided type instance. Otherwise false.
   */
  equals(b: TypeInstantiation): boolean {
    return b instanceof ExplicitInstantiation &&
      this.name === b.name &&
      this.params.length === b.params.length &&
      this.params.every((p, i) => p.equals(b.params[i]));
  }

  /**
   * Returns true if this type instance represents the same type as the provided
   * type instance, otherwise false.
   */
  isEquivalentTo(b: TypeInstantiation): boolean {
    return this.equals(b);
  }

  /**
   * Returns a new type instance which has the an identical name and parameters
   * to this type instance.
   */
  clone(): TypeInstantiation {
    return new ExplicitInstantiation(
        this.name, this.params.map(p => p.clone()));
  }
}

export class GenericInstantiation implements TypeInstantiation {
  readonly lowerBounds: ExplicitInstantiation[];
  readonly upperBounds: ExplicitInstantiation[];
  readonly isConstrained: boolean;
  readonly hasLowerBound: boolean;
  readonly hasUpperBound: boolean;

  constructor(
      readonly name = '',
      readonly unfilteredLowerBounds: readonly TypeInstantiation[] = [],
      readonly unfilteredUpperBounds: readonly TypeInstantiation[] = []
  ) {
    this.lowerBounds = unfilteredLowerBounds.filter(
        (t) => t instanceof ExplicitInstantiation) as ExplicitInstantiation[];
    this.upperBounds = unfilteredUpperBounds.filter(
        (t) => t instanceof ExplicitInstantiation) as ExplicitInstantiation[];
    this.isConstrained = !!this.lowerBounds.length || !!this.upperBounds.length;
    this.hasLowerBound = !!this.lowerBounds.length;
    this.hasUpperBound = !!this.upperBounds.length;
  }

  /**
   * Returns true if this type instance has the same name and bounds as the
   * provided type instance. Otherwise false.
   */
  equals(b: TypeInstantiation): boolean {
    return b instanceof GenericInstantiation &&
        this.name === b.name &&
        this.unfilteredLowerBounds.length == b.unfilteredLowerBounds.length &&
        this.unfilteredUpperBounds.length == b.unfilteredUpperBounds.length &&
        this.unfilteredLowerBounds.every(
            (l, i) => l.equals(b.unfilteredLowerBounds[i])) &&
        this.unfilteredUpperBounds.every(
            (u, i) => u.equals(b.unfilteredUpperBounds[i]));
  }

  /**
   * Returns true if this type instance represents the same type as the provided
   * type instance, otherwise false.
   * Ignores name and the order of bounds.
   */
  isEquivalentTo(b: TypeInstantiation): boolean {
    return b instanceof GenericInstantiation &&
      this.lowerBounds.length == b.lowerBounds.length &&
      this.upperBounds.length == b.upperBounds.length &&
      this.lowerBounds.every(
          (l) => b.lowerBounds.some(l2 => l.isEquivalentTo(l2))) &&
      this.upperBounds.every(
          (u) => b.upperBounds.some(u2 => u.isEquivalentTo(u2)));
  }

  /**
   * Returns a new type instance which has the an identical name to this type
   * instance.
   */
  clone(): TypeInstantiation {
    return new GenericInstantiation(
        this.name,
        [...this.unfilteredLowerBounds],
        [...this.unfilteredUpperBounds]);
  }
}
