/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ConnectionTyper} from '../src/connection_typer';
import {ExplicitInstantiation, GenericInstantiation} from '../src/type_instantiation';
import {TypeHierarchy} from '../src/type_hierarchy';
import {assert} from 'chai';
import * as Blockly from 'blockly';

suite.only('Connection typing', function() {
  class TestConnectionChecker extends Blockly.ConnectionChecker {
    doTypeChecks() {
      return true;
    }
  }
  const type = Blockly.registry.Type.CONNECTION_CHECKER;
  const name = 'TestConnectionChecker';
  Blockly.registry.register(type, name, TestConnectionChecker);

  let workspace;

  function createBlock(name, output = '', inputs = []) {
    Blockly.Blocks[name] = {
      init: function() {
        if (output) this.setOutput(true, output);
        inputs.forEach((input, i) => {
          this.appendValueInput(`${i}`).setCheck(input);
        });
      },
    };
    return workspace.newBlock(name);
  }

  function assertConnectionType(typer, conn, types, msg) {
    assert.deepEqual(typer.getTypesOfConnection(conn), types, msg);
  }

  function blankHierarchy() {
    const h = new TypeHierarchy();
    h.finalize();
    return h;
  }

  setup(function() {
    workspace = new Blockly.Workspace({
      plugins: {
        [type]: name,
      },
    });
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
      const typer = new ConnectionTyper(blankHierarchy());
      const block = createBlock('test', 'test');
      assertConnectionType(
          typer, block.outputConnection, [new ExplicitInstantiation('test')],
          'Expected a basic explicit type to simply be parsed');
    });

    test('typing an explicit type with params', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const block = createBlock('test', 'test[test2, test3]');
      assertConnectionType(
          typer,
          block.outputConnection,
          [new ExplicitInstantiation(
              'test',
              [
                new ExplicitInstantiation('test2'),
                new ExplicitInstantiation('test3'),
              ])],
          'Expected a parameterized explicit type to simply be parsed');
    });

    test('typing a generic type', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const block = createBlock('test', 't');
      assertConnectionType(
          typer, block.outputConnection, [new GenericInstantiation('')],
          'Expected an unattached generic output to be simply parsed');
    });

    test('typing a generic type with bounds', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const block = createBlock('test', 'test1, test2 <: t <: test3, test4');
      assertConnectionType(
          typer,
          block.outputConnection,
          [new GenericInstantiation(
              '',
              [
                new ExplicitInstantiation('test1'),
                new ExplicitInstantiation('test2'),
              ],
              [
                new ExplicitInstantiation('test3'),
                new ExplicitInstantiation('test4'),
              ])],
          'Expected an unattached generic ouput with bounds to be simply parsed');
    });
  });

  suite('simple generics', function() {
    test('typing a generic input attached to a parent', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const parent = createBlock('parent', '', ['type']);
      const child = createBlock('child', 'g', ['g']);
      parent.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          child.getInput('0').connection,
          [new GenericInstantiation('', [], [new ExplicitInstantiation('type')])],
          'Expected the generic input to have a bound of <: the parent');
    });

    test('typing a generic input through another generic parent', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const parent = createBlock('parent', '', ['type']);
      const middle = createBlock('middle', 't', ['t']);
      const child = createBlock('child', 'g', ['g']);
      parent.getInput('0').connection.connect(middle.outputConnection);
      middle.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          child.getInput('0').connection,
          [new GenericInstantiation('', [], [new ExplicitInstantiation('type')])],
          'Expected the generic to have a bound of <: the parent');
    });

    test('typing a generic input attached to a child', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const parent = createBlock('parent', '', ['g']);
      const child = createBlock('child', 'type');
      parent.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          parent.getInput('0').connection,
          [new GenericInstantiation('')],
          'Expected the input to be a simple generic');
    });

    test('typing generic input with a non-matching output', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const parent = createBlock('parent', '', ['type']);
      const child = createBlock('child', 't', ['g']);
      parent.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          child.getInput('0').connection,
          [new GenericInstantiation('')],
          'Expected the ionput to be a simple generic');
    });

    test('typing a generic output attached to a parent', function() {
      const typer = new ConnectionTyper(blankHierarchy());
      const parent = createBlock('parent', '', ['type']);
      const child = createBlock('child', 'g', ['g']);
      parent.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          child.outputConnection,
          [new GenericInstantiation('')],
          'Expected the output to be a simple generic');
    });

    test('typing a generic output through another generic child', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();
      const typer = new ConnectionTyper(h);
      const parent = createBlock('parent', 'g', ['g']);
      const middle = createBlock('middle', 't', ['t']);
      const child = createBlock('child', 'type');
      parent.getInput('0').connection.connect(middle.outputConnection);
      middle.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          parent.outputConnection,
          [new ExplicitInstantiation('type')],
          'Expetd the generic to have the type of the child');
    });

    test('typing a generic output attached to a child', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();
      const typer = new ConnectionTyper(h);
      const parent = createBlock('parent', 'g', ['g']);
      const child = createBlock('child', 'type');
      parent.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          parent.outputConnection,
          [new ExplicitInstantiation('type')],
          'Expected the generic to have the type of the child');
    });

    test('typing a generic output with only non-matching inputs', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();
      const typer = new ConnectionTyper(h);
      const parent = createBlock('parent', 'g', ['t']);
      const child = createBlock('child', 'type');
      parent.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          parent.outputConnection,
          [new GenericInstantiation('')],
          'Expected the the output to be a simple generic');
    });

    test('typing a generic output with multiple children', function() {
      const h = new TypeHierarchy();
      const a = h.addTypeDef('typeA');
      const b = h.addTypeDef('typeB');
      const c = h.addTypeDef('typeC');
      b.addParent(a.createInstance());
      c.addParent(a.createInstance());
      h.finalize();
      const typer = new ConnectionTyper(h);

      const parent = createBlock('parent', 'g', ['g', 'g']);
      const typeB = createBlock('b', 'typeB');
      const typeC = createBlock('c', 'typeC');
      parent.getInput('0').connection.connect(typeB.outputConnection);
      parent.getInput('1').connection.connect(typeC.outputConnection);
      assertConnectionType(
          typer,
          parent.outputConnection,
          [new ExplicitInstantiation('typeA')],
          'Expected the ouput to have the type of the NCA of the children');
    });

    test('typing a generic input with a sibling', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();
      const typer = new ConnectionTyper(h);
      const parent = createBlock('parent', '', ['g', 'g']);
      const child = createBlock('child', 'type');
      parent.getInput('0').connection.connect(child.outputConnection);
      assertConnectionType(
          typer,
          parent.getInput('1').connection,
          [new GenericInstantiation('')],
          'Expected the generic to be a simple generic');
    });
  });
});
