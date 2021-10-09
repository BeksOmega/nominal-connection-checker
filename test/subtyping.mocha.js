/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {TypeHierarchy} from '../src/type_hierarchy';
import {
  ExplicitInstantiation,
  GenericInstantiation,
  BoundsType,
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
      h.addTypeDef('p');
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
      const cd = h.addTypeDef('c');
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
  });

  suite('constrained generic subtyping', function() {
    test('generics always fulfill constrained generics', function() {
      const h = new TypeHierarchy();
      h.addTypeDef('t');
      const ti = new ExplicitInstantiation('t');
      const gi = new GenericInstantiation('g');
      const ci = new GenericInstantiation(
          'c', BoundsType.MORE_SPECIFIC_THAN, [ti]);

      assert.isTrue(
          h.typeFulfillsType(gi, ci),
          'Expected unconstrained generics to always fulfill constrained generics');
    });

    suite('explicits fulfilling constrained generics', function() {
      test('the same type fulfills a generic with an upper bound', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('t');
        const ti = new ExplicitInstantiation('t');
        const gi = new GenericInstantiation(
            'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);

        assert.isTrue(
            h.typeFulfillsType(ti, gi),
            'Expected the same type to fulfill a generic with an upper bound');
      });

      test('subtypes fulfill generis with a compatible upper bound', function() {
        const h = new TypeHierarchy();
        const td = h.addTypeDef('t');
        h.addTypeDef('p');
        const ti = new ExplicitInstantiation('t');
        const pi = new ExplicitInstantiation('p');
        const gi = new GenericInstantiation(
            'g', BoundsType.MORE_SPECIFIC_THAN, [pi]);
        td.addParent(pi);

        assert.isTrue(
            h.typeFulfillsType(ti, gi),
            'Expected a subtype to fulfill a generic with an upper bound');
      });

      test('subtypes fulfill generics with multiple compatible upper bounds',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p1');
            h.addTypeDef('p2');
            const ti = new ExplicitInstantiation('t');
            const p1i = new ExplicitInstantiation('p1');
            const p2i = new ExplicitInstantiation('p2');
            const gi = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [p1i, p2i]);
            td.addParent(p1i);
            td.addParent(p2i);

            assert.isTrue(
                h.typeFulfillsType(ti, gi),
                'Expected a subtype to fulfill a generic with multiple compatible upper bounds');
          });

      test('subtypes do not fulfill generics with some incompatible upper bounds',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p1');
            h.addTypeDef('p2');
            const ti = new ExplicitInstantiation('t');
            const p1i = new ExplicitInstantiation('p1');
            const p2i = new ExplicitInstantiation('p2');
            const gi = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [p1i, p2i]);
            td.addParent(p1i);

            assert.isFalse(
                h.typeFulfillsType(ti, gi),
                'Expected a subtype to not fulfill a generic with some incompatible upper bounds');
          });

      test('supertypes do not fulfill generics with an upper bound', function() {
        const h = new TypeHierarchy();
        const td = h.addTypeDef('t');
        h.addTypeDef('p');
        const ti = new ExplicitInstantiation('t');
        const pi = new ExplicitInstantiation('p');
        const gi = new GenericInstantiation(
            'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);
        td.addParent(pi);

        assert.isFalse(
            h.typeFulfillsType(pi, gi),
            'Expected a supertype to not fulfill a generic with an upper bound');
      });

      test('unrelated types do not fulfill generics with an upper bound',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            h.addTypeDef('u');
            const ti = new ExplicitInstantiation('t');
            const ui = new ExplicitInstantiation('u');
            const gi = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);

            assert.isFalse(
                h.typeFulfillsType(ui, gi),
                'Expected an unrelated type to not fulfill a generic with an upper bound');
          });

      test('the same type fulfills a generic with a lower bound', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('t');
        const ti = new ExplicitInstantiation('t');
        const gi = new GenericInstantiation(
            'g', BoundsType.MORE_GENERAL_THAN, [ti]);

        assert.isTrue(
            h.typeFulfillsType(ti, gi),
            'Expected the same type to fulfill a generic with a lower bound');
      });

      test('supertypes fulfill generis with a compatible lower bound', function() {
        const h = new TypeHierarchy();
        const td = h.addTypeDef('t');
        h.addTypeDef('p');
        const ti = new ExplicitInstantiation('t');
        const pi = new ExplicitInstantiation('p');
        const gi = new GenericInstantiation(
            'g', BoundsType.MORE_GENERAL_THAN, [ti]);
        td.addParent(pi);

        assert.isTrue(
            h.typeFulfillsType(pi, gi),
            'Expected a supertype to fulfill a generic with a lower bound');
      });

      test('supertypes fulfill generics with multiple compatible lower bounds',
          function() {
            const h = new TypeHierarchy();
            const t1d = h.addTypeDef('t1');
            const t2d = h.addTypeDef('t2');
            h.addTypeDef('p');
            const t1i = new ExplicitInstantiation('t1');
            const t2i = new ExplicitInstantiation('t2');
            const pi = new ExplicitInstantiation('p');
            const gi = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t1i, t2i]);
            t1d.addParent(pi);
            t2d.addParent(pi);

            assert.isTrue(
                h.typeFulfillsType(pi, gi),
                'Expected a supertype to fulfill a generic with multiple compatible lower bounds');
          });

      test('supertypes do not fulfill generics with some incompatible lower bounds',
          function() {
            const h = new TypeHierarchy();
            const t1d = h.addTypeDef('t1');
            h.addTypeDef('t2');
            h.addTypeDef('p');
            const t1i = new ExplicitInstantiation('t1');
            const t2i = new ExplicitInstantiation('t2');
            const pi = new ExplicitInstantiation('p');
            const gi = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t1i, t2i]);
            t1d.addParent(pi);

            assert.isFalse(
                h.typeFulfillsType(pi, gi),
                'Expected a supertype to not fulfill a generic with some incompatible lower bounds');
          });

      test('subtypes do not fulfill generics with an lower bound', function() {
        const h = new TypeHierarchy();
        const td = h.addTypeDef('t');
        h.addTypeDef('p');
        const ti = new ExplicitInstantiation('t');
        const pi = new ExplicitInstantiation('p');
        const gi = new GenericInstantiation(
            'g', BoundsType.MORE_GENERAL_THAN, [pi]);
        td.addParent(pi);

        assert.isFalse(
            h.typeFulfillsType(ti, gi),
            'Expected a subype to not fulfill a generic with an lower bound');
      });

      test('unrelated types do not fulfill generics with an lower bound',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            h.addTypeDef('u');
            const ti = new ExplicitInstantiation('t');
            const ui = new ExplicitInstantiation('u');
            const gi = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [ti]);

            assert.isTrue(
                h.typeFulfillsType(ui, gi),
                'Expected an unrelated type to not fulfill a generic with a lower bound');
          });
    });

    suite('constrained generics fulfilling each other', function() {
      test('generics with identical upper bounds fulfill each other',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const ti = new ExplicitInstantiation('t');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with identical upper bounds to fulfill each other');
          });

      test('generics with one upper bound lower than the other fulfill each other',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p');
            const ti = new ExplicitInstantiation('t');
            const pi = new ExplicitInstantiation('p');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [ti]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [pi]);
            td.addParent(pi);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with one upper bound lower than the other to fulfill each other');
          });

      test('generics with upper bounds that share children fulfill each other',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p1');
            h.addTypeDef('p2');
            const p1i = new ExplicitInstantiation('p1');
            const p2i = new ExplicitInstantiation('p2');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [p1i]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [p2i]);
            td.addParent(p1i);
            td.addParent(p2i);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with upper bounds that share children to fulfill each other');
          });

      test('generics with unrelated upper bounds do not fulfill each other',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t1');
            h.addTypeDef('t2');
            const t1i = new ExplicitInstantiation('t1');
            const t2i = new ExplicitInstantiation('t2');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [t1i]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [t2i]);

            assert.isFalse(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with unrelated upper bounds to not fulfill each other');
          });

      test('T <: Animal & <: Flier fulfills G <: Mammal', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('Animal');
        h.addTypeDef('Flier');
        const mammald = h.addTypeDef('Mammal');
        const birdd = h.addTypeDef('Bird');
        const batd = h.addTypeDef('Bat');
        const animali = new ExplicitInstantiation('Animal');
        const flieri = new ExplicitInstantiation('Flier');
        const mammali = new ExplicitInstantiation('Mammal');
        const t = new GenericInstantiation(
            't', BoundsType.MORE_SPECIFIC_THAN, [animali, flieri]);
        const g = new GenericInstantiation(
            'g', BoundsType.MORE_SPECIFIC_THAN, [mammali]);
        birdd.addParent(animali);
        birdd.addParent(flieri);
        mammald.addParent(animali);
        batd.addParent(mammali);
        batd.addParent(flieri);

        assert.isTrue(
            h.typeFulfillsType(t, g),
            'Expected T <: Animal & <: Flier to fulfill G <: Mammal');
      });

      test('T <: Mammal fulfills G <: Animal & <: Flier', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('Animal');
        h.addTypeDef('Flier');
        const mammald = h.addTypeDef('Mammal');
        const birdd = h.addTypeDef('Bird');
        const batd = h.addTypeDef('Bat');
        const animali = new ExplicitInstantiation('Animal');
        const flieri = new ExplicitInstantiation('Flier');
        const mammali = new ExplicitInstantiation('Mammal');
        const t = new GenericInstantiation(
            't', BoundsType.MORE_SPECIFIC_THAN, [mammali]);
        const g = new GenericInstantiation(
            'g', BoundsType.MORE_SPECIFIC_THAN, [animali, flieri]);
        birdd.addParent(animali);
        birdd.addParent(flieri);
        mammald.addParent(animali);
        batd.addParent(mammali);
        batd.addParent(flieri);

        assert.isTrue(
            h.typeFulfillsType(t, g),
            'Expected T <: Mammal to fulfill G <: Animal & Flier');
      });

      test('generics with identical lower bounds fulfill each other',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t');
            const ti = new ExplicitInstantiation('t');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [ti]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [ti]);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with identical lower bounds to fulfill each other');
          });

      test('generics with one lower bound higher than the other fulfill each other',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p');
            const ti = new ExplicitInstantiation('t');
            const pi = new ExplicitInstantiation('p');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [ti]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [pi]);
            td.addParent(pi);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with one lower bound higher than the other to fulfill each other');
          });

      test('generics with lower bounds that share parents fulfill each other',
          function() {
            const h = new TypeHierarchy();
            const t1d = h.addTypeDef('t1');
            const t2d = h.addTypeDef('t2');
            h.addTypeDef('p');
            const t1i = new ExplicitInstantiation('t1i');
            const t2i = new ExplicitInstantiation('t2i');
            const pi = new ExplicitInstantiation('p');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t1i]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t2i]);
            t1d.addParent(pi);
            t2d.addParent(pi);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with lower bounds that share parents to fulfill each other');
          });

      test('generics with unrelated lower bounds do not fulfill each other',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('t1');
            h.addTypeDef('t2');
            const t1i = new ExplicitInstantiation('t1');
            const t2i = new ExplicitInstantiation('t2');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t1i]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t2i]);

            assert.isFalse(
                h.typeFulfillsType(gi1, gi2),
                'Expected generics with unrelated lower bounds to not fulfill each other');
          });

      test('generic with a lower bound lower than a generic with an upper bound fulfills the generic',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p');
            const ti = new ExplicitInstantiation('t');
            const pi = new ExplicitInstantiation('p');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [ti]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [pi]);
            td.addParent(pi);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected a generic with a lower bound lower than a generic with an upperbound to fulfill the generic');
          });

      test('generic with a lower bound compatible with both of the upper bounds fulfills the generic',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p1');
            h.addTypeDef('p2');
            const ti = new ExplicitInstantiation('t');
            const p1i = new ExplicitInstantiation('p1');
            const p2i = new ExplicitInstantiation('p2');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [ti]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [p1i, p2i]);
            td.addParent(p1i);
            td.addParent(p2i);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected a generic with a lower bound compatible with both of the upper bounds to fulfill the generic');
          });

      test('generic with an upper bound compatible with both of the lower bounds fulfills the generic',
          function() {
            const h = new TypeHierarchy();
            const t1d = h.addTypeDef('t1');
            const t2d = h.addTypeDef('t2');
            h.addTypeDef('p');
            const t1i = new ExplicitInstantiation('t1');
            const t2i = new ExplicitInstantiation('t2');
            const pi = new ExplicitInstantiation('p');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t1i, t2i]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [pi]);
            t1d.addParent(pi);
            t2d.addParent(pi);

            assert.isTrue(
                h.typeFulfillsType(gi1, gi2),
                'Expected a generic an upper bound compatible with bth of the lower bounds to fulfill the generic');
          });

      test('generic with a lower bound incompatible with one of the upper bounds does not fulfill the generic',
          function() {
            const h = new TypeHierarchy();
            const td = h.addTypeDef('t');
            h.addTypeDef('p1');
            h.addTypeDef('p2');
            const ti = new ExplicitInstantiation('t');
            const p1i = new ExplicitInstantiation('p1');
            const p2i = new ExplicitInstantiation('p2');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [ti]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [p1i, p2i]);
            td.addParent(p1i);

            assert.isFalse(
                h.typeFulfillsType(gi1, gi2),
                'Expected a generic with a lower bound incompatible with one of the upperbounds to not fulfill the generic');
          });

      test('generic with an upper bound incompatible with one of the lower bounds does not fulfill the generic',
          function() {
            const h = new TypeHierarchy();
            const t1d = h.addTypeDef('t1');
            h.addTypeDef('t2');
            h.addTypeDef('p');
            const t1i = new ExplicitInstantiation('t1');
            const t2i = new ExplicitInstantiation('t2');
            const pi = new ExplicitInstantiation('p');
            const gi1 = new GenericInstantiation(
                'g', BoundsType.MORE_GENERAL_THAN, [t1i, t2i]);
            const gi2 = new GenericInstantiation(
                'g', BoundsType.MORE_SPECIFIC_THAN, [pi]);
            t1d.addParent(pi);

            assert.isFalse(
                h.typeFulfillsType(gi1, gi2),
                'Expected a generic an upper bound incompatible with one of the lower bounds to not fulfill the generic');
          });
    });
  });
});
