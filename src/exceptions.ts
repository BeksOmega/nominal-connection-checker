/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeInstantiation} from './type_instantiation';

export class IncompatibleType extends Error {
  constructor(t: TypeInstantiation) {
    super(
        `The type instance ${t} is incompatible with the given TypeHierarchy`);
  }
}

export class NotFinalized extends Error {
  constructor() {
    super('The TypeHierarchy has not been finalized');
  }
}
