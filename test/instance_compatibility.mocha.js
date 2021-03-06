/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ParameterDefinition, Variance} from '../src/parameter_definition';
import {ExplicitInstantiation, GenericInstantiation} from '../src/type_instantiation';
import {TypeHierarchy} from '../src/type_hierarchy';
import {assert} from 'chai';

suite('TypeInstance compatibility', function() {
  test('types that exist are compatible', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');
    h.finalize();

    assert.isTrue(
        h.typeIsCompatible(ti), 'Expected a type that exists to be compatible');
  });

  test('types that do not exist are not compatible', function() {
    const h = new TypeHierarchy();
    const ti = new ExplicitInstantiation('t');
    h.finalize();

    assert.isFalse(
        h.typeIsCompatible(ti),
        'Expected a type that does not exists to not be compatible');
  });

  test('unconstrained generics are always compatible', function() {
    const h = new TypeHierarchy();
    const gi = new GenericInstantiation('g');
    h.finalize();

    assert.isTrue(
        h.typeIsCompatible(gi),
        'Expected an unconstrained generic to be compatible');
  });

  test('upper bounds that exist are compatible', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation('g', [], [ti]);
    h.finalize();

    assert.isTrue(
        h.typeIsCompatible(gi),
        'Expected an upper bound that exists to be compatible');
  });

  test('upper bounds that do not exist are not compatible', function() {
    const h = new TypeHierarchy();
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation('g', [], [ti]);
    h.finalize();

    assert.isFalse(
        h.typeIsCompatible(gi),
        'Expected an upper bound that does not exists to not be compatible');
  });

  test('lower bounds that exist are compatible', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation('g', [ti]);
    h.finalize();

    assert.isTrue(
        h.typeIsCompatible(gi),
        'Expected a lower bound that exists to be compatible');
  });

  test('lower bounds that do not exist are not compatible', function() {
    const h = new TypeHierarchy();
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation('g', [ti]);
    h.finalize();

    assert.isFalse(
        h.typeIsCompatible(gi),
        'Expected a lower bound that does not exists to not be compatible');
  });

  test('generics with upper and lower bounds where lower is lower than upper are compatible',
      function() {
        const h = new TypeHierarchy();
        h.addTypeDef('p');
        const td = h.addTypeDef('t');
        const cd = h.addTypeDef('c');
        const pi = new ExplicitInstantiation('p');
        const ti = new ExplicitInstantiation('t');
        const ci = new ExplicitInstantiation('c');
        td.addParent(pi);
        cd.addParent(ti);
        const gi = new GenericInstantiation('g', [ci], [pi]);
        h.finalize();

        assert.isTrue(
            h.typeIsCompatible(gi),
            'Expected a type with upper and lower bounds where the lower is lower than upper to be compatible');
      });

  test('generics with upper and lower bounds where lower is higher than upper are not compatible',
      function() {
        const h = new TypeHierarchy();
        h.addTypeDef('p');
        const td = h.addTypeDef('t');
        const cd = h.addTypeDef('c');
        const pi = new ExplicitInstantiation('p');
        const ti = new ExplicitInstantiation('t');
        const ci = new ExplicitInstantiation('c');
        td.addParent(pi);
        cd.addParent(ti);
        const gi = new GenericInstantiation('g', [pi], [ci]);
        h.finalize();

        assert.isFalse(
            h.typeIsCompatible(gi),
            'Expected a type with upper and lower bounds where the lower is higher than upper to not be compatible');
      });

  test('param types with too few params are not compatible', function() {
    const h = new TypeHierarchy();
    const ap = new ParameterDefinition('a', Variance.CO);
    const bp = new ParameterDefinition('b', Variance.CO);
    const cp = new ParameterDefinition('c', Variance.CO);
    h.addTypeDef('x', [ap, bp, cp]);
    h.finalize();

    const xi = new ExplicitInstantiation(
        'x', [new GenericInstantiation('m'), new GenericInstantiation('n')]);
    assert.isFalse(
        h.typeIsCompatible(xi),
        'Expected a parameterized type with too few params to not be compatible');
  });

  test('param types with too many params are not compatible', function() {
    const h = new TypeHierarchy();
    const ap = new ParameterDefinition('a', Variance.CO);
    const bp = new ParameterDefinition('b', Variance.CO);
    const cp = new ParameterDefinition('c', Variance.CO);
    h.addTypeDef('x', [ap, bp, cp]);
    h.finalize();

    const xi = new ExplicitInstantiation(
        'x',
        [
          new GenericInstantiation('m'),
          new GenericInstantiation('n'),
          new GenericInstantiation('0'),
          new GenericInstantiation('p'),
        ]);
    assert.isFalse(
        h.typeIsCompatible(xi),
        'Expected a parameterized type with too many params to not be compatible');
  });

  test('param types with incompatible params are not compatible', function() {
    const h = new TypeHierarchy();
    const ap = new ParameterDefinition('a', Variance.CO);
    const bp = new ParameterDefinition('b', Variance.CO);
    const cp = new ParameterDefinition('c', Variance.CO);
    h.addTypeDef('x', [ap, bp, cp]);
    h.finalize();

    const xi = new ExplicitInstantiation(
        'x',
        [
          new GenericInstantiation('m'),
          new ExplicitInstantiation('y'), // Does not exist.
          new GenericInstantiation('0'),
        ]);
    assert.isFalse(
        h.typeIsCompatible(xi),
        'Expected a parameterized type with an incompatible param to not be compatible');
  });
});
