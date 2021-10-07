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

suite('TypeStructure', function() {
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
});
