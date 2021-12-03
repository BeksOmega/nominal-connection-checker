/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ConnectionTyper} from '../src/connection_typer';
import * as Blockly from 'blockly';
import {assert} from 'chai';
import {ExplicitInstantiation, GenericInstantiation} from '../src/type_instantiation';

suite('Connection typing', function() {
  let workspace;
  let connectionTyper;

  function createBlock(name, output = '', inputs = []) {
    Blockly.Blocks[name] = {
      init: function() {
        if (output) this.setOutput(true, output);
        inputs.forEach((input, i) => {
          this.appendValueInput(i).setCheck(input);
        });
      },
    };
    return workspace.newBlock(name);
  }

  function assertConnectionType(conn, types) {
    assert.deepEqual(connectionTyper.getTypesOfConnection(conn), types);
  }

  setup(function() {
    workspace = new Blockly.Workspace();
    connectionTyper = new ConnectionTyper();
  });

  teardown(function() {
    for (const block in Blockly.Blocks) {
      if (Object.prototype.hasOwnProperty.call(Blockly.Blocks, block)) {
        delete Blockly.Blocks[block];
      }
    }
    workspace.dispose();
  });

  suite('basic typing (no connected blocks)', function() {
    test('typing an explicit type', function() {
      const block = createBlock('test', 'test');
      assertConnectionType(
          block.outputConnection, new ExplicitInstantiation('test'));
    });

    test('typing an explicit type with params', function() {
      const block = createBlock('test', 'test[test2, test3]');
      assertConnectionType(
          block.outputConnection,
          new ExplicitInstantiation(
              'test',
              [
                new ExplicitInstantiation('test2'),
                new ExplicitInstantiation('test3'),
              ]));
    });

    test('typing a generic type', function() {
      const block = createBlock('test', 't');
      assertConnectionType(
          block.outputConnection, new GenericInstantiation('t'));
    });

    test('typing a generic type with bounds', function() {
      const block = createBlock('test', 'test1, test2 <: t <: test3, test4');
      assertConnectionType(
          block.outputConnection,
          new GenericInstantiation(
              't',
              [
                new ExplicitInstantiation('test1'),
                new ExplicitInstantiation('test2'),
              ],
              [
                new ExplicitInstantiation('test3'),
                new ExplicitInstantiation('test4'),
              ]));
    });
  });
});
