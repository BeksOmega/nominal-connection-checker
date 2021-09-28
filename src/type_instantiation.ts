/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

export class TypeInstantiation {
  readonly name: string;
  readonly isGeneric: boolean;
  readonly params: readonly TypeInstantiation[];
  readonly hasParams: boolean;

  constructor(
      name: string,
      isGeneric = false,
      params: TypeInstantiation[] = []
  ) {
    this.name = name;
    this.isGeneric = isGeneric;
    this.params = params;
    this.hasParams = !!params.length;
  }

  /**
   * Returns true if this type instance has the same name, generic status, and
   * parameters of the provided type instance. Otherwise false.
   */
  equals(b: TypeInstantiation): boolean {
    return this.name === b.name &&
        this.isGeneric === b.isGeneric &&
        this.params.length === b.params.length &&
        this.params.every((p, i) => p.equals(b.params[i]));
  }

  /**
   * Returns a new type instance which has the an identical name, generic
   * status, and parameters to this type instance.
   */
  clone(): TypeInstantiation {
    return new TypeInstantiation(
        this.name, this.isGeneric, this.params.map(p => p.clone()));
  }
}
