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

export class IncompatibleVariance extends Error {
  constructor(typeA, typeB, paramA, paramB, varianceA, varianceB) {
    super(`The type ${typeA} with parameter ${paramA} with variance ` +
        `${varianceA} cannot fulfill ${typeB} with ${paramB} with variance ` +
        `${varianceB}`);
  }
}
