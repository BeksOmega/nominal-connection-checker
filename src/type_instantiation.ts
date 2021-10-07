/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

export interface TypeInstantiation {
  readonly name: string;
  equals: (t: TypeInstantiation) => boolean;
  clone: () => TypeInstantiation;
}

export class ExplicitInstantiation implements TypeInstantiation {
  readonly name: string;
  readonly params: readonly TypeInstantiation[];
  readonly hasParams: boolean;

  constructor(name: string, params: TypeInstantiation[] = []) {
    this.name = name;
    this.params = params;
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
   * Returns a new type instance which has the an identical name and parameters
   * to this type instance.
   */
  clone(): TypeInstantiation {
    return new ExplicitInstantiation(
        this.name, this.params.map(p => p.clone()));
  }
}

export class GenericInstantiation implements TypeInstantiation {
  readonly name: string;

  constructor(name = '') {
    this.name = name;
  }

  /**
   * Returns true if this type instance has the same name as the provided type
   * instance. Otherwise false.
   */
  equals(b: TypeInstantiation): boolean {
    return b instanceof GenericInstantiation && this.name === b.name;
  }

  /**
   * Returns a new type instance which has the an identical name to this type
   * instance.
   */
  clone(): TypeInstantiation {
    return new GenericInstantiation(this.name);
  }
}
