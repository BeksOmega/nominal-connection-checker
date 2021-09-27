/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {IncompatibleType} from '../src/exceptions';
import {TypeDefinition} from '../src/TypeDefinition';
import {TypeHierarchy} from '../src/TypeHierarchy';
import {TypeInstantiation} from '../src/TypeInstantiation';
import {assert} from 'chai';

suite('TypeDefinition', function() {
  test('every type definition is an ancestor of itself', function() {
    const h = new TypeHierarchy();
    const t = h.addTypeDef('t');

    assert.isTrue(
        t.hasAncestor(new TypeInstantiation('t')),
        'Expected the type definition to be an ancestor of itself');
  });

  test('every type definition is descendant of itself', function() {
    const h = new TypeHierarchy();
    const t = h.addTypeDef('t');

    assert.isTrue(
        t.hasDescendant(new TypeInstantiation('t')),
        'Expected the type definition to be a descendant of itself');
  });

  suite('constructing the type graph', function() {
    test('adding a parent', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      const pd = h.addTypeDef('p');
      const ci = new TypeInstantiation('c');
      const pi = new TypeInstantiation('p');

      cd.addParent(pi);

      assert.isTrue(
          cd.hasParent(pi), 'Expected the child to have a parent');
      assert.isTrue(
          cd.hasAncestor(pi), 'Expected the child to have an ancestor');
      assert.isTrue(
          pd.hasChild(ci), 'Expected the parent to have a child');
      assert.isTrue(
          pd.hasDescendant(ci), 'Expected the parent to have a descendant');
    });

    test('if the parent does not exist, an error is thrown', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      const pi = new TypeInstantiation('p');

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
      const pi1 = new TypeInstantiation('p');
      const pi2 = new TypeInstantiation('p');
      const ci = new TypeInstantiation('c')
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

    test('adding a parent with a parent creates an ancestor', function() {
      const h = new TypeHierarchy();
      const td = h.addTypeDef('t');
      const pd = h.addTypeDef('p');
      const gpd = h.addTypeDef('gp');
      const ti = new TypeInstantiation('t');
      const pi = new TypeInstantiation('p');
      const gpi = new TypeInstantiation('gp');
      pd.addParent(gpi);

      td.addParent(pi);

      assert.isFalse(
          td.hasParent(gpi),
          'Expected the grandparent type to not be a parent');
      assert.isTrue(
          td.hasAncestor(gpi),
          'Expected the grandparent type to be an ancestor');
      assert.isFalse(
          gpd.hasChild(ti),
          'Expected the type to not be a child of the grandparent');
      assert.isTrue(
          gpd.hasDescendant(ti),
          'Expected the type to be a descendant of the grandparent');
    });

    test('adding a parent to a type with a child creates an ancestor and a descendant',
        function() {
          const h = new TypeHierarchy();
          const td = h.addTypeDef('t');
          const cd = h.addTypeDef('c');
          const pd = h.addTypeDef('p');
          const ti = new TypeInstantiation('t');
          const ci = new TypeInstantiation('c');
          const pi = new TypeInstantiation('p');
          cd.addParent(ti);

          td.addParent(pi);

          assert.isTrue(
              cd.hasAncestor(pi),
              'Expected the parent to be an ancestor of the child');
          assert.isTrue(
              pd.hasDescendant(ci),
              'Expected the child to be a descendant of the parent');
        });

    test('adding a parent that shares an ancestor with the type creates only one ancestor',
        function() {
          const h = new TypeHierarchy();
          const td = h.addTypeDef('t');
          const p1d = h.addTypeDef('p1');
          const p2d = h.addTypeDef('p2');
          const gpd = h.addTypeDef('gp');
          const ti = new TypeInstantiation('t');
          const p1i = new TypeInstantiation('p1');
          const p2i = new TypeInstantiation('p2');
          const gpi = new TypeInstantiation('gp');
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
          const ti = new TypeInstantiation('t');
          const c1i = new TypeInstantiation('c1');
          const c2i = new TypeInstantiation('c2');
          const gci = new TypeInstantiation('gc');
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
});
