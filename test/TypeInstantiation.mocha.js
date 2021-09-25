/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeInstantiation} from '../src/TypeInstantiation';
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
      const a = new TypeInstantiation('t');
      const b = new TypeInstantiation('t');

      assert.isTrue(
          a.equals(b),
          'Expected identical generic TypeInstantiations to be equal');
    });

    test('different generics are not equal', function() {
      const a = new TypeInstantiation('t');
      const b = new TypeInstantiation('g');

      assert.isFalse(
          a.equals(b),
          'Expected generic TypeInstantiations with different names to not be equal');
    });

    test('differently cased generics are not equal', function() {
      const a = new TypeInstantiation('t');
      const b = new TypeInstantiation('T');

      assert.isFalse(
          a.equals(b),
          'Expected generic TypeInstantiations with different casing to not be equal');
    });

    test('identical params are equal', function() {
      const p1A = new TypeInstantiation('p1');
      const p1B = new TypeInstantiation('p1');
      const p2A = new TypeInstantiation('p2');
      const p2B = new TypeInstantiation('p2');
      const a = new TypeInstantiation('test', [p1A, p2A]);
      const b = new TypeInstantiation('test', [p1B, p2B]);

      assert.isTrue(
          a.equals(b),
          'Expected TypeInstantiations with identical parameters to be equal');
    });

    test('differently named params are not equal', function() {
      const p1 = new TypeInstantiation('p1');
      const p2 = new TypeInstantiation('p2');
      const p3 = new TypeInstantiation('p3');
      const p4 = new TypeInstantiation('p4');
      const a = new TypeInstantiation('test', [p1, p2]);
      const b = new TypeInstantiation('test', [p3, p4]);

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different parameter names to not be equal');
    });

    test('different param counts are not equal', function() {
      const p1A = new TypeInstantiation('p1');
      const p1B = new TypeInstantiation('p1');
      const p2A = new TypeInstantiation('p2');
      const a = new TypeInstantiation('test', [p1A, p2A]);
      const b = new TypeInstantiation('test', [p1B]);

      assert.isFalse(
          a.equals(b),
          'Expected TypeInstantiations with different numbers of parameters to not be equal');
    });
  });
});
