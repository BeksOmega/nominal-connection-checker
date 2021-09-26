/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

export interface ParameterDefinition {
  readonly name: string;
  readonly variance: Variance
}

enum Variance {
  CO = 'COVARIANT',
  CONTRA = 'CONTRAVARIANT',
  INV = 'INVARIANT'
}
