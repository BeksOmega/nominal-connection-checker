/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

export class ParameterDefinition {
  constructor(readonly name: string, readonly variance: Variance) {}
}

export enum Variance {
  CO = 'COVARIANT',
  CONTRA = 'CONTRAVARIANT',
  INV = 'INVARIANT'
}
