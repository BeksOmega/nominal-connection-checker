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
import {ParameterDefinition, Variance} from '../src/parameter_definition';

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
    const val = typer.getTypesOfConnection(conn);
    // console.log('vals');
    // val.forEach(v => console.log(v));
    assert.deepEqual(val, types, msg);
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
      const h = new TypeHierarchy();
      h.addTypeDef('test');
      h.finalize();
      const typer = new ConnectionTyper(h);
      const block = createBlock('test', 'test');
      assertConnectionType(
          typer, block.outputConnection, [new ExplicitInstantiation('test')],
          'Expected a basic explicit type to simply be parsed');
    });

    test('typing an explicit type with params', function() {
      const h = new TypeHierarchy();
      const paramA = new ParameterDefinition('a', Variance.CO);
      const paramB = new ParameterDefinition('b', Variance.CO);
      h.addTypeDef('test', [paramA, paramB]);
      h.addTypeDef('test2');
      h.addTypeDef('test3');
      h.finalize();
      const typer = new ConnectionTyper(h);
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
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();

      const typer = new ConnectionTyper(h);
      const block = createBlock('test', 't');
      assertConnectionType(
          typer, block.outputConnection, [new GenericInstantiation('')],
          'Expected an unattached generic output to be simply parsed');
    });

    test('typing a generic type with bounds', function() {
      const h = new TypeHierarchy();
      const t1 = h.addTypeDef('test1');
      const t2 = h.addTypeDef('test2');
      t1.addParent(t2.createInstance());
      h.finalize();
      const typer = new ConnectionTyper(h);
      const block = createBlock('test', 'test1 <: t <: test2');
      assertConnectionType(
          typer,
          block.outputConnection,
          [new GenericInstantiation(
              '',
              [
                new ExplicitInstantiation('test1'),
              ],
              [
                new ExplicitInstantiation('test2'),
              ])],
          'Expected an unattached generic ouput with bounds to be simply parsed');
    });
  });

  suite('simple generics', function() {
    test('typing a generic input attached to a parent', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();

      const typer = new ConnectionTyper(h);
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
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();

      const typer = new ConnectionTyper(h);
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
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();

      const typer = new ConnectionTyper(h);
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
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();

      const typer = new ConnectionTyper(h);
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
      const h = new TypeHierarchy();
      h.addTypeDef('type');
      h.finalize();

      const typer = new ConnectionTyper(h);
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

    test('typing a generic input with multiple nested children', function() {
      const h = new TypeHierarchy();
      const a = h.addTypeDef('typeA');
      const b = h.addTypeDef('typeB');
      const c = h.addTypeDef('typeC');
      const d = h.addTypeDef('typeD');
      const e = h.addTypeDef('typeE');
      c.addParent(a.createInstance());
      d.addParent(a.createInstance());
      e.addParent(a.createInstance());
      d.addParent(b.createInstance());
      e.addParent(b.createInstance());
      h.finalize();
      const typer = new ConnectionTyper(h);

      const parent = createBlock('parent', 'g', ['g', 'g']);
      const middle = createBlock('middle', 'g', ['g', 'g']);
      const typeC = createBlock('c', 'typeC');
      const typeD = createBlock('d', 'typeD');
      const typeE = createBlock('e', 'typeE');
      parent.getInput('0').connection.connect(typeC.outputConnection);
      parent.getInput('1').connection.connect(middle.outputConnection);
      middle.getInput('0').connection.connect(typeD.outputConnection);
      middle.getInput('1').connection.connect(typeE.outputConnection);
      assertConnectionType(
          typer,
          parent.outputConnection,
          [new ExplicitInstantiation('typeA')],
          'Expected the ouput to have the type of the NCA of all of the children');
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

  suite('constrained generic types', function() {
    function defineTyper() {
      const h = new TypeHierarchy();
      const a = h.addTypeDef('typeA');
      const b = h.addTypeDef('typeB');
      const c = h.addTypeDef('typeC');
      const d = h.addTypeDef('typeD');
      const e = h.addTypeDef('typeE');
      e.addParent(d.createInstance());
      d.addParent(c.createInstance());
      c.addParent(b.createInstance());
      b.addParent(a.createInstance());
      h.finalize();
      return new ConnectionTyper(h);
    }

    suite('combining constraints within a block', function() {
      function defineTyper() {
        const h = new TypeHierarchy();
        const a = h.addTypeDef('typeA');
        const b = h.addTypeDef('typeB');
        const c = h.addTypeDef('typeC');
        const d = h.addTypeDef('typeD');
        b.addParent(a.createInstance());
        c.addParent(a.createInstance());
        d.addParent(b.createInstance());
        d.addParent(c.createInstance());
        h.finalize();
        return new ConnectionTyper(h);
      }

      suite('outputs', function() {
        test('outputs get the constraints of inputs', function() {
          const typer = defineTyper();
          const block = createBlock('block', 't', ['t <: typeB']);
          assertConnectionType(
              typer,
              block.outputConnection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeB')])],
              'Expected outputs to get the constraints of inputs');
        });

        test('outputs combine the constraints of inputs with their own constraints',
            function() {
              const typer = defineTyper();
              const block = createBlock('block', 't <: typeC', ['t <: typeB']);
              assertConnectionType(
                  typer,
                  block.outputConnection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeD')])],
                  'Expected outputs to combine their constraints with the constraints of inputs');
            });
      });

      suite('inputs', function() {
        test('inputs get the constraints of outputs', function() {
          const typer = defineTyper();
          const block = createBlock('block', 't <: typeB', ['t']);
          assertConnectionType(
              typer,
              block.getInput('0').connection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeB')])],
              'Expected inputs to get the constraints of outputs');
        });

        test('inputs combine the constraints of outputs with their own constraints',
            function() {
              const typer = defineTyper();
              const block = createBlock('block', 't <: typeB', ['t <: typeC']);
              assertConnectionType(
                  typer,
                  block.getInput('0').connection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeD')])],
                  'Expected inputs to combine their constraints with the constraints of outputs');
            });

        test('inputs get the constraints of other inputs', function() {
          const typer = defineTyper();
          const block = createBlock('block', 't', ['t', 't <: typeB']);
          assertConnectionType(
              typer,
              block.getInput('0').connection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeB')])],
              'Expected inputs to get the constraints of other inputs');
        });

        test('inputs combine the constraints of other inputs with their own constraints',
            function() {
              const typer = defineTyper();
              const block = createBlock(
                  'block', 't', ['t <: typeC', 't <: typeB']);
              assertConnectionType(
                  typer,
                  block.getInput('0').connection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeD')])],
                  'Expected inputs to combine their constraints with the constraints of other inputs');
            });
      });
    });

    suite('getting constraints from other blocks', function() {
      suite('outputs', function() {
        test('outputs get the constraints of children', function() {
          const typer = defineTyper();
          const parent = createBlock('parent', 't', ['t']);
          const child = createBlock('child', 'g <: typeD', ['g']);
          parent.getInput('0').connection.connect(child.outputConnection);
          assertConnectionType(
              typer,
              parent.outputConnection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeD')])],
              'Expected outputs to get the constraints of children');
        });

        test('outputs get constraints through children', function() {
          const typer = defineTyper();
          const parent = createBlock('parent', 't', ['t']);
          const middle = createBlock('parent', 'g', ['g']);
          const child = createBlock('child', 'h <: typeD', ['g']);
          parent.getInput('0').connection.connect(middle.outputConnection);
          middle.getInput('0').connection.connect(child.outputConnection);
          assertConnectionType(
              typer,
              parent.outputConnection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeD')])],
              'Expected outputs to get constraints through children');
        });

        test('ouputs do not get the constraints of parents', function() {
          const typer = defineTyper();
          const parent = createBlock('parent', 't', ['t']);
          const child = createBlock('child', 'g', ['g']);
          parent.getInput('0').connection.connect(child.outputConnection);
          assertConnectionType(
              typer,
              child.outputConnection,
              [new GenericInstantiation('')],
              'Expected outputs to not get the constraints of parents children');
        });
      });

      suite('inputs', function() {
        test('inputs get the constraints of parents', function() {
          const typer = defineTyper();
          const parent = createBlock('parent', 't <: typeC', ['t']);
          const child = createBlock('child', 'g', ['g']);
          parent.getInput('0').connection.connect(child.outputConnection);
          assertConnectionType(
              typer,
              child.getInput('0').connection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeC')])],
              'Expected inputs to get the constraints of parents');
        });

        test('inputs get constraints through parents', function() {
          const typer = defineTyper();
          const parent = createBlock('parent', 't <: typeC', ['t']);
          const middle = createBlock('middle', 't', ['t']);
          const child = createBlock('child', 'g', ['g']);
          parent.getInput('0').connection.connect(middle.outputConnection);
          middle.getInput('0').connection.connect(child.outputConnection);
          assertConnectionType(
              typer,
              child.getInput('0').connection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeC')])],
              'Expected inputs to get constraints through parents');
        });

        test('inputs do not get the constraints of children', function() {
          const typer = defineTyper();
          const parent = createBlock('parent', 't', ['t']);
          const child = createBlock('child', 'g <: typeC', ['g']);
          parent.getInput('0').connection.connect(child.outputConnection);
          assertConnectionType(
              typer,
              parent.getInput('0').connection,
              [new GenericInstantiation('')],
              'Expected inputs to not get the constraints of children');
        });

        test('inputs do not get the constraints of sibling input children',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const child = createBlock('child', 'g <: typeC', ['g']);
              parent.getInput('1').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  parent.getInput('0').connection,
                  [new GenericInstantiation('')],
                  'Expected inputs to not get the constraints of sibling input children');
            });
      });
    });

    suite('unification of checks with explicit children', function() {
      suite('outputs', function() {
        // a supertype cannot conect to an upper bound input.

        test('a subtype connected to an upper bound input results in the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t <: typeC']);
              const child = createBlock('child', 'typeD');
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation('typeD')],
                  'Expected typing to result in the subtype');
            });
      });

      suite('inputs', function() {
        test('an upper bound subtype connected to a supertype results in an upper bound with the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', '', ['typeB']);
              const child = createBlock('child', 't', 't <: typeC');
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  child.getInput('0').connection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeC')])],
                  'Expected typing to result an upper bound with the subtype');
            });

        test('an upper bound supertype connected to a subtype results in a lower bound with the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', '', ['typeD']);
              const child = createBlock('child', 't', 't <: typeC');
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  child.getInput('0').connection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeD')])],
                  'Expected typing to result an upper bound with the subtype');
            });
      });
    });

    suite('unification of checks with constrained children', function() {
      suite('outputs', function() {
        test('a supertype upper bound connected to a subtype upper bound results in an upper bound with the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t <: typeC']);
              const child = createBlock('child', 'g <: typeB', ['g']);
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeC')])],
                  'Expected typing to result in an upper bound with the subtype');
            });

        test('a subtype upper bound connected to a supertype upper bound results in an upper bound with the subtye',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t <: typeC']);
              const child = createBlock('child', 'g <: typeD', ['g']);
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeD')])],
                  'Expected typing to result in an upper bound with the subtype');
            });

        // supertype lower bounds cannot connect to subtype upper bounds.

        test('a subtype lower bound connected to a supertype upper bound results in a lower bound with the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t <: typeC']);
              const child = createBlock('child', 'g >: typeD', ['g']);
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [new ExplicitInstantiation('typeD')])],
                  'Expected typing to result in a lower bound with the subtype');
            });
      });

      suite('inputs', function() {
        test('a subtype upper bound connected to a supertype upper bound results in an upper bound with the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 'g', ['g <: typeB']);
              const child = createBlock('child', 't', 't <: typeC');
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  child.getInput('0').connection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeC')])],
                  'Expected typing to result an upper bound with the subtype');
            });

        test('a supertype upper bound connected to a subtype upper bound results in an upper bound with the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 'g', ['g <: typeD']);
              const child = createBlock('child', 't', 't <: typeC');
              parent.getInput('0').connection.connect(child.outputConnection);
              assertConnectionType(
                  typer,
                  child.getInput('0').connection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeD')])],
                  'Expected typing to result an upper bound with the subtype');
            });
      });
    });

    suite('unification of siblings, including explicits', function() {
      suite('outputs', function() {
        test('an upper bound subtype with a supertype results in the supertype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const childA = createBlock('childA', 'g <: typeC', ['g']);
              const childB = createBlock('childB', 'typeB');
              parent.getInput('0').connection.connect(childA.outputConnection);
              parent.getInput('1').connection.connect(childB.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation('typeB')],
                  'Expected typing to result in the supertype');
            });

        test('an upper bound supertype with a subtype results in the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const childA = createBlock('childA', 'g <: typeC', ['g']);
              const childB = createBlock('childB', 'typeD');
              parent.getInput('0').connection.connect(childA.outputConnection);
              parent.getInput('1').connection.connect(childB.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation('typeD')],
                  'Expected typing to result in the subtype');
            });

        test('a lower bound subtype with a supertype results in a lower bound of the supertype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const childA = createBlock('childA', 'g >: typeC', ['g']);
              const childB = createBlock('childB', 'typeB');
              parent.getInput('0').connection.connect(childA.outputConnection);
              parent.getInput('1').connection.connect(childB.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [new ExplicitInstantiation('typeB')])],
                  'Expected typing to result in a lower bound with the supertype');
            });

        test('a lower bound supertype with a subtype results in a lowerbound of the supertype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const childA = createBlock('childA', 'g >: typeC', ['g']);
              const childB = createBlock('childB', 'typeD');
              parent.getInput('0').connection.connect(childA.outputConnection);
              parent.getInput('1').connection.connect(childB.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [new ExplicitInstantiation('typeC')])],
                  'Expected typing to result in a lower bound with the supertype');
            });
      });
    });

    suite('unification of siblings, only with constraints', function() {
      suite('outputs', function() {
        test('an upper bound subtype with an upper bound supertype results in an upper bound of the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const childA = createBlock('childA', 'g <: typeC', ['g']);
              const childB = createBlock('childB', 'h <: typeB', ['h']);
              parent.getInput('0').connection.connect(childA.outputConnection);
              parent.getInput('1').connection.connect(childB.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeC')])],
                  'Expected typing to result in an upper bound withthe subtype');
            });

        // upper bound subtypes cannot be siblings with lower bound supertypes.

        test('an upper bound supertype with a lower bound subtype results in a lower bound of the subtype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const childA = createBlock('childA', 'g <: typeC', ['g']);
              const childB = createBlock('childB', 'h >: typeD', ['h']);
              parent.getInput('0').connection.connect(childA.outputConnection);
              parent.getInput('1').connection.connect(childB.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [new ExplicitInstantiation('typeD')])],
                  'Expected typing to result in a lower bound with the subtype');
            });

        test('a lower bound subtype with a lower bound supertype results in a lowerbound of the supertype',
            function() {
              const typer = defineTyper();
              const parent = createBlock('parent', 't', ['t', 't']);
              const childA = createBlock('childA', 'g >: typeC', ['g']);
              const childB = createBlock('childB', 'h >: typeB', ['h']);
              parent.getInput('0').connection.connect(childA.outputConnection);
              parent.getInput('1').connection.connect(childB.outputConnection);
              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new GenericInstantiation(
                      '', [new ExplicitInstantiation('typeB')])],
                  'Expected typing to result in an upper bound with the supertype');
            });
      });
    });
  });

  suite.skip('generic parameterized types', function() {
    suite('covariant', function() {
      suite('inputs', function() {
        test('typing a parameterized input with parameterized output', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', '', ['typeA[typeB]']);
          const child = createBlock('child', 'typeA[t]', ['typeA[t]']);
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              child.getInput('0').connection,
              [new ExplicitInstantiation(
                  'typeA', [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeB')])])],
              'Expected a parameterized input to be bound to the type attached to the output');
        });

        test('typing a parameterized input with parameterized output attached to super',
            function() {
              const h = new TypeHierarchy();
              const coParamA = new ParameterDefinition('coA', Variance.CO);
              const coParamB = new ParameterDefinition('coB', Variance.CO);
              h.addTypeDef('typeA', [coParamA, coParamB]);
              const b = h.addTypeDef('typeB', [coParamA]);
              h.addTypeDef('typeC');
              h.addTypeDef('typeD');
              b.addParent(new ExplicitInstantiation(
                  'typeA',
                  [new ExplicitInstantiation('typeC'), new GenericInstantiation('coA')]));
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', '', ['typeA[typeC, typeD]']);
              const child = createBlock('child', 'typeB[t]', ['typeB[t]']);
              parent.getInput('0').connection.connect(child.outputConnection);

              assertConnectionType(
                  typer,
                  child.getInput('0').connection,
                  [new ExplicitInstantiation(
                      'typeB', [new GenericInstantiation(
                          '', [], [new ExplicitInstantiation('typeD')])])],
                  'Expected parameters to be properly reorganized for subtypes');
            });

        test('typing a parameterized input with generic output', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', '', ['typeB']);
          const child = createBlock('child', 't', ['typeA[t]']);
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              child.getInput('0').connection,
              [new ExplicitInstantiation(
                  'typeA', [new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeB')])])],
              'Expected generics to be properly slotted into parameters');
        });

        test('typing a generic input with parameterized output', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', '', ['typeA[typeB]']);
          const child = createBlock('child', 'typeA[t]', ['t']);
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              child.getInput('0').connection,
              [new GenericInstantiation(
                  '', [], [new ExplicitInstantiation('typeB')])],
              'Expected generics to properly look at parameters');
        });

        test('typing a parameterized input through a parameterized parent',
            function() {
              const h = new TypeHierarchy();
              const coParamA = new ParameterDefinition('coA', Variance.CO);
              const coParamB = new ParameterDefinition('coB', Variance.CO);
              h.addTypeDef('typeA', [coParamA, coParamB]);
              const b = h.addTypeDef('typeB', [coParamA]);
              h.addTypeDef('typeC');
              h.addTypeDef('typeD');
              b.addParent(new ExplicitInstantiation(
                  'typeA',
                  [
                    new ExplicitInstantiation('typeC'),
                    new GenericInstantiation('coA'),
                  ]));
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', '', ['typeA[typeC, typeD]']);
              const middle = createBlock('middle', 'typeA[a, b]', ['typeB[b]']);
              const child = createBlock('child', 'typeB[t]', ['typeB[t]']);
              parent.getInput('0').connection.connect(middle.outputConnection);
              middle.getInput('0').connection.connect(child.outputConnection);

              assertConnectionType(
                  typer,
                  child.getInput('0').connection,
                  [new ExplicitInstantiation(
                      'typeB', [new GenericInstantiation(
                          '', [], [new ExplicitInstantiation('typeD')])])],
                  'Expected parameters to be properly reorganized for subtypes, and to travel through blocks');
            });

        test('typing a parameterized input without associated output', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', '', ['typeA[typeB]']);
          const child = createBlock('child', 'typeA[b]', ['typeA[t]']);
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              child.getInput('0').connection,
              [new ExplicitInstantiation(
                  'typeA', [new GenericInstantiation('')])],
              'Expected unbound generics to be unnamed');
        });

        test('typing a paramterized input with the generic nested', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', '', ['typeA[typeA[typeB]]']);
          const child = createBlock('child', 'typeA[typeA[t]]', ['typeA[typeA[t]]']);
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              child.getInput('0').connection,
              [new ExplicitInstantiation(
                  'typeA', [new ExplicitInstantiation(
                      'typeA', [new GenericInstantiation(
                          '', [], [new ExplicitInstantiation('typeB')])])])],
              'Expected the generic param to be properly bound, even though it is nested');
        });
      });

      suite('outputs', function() {
        test('typing a parameterized output with parameterized input', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', 'typeA[t]', ['typeA[t]']);
          const child = createBlock('child', 'typeA[typeB]');
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              parent.outputConnection,
              [new ExplicitInstantiation(
                  'typeA', [new ExplicitInstantiation('typeB')])],
              'Expected a parameterized output to be bound to the type attached to the input');
        });

        test('typing a parameterized output with parameterized input attached to sub',
            function() {
              const h = new TypeHierarchy();
              const coParamA = new ParameterDefinition('coA', Variance.CO);
              const coParamB = new ParameterDefinition('coB', Variance.CO);
              h.addTypeDef('typeA', [coParamA, coParamB]);
              const b = h.addTypeDef('typeB', [coParamA]);
              h.addTypeDef('typeC');
              h.addTypeDef('typeD');
              b.addParent(new ExplicitInstantiation(
                  'typeA',
                  [
                    new ExplicitInstantiation('typeC'),
                    new GenericInstantiation('coA'),
                  ]));
              h.finalize();


              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', 'typeA[a, b]', ['typeA[a, b]']);
              const child = createBlock('child', 'typeB[typeD]');
              parent.getInput('0').connection.connect(child.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeC'),
                        new ExplicitInstantiation('typeD'),
                      ])],
                  'Expected parameters to be properly reorganized');
            });

        test('typing a parameterized output with multiple parameterized inputs',
            function() {
              const h = new TypeHierarchy();
              const coParam = new ParameterDefinition('co', Variance.CO);
              h.addTypeDef('typeA', [coParam]);
              const b = h.addTypeDef('typeB');
              const c = h.addTypeDef('typeC');
              const d = h.addTypeDef('typeD');
              c.addParent(b.createInstance());
              d.addParent(b.createInstance());
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock(
                  'parent', 'typeA[t]', ['typeA[t]', 'typeA[t]']);
              const childC = createBlock('child', 'typeA[typeC]');
              const childD = createBlock('child', 'typeA[typeD]');
              parent.getInput('0').connection.connect(childC.outputConnection);
              parent.getInput('1').connection.connect(childD.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation(
                      'typeA', [new ExplicitInstantiation('typeB')])],
                  'Expected params to inputs to be properly unified');
            });

        test('typing a parameterized output with generic input', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', 'typeA[t]', ['t']);
          const child = createBlock('child', 'typeB');
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              parent.outputConnection,
              [new ExplicitInstantiation(
                  'typeA', [new ExplicitInstantiation('typeB')])],
              'Expected generics to be properly slotted into params');
        });

        test('typing a parameterized output with multiple generic inputs',
            function() {
              const h = new TypeHierarchy();
              const coParam = new ParameterDefinition('co', Variance.CO);
              h.addTypeDef('typeA', [coParam]);
              const b = h.addTypeDef('typeB');
              const c = h.addTypeDef('typeC');
              const d = h.addTypeDef('typeD');
              c.addParent(b.createInstance());
              d.addParent(b.createInstance());
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', 'typeA[t]', ['t', 't']);
              const childC = createBlock('child', 'typeC');
              const childD = createBlock('child', 'typeD');
              parent.getInput('0').connection.connect(childC.outputConnection);
              parent.getInput('1').connection.connect(childD.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation(
                      'typeA', [new ExplicitInstantiation('typeB')])],
                  'Expected generics to be properly unified');
            });

        test('typing a parameterized output with parameterized and generic inputs',
            function() {
              const h = new TypeHierarchy();
              const coParam = new ParameterDefinition('co', Variance.CO);
              h.addTypeDef('typeA', [coParam]);
              const b = h.addTypeDef('typeB');
              const c = h.addTypeDef('typeC');
              const d = h.addTypeDef('typeD');
              c.addParent(b.createInstance());
              d.addParent(b.createInstance());
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', 'typeA[t]', ['t', 'typeA[t]']);
              const childC = createBlock('child', 'typeC');
              const childD = createBlock('child', 'typeA[typeD]');
              parent.getInput('0').connection.connect(childC.outputConnection);
              parent.getInput('1').connection.connect(childD.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation(
                      'typeA', [new ExplicitInstantiation('typeB')])],
                  'Expected generics and params to be properly unified');
            });

        test('typing a parameterized output through a parameterized child',
            function() {
              const h = new TypeHierarchy();
              const coParamA = new ParameterDefinition('coA', Variance.CO);
              const coParamB = new ParameterDefinition('coB', Variance.CO);
              h.addTypeDef('typeA', [coParamA, coParamB]);
              const b = h.addTypeDef('typeB', [coParamA]);
              h.addTypeDef('typeC');
              h.addTypeDef('typeD');
              b.addParent(new ExplicitInstantiation(
                  'typeA',
                  [
                    new ExplicitInstantiation('typeC'),
                    new GenericInstantiation('coA'),
                  ]));
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', 'typeA[a, b]', ['typeA[a, b]']);
              const middle = createBlock('middle', 'typeA[a, b]', ['typeA[a, b]']);
              const child = createBlock('child', 'typeB[typeD]');
              parent.getInput('0').connection.connect(middle.outputConnection);
              middle.getInput('0').connection.connect(child.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeC'),
                        new ExplicitInstantiation('typeD'),
                      ])],
                  'Expected Expected parameters to be properly reorganized for subtypes, and to travel through blocks');
            });

        test('typing a paramterized output with multiple params that unify to multiple things',
            function() {
              const h = new TypeHierarchy();
              const coParamA = new ParameterDefinition('coA', Variance.CO);
              const coParamB = new ParameterDefinition('coB', Variance.CO);
              h.addTypeDef('typeA', [coParamA, coParamB]);
              h.addTypeDef('typeX', [coParamA]);
              const b = h.addTypeDef('typeB');
              const c = h.addTypeDef('typeC');
              const d = h.addTypeDef('typeD');
              const e = h.addTypeDef('typeE');
              const f = h.addTypeDef('typeF');
              const g = h.addTypeDef('typeG');
              const i = h.addTypeDef('typeI');
              const j = h.addTypeDef('typeJ');
              d.addParent(b.createInstance());
              d.addParent(c.createInstance());
              e.addParent(b.createInstance());
              e.addParent(c.createInstance());
              i.addParent(f.createInstance());
              i.addParent(g.createInstance());
              j.addParent(f.createInstance());
              j.addParent(g.createInstance());
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock(
                  'parent',
                  'typeA[a, b]',
                  ['typeX[a]', 'typeX[a]', 'typeX[b]', 'typeX[b]']);
              const childD = createBlock('child', 'typeX[typeD]');
              const childE = createBlock('child', 'typeX[typeE]');
              const childI = createBlock('child', 'typeX[typeI]');
              const childJ = createBlock('child', 'typeX[typeJ]');
              parent.getInput('0').connection.connect(childD.outputConnection);
              parent.getInput('1').connection.connect(childE.outputConnection);
              parent.getInput('2').connection.connect(childI.outputConnection);
              parent.getInput('3').connection.connect(childJ.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeB'),
                          new ExplicitInstantiation('typeF'),
                        ]),
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeB'),
                          new ExplicitInstantiation('typeG'),
                        ]),
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeC'),
                          new ExplicitInstantiation('typeF'),
                        ]),
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeC'),
                          new ExplicitInstantiation('typeG'),
                        ]),
                  ],
                  'Expected params unifying to multiple types to result in multiple types');
            });

        test('typing a paramterized output with multiple params that unify to multiple things through children',
            function() {
              const h = new TypeHierarchy();
              const coParamA = new ParameterDefinition('coA', Variance.CO);
              const coParamB = new ParameterDefinition('coB', Variance.CO);
              h.addTypeDef('typeA', [coParamA, coParamB]);
              h.addTypeDef('typeX', [coParamA]);
              const b = h.addTypeDef('typeB');
              const c = h.addTypeDef('typeC');
              const d = h.addTypeDef('typeD');
              const e = h.addTypeDef('typeE');
              const f = h.addTypeDef('typeF');
              const g = h.addTypeDef('typeG');
              const i = h.addTypeDef('typeI');
              const j = h.addTypeDef('typeJ');
              d.addParent(b.createInstance());
              d.addParent(c.createInstance());
              e.addParent(b.createInstance());
              e.addParent(c.createInstance());
              i.addParent(f.createInstance());
              i.addParent(g.createInstance());
              j.addParent(f.createInstance());
              j.addParent(g.createInstance());
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock(
                  'parent', 'typeA[a, b]', ['typeX[a]', 'typeX[b]']);
              const middle1 = createBlock(
                  'middle1', 'typeX[t]', ['typeX[t]', 'typeX[t]']);
              const middle2 = createBlock(
                  'middle2', 'typeX[t]', ['typeX[t]', 'typeX[t]']);
              const childD = createBlock('child', 'typeX[typeD]');
              const childE = createBlock('child', 'typeX[typeE]');
              const childI = createBlock('child', 'typeX[typeI]');
              const childJ = createBlock('child', 'typeX[typeJ]');
              parent.getInput('0').connection.connect(middle1.outputConnection);
              parent.getInput('1').connection.connect(middle2.outputConnection);
              middle1.getInput('0').connection.connect(childD.outputConnection);
              middle1.getInput('1').connection.connect(childE.outputConnection);
              middle2.getInput('0').connection.connect(childI.outputConnection);
              middle2.getInput('1').connection.connect(childJ.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeB'),
                          new ExplicitInstantiation('typeF'),
                        ]),
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeB'),
                          new ExplicitInstantiation('typeG'),
                        ]),
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeC'),
                          new ExplicitInstantiation('typeF'),
                        ]),
                    new ExplicitInstantiation(
                        'typeA',
                        [
                          new ExplicitInstantiation('typeC'),
                          new ExplicitInstantiation('typeG'),
                        ]),
                  ],
                  'Expected params unifying to multiple types to result in multiple types');
            });

        test('typing a generic output with parameterized input', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', 't', ['typeA[t]']);
          const child = createBlock('child', 'typeA[typeB]');
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              parent.outputConnection,
              [new ExplicitInstantiation('typeB')],
              'Expected generics to be properly bound to params');
        });

        test('typing a generic output with multiple parameterized inputs',
            function() {
              const h = new TypeHierarchy();
              const coParam = new ParameterDefinition('co', Variance.CO);
              h.addTypeDef('typeA', [coParam]);
              const b = h.addTypeDef('typeB');
              const c = h.addTypeDef('typeC');
              const d = h.addTypeDef('typeD');
              c.addParent(b.createInstance());
              d.addParent(b.createInstance());
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', 't', ['typeA[t]', 'typeA[t]']);
              const childC = createBlock('child', 'typeA[typeC]');
              const childD = createBlock('child', 'typeA[typeD]');
              parent.getInput('0').connection.connect(childC.outputConnection);
              parent.getInput('1').connection.connect(childD.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation('typeB')],
                  'Expected params to be properly unified');
            });

        test('typing a generic output with parameterized and generic inputs',
            function() {
              const h = new TypeHierarchy();
              const coParam = new ParameterDefinition('co', Variance.CO);
              h.addTypeDef('typeA', [coParam]);
              const b = h.addTypeDef('typeB');
              const c = h.addTypeDef('typeC');
              const d = h.addTypeDef('typeD');
              c.addParent(b.createInstance());
              d.addParent(b.createInstance());
              h.finalize();

              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', 't', ['typeA[t]', 't']);
              const childC = createBlock('child', 'typeA[typeC]');
              const childD = createBlock('child', 'typeD');
              parent.getInput('0').connection.connect(childC.outputConnection);
              parent.getInput('1').connection.connect(childD.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation('typeB')],
                  'Expected params and generics to be properly unified');
            });

        test('typing a parameterized output without associated input', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock('parent', 'typeA[t]', ['typeA[b]']);
          const child = createBlock('child', 'typeA[typeB]');
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              parent.outputConnection,
              [new ExplicitInstantiation('typeA', [new GenericInstantiation('')])],
              'Expected unbound generics to be unnamed');
        });

        test('typing a parameterized output without one generic associated with an input, and the other not',
            function() {
              const h = new TypeHierarchy();
              const coParamA = new ParameterDefinition('coA', Variance.CO);
              const coParamB = new ParameterDefinition('coB', Variance.CO);
              h.addTypeDef('typeA', [coParamA, coParamB]);
              const b = h.addTypeDef('typeB', [coParamA]);
              h.addTypeDef('typeC');
              h.addTypeDef('typeD');
              b.addParent(new ExplicitInstantiation(
                  'typeA',
                  [
                    new ExplicitInstantiation('typeC'),
                    new GenericInstantiation('coA'),
                  ]));
              h.finalize();


              const typer = new ConnectionTyper(h);
              const parent = createBlock('parent', 'typeA[a, b]', ['typeB[b]']);
              const child = createBlock('child', 'typeB[typeD]');
              parent.getInput('0').connection.connect(child.outputConnection);

              assertConnectionType(
                  typer,
                  parent.outputConnection,
                  [new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(''),
                        new ExplicitInstantiation('typeD'),
                      ])],
                  'Expected unbound generics to be unnamed');
            });

        test('typing a paramterized output with the generic nested', function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('co', Variance.CO);
          h.addTypeDef('typeA', [coParam]);
          h.addTypeDef('typeB');
          h.finalize();

          const typer = new ConnectionTyper(h);
          const parent = createBlock(
              'parent', 'typeA[typeA[t]]', ['typeA[typeA[t]]']);
          const child = createBlock('child', 'typeA[typeA[typeB]]');
          parent.getInput('0').connection.connect(child.outputConnection);

          assertConnectionType(
              typer,
              parent.outputConnection,
              [new ExplicitInstantiation(
                  'typeA', [new ExplicitInstantiation(
                      'typeA', [new ExplicitInstantiation('typeB')])])],
              'Expected the generic param to be properly bound, even though it is nested');
        });
      });
    });
  });

  suite.skip('generic paramterized types with multiple of the same param', function() {
    suite('covariant', function() {
      function defineHierarchy() {
        const h = new TypeHierarchy();
        const paramA = new ParameterDefinition('a', Variance.CO);
        const paramB = new ParameterDefinition('b', Variance.CO);
        h.addTypeDef('typeA', [paramA, paramB]);
        h.addTypeDef('typeB', [paramA]);
        const c = h.addTypeDef('typeC');
        const d = h.addTypeDef('typeD');
        const e = h.addTypeDef('typeE');
        const f = h.addTypeDef('typeF');
        const g = h.addTypeDef('typeG');
        const i = h.addTypeDef('typeI');
        const j = h.addTypeDef('typeJ');
        const k = h.addTypeDef('typeK');
        const l = h.addTypeDef('typeL');
        const m = h.addTypeDef('typeM');
        d.addParent(c.createInstance());
        e.addParent(c.createInstance());
        i.addParent(f.createInstance());
        i.addParent(g.createInstance());
        l.addParent(j.createInstance());
        l.addParent(k.createInstance());
        m.addParent(j.createInstance());
        m.addParent(k.createInstance());
        h.finalize();
        return h;
      }

      test('typing an input with non-nested identical params', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', '', ['typeA[typeF, typeG]']);
        const child = createBlock('child', 'typeA[t, t]', ['typeA[t, t]']);
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            child.getInput('0').connection,
            [new ExplicitInstantiation(
                'typeA',
                [
                  new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeI')]),
                  new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeI')]),
                ])],
            'Expected the generic to be the nearest common descendant of the types');
      });

      test('typing an input with non-nested identical params, which unify to multiple types',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', '', ['typeA[typeJ, typeK]']);
            const child = createBlock('child', 'typeA[t, t]', ['typeA[t, t]']);
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                child.getInput('0').connection,
                [
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeL')]),
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeL')]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeL')]),
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeM')]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeM')]),
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeL')]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeM')]),
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeM')]),
                      ]),
                ],
                'Expected the generic to bound to all of the combinations of the ncds of the types');
          });

      test('typing an input with nested identical params', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', '', ['typeA[typeF, typeB[typeG]]']);
        const child = createBlock('child', 'typeA[t, typeB[t]]', ['typeA[t, typeB[t]]']);
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            child.getInput('0').connection,
            [new ExplicitInstantiation(
                'typeA',
                [
                  new GenericInstantiation(
                      '', [], [new ExplicitInstantiation('typeI')]),
                  new ExplicitInstantiation(
                      'typeB', [new GenericInstantiation(
                          '', [], [new ExplicitInstantiation('typeI')])]),
                ])],
            'Expected the generic to be the nearest common descendant of the types');
      });

      test('typng an input with nested identical params, which unify to multiple types',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock(
                'parent', '', ['typeA[typeJ, typeB[typeK]]']);
            const child = createBlock(
                'child', 'typeA[t, typeB[t]]', ['typeA[t, typeB[t]]']);
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                child.getInput('0').connection,
                [
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeL')]),
                        new ExplicitInstantiation(
                            'typeB', [new GenericInstantiation(
                                '', [], [new ExplicitInstantiation('typeL')])])
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeL')]),
                        new ExplicitInstantiation(
                            'typeB', [new GenericInstantiation(
                                '', [], [new ExplicitInstantiation('typeM')])]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeM')]),
                        new ExplicitInstantiation(
                            'typeB', [new GenericInstantiation(
                                '', [], [new ExplicitInstantiation('typeL')])]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new GenericInstantiation(
                            '', [], [new ExplicitInstantiation('typeM')]),
                        new ExplicitInstantiation(
                            'typeB', [new GenericInstantiation(
                                '', [], [new ExplicitInstantiation('typeM')])]),
                      ]),
                ],
                'Expected the generic to bound to all of the combinations of the ncds of the types');
          });

      test('typing an output with non-nested identical params', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 'typeA[t, t]', ['typeA[t, t]']);
        const child = createBlock('child', 'typeA[typeD, typeE]');
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            parent.outputConnection,
            [new ExplicitInstantiation(
                'typeA',
                [
                  new ExplicitInstantiation('typeC'),
                  new ExplicitInstantiation('typeC'),
                ])],
            'Expected the generic to be the nearest common ancestor of the types');
      });

      test('typing an output with non-nested identical params, which unify to multiple types',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', 'typeA[t, t]', ['typeA[t, t]']);
            const child = createBlock('child', 'typeA[typeL, typeM]');
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeJ'),
                        new ExplicitInstantiation('typeJ'),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeJ'),
                        new ExplicitInstantiation('typeK'),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeK'),
                        new ExplicitInstantiation('typeJ'),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeK'),
                        new ExplicitInstantiation('typeK'),
                      ]),
                ],
                'Expected the generic to be bound to all the combinations of the ncas of the types');
          });

      test('typing an output with nested identical params', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock(
            'parent', 'typeA[t, typeB[t]]', ['typeA[t, typeB[t]]']);
        const child = createBlock('child', 'typeA[typeD, typeB[typeE]]');
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            parent.outputConnection,
            [new ExplicitInstantiation(
                'typeA',
                [
                  new ExplicitInstantiation('typeC'),
                  new ExplicitInstantiation(
                      'typeB', [new ExplicitInstantiation('typeC')]),
                ])],
            'Expected the generic to be the nearest common ancestor of the types');
      });

      test('typing an output with nested identical params, which unify to multiple types',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', 'typeA[t, typeB[t]]', ['typeA[t, typeB[t]]']);
            const child = createBlock('child', 'typeA[typeL, typeB[typeM]]');
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeJ'),
                        new ExplicitInstantiation(
                            'typeB', [new ExplicitInstantiation('typeJ')]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeJ'),
                        new ExplicitInstantiation(
                            'typeB', [new ExplicitInstantiation('typeK')]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeK'),
                        new ExplicitInstantiation(
                            'typeB', [new ExplicitInstantiation('typeJ')]),
                      ]),
                  new ExplicitInstantiation(
                      'typeA',
                      [
                        new ExplicitInstantiation('typeK'),
                        new ExplicitInstantiation(
                            'typeB', [new ExplicitInstantiation('typeK')]),
                      ]),
                ],
                'Expected the generic to be bound to all the combinations of the ncas of the types');
          });
    });
  });
});
