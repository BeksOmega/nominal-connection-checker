/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

export class TypeInstantiation {
  readonly name: string;
  readonly params: readonly TypeInstantiation[];

  constructor(name: string, params: TypeInstantiation[] = []) {
    this.name = name;
    this.params = params;
  }

  equals(b: TypeInstantiation): boolean {
    return this.name == b.name &&
        this.params.length == b.params.length &&
        this.params.every((p, i) => p.equals(b.params[i]));
  }
}
