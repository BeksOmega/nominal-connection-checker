/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {IncompatibleType} from '../src/exceptions';
import {TypeHierarchy} from '../src/type_hierarchy';
import {
  ExplicitInstantiation,
  GenericInstantiation
} from '../src/type_instantiation';
import {assert} from 'chai';
import {ParameterDefinition, Variance} from "../src/parameter_definition";

suite('TypeDefinition', function() {
  test('every type definition is an ancestor of itself', function() {
    const h = new TypeHierarchy();
    const t = h.addTypeDef('t');

    assert.isTrue(
        t.hasAncestor('t'),
        'Expected the type definition to be an ancestor of itself');
  });

  test('every type definition is descendant of itself', function() {
    const h = new TypeHierarchy();
    const t = h.addTypeDef('t');

    assert.isTrue(
        t.hasDescendant('t'),
        'Expected the type definition to be a descendant of itself');
  });

  suite('constructing the type graph', function() {
    test('adding a parent', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      const pd = h.addTypeDef('p');
      const pi = new ExplicitInstantiation('p');

      cd.addParent(pi);

      assert.isTrue(
          cd.hasParent('p'), 'Expected the child to have a parent');
      assert.isTrue(
          cd.hasAncestor('p'), 'Expected the child to have an ancestor');
      assert.isTrue(
          pd.hasChild('c'), 'Expected the parent to have a child');
      assert.isTrue(
          pd.hasDescendant('c'), 'Expected the parent to have a descendant');
    });

    test('if the parent does not exist, an error is thrown', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      const pi = new ExplicitInstantiation('p');

      assert.throws(
          () => cd.addParent(pi),
          IncompatibleType,
          /The type instance .* is incompatible with the given TypeHierarchy/,
          'Expected adding a nonexistent parent to throw an IncompatibleType error');
    });

    test('adding a parent twice only creates one parent', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      const pd = h.addTypeDef('p');
      const pi1 = new ExplicitInstantiation('p');
      const pi2 = new ExplicitInstantiation('p');
      const ci = new ExplicitInstantiation('c');
      cd.addParent(pi1);

      cd.addParent(pi2);

      assert.equal(
          cd.parents.reduce((acc, t) => acc + (t.equals(pi1) ? 1 : 0), 0),
          1,
          'Expected the parent to only exist once');
      assert.equal(
          pd.children.reduce((acc, t) => acc + (t.equals(ci) ? 1 : 0), 0),
          1,
          'Expected the child to only exist once');
    });

    test('adding a parent with a parent creates an ancestor and a descendant', function() {
      const h = new TypeHierarchy();
      const td = h.addTypeDef('t');
      const pd = h.addTypeDef('p');
      const gpd = h.addTypeDef('gp');
      const pi = new ExplicitInstantiation('p');
      const gpi = new ExplicitInstantiation('gp');
      pd.addParent(gpi);

      td.addParent(pi);

      assert.isFalse(
          td.hasParent('gp'),
          'Expected the grandparent type to not be a parent');
      assert.isTrue(
          td.hasAncestor('gp'),
          'Expected the grandparent type to be an ancestor');
      assert.isFalse(
          gpd.hasChild('t'),
          'Expected the type to not be a child of the grandparent');
      assert.isTrue(
          gpd.hasDescendant('t'),
          'Expected the type to be a descendant of the grandparent');
    });

    test('adding a parent to a type with a child creates an ancestor and a descendant',
        function() {
          const h = new TypeHierarchy();
          const td = h.addTypeDef('t');
          const cd = h.addTypeDef('c');
          const pd = h.addTypeDef('p');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          cd.addParent(ti);

          td.addParent(pi);

          assert.isTrue(
              cd.hasAncestor('p'),
              'Expected the parent to be an ancestor of the child');
          assert.isTrue(
              pd.hasDescendant('c'),
              'Expected the child to be a descendant of the parent');
        });

    test('adding a parent that shares an ancestor with the type creates only one ancestor',
        function() {
          const h = new TypeHierarchy();
          const td = h.addTypeDef('t');
          const p1d = h.addTypeDef('p1');
          const p2d = h.addTypeDef('p2');
          const gpd = h.addTypeDef('gp');
          const ti = new ExplicitInstantiation('t');
          const p1i = new ExplicitInstantiation('p1');
          const p2i = new ExplicitInstantiation('p2');
          const gpi = new ExplicitInstantiation('gp');
          p1d.addParent(gpi);
          p2d.addParent(gpi);
          td.addParent(p1i);

          td.addParent(p2i);

          assert.equal(
              td.ancestors.reduce((acc, t) => acc + (t.equals(gpi) ? 1 : 0), 0),
              1,
              'Expected the ancestor to only exist once');
          assert.equal(
              gpd.descendants.reduce(
                  (acc, t) => acc + (t.equals(ti) ? 1 : 0), 0),
              1,
              'Expected the descendant to only exist once');
        });

    test('adding a child that shares a descendant with the type creates only one descendant',
        function() {
          const h = new TypeHierarchy();
          const td = h.addTypeDef('t');
          const c1d = h.addTypeDef('c1');
          const c2d = h.addTypeDef('c2');
          const gcd = h.addTypeDef('gc');
          const ti = new ExplicitInstantiation('t');
          const c1i = new ExplicitInstantiation('c1');
          const c2i = new ExplicitInstantiation('c2');
          const gci = new ExplicitInstantiation('gc');
          gcd.addParent(c1i);
          gcd.addParent(c2i);
          c1d.addParent(ti);

          c2d.addParent(ti);

          assert.equal(
              gcd.ancestors.reduce((acc, t) => acc + (t.equals(ti) ? 1 : 0), 0),
              1,
              'Expected the ancestor to only exist once');
          assert.equal(
              td.descendants.reduce(
                  (acc, t) => acc + (t.equals(gci) ? 1 : 0), 0),
              1,
              'Expected the descendant to only exist once');
        });
  });

  suite('reorganizing params for ancestors', function() {
    function assertParamOrder(type, ancestor, params, msg) {
      const mappedParams = type.getParamsForAncestor(ancestor);
      assert.equal(mappedParams.length, params.length, msg);
      assert.deepEqual(mappedParams, params, msg);
    }

    test('params for self are identical', function() {
      const h = new TypeHierarchy();
      const pa = new ParameterDefinition('a', Variance.CO);
      const pb = new ParameterDefinition('b', Variance.CO);
      const x = h.addTypeDef('x', [pa, pb]);
      h.finalize();

      assertParamOrder(
          x, 'x', [new GenericInstantiation('a'), new GenericInstantiation('b')],
          'Expected the param mapping from a type to itself to be identical to its normal params list');
    });

    test('params are properly reorganized for parent', function() {
      const h = new TypeHierarchy();
      const pa = new ParameterDefinition('a', Variance.CO);
      const pb = new ParameterDefinition('b', Variance.CO);
      const x = h.addTypeDef('x', [pa, pb]);
      const y = h.addTypeDef('y', [pb, pa]);
      x.addParent(y.createInstance());
      h.finalize();

      assertParamOrder(
          x, 'y', [new GenericInstantiation('b'), new GenericInstantiation('a')],
          'Expected params to be properly reorganized for the parent type');
    });

    test('params are properly reorganized for ancestor', function() {
      const h = new TypeHierarchy();
      const pa = new ParameterDefinition('a', Variance.CO);
      const pb = new ParameterDefinition('b', Variance.CO);
      const pc = new ParameterDefinition('c', Variance.CO);
      const x = h.addTypeDef('x', [pa, pb, pc]);
      const y = h.addTypeDef('y', [pc, pa, pb]);
      const z = h.addTypeDef('z', [pb, pc, pa]);
      x.addParent(y.createInstance());
      y.addParent(z.createInstance());
      h.finalize();

      assertParamOrder(
          x,
          'z',
          [
            new GenericInstantiation('b'),
            new GenericInstantiation('c'),
            new GenericInstantiation('a'),
          ],
          'Expected the params to be properly reorganized for the ancestor type');
    });

    test('nested params in ancestors are properly mapped', function() {
      const h = new TypeHierarchy();
      const pa = new ParameterDefinition('a', Variance.CO);
      h.addTypeDef('list', [pa]);
      const listList = h.addTypeDef('listList', [pa]);
      listList.addParent(new ExplicitInstantiation(
          'list', [new ExplicitInstantiation(
              'list', [new GenericInstantiation('a')])]));
      h.addTypeDef('dog');
      const dogListList = h.addTypeDef('dogListList');
      dogListList.addParent(new ExplicitInstantiation(
          'listList', [new ExplicitInstantiation('dog')]));

      assertParamOrder(
          dogListList,
          'list',
          [
            new ExplicitInstantiation(
                'list', [new ExplicitInstantiation('dog')]),
          ],
          'Expected nested params to be properly reorganized for the ancestor type');
    });
  });

  suite('variance inheritance', function() {
  });
});
