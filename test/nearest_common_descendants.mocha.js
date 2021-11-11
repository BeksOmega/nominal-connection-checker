/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeHierarchy} from '../src/type_hierarchy';
import {ExplicitInstantiation, GenericInstantiation} from '../src/type_instantiation';
import {assert} from 'chai';
import {IncompatibleType, NotFinalized} from '../src/exceptions';
import {ParameterDefinition, Variance} from '../src/parameter_definition';

suite('Nearest common descendants', function() {
  /**
   * Asserts that the nearest common descendants of the types ts are the
   * ancestors eds.
   * @param {!TypeHierarchy} h The hierarchy to use to find the nearest common
   *     descendants.
   * @param {!Array<TypeInstantiation>} ts The types to find the nearest
   *     common descendants of.
   * @param {!Array<!TypeInstantiation>} eds The expected descendants.
   * @param {string} msg The message to include in the assertion.
   */
  function assertNearestCommonDescendants(h, ts, eds, msg) {
    const ads = h.getNearestCommonDescendants(...ts);
    assert.equal(ads.length, eds.length, msg);
    assert.isTrue(ads.every((ad, i) => ad.equals(eds[i])), msg);
  }

  test('invalid type throws', function() {
    const h = new TypeHierarchy();
    const ti1 = new ExplicitInstantiation('t');
    const ti2 = new ExplicitInstantiation('t');
    h.finalize();

    assert.throws(
        () => h.getNearestCommonDescendants(ti1, ti2),
        /The type instance .* is incompatible with the given TypeHierarchy/,
        IncompatibleType);
  });

  test('invalid upper bound throws', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');
    const ui = new ExplicitInstantiation('u');
    const gi = new GenericInstantiation('g', [], [ui]);
    h.finalize();

    assert.throws(
        () => h.getNearestCommonDescendants(ti, gi),
        /The type instance .* is incompatible with the given TypeHierarchy/,
        IncompatibleType);
  });

  test('invalid lower bound throws', function() {
    const h = new TypeHierarchy();
    h.addTypeDef('t');
    const ti = new ExplicitInstantiation('t');
    const ui = new ExplicitInstantiation('u');
    const gi = new GenericInstantiation('g', [ui]);
    h.finalize();

    assert.throws(
        () => h.getNearestCommonDescendants(ti, gi),
        /The type instance .* is incompatible with the given TypeHierarchy/,
        IncompatibleType);
  });

  test('lower bound higher than upper bound throws', function() {
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

    assert.throws(
        () => h.getNearestCommonDescendants(ti, gi),
        /The type instance .* is incompatible with the given TypeHierarchy/,
        IncompatibleType);
  });

  suite('basic explicit nearest common descendants', function() {
    test('not being finalized throws an error', function() {
      const h = new TypeHierarchy();

      assert.throws(
          () => h.getNearestCommonDescendants(),
          'The TypeHierarchy has not been finalized',
          NotFinalized);
    });

    test('ncd of no types is empty', function() {
      const h = new TypeHierarchy();
      h.finalize();

      assert.isEmpty(
          h.getNearestCommonDescendants(),
          'Expected the ncd of no types to be empty');
    });

    test('ncd of one type is itself', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      h.finalize();
      const ti = new ExplicitInstantiation('t');

      assertNearestCommonDescendants(
          h, [ti], [ti], 'Expected the ncd of one type to be itself');
    });

    test('ncd of two unrelated types is empty', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('a');
      h.addTypeDef('b');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');
      h.finalize();

      assert.isEmpty(
          h.getNearestCommonDescendants(ai, bi),
          'Expected the ncd of two unrelated types to be empty');
    });

    test('ncd of a type and itself is itself', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const ti1 = new ExplicitInstantiation('t');
      const ti2 = new ExplicitInstantiation('t');
      h.finalize();

      assertNearestCommonDescendants(
          h, [ti1, ti2], [ti1],
          'Expected the ncd of a type and itself to be itself');
    });

    test('ncd of a type and its child is the child', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const cd = h.addTypeDef('c');
      const ti = new ExplicitInstantiation('t');
      const ci = new ExplicitInstantiation('c');
      cd.addParent(ti);
      h.finalize();

      assertNearestCommonDescendants(
          h, [ti, ci], [ci],
          'Expected the ncd of a type and its child to be the child');
    });

    test('ncd of a type and its grandchild is the grandchild', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const cd = h.addTypeDef('c');
      const gcd = h.addTypeDef('gc');
      const ti = new ExplicitInstantiation('t');
      const ci = new ExplicitInstantiation('c');
      const gci = new ExplicitInstantiation('gc');
      cd.addParent(ti);
      gcd.addParent(ci);
      h.finalize();

      assertNearestCommonDescendants(
          h, [ti, gci], [gci],
          'Expected the ncd of a type and its grandchild to be the grandchild');
    });

    test('ncd of a type, its child, and its grandchild is the grandchild',
        function() {
          const h = new TypeHierarchy();
          h.addTypeDef('t');
          const cd = h.addTypeDef('c');
          const gcd = h.addTypeDef('gc');
          const ti = new ExplicitInstantiation('t');
          const ci = new ExplicitInstantiation('c');
          const gci = new ExplicitInstantiation('gc');
          cd.addParent(ti);
          gcd.addParent(ci);
          h.finalize();

          assertNearestCommonDescendants(
              h, [ti, ci, gci], [gci],
              'Expected the ncd of a type, its child, and its grandchild to be the grandchild');
        });

    test('ncd of two coparents is the child', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('a');
      h.addTypeDef('b');
      const cd = h.addTypeDef('c');
      const ai = new ExplicitInstantiation('a');
      const bi = new ExplicitInstantiation('b');
      const ci = new ExplicitInstantiation('c');
      cd.addParent(ai);
      cd.addParent(bi);
      h.finalize();

      assertNearestCommonDescendants(
          h, [ai, bi], [ci],
          'Expected the ncd of two coparents to be their child');
    });

    test('ncd of three coparents is the child', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('x');
      h.addTypeDef('y');
      h.addTypeDef('z');
      const cd = h.addTypeDef('c');
      const xi = new ExplicitInstantiation('x');
      const yi = new ExplicitInstantiation('y');
      const zi = new ExplicitInstantiation('z');
      const ci = new ExplicitInstantiation('c');
      cd.addParent(xi);
      cd.addParent(yi);
      cd.addParent(zi);
      h.finalize();

      assertNearestCommonDescendants(
          h, [xi, yi, zi], [ci],
          'Expected the ncd of three coparents to be their child');
    });

    test('ncd of two grandparents is the grandchild', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      const pad = h.addTypeDef('pa');
      const pbd = h.addTypeDef('pb');
      h.addTypeDef('gpa');
      h.addTypeDef('gpb');
      const ci = new ExplicitInstantiation('c');
      const pai = new ExplicitInstantiation('pa');
      const pbi = new ExplicitInstantiation('pb');
      const gpai = new ExplicitInstantiation('gpa');
      const gpbi = new ExplicitInstantiation('gpb');
      cd.addParent(pai);
      cd.addParent(pbi);
      pad.addParent(gpai);
      pbd.addParent(gpbi);
      h.finalize();

      assertNearestCommonDescendants(
          h, [gpai, gpbi], [ci],
          'Expected the ncd of two grandparents to be their grandchild');
    });

    test('ncd of a parent and other grandparent is the child', function() {
      const h = new TypeHierarchy();
      const cd = h.addTypeDef('c');
      const pad = h.addTypeDef('pa');
      h.addTypeDef('pb');
      h.addTypeDef('gpa');
      const ci = new ExplicitInstantiation('c');
      const pai = new ExplicitInstantiation('pa');
      const pbi = new ExplicitInstantiation('pb');
      const gpai = new ExplicitInstantiation('gpa');
      cd.addParent(pai);
      cd.addParent(pbi);
      pad.addParent(gpai);
      h.finalize();

      assertNearestCommonDescendants(
          h, [gpai, pbi], [ci],
          'Expected the ncd of a parent and the opposite grandparent to be the child');
    });

    test('ncds of two parents with multiple shared children are the children',
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

          assertNearestCommonDescendants(
              h, [pai, pbi], [cai, cbi],
              'Expected the ncds two parents with multiple shared children to be the children');
        });

    test('ncds of two parents with some shared children are the children',
        function() {
          const h = new TypeHierarchy();
          h.addTypeDef('pa');
          h.addTypeDef('pb');
          const cad = h.addTypeDef('ca');
          const cbd = h.addTypeDef('cb');
          const ccd = h.addTypeDef('cc');
          const cdd = h.addTypeDef('cd');
          const pai = new ExplicitInstantiation('pa');
          const pbi = new ExplicitInstantiation('pb');
          const cbi = new ExplicitInstantiation('cb');
          const cci = new ExplicitInstantiation('cc');
          cad.addParent(pai);
          cbd.addParent(pai);
          cbd.addParent(pbi);
          ccd.addParent(pai);
          ccd.addParent(pbi);
          cdd.addParent(pbi);
          h.finalize();

          assertNearestCommonDescendants(
              h, [pai, pbi], [cbi, cci],
              'Expected the ncds two parents with some shared children to be the shared children');
        });

    test('ncds of three parents with some shared children is the child',
        function() {
          const h = new TypeHierarchy();
          const cad = h.addTypeDef('ca');
          const cbd = h.addTypeDef('cb');
          const ccd = h.addTypeDef('cc');
          const cdd = h.addTypeDef('cd');
          const ced = h.addTypeDef('ce');
          h.addTypeDef('pa');
          h.addTypeDef('pb');
          h.addTypeDef('pc');
          const cci = new ExplicitInstantiation('cc');
          const pai = new ExplicitInstantiation('pa');
          const pbi = new ExplicitInstantiation('pb');
          const pci = new ExplicitInstantiation('pc');
          cad.addParent(pai);
          cbd.addParent(pai);
          cbd.addParent(pbi);
          ccd.addParent(pai);
          ccd.addParent(pbi);
          ccd.addParent(pci);
          cdd.addParent(pbi);
          cdd.addParent(pci);
          ced.addParent(pci);
          h.finalize();

          assertNearestCommonDescendants(
              h, [pai, pbi, pci], [cci],
              'Expected the ncds three parents with some shared children to be the shared children');
        });


    /* All of these tests  use the follow graph. Children are below their
     * ancestors.
     *
     *   X         Y
     * / | \     / | \
     * | |  \   /  |  \
     * | |    Z    /   |
     * |  \   |   V    |
     * |    \ | / |    Q
     *  \     W   |   /
     *    \      /   /
     *      \   /   /
     *        U ---'
     *
     */
    suite('complex graph unions', function() {
      function createHierarchy() {
        const h = new TypeHierarchy();
        const qd = h.addTypeDef('q');
        const ud = h.addTypeDef('u');
        const vd = h.addTypeDef('v');
        const wd = h.addTypeDef('w');
        h.addTypeDef('x');
        h.addTypeDef('y');
        const zd = h.addTypeDef('z');
        const qi = new ExplicitInstantiation('q');
        const vi = new ExplicitInstantiation('v');
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const zi = new ExplicitInstantiation('z');

        zd.addParent(xi);
        wd.addParent(xi);
        ud.addParent(xi);
        zd.addParent(yi);
        vd.addParent(yi);
        qd.addParent(yi);
        wd.addParent(zi);
        wd.addParent(vi);
        ud.addParent(vi);
        ud.addParent(qi);

        h.finalize();

        return h;
      }

      test('ncds of X and Y are Z and U', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const zi = new ExplicitInstantiation('z');
        const ui = new ExplicitInstantiation('u');
        assertNearestCommonDescendants(
            h, [xi, yi], [zi, ui],
            'Expected the ncds of X and Y to be Z and U');
      });

      test('ncd of X, Y, and Z is Z', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const zi = new ExplicitInstantiation('z');
        assertNearestCommonDescendants(
            h, [xi, yi, zi], [zi],
            'Expected the ncd of X, Y and Z to be Z');
      });

      test('ncd of X, Y, and W is W', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const wi = new ExplicitInstantiation('w');
        assertNearestCommonDescendants(
            h, [xi, yi, wi], [wi],
            'Expected the ncd of X, Y and W to be W');
      });

      test('ncds of X, Y, and V are W and U', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const vi = new ExplicitInstantiation('v');
        const wi = new ExplicitInstantiation('w');
        const ui = new ExplicitInstantiation('u');
        assertNearestCommonDescendants(
            h, [xi, yi, vi], [wi, ui],
            'Expected the ncds of X, Y and V to be W and U');
      });

      test('ncd of X, Y, and Q is U', function() {
        const h = createHierarchy();
        const xi = new ExplicitInstantiation('x');
        const yi = new ExplicitInstantiation('y');
        const qi = new ExplicitInstantiation('q');
        const ui = new ExplicitInstantiation('u');
        assertNearestCommonDescendants(
            h, [xi, yi, qi], [ui],
            'Expected the ncd of X, Y and Q to be U');
      });
    });
  });

  suite('basic generic nearest common descendants', function() {
    test('ncd of only generics is a default generic', function() {
      const h = new TypeHierarchy();
      h.finalize();
      const g1 = new GenericInstantiation('g1');
      const g2 = new GenericInstantiation('g2');
      const g3 = new GenericInstantiation('g3');
      const g = new GenericInstantiation();

      assertNearestCommonDescendants(
          h, [g1, g2, g3], [g],
          'Expected the ncd of only generics to be a generic');
    });

    test('nca of a generic and a type is the type', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const ti = new ExplicitInstantiation('t');
      const gi = new GenericInstantiation('gi');
      h.finalize();

      assertNearestCommonDescendants(
          h, [ti, gi], [ti],
          'Expected generics to be ignored when included with explicits');
    });

    test('ncds of generics and types are the ncds of the types', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const cd = h.addTypeDef('c');
      const ti = new ExplicitInstantiation('t');
      const ci = new ExplicitInstantiation('c');
      const gi = new GenericInstantiation('g');
      cd.addParent(ti);
      h.finalize();

      assertNearestCommonDescendants(
          h, [ti, ci, gi], [ci],
          'Expected generics to be ignored when included with explicits');
    });
  });

  suite('constrained generic nearest common descendants', function() {
    suite('constrained generics with unconstrained generics', function() {
      test('ncd of a generic and an upper bound generic is the upper bound generic',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const t = new ExplicitInstantiation('t');
            const g = new GenericInstantiation('g');
            const ug = new GenericInstantiation('g', [], [t]);
            h.finalize();

            const eg = new GenericInstantiation('', [], [t]);
            assertNearestCommonDescendants(
                h, [g, ug], [eg],
                'Expected the ncd of a generic and an upper bound generic to be the upper bound generic');
          });

      test('ncd of a generic and a lower bound generic is the lower bound generic',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const t = new ExplicitInstantiation('t');
            const g = new GenericInstantiation('g');
            const lg = new GenericInstantiation('g', [t]);
            h.finalize();

            const eg = new GenericInstantiation('', [t]);
            assertNearestCommonDescendants(
                h, [g, lg], [eg],
                'Expected the ncd of a generic and a lower bound generic to be the lower bound generic');
          });
    });

    suite('constrained generics with explicit types', function() {
      test('ncd of an upper bound generic and a subtype is an upper bound generic with the subtype',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const ug = new GenericInstantiation('g', [], [ti]);
            cd.addParent(ti);
            h.finalize();

            const ed = new GenericInstantiation('', [], [ci]);
            assertNearestCommonDescendants(
                h, [ci, ug], [ed],
                'Expected the ncd of an upper bound generic and a subtype to be an upper bound generic with the subtype');
          });

      test('ncd of an upper bound generic and a supertype is the upper bound generic',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const ti = new ExplicitInstantiation('t');
            const pi = new ExplicitInstantiation('p');
            const ug = new GenericInstantiation('g', [], [ti]);
            td.addParent(pi);
            h.finalize();

            const eg = new GenericInstantiation('', [], [ti]);
            assertNearestCommonDescendants(
                h, [pi, ug], [eg],
                'Expected the ncd of an upper bound generic and a supertype to be the upper bound generic');
          });

      test('ncd of an upper bound generic and a coparent is an upper bound generic with the child',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('a');
            h.addTypeDef('b');
            const cd = h.addTypeDef('c');
            const ai = new ExplicitInstantiation('a');
            const bi = new ExplicitInstantiation('b');
            const ci = new ExplicitInstantiation('c');
            const ug = new GenericInstantiation('g', [], [ai]);
            cd.addParent(ai);
            cd.addParent(bi);
            h.finalize();

            const eg = new GenericInstantiation('', [], [ci]);
            assertNearestCommonDescendants(
                h, [bi, ug], [eg],
                'Expected the ncd of an upper bound generic and a coparent to be an upper bound generic with the child');
          });

      test('upper bound generics and unrelated types do not unify', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('t');
        h.addTypeDef('u');
        const ti = new ExplicitInstantiation('t');
        const ui = new ExplicitInstantiation('u');
        const g = new GenericInstantiation('g', [], [ti]);
        h.finalize();

        assertNearestCommonDescendants(
            h, [ui, g], [],
            'Expected an upper bound generic and an unrelated type to not unify');
      });

      test('ncd of a lower bound generic and a subtype is a lower bound generic with the subtype',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const lg = new GenericInstantiation('g', [ti]);
            cd.addParent(ti);
            h.finalize();

            const ed = new GenericInstantiation('', [ci]);
            assertNearestCommonDescendants(
                h, [ci, lg], [ed],
                'Expected the ncd of a lower bound generic and a subtype to be a lower bound generic with the subtype');
          });

      test('ncd of a lower bound generic and a supertype is the lower bound generic',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const ti = new ExplicitInstantiation('t');
            const pi = new ExplicitInstantiation('p');
            const lg = new GenericInstantiation('g', [ti]);
            td.addParent(pi);
            h.finalize();

            const eg = new GenericInstantiation('', [ti]);
            assertNearestCommonDescendants(
                h, [pi, lg], [eg],
                'Expected the ncd of a lower bound generic and a supertype to be the lower bound generic');
          });

      test('ncd of a lower bound generic and a coparent is a lower bound generic with the child',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('a');
            h.addTypeDef('b');
            const cd = h.addTypeDef('c');
            const ai = new ExplicitInstantiation('a');
            const bi = new ExplicitInstantiation('b');
            const ci = new ExplicitInstantiation('c');
            const lg = new GenericInstantiation('g', [ai]);
            cd.addParent(ai);
            cd.addParent(bi);
            h.finalize();

            const eg = new GenericInstantiation('', [ci]);
            assertNearestCommonDescendants(
                h, [bi, lg], [eg],
                'Expected the ncd of a lower bound generic and a coparent to be a lower bound generic with the child');
          });

      test('lower bound generics and unrelated types do not unify', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('t');
        h.addTypeDef('u');
        const ti = new ExplicitInstantiation('t');
        const ui = new ExplicitInstantiation('u');
        const g = new GenericInstantiation('g', [ti]);
        h.finalize();

        assertNearestCommonDescendants(
            h, [ui, g], [],
            'Expected lower bound generic and an unrelated type to not unify');
      });

      test('ncd of a lower bound generic, a middling type, and an upper bound generic is a constrained generic with a lower bound of the lower type and an upper bound of the middling type',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const pi = new ExplicitInstantiation('p');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const lg = new GenericInstantiation('g', [ci]);
            const ug = new GenericInstantiation('g', [], [pi]);
            td.addParent(pi);
            cd.addParent(ti);
            h.finalize();

            const eg = new GenericInstantiation('', [ci], [ti]);
            assertNearestCommonDescendants(
                h, [lg, ti, ug], [eg],
                'Expected the ncd of a lower bound generic, a middling type, and an upper bound generic to be a constrained generic with a lower bound of the lower type and an upper bound of the middling type');
          });
    });

    suite('constrained generics with constrained generics', function() {
      test('ncd of an upper bound generic and an upper bound generic with a subtype is the second upper bound generic',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const tg = new GenericInstantiation('g', [], [ti]);
            const cg = new GenericInstantiation('g', [], [ci]);
            cd.addParent(ti);
            h.finalize();

            const eg = new GenericInstantiation('', [], [ci]);
            assertNearestCommonDescendants(
                h, [tg, cg], [eg],
                'Expected the ncd of an upper bound generic and an upper bound generic with a subtype to be the second upper bound generic');
          });

      test('ncd of an upper bound generic and an upper bound generic with a supertype is the first upper bound generic',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const ti = new ExplicitInstantiation('t');
            const pi = new ExplicitInstantiation('p');
            const tg = new GenericInstantiation('g', [], [ti]);
            const pg = new GenericInstantiation('g', [], [pi]);
            td.addParent(pi);
            h.finalize();

            const eg = new GenericInstantiation('', [], [ti]);
            assertNearestCommonDescendants(
                h, [tg, pg], [eg],
                'Expected the ncd of an upper bound generic and an upper bound generic with a supertype to be the first upper bound generic');
          });

      test('ncd of an upper bound generic and an upper bound generic with a coparent is an upper bound generic with the child',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('a');
            h.addTypeDef('b');
            const cd = h.addTypeDef('c');
            const ai = new ExplicitInstantiation('a');
            const bi = new ExplicitInstantiation('b');
            const ci = new ExplicitInstantiation('c');
            const ag = new GenericInstantiation('g', [], [ai]);
            const bg = new GenericInstantiation('g', [], [bi]);
            cd.addParent(ai);
            cd.addParent(bi);
            h.finalize();

            const eg = new GenericInstantiation('', [], [ci]);
            assertNearestCommonDescendants(
                h, [ag, bg], [eg],
                'Expected the ncd of an upper bound generic and an upper bound generic with a comparent to be an upper bound generic with the child');
          });

      test('upper bound generics and upper bound generics with unrelated types do not unify',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            h.addTypeDef('u');
            const ti = new ExplicitInstantiation('t');
            const ui = new ExplicitInstantiation('u');
            const ug = new GenericInstantiation('g', [], [ui]);
            const tg = new GenericInstantiation('g', [], [ti]);
            h.finalize();

            assertNearestCommonDescendants(
                h, [ug, tg], [],
                'Expected an upper bound generic and an upper bound generic with an unrelated type to not unify');
          });

      test('ncd of a lower bound generic and a lower bound generic with a subtype is the second lower bound type',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const tg = new GenericInstantiation('g', [ti]);
            const cg = new GenericInstantiation('g', [ci]);
            cd.addParent(ti);
            h.finalize();

            const eg = new GenericInstantiation('', [ci]);
            assertNearestCommonDescendants(
                h, [tg, cg], [eg],
                'Expected the ncd of a lower bound generic and a lower bound generic with a subtype to be the second lower bound generic');
          });

      test('ncd of a lower bound generic and a lower bound generic with a supertype is the first lower bound generic',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const ti = new ExplicitInstantiation('t');
            const pi = new ExplicitInstantiation('p');
            const tg = new GenericInstantiation('g', [ti]);
            const pg = new GenericInstantiation('g', [pi]);
            td.addParent(pi);
            h.finalize();

            const eg = new GenericInstantiation('', [ti]);
            assertNearestCommonDescendants(
                h, [tg, pg], [eg],
                'Expected the ncd of a lower bound generic and lower bound generic with a supertype to be the first lower bound generic');
          });

      test('ncd of a lower bound generic and a lower bound generic with a coparent is a lower bound generic with the child',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('a');
            h.addTypeDef('b');
            const cd = h.addTypeDef('c');
            const ai = new ExplicitInstantiation('a');
            const bi = new ExplicitInstantiation('b');
            const ci = new ExplicitInstantiation('c');
            const ag = new GenericInstantiation('g', [ai]);
            const bg = new GenericInstantiation('g', [bi]);
            cd.addParent(ai);
            cd.addParent(bi);
            h.finalize();

            const eg = new GenericInstantiation('', [ci]);
            assertNearestCommonDescendants(
                h, [ag, bg], [eg],
                'Expected the ncd of a lower bound generic and a lower bound generic witha comparent is a lower bound generic with teh child');
          });

      test('lower bound generics and lower bound generics unrelated types do not unify',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            h.addTypeDef('u');
            const ti = new ExplicitInstantiation('t');
            const ui = new ExplicitInstantiation('u');
            const ug = new GenericInstantiation('g', [ui]);
            const tg = new GenericInstantiation('g', [ti]);
            h.finalize();

            assertNearestCommonDescendants(
                h, [ug, tg], [],
                'Expected lower bound generic and a lower bound generic with an unrelated type to not unify');
          });

      test('ncd of an upper bound generic and a lower bound generic is a generic with both bounds',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const pi = new ExplicitInstantiation('p');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const lg = new GenericInstantiation('g', [ci]);
            const ug = new GenericInstantiation('g', [], [pi]);
            td.addParent(pi);
            cd.addParent(ti);
            h.finalize();

            const eg = new GenericInstantiation('', [ci], [pi]);
            assertNearestCommonDescendants(
                h, [lg, ug], [eg],
                'Expected the ncd of an upper bound generic and a lower bound generic to be a generic with both bounds');
          });

      test('ncd of a lower bound generic, a middling lower bound type, and an upper bound generic is a constrained generic with a lower bound of the lower type and an upper bound of the upper type',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const pi = new ExplicitInstantiation('p');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const lg = new GenericInstantiation('g', [ci]);
            const mg = new GenericInstantiation('g', [ti]);
            const ug = new GenericInstantiation('g', [], [pi]);
            td.addParent(pi);
            cd.addParent(ti);
            h.finalize();

            const eg = new GenericInstantiation('', [ci], [pi]);
            assertNearestCommonDescendants(
                h, [lg, mg, ug], [eg],
                'Expected the ncd of a lower bound generic, a middling lower bound type, and an upper bound generic is a constrained generic with a lower bound of the lower type and an upper bound of the upper type');
          });

      test('ncd of a lower bound generic, a middling upper bound type, and an upper bound generic is a constrained generic with a lower bound of the lower type and an upper bound of the middling type',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const cd = h.addTypeDef('c');
            const pi = new ExplicitInstantiation('p');
            const ti = new ExplicitInstantiation('t');
            const ci = new ExplicitInstantiation('c');
            const lg = new GenericInstantiation('g', [ci]);
            const mg = new GenericInstantiation('g', [], [ti]);
            const ug = new GenericInstantiation('g', [], [pi]);
            td.addParent(pi);
            cd.addParent(ti);
            h.finalize();

            const eg = new GenericInstantiation('', [ci], [ti]);
            assertNearestCommonDescendants(
                h, [lg, mg, ug], [eg],
                'Expected the ncd of a lower bound generic, a middling upper bound type, and an upper bound generic to be a constrained generic with a lower bound of the lower type and an upper bound of the middling type');
          });

      test('upper bounds which unify to multiple types result in multiple upper bound types', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('a');
        h.addTypeDef('b');
        const cd = h.addTypeDef('c');
        const dd = h.addTypeDef('d');
        const ai = new ExplicitInstantiation('a');
        const bi = new ExplicitInstantiation('b');
        const ci = new ExplicitInstantiation('c');
        const di = new ExplicitInstantiation('d');
        cd.addParent(ai);
        cd.addParent(bi);
        dd.addParent(ai);
        dd.addParent(bi);
        const cg = new GenericInstantiation('g', [], [ai]);
        const dg = new GenericInstantiation('g', [], [bi]);
        h.finalize();

        const egs = [
          new GenericInstantiation('', [], [ci]),
          new GenericInstantiation('', [], [di]),
        ];
        assertNearestCommonDescendants(
            h, [cg, dg], egs,
            'Expected that when upper bounds unify to multiple types it results in multiple upper bound types');
      });

      test('lower bounds which unify to multiple types result in multiple lower bound types', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('a');
        h.addTypeDef('b');
        const cd = h.addTypeDef('c');
        const dd = h.addTypeDef('d');
        const ai = new ExplicitInstantiation('a');
        const bi = new ExplicitInstantiation('b');
        const ci = new ExplicitInstantiation('c');
        const di = new ExplicitInstantiation('d');
        cd.addParent(ai);
        cd.addParent(bi);
        dd.addParent(ai);
        dd.addParent(bi);
        const cg = new GenericInstantiation('g', [ai]);
        const dg = new GenericInstantiation('g', [bi]);
        h.finalize();

        const egs = [
          new GenericInstantiation('', [ci]),
          new GenericInstantiation('', [di]),
        ];
        assertNearestCommonDescendants(
            h, [cg, dg], egs,
            'Expected that when lower bounds unify to multiple types it results in multiple lower bound types');
      });

      test('upper and lower bounds which unify to multiple types result in multiple upper and lower bound types', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('a');
        h.addTypeDef('b');
        const cd = h.addTypeDef('c');
        const dd = h.addTypeDef('d');
        const ai = new ExplicitInstantiation('a');
        const bi = new ExplicitInstantiation('b');
        const ci = new ExplicitInstantiation('c');
        const di = new ExplicitInstantiation('d');
        cd.addParent(ai);
        cd.addParent(bi);
        dd.addParent(ai);
        dd.addParent(bi);
        const cg = new GenericInstantiation('g', [ai], [ai]);
        const dg = new GenericInstantiation('g', [bi], [bi]);
        h.finalize();

        const egs = [
          new GenericInstantiation('', [ci], [ci]),
          new GenericInstantiation('', [ci], [di]),
          new GenericInstantiation('', [di], [ci]),
          new GenericInstantiation('', [di], [di]),
        ];
        assertNearestCommonDescendants(
            h, [cg, dg], egs,
            'Expected that when upper and lower bounds unify to multiple types it results in multiple upper and lower bound types');
      });
    });
  });

  suite('explicit parameterized nearest common ancestors', function() {
    function defineParameterizedHierarchy() {
      const h = new TypeHierarchy();
      const coParam = new ParameterDefinition('a', Variance.CO);
      const contraParam = new ParameterDefinition('a', Variance.CONTRA);
      const invParam = new ParameterDefinition('a', Variance.INV);

      const coc = h.addTypeDef('coc', [coParam]);
      const coa = h.addTypeDef('coa', [coParam]);
      const cob = h.addTypeDef('cob', [coParam]);
      const cop = h.addTypeDef('cop', [coParam]);
      coc.addParent(coa.createInstance());
      coc.addParent(cob.createInstance());
      coa.addParent(cop.createInstance());
      cob.addParent(cop.createInstance());

      const conc = h.addTypeDef('conc', [contraParam]);
      const cona = h.addTypeDef('cona', [contraParam]);
      const conb = h.addTypeDef('conb', [contraParam]);
      const conp = h.addTypeDef('conp', [contraParam]);
      conc.addParent(cona.createInstance());
      conc.addParent(conb.createInstance());
      cona.addParent(conp.createInstance());
      conb.addParent(conp.createInstance());

      const invc = h.addTypeDef('invc', [invParam]);
      const inva = h.addTypeDef('inva', [invParam]);
      const invb = h.addTypeDef('invb', [invParam]);
      const invp = h.addTypeDef('invp', [invParam]);
      invc.addParent(inva.createInstance());
      invc.addParent(invb.createInstance());
      inva.addParent(invp.createInstance());
      invb.addParent(invp.createInstance());

      const c = h.addTypeDef('c');
      const ta = h.addTypeDef('ta');
      const tb = h.addTypeDef('tb');
      h.addTypeDef('tc');
      const p = h.addTypeDef('p');
      c.addParent(ta.createInstance());
      c.addParent(tb.createInstance());
      ta.addParent(p.createInstance());
      tb.addParent(p.createInstance());

      h.finalize();

      return h;
    }

    test('ncd of covariant params is the descendant', function() {
      const h = defineParameterizedHierarchy();
      const x = new ExplicitInstantiation(
          'coa', [new ExplicitInstantiation('ta')]);
      const y = new ExplicitInstantiation(
          'coa', [new ExplicitInstantiation('tb')]);

      const e = new ExplicitInstantiation(
          'coa', [new ExplicitInstantiation('c')]);
      assertNearestCommonDescendants(
          h, [x, y], [e],
          'Expected the ncd of coparent covariant params to be the descendant');
    });

    test('ncd of unrelated covariant params is empty', function() {
      const h = defineParameterizedHierarchy();
      const x = new ExplicitInstantiation(
          'coa', [new ExplicitInstantiation('ta')]);
      const y = new ExplicitInstantiation(
          'coa', [new ExplicitInstantiation('tc')]);

      assertNearestCommonDescendants(
          h, [x, y], [],
          'Expected the ncd of unrelated covariant params to be empty');
    });

    test('ncd of contravariant params is the ancestor', function() {
      const h = defineParameterizedHierarchy();
      const x = new ExplicitInstantiation(
          'cona', [new ExplicitInstantiation('ta')]);
      const y = new ExplicitInstantiation(
          'cona', [new ExplicitInstantiation('tb')]);

      const e = new ExplicitInstantiation(
          'cona', [new ExplicitInstantiation('p')]);
      assertNearestCommonDescendants(
          h, [x, y], [e],
          'Expected the ncd of sibling contravariant params to be the ancestor');
    });

    test('ncd of unrelated covariant params is empty', function() {
      const h = defineParameterizedHierarchy();
      const x = new ExplicitInstantiation(
          'cona', [new ExplicitInstantiation('ta')]);
      const y = new ExplicitInstantiation(
          'cona', [new ExplicitInstantiation('tc')]);

      assertNearestCommonDescendants(
          h, [x, y], [],
          'Expected the ncd of unrelated contravariant params to be empty');
    });

    test('ncd of identical invariant params is identical', function() {
      const h = defineParameterizedHierarchy();
      const x = new ExplicitInstantiation(
          'inva', [new ExplicitInstantiation('ta')]);
      const y = new ExplicitInstantiation(
          'inva', [new ExplicitInstantiation('ta')]);

      const e = new ExplicitInstantiation(
          'inva', [new ExplicitInstantiation('ta')]);
      assertNearestCommonDescendants(
          h, [x, y], [e],
          'Expected the ncd of identical invariant params is identical');
    });

    test('ncd of related invariant params is empty', function() {
      const h = defineParameterizedHierarchy();
      const x = new ExplicitInstantiation(
          'inva', [new ExplicitInstantiation('ta')]);
      const y = new ExplicitInstantiation(
          'inva', [new ExplicitInstantiation('tb')]);

      assertNearestCommonDescendants(
          h, [x, y], [],
          'Expected the ncd of related invariant params to be empty');
    });

    test('ncd of unrelated invariant params is empty', function() {
      const h = defineParameterizedHierarchy();
      const x = new ExplicitInstantiation(
          'inva', [new ExplicitInstantiation('ta')]);
      const y = new ExplicitInstantiation(
          'inva', [new ExplicitInstantiation('tc')]);

      assertNearestCommonDescendants(
          h, [x, y], [],
          'Expected the ncd of unrelated invariant params to be empty');
    });

    test('ncd of multiple common outer types results is multiple parameterized types',
        function() {
          const h = new TypeHierarchy();
          const coParam = new ParameterDefinition('a', Variance.CO);
          const coa = h.addTypeDef('coa', [coParam]);
          const cob = h.addTypeDef('cob', [coParam]);
          const coca = h.addTypeDef('coca', [coParam]);
          const cocb = h.addTypeDef('cocb', [coParam]);
          coca.addParent(coa.createInstance());
          coca.addParent(cob.createInstance());
          cocb.addParent(coa.createInstance());
          cocb.addParent(cob.createInstance());
          h.addTypeDef('t');
          h.finalize();
          const x = new ExplicitInstantiation(
              'coa', [new ExplicitInstantiation('t')]);
          const y = new ExplicitInstantiation(
              'cob', [new ExplicitInstantiation('t')]);

          const e1 = new ExplicitInstantiation(
              'coca', [new ExplicitInstantiation('t')]);
          const e2 = new ExplicitInstantiation(
              'cocb', [new ExplicitInstantiation('t')]);

          assertNearestCommonDescendants(
              h, [x, y], [e1, e2],
              'Expected the ncd of multiple common outer types to result in multiple parameterized types');
        });

    test('ncd of a pair of params each with a pair of common types, results in all combos of common types',
        function() {
          const h = new TypeHierarchy();
          const paramA = new ParameterDefinition('a', Variance.CO);
          const paramB = new ParameterDefinition('b', Variance.CO);
          h.addTypeDef('co', [paramA, paramB]);
          const ta = h.addTypeDef('ta');
          const tb = h.addTypeDef('tb');
          const ca = h.addTypeDef('ca');
          const cb = h.addTypeDef('cb');
          ca.addParent(ta.createInstance());
          ca.addParent(tb.createInstance());
          cb.addParent(ta.createInstance());
          cb.addParent(tb.createInstance());
          const tc = h.addTypeDef('tc');
          const td = h.addTypeDef('td');
          const cc = h.addTypeDef('cc');
          const cd = h.addTypeDef('cd');
          cc.addParent(tc.createInstance());
          cc.addParent(td.createInstance());
          cd.addParent(tc.createInstance());
          cd.addParent(td.createInstance());
          h.finalize();
          const x = new ExplicitInstantiation(
              'co',
              [
                new ExplicitInstantiation('ta'),
                new ExplicitInstantiation('tc'),
              ]);
          const y = new ExplicitInstantiation(
              'co',
              [
                new ExplicitInstantiation('tb'),
                new ExplicitInstantiation('td'),
              ]);

          const e1 = new ExplicitInstantiation(
              'co',
              [
                new ExplicitInstantiation('ca'),
                new ExplicitInstantiation('cc'),
              ]);
          const e2 = new ExplicitInstantiation(
              'co',
              [
                new ExplicitInstantiation('ca'),
                new ExplicitInstantiation('cd'),
              ]);
          const e3 = new ExplicitInstantiation(
              'co',
              [
                new ExplicitInstantiation('cb'),
                new ExplicitInstantiation('cc'),
              ]);
          const e4 = new ExplicitInstantiation(
              'co',
              [
                new ExplicitInstantiation('cb'),
                new ExplicitInstantiation('cd'),
              ]);

          assertNearestCommonDescendants(
              h, [x, y], [e1, e2, e3, e4],
              'Expected multiple common types for params to result in all combos of params');
        });

    test('params are properly reordered for outer types', function() {
      const h = new TypeHierarchy();
      const paramA = new ParameterDefinition('a', Variance.CO);
      const paramB = new ParameterDefinition('b', Variance.CO);
      const paramC = new ParameterDefinition('c', Variance.CO);
      const coa = h.addTypeDef('coa', [paramC, paramA, paramB]);
      const cob = h.addTypeDef('cob', [paramB, paramC, paramA]);
      const coc = h.addTypeDef('coc', [paramA, paramB, paramC]);
      coc.addParent(coa.createInstance());
      coc.addParent(cob.createInstance());
      const ta = h.addTypeDef('a');
      const tb = h.addTypeDef('b');
      const tc = h.addTypeDef('c');
      const ccb = h.addTypeDef('ccb');
      const cac = h.addTypeDef('cac');
      const cba = h.addTypeDef('cba');
      ccb.addParent(tc.createInstance());
      ccb.addParent(tb.createInstance());
      cac.addParent(ta.createInstance());
      cac.addParent(tc.createInstance());
      cba.addParent(tb.createInstance());
      cba.addParent(ta.createInstance());
      h.finalize();
      const coai = new ExplicitInstantiation(
          'coa',
          [
            new ExplicitInstantiation('a'),
            new ExplicitInstantiation('b'),
            new ExplicitInstantiation('c'),
          ]);
      const cobi = new ExplicitInstantiation(
          'cob',
          [
            new ExplicitInstantiation('a'),
            new ExplicitInstantiation('b'),
            new ExplicitInstantiation('c'),
          ]);
      const e = new ExplicitInstantiation(
          'coc', [ccb.createInstance(), cac.createInstance(), cba.createInstance()]);


      assertNearestCommonDescendants(
          h, [coai, cobi], [e],
          'Expected parameters to be properly reordered to match the order of the descendant');
    });

    suite('nested variances', function() {
      test('coa[coa[ta]] and cob[cob[tb]] unify to coc[coc[c]]', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'coa', [new ExplicitInstantiation(
                'coa', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'cob', [new ExplicitInstantiation(
                'cob', [new ExplicitInstantiation('tb')])]);

        const e = new ExplicitInstantiation(
            'coc', [new ExplicitInstantiation(
                'coc', [new ExplicitInstantiation('c')])]);
        assertNearestCommonDescendants(
            h, [x, y], [e],
            'Expected coa[coa[ta]] and cob[cob[tb]] to unify to coc[coc[c]]');
      });

      test('coa[cona[ta]] and cob[conb[tb]] unify to coc[conc[p]]', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'coa', [new ExplicitInstantiation(
                'cona', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'cob', [new ExplicitInstantiation(
                'conb', [new ExplicitInstantiation('tb')])]);

        const e = new ExplicitInstantiation(
            'coc', [new ExplicitInstantiation(
                'conc', [new ExplicitInstantiation('p')])]);
        assertNearestCommonDescendants(
            h, [x, y], [e],
            'Expected coa[cona[ta]] and cob[conb[tb]] to unify to coc[conc[c]]');
      });

      test('coa[inva[ta]] and cob[invb[tb]] do not unify', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'coa', [new ExplicitInstantiation(
                'inva', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'cob', [new ExplicitInstantiation(
                'invb', [new ExplicitInstantiation('tb')])]);

        assertNearestCommonDescendants(
            h, [x, y], [],
            'Expected coa[inva[ta]] and cob[invb[tb]] to not unify');
      });

      test('coa[inva[ta]] and cob[invb[ta]] unify to coc[invc[ta]]', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'coa', [new ExplicitInstantiation(
                'inva', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'cob', [new ExplicitInstantiation(
                'invb', [new ExplicitInstantiation('ta')])]);

        const e = new ExplicitInstantiation(
            'coc', [new ExplicitInstantiation(
                'invc', [new ExplicitInstantiation('ta')])]);
        assertNearestCommonDescendants(
            h, [x, y], [e],
            'Expected coa[inva[ta]] and cob[invb[ta]] to unify to coc[invc[ta]]');
      });

      test('cona[coa[ta]] and conb[cob[tb]] unify to conc[cop[p]]', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'cona', [new ExplicitInstantiation(
                'coa', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'conb', [new ExplicitInstantiation(
                'cob', [new ExplicitInstantiation('tb')])]);

        const e = new ExplicitInstantiation(
            'conc', [new ExplicitInstantiation(
                'cop', [new ExplicitInstantiation('p')])]);
        assertNearestCommonDescendants(
            h, [x, y], [e],
            'Expected cona[coa[ta]] and conb[cob[tb]] to unify to conc[cop[p]]');
      });

      test('cona[cona[ta]] and conb[cob[tb]] unify to conc[conp[c]]', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'cona', [new ExplicitInstantiation(
                'cona', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'conb', [new ExplicitInstantiation(
                'conb', [new ExplicitInstantiation('tb')])]);

        const e = new ExplicitInstantiation(
            'conc', [new ExplicitInstantiation(
                'conp', [new ExplicitInstantiation('c')])]);
        assertNearestCommonDescendants(
            h, [x, y], [e],
            'Expected cona[cona[ta]] and conb[conb[tb]] to unify to conc[conp[c]]');
      });

      test('cona[inva[ta]] and conb[invb[tb]] do not unify', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'cona', [new ExplicitInstantiation(
                'inva', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'conb', [new ExplicitInstantiation(
                'invb', [new ExplicitInstantiation('tb')])]);

        assertNearestCommonDescendants(
            h, [x, y], [],
            'Expected cona[inva[ta]] and conb[invb[tb]] to not unify');
      });

      test('cona[inva[ta]] and conb[invb[ta]] unify o conc[invp[ta]]', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'cona', [new ExplicitInstantiation(
                'inva', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'conb', [new ExplicitInstantiation(
                'invb', [new ExplicitInstantiation('ta')])]);

        const e = new ExplicitInstantiation(
            'conc', [new ExplicitInstantiation(
                'invp', [new ExplicitInstantiation('ta')])]);
        assertNearestCommonDescendants(
            h, [x, y], [e],
            'Expected cona[inva[ta]] and conb[invb[ta]] to unify to conc[invp[ta]]');
      });

      test('inva[coa[ta]] and invb[cob[tb]] do not unify', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'inva', [new ExplicitInstantiation(
                'coa', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'inva', [new ExplicitInstantiation(
                'cob', [new ExplicitInstantiation('tb')])]);

        assertNearestCommonDescendants(
            h, [x, y], [],
            'Expected inva[coa[ta]] and invb[cob[tb]] to not unify');
      });

      test('inva[cona[ta]] and invb[conb[tb]] do not unify', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'inva', [new ExplicitInstantiation(
                'cona', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'inva', [new ExplicitInstantiation(
                'conb', [new ExplicitInstantiation('tb')])]);

        assertNearestCommonDescendants(
            h, [x, y], [],
            'Expected inva[cona[ta]] and invb[conb[tb]] to not unify');
      });

      test('inva[inva[ta]] and invb[invb[tb]] do not unify', function() {
        const h = defineParameterizedHierarchy();
        const x = new ExplicitInstantiation(
            'inva', [new ExplicitInstantiation(
                'inva', [new ExplicitInstantiation('ta')])]);
        const y = new ExplicitInstantiation(
            'inva', [new ExplicitInstantiation(
                'inva', [new ExplicitInstantiation('tb')])]);

        assertNearestCommonDescendants(
            h, [x, y], [],
            'Expected inva[inva[ta]] and invb[invb[tb]] to not unify');
      });
    });
  });
});
