/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {Connection} from 'blockly';
import {TypeInstantiation} from './type_instantiation';
import {parseType} from './type_parser';

export class ConnectionTyper {
  getTypesOfConnection(c: Connection): TypeInstantiation {
    return parseType(c.getCheck()[0]);
  }
}
