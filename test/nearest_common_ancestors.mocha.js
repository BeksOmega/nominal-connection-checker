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
import {NotFinalized} from '../src/exceptions';

suite('Nearest common ancestors', function() {
  /**
   * Asserts that the nearest common ancestors of the types ts are the
   * ancestors eas.
   * @param {!TypeHierarchy} h The hierarchy to use to find the nearest common
   *     ancestors.
   * @param {!Array<ExplicitInstantiation>} ts The types to find the nearest
   *     common ancestors of.
   * @param {!Array<!ExplicitInstantiation>} eas The expected ancestors.
   * @param {string} msg The message to include in the assertion.
   */
  function assertNearestCommonAncestors(h, ts, eas, msg) {
    const aas = h.getNearestCommonAncestors(...ts);
    assert.equal(aas.length, eas.length, msg);
    assert.isTrue(aas.every((aa, i) => aa.equals(eas[i])), msg);
  }

  suite('basic explicit nearest common ancestors', function() {
    test('not being finalized throws errors', function() {
      const h = new TypeHierarchy();

      assert.throws(
          () => h.getNearestCommonAncestors(),
          'The TypeHierarchy has not been finalized',
          NotFinalized);
    });

    test('nca of no types is empty', function() {
      const h = new TypeHierarchy();
      h.finalize();

      assert.isEmpty(
          h.getNearestCommonAncestors(),
          'Expected the nca of no types to be empty');
    });

    test('nca of one type is itself', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      h.finalize();
      const ti = new ExplicitInstantiation('t');

      assertNearestCommonAncestors(
          h, [ti], [ti], 'Expected the nca of one type to be itself');
    });

    test('nca of two unrelated types is empty', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('a');
      h.addTypeDef('b');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');
      h.finalize();

      assert.isEmpty(
          h.getNearestCommonAncestors(ai, bi),
          'Expected the nca of two unrelated types to be empty');
    });

    test('nca of a type and itself is itself', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const ti1 = new ExplicitInstantiation('t');
      const ti2 = new ExplicitInstantiation('t');
      h.finalize();

      assertNearestCommonAncestors(
          h, [ti1, ti2], [ti1],
          'Expected the nca of a type and itself to be itself');
    });

    test('nca of a type and its parent is the parent', function() {
      const h = new TypeHierarchy();
      const td = h.addTypeDef('t');
      h.addTypeDef('p');
      const ti = new ExplicitInstantiation('t');
      const pi = new ExplicitInstantiation('p');
      td.addParent(pi);
      h.finalize();

      assertNearestCommonAncestors(
          h, [ti, pi], [pi],
          'Expected the nca of a type and its parent to be the parent');
    });

    test('nca of a type and its grandparent is the grandparent', function() {
      const h = new TypeHierarchy();
      const td = h.addTypeDef('t');
      const pd = h.addTypeDef('p');
      h.addTypeDef('gp');
      const ti = new ExplicitInstantiation('t');
      const pi = new ExplicitInstantiation('p');
      const gpi = new ExplicitInstantiation('gp');
      pd.addParent(gpi);
      td.addParent(pi);
      h.finalize();

      assertNearestCommonAncestors(
          h, [ti, gpi], [gpi],
          'Expected the nca of a type and its grandparent to be the grandparent');
    });

    test('nca of a type, its parent, and its grandparent is the grandparent',
        function() {
          const h = new TypeHierarchy();
          const td = h.addTypeDef('t');
          const pd = h.addTypeDef('p');
          h.addTypeDef('gp');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const gpi = new ExplicitInstantiation('gp');
          pd.addParent(gpi);
          td.addParent(pi);
          h.finalize();

          assertNearestCommonAncestors(
              h, [ti, pi, gpi], [gpi],
              'Expected the nca of a type, its parent, and its grandparent to be the grandparent');
        });

    test('nca of two siblings is their parent', function() {
      const h = new TypeHierarchy();
      const ad = h.addTypeDef('a');
      const bd = h.addTypeDef('b');
      h.addTypeDef('p');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');
      const pi = new ExplicitInstantiation('p');
      ad.addParent(pi);
      bd.addParent(pi);
      h.finalize();

      assertNearestCommonAncestors(
          h, [ai, bi], [pi],
          'Expected the nca of two siblings to be their parent');
    });

    test('nca of three siblings is their parent', function() {
      const h = new TypeHierarchy();
      const ad = h.addTypeDef('a');
      const bd = h.addTypeDef('b');
      const cd = h.addTypeDef('c');
      h.addTypeDef('p');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');
      const ci = new ExplicitInstantiation('c');
      const pi = new ExplicitInstantiation('p');
      ad.addParent(pi);
      bd.addParent(pi);
      cd.addParent(pi);
      h.finalize();

      assertNearestCommonAncestors(
          h, [ci, bi, ai], [pi],
          'Expected the nca of three siblings to be their parent');
    });

    test('nca of two cousins is the grandparent', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('gp');
      const pad = h.addTypeDef('pa');
      const pbd = h.addTypeDef('pb');
      const cad = h.addTypeDef('ca');
      const cbd = h.addTypeDef('cb');
      const gpi = new ExplicitInstantiation('gp');
      const pai = new ExplicitInstantiation('pa');
      const pbi = new ExplicitInstantiation('pb');
      const cai = new ExplicitInstantiation('ca');
      const cbi = new ExplicitInstantiation('cb');
      pad.addParent(gpi);
      pbd.addParent(gpi);
      cad.addParent(pai);
      cbd.addParent(pbi);
      h.finalize();

      assertNearestCommonAncestors(
          h, [cai, cbi], [gpi],
          'Expected the nca of two cousins to be the grandparent');
    });

    test('nca of a type and its parsib is the grandparent', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('gp');
      const pad = h.addTypeDef('pa');
      const pbd = h.addTypeDef('pb');
      const cd = h.addTypeDef('c');
      const gpi = new ExplicitInstantiation('gp');
      const pai = new ExplicitInstantiation('pa');
      const pbi = new ExplicitInstantiation('pb');
      const ci = new ExplicitInstantiation('c');
      pad.addParent(gpi);
      pbd.addParent(gpi);
      cd.addParent(pai);
      h.finalize();

      assertNearestCommonAncestors(
          h, [ci, pbi], [gpi],
          'Expected the nca of a type and its parsib to be its grandparent');
    });

    test('ncas of two siblings with multiple shared parents are the parents',
        function() {
          const h = new TypeHierarchy();
          h.addTypeDef('pa');
          h.addTypeDef('pb');
          const cad = h.addTypeDef('ca');
          const cbd = h.addTypeDef('cb');
          const pai = new ExplicitInstantiation('pa');
          const pbi = new ExplicitInstantiation('pb');
          const cai = new ExplicitInstantiation('ca');
          const cbi = new ExplicitInstantiation('cb');
          cad.addParent(pai);
          cad.addParent(pbi);
          cbd.addParent(pai);
          cbd.addParent(pbi);
          h.finalize();

          assertNearestCommonAncestors(
              h, [cai, cbi], [pai, pbi],
              'Expected the ncas two siblings with multiple shared parents to be the parents');
        });

    test('ncas of two siblings with some shared parents are the shared parents',
        function() {
          const h = new TypeHierarchy();
          h.addTypeDef('pa');
          h.addTypeDef('pb');
          h.addTypeDef('pc');
          h.addTypeDef('pd');
          const cad = h.addTypeDef('ca');
          const cbd = h.addTypeDef('cb');
          const pai = new ExplicitInstantiation('pa');
          const pbi = new ExplicitInstantiation('pb');
          const pci = new ExplicitInstantiation('pc');
          const pdi = new ExplicitInstantiation('pd');
          const cai = new ExplicitInstantiation('ca');
          const cbi = new ExplicitInstantiation('cb');
          cad.addParent(pai);
          cad.addParent(pbi);
          cad.addParent(pci);
          cbd.addParent(pbi);
          cbd.addParent(pci);
          cbd.addParent(pdi);
          h.finalize();

          assertNearestCommonAncestors(
              h, [cai, cbi], [pbi, pci],
              'Expected the ncas two siblings with some shared parents to be the shared parents');
        });

    test('ncas of three siblings with some shared parents is the shared parent',
        function() {
          const h = new TypeHierarchy();
          h.addTypeDef('pa');
          h.addTypeDef('pb');
          h.addTypeDef('pc');
          h.addTypeDef('pd');
          h.addTypeDef('pe');
          const cad = h.addTypeDef('ca');
          const cbd = h.addTypeDef('cb');
          const ccd = h.addTypeDef('cc');
          const pai = new ExplicitInstantiation('pa');
          const pbi = new ExplicitInstantiation('pb');
          const pci = new ExplicitInstantiation('pc');
          const pdi = new ExplicitInstantiation('pd');
          const pei = new ExplicitInstantiation('pe');
          const cai = new ExplicitInstantiation('ca');
          const cbi = new ExplicitInstantiation('cb');
          const cci = new ExplicitInstantiation('cc');
          cad.addParent(pai);
          cad.addParent(pbi);
          cad.addParent(pci);
          cbd.addParent(pbi);
          cbd.addParent(pci);
          cbd.addParent(pdi);
          ccd.addParent(pci);
          ccd.addParent(pdi);
          ccd.addParent(pei);
          h.finalize();

          assertNearestCommonAncestors(
              h, [cai, cbi, cci], [pci],
              'Expected the ncas three siblings with some shared parents to be the shared parent');
        });

    /* All of these tests  use the follow graph. Children are below their
     * ancestors.
     *
     *        u ----.
     *      /   \    \
     *    /      \    \
     *  /     W   |    \
     * |    / | \ |     Q
     * |  /   |   V     |
     * | |    Z    \    |
     * | |  /   \  |   /
     * \ | /     \ | /
     *   X         Y
     */
    suite('complex graph unions', function() {
      function createHierarchy() {
        const h = new TypeHierarchy();
        const qd = h.addTypeDef('q');
        h.addTypeDef('u');
        const vd = h.addTypeDef('v');
        h.addTypeDef('w');
        const xd = h.addTypeDef('x');
        const yd = h.addTypeDef('y');
        const zd = h.addTypeDef('z');
        const qi = new ExplicitInstantiation('q');
        const ui = new ExplicitInstantiation('u');
        const vi = new ExplicitInstantiation('v');
        const wi = new ExplicitInstantiation('w');
        const zi = new ExplicitInstantiation('z');

        qd.addParent(ui);
        vd.addParent(ui);
        xd.addParent(ui);
        vd.addParent(wi);
        zd.addParent(wi);
        xd.addParent(wi);
        yd.addParent(qi);
        yd.addParent(vi);
        yd.addParent(zi);
        xd.addParent(zi);

        h.finalize();

        return h;
      }

      test('ncas of X and Y are Z and U', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const zi = new ExplicitInstantiation('z');
        const ui = new ExplicitInstantiation('u');
        assertNearestCommonAncestors(
            h, [xi, yi], [ui, zi],
            'Expected the ncas of X and Y to be Z and U');
      });

      test('nca of X, Y, and Z is Z', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const zi = new ExplicitInstantiation('z');
        assertNearestCommonAncestors(
            h, [xi, yi, zi], [zi],
            'Expected the nca of X, Y and Z to be Z');
      });

      test('nca of X, Y, and W is W', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const wi = new ExplicitInstantiation('w');
        assertNearestCommonAncestors(
            h, [xi, yi, wi], [wi],
            'Expected the nca of X, Y and W to be W');
      });

      test('ncas of X, Y, and V are W and U', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const vi = new ExplicitInstantiation('v');
        const wi = new ExplicitInstantiation('w');
        const ui = new ExplicitInstantiation('u');
        assertNearestCommonAncestors(
            h, [xi, yi, vi], [ui, wi],
            'Expected the ncas of X, Y and V to be W and U');
      });

      test('nca of X, Y, and Q is U', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const qi = new ExplicitInstantiation('q');
        const ui = new ExplicitInstantiation('u');
        assertNearestCommonAncestors(
            h, [xi, yi, qi], [ui],
            'Expected the nca of X, Y and Q to be U');
      });
    });
  });

  suite('basic generic nearest common ancestors', function() {
    test('nca of only generics is a generic', function() {
      const h = new TypeHierarchy();
      h.finalize();
      const g1 = new GenericInstantiation('g1');
      const g2 = new GenericInstantiation('g2');
      const g3 = new GenericInstantiation('g3');
      const g = new GenericInstantiation();

      assertNearestCommonAncestors(
          h, [g1, g2, g3], [g],
          'Expected the nca of only generics to be a generic');
    });

    test('generics are otherwise ignored', function() {
      const h = new TypeHierarchy();
      const td = h.addTypeDef('t');
      h.addTypeDef('p');
      const ti = new ExplicitInstantiation('t');
      const pi = new ExplicitInstantiation('p');
      const gi = new GenericInstantiation('g');
      td.addParent(pi);
      h.finalize();

      assertNearestCommonAncestors(
          h, [ti, pi, gi], [pi],
          'Expected generics to be ignored when included with explicits');
    });
  });
});
