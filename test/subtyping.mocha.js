/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeHierarchy} from '../src/type_hierarchy';
import {
  ExplicitInstantiation,
  GenericInstantiation
} from '../src/type_instantiation';
import {assert} from 'chai';

suite('Subtyping', function() {
  suite('basic explicit subtyping', function() {
    test('every type fulfills itself', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const ti1 = new ExplicitInstantiation('t');
      const ti2 = new ExplicitInstantiation('t');

      assert.isTrue(
          h.typeFulfillsType(ti1, ti2), 'Expected the type to fulfill itself');
    });

    test('children fulfill parents', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      h.addTypeDef('p');
      const ci = new ExplicitInstantiation('c');
      const pi = new ExplicitInstantiation('p');
      cd.addParent(pi);

      assert.isTrue(
          h.typeFulfillsType(ci, pi),
          'Expected the child type to fulfill the parent type');
    });

    test('parents do not fulfill children', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      h.addTypeDef('p');
      const ci = new ExplicitInstantiation('c');
      const pi = new ExplicitInstantiation('p');
      cd.addParent(pi);

      assert.isFalse(
          h.typeFulfillsType(pi, ci),
          'Expected the parent type to not fulfill the child type');
    });

    test('descendants fulfill ancestors', function() {
      const h = new TypeHierarchy();
      const td = h.addTypeDef('t');
      const pd = h.addTypeDef('p');
      h.addTypeDef('gp');
      const ti = new ExplicitInstantiation('t');
      const pi = new ExplicitInstantiation('p');
      const gpi = new ExplicitInstantiation('gp');
      pd.addParent(gpi);
      td.addParent(pi);

      assert.isTrue(
          h.typeFulfillsType(ti, gpi),
          'Expected the descendant type to fulfill the ancestor type');
    });

    test('ancestors do not fulfill descendants', function() {
      const h = new TypeHierarchy();
      const td = h.addTypeDef('t');
      const pd = h.addTypeDef('p');
      h.addTypeDef('gp');
      const ti = new ExplicitInstantiation('t');
      const pi = new ExplicitInstantiation('p');
      const gpi = new ExplicitInstantiation('gp');
      pd.addParent(gpi);
      td.addParent(pi);

      assert.isFalse(
          h.typeFulfillsType(gpi, ti),
          'Expected the ancestor type to not fulfill the descendant type');
    });

    test('unrelated types do not fulfill each other', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('a');
      h.addTypeDef('b');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');

      assert.isFalse(
          h.typeFulfillsType(ai, bi),
          'Expected unrelated types to not fulfill each other');
    });

    test('siblings do not fulfill each other', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('p')
      const ad = h.addTypeDef('a');
      const bd = h.addTypeDef('b');
      const pi = new ExplicitInstantiation('p');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');
      ad.addParent(pi);
      bd.addParent(pi);

      assert.isFalse(
          h.typeFulfillsType(ai, bi),
          'Expected sibling types to not fulfill each other');
    });

    test('coparents do not fulfill each other', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c')
      h.addTypeDef('a');
      h.addTypeDef('b');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');
      cd.addParent(ai);
      cd.addParent(bi);

      assert.isFalse(
          h.typeFulfillsType(ai, bi),
          'Expected coparent types to not fulfill each other');
    });
  });

  suite('basic generic subtyping', function() {
    test('generics fulfill all types', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const t = new ExplicitInstantiation('t');
      const g = new GenericInstantiation('g');

      assert.isTrue(
          h.typeFulfillsType(g, t),
          'Expected the generic type to fulfill the explicit type');
    });

    test('all types fulfill generics', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const t = new ExplicitInstantiation('t');
      const g = new GenericInstantiation('g');

      assert.isTrue(
          h.typeFulfillsType(t, g),
          'Expected the explicit type to fulfill the generic type');
    });

    test('generics fulfill each other', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const g1 = new GenericInstantiation('g1');
      const g2 = new GenericInstantiation('g2');

      assert.isTrue(
          h.typeFulfillsType(g1, g2),
          'Expected the generic types to fulfill each other');
    });
  })
})
