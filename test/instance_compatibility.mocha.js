/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeHierarchy} from '../src/type_hierarchy';
import {
  BoundsType,
  ExplicitInstantiation,
  GenericInstantiation
} from '../src/type_instantiation';
import {assert} from 'chai';

suite('TypeInstance compatibility', function() {
  test('types that exist are compatible', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');

    assert.isTrue(
        h.typeIsCompatible(ti), 'Expected a type that exists to be compatible');
  });

  test('types that do not exist are not compatible', function() {
    const h = new TypeHierarchy();
    const ti = new ExplicitInstantiation('t');

    assert.isFalse(
        h.typeIsCompatible(ti),
        'Expected a type that does not exists to not be compatible');
  });

  test('unconstrained generics are always compatible', function() {
    const h = new TypeHierarchy();
    const gi = new GenericInstantiation('g');

    assert.isTrue(
        h.typeIsCompatible(gi),
        'Expected an unconstrained generic to be compatible');
  });

  test('upper bounds that exist are compatible', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation(
        'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);

    assert.isTrue(
        h.typeIsCompatible(gi),
        'Expected an upper bound that exists to be compatible');
  });

  test('upper bounds that do not exist are not compatible', function() {
    const h = new TypeHierarchy();
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation(
        'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);

    assert.isFalse(
        h.typeIsCompatible(gi),
        'Expected an upper bound that does not exists to not be compatible');
  });

  test('lower bounds that exist are compatible', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation(
        'g', BoundsType.MORE_GENERAL_THAN, [ti]);

    assert.isTrue(
        h.typeIsCompatible(gi),
        'Expected a lower bound that exists to be compatible');
  });

  test('lower bounds that do not exist are not compatible', function() {
    const h = new TypeHierarchy();
    const ti = new ExplicitInstantiation('t');
    const gi = new GenericInstantiation(
        'g', BoundsType.MORE_GENERAL_THAN, [ti]);

    assert.isFalse(
        h.typeIsCompatible(gi),
        'Expected a lower bound that does not exists to not be compatible');
  });
});
