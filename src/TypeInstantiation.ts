/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

export class TypeInstantiation {
  readonly name: string;
  readonly isGeneric: boolean;
  readonly params: readonly TypeInstantiation[];

  constructor(
    name: string,
    isGeneric: boolean = false,
    params: TypeInstantiation[] = []
  ) {
    this.name = name;
    this.isGeneric = isGeneric;
    this.params = params;
  }

  equals(b: TypeInstantiation): boolean {
    return this.name === b.name &&
        this.isGeneric === b.isGeneric &&
        this.params.length === b.params.length &&
        this.params.every((p, i) => p.equals(b.params[i]));
  }

  clone(): TypeInstantiation {
    return new TypeInstantiation(
        this.name, this.isGeneric, this.params.map(p => p.clone()));
  }
}
