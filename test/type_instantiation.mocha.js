/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {
  ExplicitInstantiation,
  GenericInstantiation,
} from '../src/type_instantiation';
import {assert} from 'chai';

suite('TypeInstantiation', function() {
  test('default name of a generic is ""', function() {
    const g = new GenericInstantiation();
    assert.strictEqual(
        g.name, '', 'Expected the default name of a generic to be ""');
  });

  suite('equals is exactly equal', function() {
    test('identical names are equal', function() {
      const a = new ExplicitInstantiation('test');
      const b = new ExplicitInstantiation('test');

      assert.isTrue(
          a.equals(b), 'Expected identical TypeInstantiations to be equal');
    });

    test('different names are not equal', function() {
      const a = new ExplicitInstantiation('test');
      const b = new ExplicitInstantiation('test2');

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different names to not be equal');
    });

    test('differently cased names are not equal', function() {
      const a = new ExplicitInstantiation('test');
      const b = new ExplicitInstantiation('TEST');

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different casing to not be equal');
    });

    test('identical generics are equal', function() {
      const a = new GenericInstantiation('test');
      const b = new GenericInstantiation('test');

      assert.isTrue(
          a.equals(b),
          'Expected identical generic TypeInstantiations to be equal');
    });

    test('different generics are not equal', function() {
      const a = new GenericInstantiation('test');
      const b = new GenericInstantiation('test2');

      assert.isFalse(
          a.equals(b),
          'Expected generic TypeInstantiations with different names to not be equal');
    });

    test('differently cased generics are not equal', function() {
      const a = new GenericInstantiation('test');
      const b = new GenericInstantiation('TEST');

      assert.isFalse(
          a.equals(b),
          'Expected generic TypeInstantiations with different casing to not be equal');
    });

    test('generics and non-generics are not equal', function() {
      const a = new GenericInstantiation('test');
      const b = new ExplicitInstantiation('test');

      assert.isFalse(
          a.equals(b),
          'Expected a generic and a non-generic to not be equal');
    });

    test('identical params are equal', function() {
      const p1A = new ExplicitInstantiation('p1');
      const p1B = new ExplicitInstantiation('p1');
      const p2A = new ExplicitInstantiation('p2');
      const p2B = new ExplicitInstantiation('p2');
      const a = new ExplicitInstantiation('test', [p1A, p2A]);
      const b = new ExplicitInstantiation('test', [p1B, p2B]);

      assert.isTrue(
          a.equals(b),
          'Expected TypeInstantiations with identical parameters to be equal');
    });

    test('different param counts are not equal', function() {
      const p1A = new ExplicitInstantiation('p1');
      const p1B = new ExplicitInstantiation('p1');
      const p2A = new ExplicitInstantiation('p2');
      const a = new ExplicitInstantiation('test', [p1A, p2A]);
      const b = new ExplicitInstantiation('test', [p1B]);

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different numbers of parameters to not be equal');
    });

    test('identical constraints are equal', function() {
      const x1 = new ExplicitInstantiation('x');
      const y1 = new ExplicitInstantiation('y');
      const x2 = new ExplicitInstantiation('x');
      const y2 = new ExplicitInstantiation('y');
      const a = new GenericInstantiation('test', [x1], [y1]);
      const b = new GenericInstantiation('test', [x2], [y2]);

      assert.isTrue(
          a.equals(b),
          'Expected generics with identical constraints to be equal');
    });

    test('different upper bounds are not equal', function() {
      const x1 = new ExplicitInstantiation('x');
      const y = new ExplicitInstantiation('y');
      const x2 = new ExplicitInstantiation('x');
      const z = new ExplicitInstantiation('z');
      const a = new GenericInstantiation('test', [x1], [y]);
      const b = new GenericInstantiation('test', [x2], [z]);

      assert.isFalse(
          a.equals(b),
          'Expected generics different upper bounds to not be equal');
    });

    test('different lower bounds are not equal', function() {
      const x = new ExplicitInstantiation('x');
      const y1 = new ExplicitInstantiation('y');
      const z = new ExplicitInstantiation('z');
      const y2 = new ExplicitInstantiation('y');
      const a = new GenericInstantiation('test', [x], [y1]);
      const b = new GenericInstantiation('test', [z], [y2]);

      assert.isFalse(
          a.equals(b),
          'Expected geenerics with different lower bounds to not be equal');
    });
  });

  suite('cloning', function() {
    test('cloning a simple explicit type', function() {
      const t = new ExplicitInstantiation('test');
      const c = t.clone();

      assert.deepEqual(c, t, 'Expected the clone to deeply equal the original');
    });

    test('cloning a generic type', function() {
      const t = new GenericInstantiation('test');
      const c = t.clone();

      assert.deepEqual(c, t, 'Expected the clone to deeply equal the original');
    });

    test('cloning a parameterized type', function() {
      const p = new ExplicitInstantiation('parameter');
      const t = new ExplicitInstantiation('test', [p]);
      const c = t.clone();

      assert.deepEqual(c, t, 'Expected the clone to deeply equal the original');
    });

    test('cloning a constrained generic', function() {
      const x = new ExplicitInstantiation('x');
      const y = new ExplicitInstantiation('y');
      const a = new GenericInstantiation('test', [x], [y]);
      const b = a.clone();

      assert.deepEqual(b, a, 'Expected the clone to deeply equal the original');
    });
  });

  suite('having params', function() {
    test('having params', function() {
      const p = new ExplicitInstantiation('p');
      const t = new ExplicitInstantiation('test', [p]);

      assert.isTrue(
          t.hasParams, 'Expected the TypeInstantiation to have params');
    });

    test('not having params', function() {
      const t = new ExplicitInstantiation('test');

      assert.isFalse(
          t.hasParams, 'Expected the TypeInstantiation to not have params');
    });
  });

  suite('having constraints', function() {
    test('having upper and lower bounds', function() {
      const x = new ExplicitInstantiation('x');
      const y = new ExplicitInstantiation('y');
      const a = new GenericInstantiation('test', [x], [y]);

      assert.isTrue(a.isConstrained, 'Expected the type to be constrained');
    });

    test('having upper bounds', function() {
      const y = new ExplicitInstantiation('y');
      const a = new GenericInstantiation('test', [], [y]);

      assert.isTrue(a.isConstrained, 'Expected the type to be constrained');
    });

    test('having lower bounds', function() {
      const x = new ExplicitInstantiation('x');
      const a = new GenericInstantiation('test', [x], []);

      assert.isTrue(a.isConstrained, 'Expected the type to be constrained');
    });

    test('not having constraints', function() {
      const a = new GenericInstantiation('test', [], []);

      assert.isFalse(a.isConstrained, 'Expected the type to not be constrained');
    });
  });
});
