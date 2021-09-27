/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeInstantiation} from './TypeInstantiation';

export class IncompatibleType extends Error {
  constructor(t: TypeInstantiation) {
    super(
        `The type instance ${t} is incompatible with the given TypeHierarchy`);
  }
}
