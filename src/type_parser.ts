/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */
import {ExplicitInstantiation, TypeInstantiation} from './type_instantiation';

export function parseType(str: string): TypeInstantiation {
  return new ExplicitInstantiation(str);
}
