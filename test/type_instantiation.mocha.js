/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeInstantiation} from '../src/type_instantiation';
import {assert} from 'chai';

suite('TypeStructure', function() {
  suite('equals is exactly equal', function() {
    test('identical names are equal', function() {
      const a = new TypeInstantiation('test');
      const b = new TypeInstantiation('test');

      assert.isTrue(
          a.equals(b), 'Expected identical TypeInstantiations to be equal');
    });

    test('different names are not equal', function() {
      const a = new TypeInstantiation('test');
      const b = new TypeInstantiation('test2');

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different names to not be equal');
    });

    test('differently cased names are not equal', function() {
      const a = new TypeInstantiation('test');
      const b = new TypeInstantiation('TEST');

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different casing to not be equal');
    });

    test('identical generics are equal', function() {
      const a = new TypeInstantiation('test', true);
      const b = new TypeInstantiation('test', true);

      assert.isTrue(
          a.equals(b),
          'Expected identical generic TypeInstantiations to be equal');
    });

    test('different generics are not equal', function() {
      const a = new TypeInstantiation('test', true);
      const b = new TypeInstantiation('test2', true);

      assert.isFalse(
          a.equals(b),
          'Expected generic TypeInstantiations with different names to not be equal');
    });

    test('differently cased generics are not equal', function() {
      const a = new TypeInstantiation('test', true);
      const b = new TypeInstantiation('TEST', true);

      assert.isFalse(
          a.equals(b),
          'Expected generic TypeInstantiations with different casing to not be equal');
    });

    test('generics and non-generics are not equal', function() {
      const a = new TypeInstantiation('test', true);
      const b = new TypeInstantiation('test', false);

      assert.isFalse(
          a.equals(b),
          'Expected a generic and a non-generic to not be equal');
    });

    test('identical params are equal', function() {
      const p1A = new TypeInstantiation('p1');
      const p1B = new TypeInstantiation('p1');
      const p2A = new TypeInstantiation('p2');
      const p2B = new TypeInstantiation('p2');
      const a = new TypeInstantiation('test', false, [p1A, p2A]);
      const b = new TypeInstantiation('test', false, [p1B, p2B]);

      assert.isTrue(
          a.equals(b),
          'Expected TypeInstantiations with identical parameters to be equal');
    });

    test('different param counts are not equal', function() {
      const p1A = new TypeInstantiation('p1');
      const p1B = new TypeInstantiation('p1');
      const p2A = new TypeInstantiation('p2');
      const a = new TypeInstantiation('test', false, [p1A, p2A]);
      const b = new TypeInstantiation('test', false, [p1B]);

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different numbers of parameters to not be equal');
    });
  });

  suite('cloning', function() {
    test('cloning a simple explicit type', function() {
      const t = new TypeInstantiation('test');
      const c = t.clone();

      assert.deepEqual(c, t, 'Expected the clone to deeply equal the original');
    });

    test('cloning a generic type', function() {
      const t = new TypeInstantiation('test', true);
      const c = t.clone();

      assert.deepEqual(c, t, 'Expected the clone to deeply equal the original');
    });

    test('cloning a parameterized type', function() {
      const p = new TypeInstantiation('parameter');
      const t = new TypeInstantiation('test', false, [p]);
      const c = t.clone();

      assert.deepEqual(c, t, 'Expected the clone to deeply equal the original');
    });
  });

  suite('having params', function() {
    test('having params', function() {
      const p = new TypeInstantiation('p');
      const t = new TypeInstantiation('test', false, [p]);

      assert.isTrue(
          t.hasParams, 'Expected the TypeInstantiation to have params');
    });

    test('not having params', function() {
      const t = new TypeInstantiation('test');

      assert.isFalse(
          t.hasParams, 'Expected the TypeInstantiation to not have params');
    });
  });
});
