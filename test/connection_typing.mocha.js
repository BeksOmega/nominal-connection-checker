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
    function defineHierarchy() {
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
      return h;
    }

    suite('sharing constraints within a block', function() {
      test('inputs get the constraints of outputs', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const block = createBlock('block', 'typeE <: t <: typeA', ['t']);
        assertConnectionType(
            typer,
            block.getInput('0').connection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the input to aquire the constraints of the output');
      });

      test('inputs get the constraints of other inputs', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const block = createBlock('block', '', ['t', 'typeE <: t <: typeA']);
        assertConnectionType(
            typer,
            block.getInput('0').connection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the input to aquire the constraints of the other input');
      });

      test('inputs combine the constraints of outputs with their own constraints',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const block = createBlock('block', 't >: typeE', ['t <: typeA']);
            assertConnectionType(
                typer,
                block.getInput('0').connection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the input to combine its constraints with the constraints on the output');
          });

      test('inputs combine constraints of other inputs with their own constraints',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const block = createBlock('block', '', ['t >: typeE', 't <: typeA']);
            assertConnectionType(
                typer,
                block.getInput('0').connection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the input to combine its constraints with the constraints on the other input');
          });

      test('inputs combine the constraints of other connections with eachother',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const block = createBlock(
                'block', 't <: typeA', ['t', 't >: typeE']);
            assertConnectionType(
                typer,
                block.getInput('0').connection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the input to combine the constraints of the other connections');
          });

      test('inputs combine constraints to create the narrowest range', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const block = createBlock(
            'block', 't <: typeA', ['t', 't >: typeE', 't >: typeD', 't <: typeB']);
        assertConnectionType(
            typer,
            block.getInput('0').connection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeD')],
                [new ExplicitInstantiation('typeB')])],
            'Expected the input to combine the constraints to create the narrowest range');
      });

      test('inputs throw if combining the constraints creates an invalid type',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const block = createBlock('block', 't <: typeE', ['t >: typeA']);
            assert.throws(
                () => typer.getTypesOfConnection(block.getInput('0').connection));
          });

      test.only('constraints for inputs are not prematurely unfied', function() {
        const h = new TypeHierarchy();
        const t1 = h.addTypeDef('test1');
        const t2 = h.addTypeDef('test2');
        const t3 = h.addTypeDef('test3');
        const t4 = h.addTypeDef('test4');
        const t5 = h.addTypeDef('test5');
        const t6 = h.addTypeDef('test6');
        t1.addParent(t3.createInstance());
        t1.addParent(t4.createInstance());
        t2.addParent(t3.createInstance());
        t2.addParent(t4.createInstance());
        t3.addParent(t5.createInstance());
        t3.addParent(t6.createInstance());
        t4.addParent(t5.createInstance());
        t4.addParent(t6.createInstance());
        h.finalize();
        const typer = new ConnectionTyper(h);
        const block = createBlock(
            'test', '', ['test1, test2 <: t <: test5, test6']);
        assertConnectionType(
            typer,
            block.getInput('0').connection,
            [new GenericInstantiation(
                '',
                [
                  new ExplicitInstantiation('test1'),
                  new ExplicitInstantiation('test2'),
                ],
                [
                  new ExplicitInstantiation('test5'),
                  new ExplicitInstantiation('test6'),
                ])],
            'Expected bounds to not be prematurely unified');
      });

      test('outputs get the constraints of inputs', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const block = createBlock('block', 't', ['typeE <: t <: typeA']);
        assertConnectionType(
            typer,
            block.outputConnection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the output to aquire the constraints of the input');
      });

      test('outputs combine the constraints of inputs with their own constraints',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const block = createBlock('block', 't >: typeE', ['t <: typeA']);
            assertConnectionType(
                typer,
                block.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the output to combine its own constraints with the constraints on the input');
          });

      test('outputs combine the constraints of multiple other connections',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const block = createBlock(
                'block', 't', ['t <: typeA', 't >: typeE']);
            assertConnectionType(
                typer,
                block.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the output to combine the constraints of the other connections');
          });

      test('outputs combine constraints to create the narrowest range', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const block = createBlock(
            'block', 't', ['t <: typeA', 't >: typeD', 't >: typeE', 't <: typeB']);
        assertConnectionType(
            typer,
            block.outputConnection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeD')],
                [new ExplicitInstantiation('typeB')])],
            'Expected the output to combine constraints to create the narrowest range');
      });

      test('outputs throw if combining the constraints creates an invalid type',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const block = createBlock('block', 't <: typeE', ['t >: typeA']);
            assert.throws(
                () => typer.getTypesOfConnection(block.outputConnection));
          });

      test('constraints for outputs are not prematurely unified', function() {
        const h = new TypeHierarchy();
        const t1 = h.addTypeDef('test1');
        const t2 = h.addTypeDef('test2');
        const t3 = h.addTypeDef('test3');
        const t4 = h.addTypeDef('test4');
        const t5 = h.addTypeDef('test5');
        const t6 = h.addTypeDef('test6');
        t1.addParent(t3.createInstance());
        t1.addParent(t4.createInstance());
        t2.addParent(t3.createInstance());
        t2.addParent(t4.createInstance());
        t3.addParent(t5.createInstance());
        t3.addParent(t6.createInstance());
        t4.addParent(t5.createInstance());
        t4.addParent(t6.createInstance());
        h.finalize();
        const typer = new ConnectionTyper(h);
        const block = createBlock('test', 'test1, test2 <: t <: test5, test6');
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
                  new ExplicitInstantiation('test5'),
                  new ExplicitInstantiation('test6'),
                ])],
            'Expected bounds to not be prematurely unified');
      });
    });

    suite('constraints via connections', function() {
      test('inputs get the constraints of parents', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', '', ['typeE <: t <: typeA']);
        const child = createBlock('child', 't', ['t']);
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            child.getInput('0').connection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the input to aquire the constraints of the parent');
      });

      test('inputs get constraints through parents', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 'typeE <: t <: typeA', ['t']);
        const middle = createBlock('child', 't', ['t']);
        const child = createBlock('child', 't', ['t']);
        parent.getInput('0').connection.connect(middle.outputConnection);
        middle.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            child.getInput('0').connection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the input to aquire constraints through the parent');
      });

      test('inputs combine constraints with parents', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', '', ['t <: typeA']);
        const child = createBlock('child', 't', ['t >: typeE']);
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            child.getInput('0').connection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the input to combine with the constraints of the parent');
      });

      test('inputs combine constraints with parents to create the narrowest range',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', '', ['typeD <: t <: typeA']);
            const child = createBlock('child', 't', ['typeE <: t <: typeB']);
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                child.getInput('0').connection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeD')],
                    [new ExplicitInstantiation('typeB')])],
                'Expected the input to combine with the constraints of the parent to create the narrowest range');
          });

      test('inputs do not get constraints from children', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 't', ['t']);
        const child = createBlock('child', 'typeE <: t <: typeA');
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            parent.getInput('0').connection,
            [new GenericInstantiation('')],
            'Expected inputs to not gain constraints from children');
      });

      test('inputs do not get constraints from sibling input children', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 't', ['t', 't']);
        const child = createBlock('child', 'typeE <: t <: typeA');
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            parent.getInput('1').connection,
            [new GenericInstantiation('')],
            'Expected inputs to not gain constraints from sibling input children');
      });

      test('outputs get the constraints of children', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 't', ['t']);
        const child = createBlock('child', 'typeE <: t <: typeA');
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            parent.outputConnection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected outputs to gain constraints from children');
      });

      test('outputs get constraints through children', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 't', ['t']);
        const middle = createBlock('child', 't', ['t']);
        const child = createBlock('child', 't', ['typeE <: t <: typeA']);
        parent.getInput('0').connection.connect(middle.outputConnection);
        middle.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            parent.outputConnection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the output to aquire constraints through the child');
      });

      test('outputs combine constraints with children', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 't >: typeE', ['t']);
        const child = createBlock('child', 't <: typeA');
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            parent.outputConnection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the output to combine with the constraints of the child');
      });

      test('outputs combine constraints with children to create the narrowest range',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', 'typeE <: t <: typeB', ['t']);
            const child = createBlock('child', 'typeD <: t <: typeA');
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeD')],
                    [new ExplicitInstantiation('typeB')])],
                'Expected the output to combine with the constraints of the child to create the narrowest range');
          });

      test('outputs combine the constraints of multiple children', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 't', ['t', 't']);
        const child1 = createBlock('child1', 't', ['t >: typeE']);
        const child2 = createBlock('child2', 't', ['t <: typeA']);
        parent.getInput('0').connection.connect(child1.outputConnection);
        parent.getInput('1').connection.connect(child2.outputConnection);
        assertConnectionType(
            typer,
            parent.outputConnection,
            [new GenericInstantiation(
                '',
                [new ExplicitInstantiation('typeE')],
                [new ExplicitInstantiation('typeA')])],
            'Expected the output to combine the constraints of multiple children');
      });

      test('outputs combine the constraints of multiple children to create the widest range',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', 't', ['t', 't', 't', 't']);
            const child1 = createBlock('child1', 't', ['t >: typeD']);
            const child2 = createBlock('child1', 't', ['t >: typeE']);
            const child3 = createBlock('child2', 't', ['t <: typeA']);
            const child4 = createBlock('child2', 't', ['t <: typeB']);
            parent.getInput('0').connection.connect(child1.outputConnection);
            parent.getInput('1').connection.connect(child2.outputConnection);
            parent.getInput('2').connection.connect(child3.outputConnection);
            parent.getInput('3').connection.connect(child4.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the output to combine the constraints of multiple children to create the widest range');
          });

      test('outputs limit the lower bound of multiple children with their own constraints',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock(
                'parent', 't', ['t >: typeD', 't', 't', 't']);
            const child1 = createBlock('child1', 't', ['t >: typeD']);
            const child2 = createBlock('child1', 't', ['t >: typeE']);
            const child3 = createBlock('child2', 't', ['t <: typeA']);
            const child4 = createBlock('child2', 't', ['t <: typeB']);
            parent.getInput('0').connection.connect(child1.outputConnection);
            parent.getInput('1').connection.connect(child2.outputConnection);
            parent.getInput('2').connection.connect(child3.outputConnection);
            parent.getInput('3').connection.connect(child4.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeD')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the output to limit the lower bound of multiple children with its own constraints');
          });

      test('outputs limit the upper bound of multiple children with their own constraints',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock(
                'parent', 't', ['t <: typeB', 't', 't', 't']);
            const child1 = createBlock('child1', 't', ['t >: typeD']);
            const child2 = createBlock('child1', 't', ['t >: typeE']);
            const child3 = createBlock('child2', 't', ['t <: typeA']);
            const child4 = createBlock('child2', 't', ['t <: typeB']);
            parent.getInput('0').connection.connect(child1.outputConnection);
            parent.getInput('1').connection.connect(child2.outputConnection);
            parent.getInput('2').connection.connect(child3.outputConnection);
            parent.getInput('3').connection.connect(child4.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeB')])],
                'Expected the output to limit the upper bound of multiple children with its own constraints');
          });

      test('outputs with multiple nested children combine constraints to create the widest range',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', 't', ['t', 't']);
            const middle1 = createBlock('middle1', 't', ['t', 't']);
            const middle2 = createBlock('middle2', 't', ['t', 't']);
            const childA = createBlock('childA', 't <: typeA');
            const childD = createBlock('childD', 't >: typeD');
            const childB = createBlock('childE', 't <: typeB');
            const childE = createBlock('childD', 't >: typeE');
            parent.getInput('0').connection.connect(middle1.outputConnection);
            parent.getInput('1').connection.connect(middle2.outputConnection);
            middle1.getInput('0').connection.connect(childA.outputConnection);
            middle1.getInput('1').connection.connect(childD.outputConnection);
            middle2.getInput('0').connection.connect(childB.outputConnection);
            middle2.getInput('1').connection.connect(childE.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeE')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the output to combine the constraints of multiple nested children to create the widest range');
          });

      test('outputs with multiple nested children are not unified prematurely',
          function() {
            const h = new TypeHierarchy();
            const a = h.addTypeDef('typeA');
            const b = h.addTypeDef('typeB');
            const c = h.addTypeDef('typeC');
            const d = h.addTypeDef('typeD');
            const e = h.addTypeDef('typeE');
            c.addParent(a.createInstance());
            d.addParent(a.createInstance());
            c.addParent(b.createInstance());
            d.addParent(b.createInstance());
            e.addParent(b.createInstance());
            h.finalize();

            const typer = new ConnectionTyper(h);
            const parent = createBlock('parent', 't', ['t', 't']);
            const middle1 = createBlock('middle1', 't', ['t', 't']);
            const middle2 = createBlock('middle2', 't', ['t', 't']);
            const childC = createBlock('childC', 't <: typeC');
            const childD = createBlock('childD', 't <: typeD');
            const childE = createBlock('childE', 't <: typeE');
            parent.getInput('0').connection.connect(middle1.outputConnection);
            parent.getInput('1').connection.connect(middle2.outputConnection);
            middle1.getInput('0').connection.connect(childC.outputConnection);
            middle1.getInput('1').connection.connect(childD.outputConnection);
            middle2.getInput('0').connection.connect(childE.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [],
                    [new ExplicitInstantiation('typeB')])],
                'Expected the output to combine the constraints of multiple nested children to not be unified prematurely');
          });

      test('outputs do not get constraints from parents', function() {
        const typer = new ConnectionTyper(defineHierarchy());
        const parent = createBlock('parent', 't', ['typeE <: t <: typeA']);
        const child = createBlock('child', 't');
        parent.getInput('0').connection.connect(child.outputConnection);
        assertConnectionType(
            typer,
            child.outputConnection,
            [new GenericInstantiation('')],
            'Expected outputs to not gain constraints from parents');
      });
    });

    suite('constraints combining with explicits', function() {
      test('an upper bound inputs combined with a subtype parent results in an upper bound of the subytpe',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', '', ['typeE']);
            const child = createBlock('child', 't', ['t <: typeC']);
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                child.getInput('0').connection,
                [new GenericInstantiation(
                    '',
                    [],
                    [new ExplicitInstantiation('typeE')])],
                'Expected the upper bound to match the subtype');
          });

      test('an upper bound input combined with a supertype parent results in an upper bound of the bound',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', '', ['typeA']);
            const child = createBlock('child', 't', ['t <: typeC']);
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                child.getInput('0').connection,
                [new GenericInstantiation(
                    '',
                    [],
                    [new ExplicitInstantiation('typeC')])],
                'Expected the upper bound to match the bound');
          });

      // A lower bound input with a subtype parent is not possible.

      test('a lower bound input combined with a supertype parent results in a lower bound of the bound, and an upper bound of the super type',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', '', ['typeA']);
            const child = createBlock('child', 't', ['t >: typeC']);
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                child.getInput('0').connection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeC')],
                    [new ExplicitInstantiation('typeA')])],
                'Expected the lower bound to match the bound, and the upper bound to match the supertype');
          });

      test('an upper bound output combined with a subtype child results in an upper bound of the subtype',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', 't <: typeC', ['t']);
            const child = createBlock('child', 'typeE');
            parent.getInput('0').connection.connect(child.outputConnection);

            // Technically we could also return t <: typeC, since t could be
            // bound to another different subtype of typeC.
            // However, this is fine as well. If the parent then gets assigned
            // to an input of type typeE, we just enforce that any further
            // children of the parent must be <: typeE.

            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [],
                    [new ExplicitInstantiation('typeE')])],
                'Expected the upper bound to match the subtype');
          });

      // An upper bound output with a supertype child is not possible.

      // A lower bound output with a subtype child is not possible.

      test('a lower bound output combined with a supertype child results in a lower bound of the super type',
          function() {
            const typer = new ConnectionTyper(defineHierarchy());
            const parent = createBlock('parent', 't >: typeE', ['t']);
            const child = createBlock('child', 'typeD');
            parent.getInput('0').connection.connect(child.outputConnection);
            assertConnectionType(
                typer,
                parent.outputConnection,
                [new GenericInstantiation(
                    '',
                    [new ExplicitInstantiation('typeD')])],
                'Expected the lower bound to match the supertype');
          });
    });
  });

  suite('generic parameterized types', function() {
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

  suite('generic paramterized types with multiple of the same param', function() {
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
