/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {ExplicitInstantiation, GenericInstantiation} from '../src/type_instantiation';
import {IncompatibleType} from '../src/exceptions';
import {ParameterDefinition, Variance} from '../src/parameter_definition';
import {TypeHierarchy} from '../src/type_hierarchy';
import {assert} from 'chai';

suite('Subtyping', function() {
  test('invalid type throws', function() {
    const h = new TypeHierarchy();
    const ti1 = new ExplicitInstantiation('t');
    const ti2 = new ExplicitInstantiation('t');
    h.finalize();

    assert.throws(
        () => h.typeFulfillsType(ti1, ti2),
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
        () => h.typeFulfillsType(ti, gi),
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
        () => h.typeFulfillsType(ti, gi),
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
        () => h.typeFulfillsType(ti, gi),
        /The type instance .* is incompatible with the given TypeHierarchy/,
        IncompatibleType);
  });

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
      const ci = new GenericInstantiation('c', [], [ti]);

      assert.isTrue(
          h.typeFulfillsType(gi, ci),
          'Expected unconstrained generics to always fulfill constrained generics');
    });

    suite('explicits fulfilling constrained generics', function() {
      test('the same type fulfills a generic with an upper bound', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('t');
        const ti = new ExplicitInstantiation('t');
        const gi = new GenericInstantiation('g', [], [ti]);

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
        const gi = new GenericInstantiation('g', [], [pi]);
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
            const gi = new GenericInstantiation('g', [], [p1i, p2i]);
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
            const gi = new GenericInstantiation('g', [], [p1i, p2i]);
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
        const gi = new GenericInstantiation('g', [], [ti]);
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
            const gi = new GenericInstantiation('g', [], [ti]);

            assert.isFalse(
                h.typeFulfillsType(ui, gi),
                'Expected an unrelated type to not fulfill a generic with an upper bound');
          });

      test('the same type fulfills a generic with a lower bound', function() {
        const h = new TypeHierarchy();
        h.addTypeDef('t');
        const ti = new ExplicitInstantiation('t');
        const gi = new GenericInstantiation('g', [ti]);

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
        const gi = new GenericInstantiation('g', [ti]);
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
            const gi = new GenericInstantiation('g', [t1i, t2i]);
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
            const gi = new GenericInstantiation('g', [t1i, t2i]);
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
        const gi = new GenericInstantiation('g', [pi]);
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
            const gi = new GenericInstantiation('g', [ti]);

            assert.isFalse(
                h.typeFulfillsType(ui, gi),
                'Expected an unrelated type to not fulfill a generic with a lower bound');
          });

      test('middling types fulfill generics with upper and lower bounds',
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
                h.typeFulfillsType(ti, gi),
                'Expected a middling type to fulfill a generic with an upper and lower bound');
          });

      test('types that only fulfill the upper bound do not fulfill generics with upper and lower bounds',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            const ud = h.addTypeDef('u');
            const cd = h.addTypeDef('c');
            const pi = new ExplicitInstantiation('p');
            const ti = new ExplicitInstantiation('t');
            const ui = new ExplicitInstantiation('u');
            const ci = new ExplicitInstantiation('c');
            td.addParent(pi);
            ud.addParent(pi);
            cd.addParent(ti);
            const gi = new GenericInstantiation('g', [ci], [pi]);
            h.finalize();

            assert.isFalse(
                h.typeFulfillsType(ui, gi),
                'Expected a type that only fulfills the lower bound to not fulfill a genreic with an upper and lower bound');
          });

      test('types that only fulfill the lower bound do not fulfill generics with upper and lower bounds',
          function() {
            const h = new TypeHierarchy();
            h.addTypeDef('p');
            const td = h.addTypeDef('t');
            h.addTypeDef('u');
            const cd = h.addTypeDef('c');
            const pi = new ExplicitInstantiation('p');
            const ti = new ExplicitInstantiation('t');
            const ui = new ExplicitInstantiation('u');
            const ci = new ExplicitInstantiation('c');
            td.addParent(pi);
            cd.addParent(ti);
            cd.addParent(ui);
            const gi = new GenericInstantiation('g', [ci], [pi]);
            h.finalize();

            assert.isFalse(
                h.typeFulfillsType(ui, gi),
                'Expected a type that only fulfills the lower bound to not fulfill a genreic with an upper and lower bound');
          });

      suite('generic bounds', function() {
        test('all types fulfill generics with generic bounds', function() {
          const h = new TypeHierarchy();
          const t = h.addTypeDef('t');
          const gi = new GenericInstantiation(
              'g', [], [new GenericInstantiation('h')]);

          assert.isTrue(
              h.typeFulfillsType(t.createInstance(), gi),
              'Expected any type to fulfill a generic with a generic constraint');
        });

        test('generic bounds are ignored', function() {
          const h = new TypeHierarchy();
          const t = h.addTypeDef('t');
          const gi = new GenericInstantiation(
              'g', [], [new GenericInstantiation('h'), t.createInstance]);

          assert.isTrue(
              h.typeFulfillsType(t.createInstance(), gi),
              'Expected generic bounds to be ignored');
        });
      });

      suite('explicit parameterized types fulfilling constrained generics',
          function() {
            function defineHierarchy() {
              const h = new TypeHierarchy();
              const coParam = new ParameterDefinition('co', Variance.CO);
              const conParam = new ParameterDefinition('con', Variance.CONTRA);
              const invParam = new ParameterDefinition('inv', Variance.INV);
              const cop = h.addTypeDef('cop', [coParam]);
              const co = h.addTypeDef('co', [coParam]);
              const coc = h.addTypeDef('coc', [coParam]);
              const contrap = h.addTypeDef('contrap', [conParam]);
              const contra = h.addTypeDef('contra', [conParam]);
              const contrac = h.addTypeDef('contrac', [conParam]);
              h.addTypeDef('inv', [invParam]);
              coc.addParent(co.createInstance());
              co.addParent(cop.createInstance());
              contrac.addParent(contra.createInstance());
              contra.addParent(contrap.createInstance());
              const p = h.addTypeDef('parent');
              const t = h.addTypeDef('type');
              const c = h.addTypeDef('child');
              c.addParent(t.createInstance());
              t.addParent(p.createInstance());
              h.finalize();
              return h;
            }

            test('coc[c] fulfills T <: co[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'coc', [new ExplicitInstantiation('child')]);
              const t2 = new GenericInstantiation(
                  't', [], [new ExplicitInstantiation(
                      'co', [new ExplicitInstantiation('type')])]);

              assert.isTrue(
                  h.typeFulfillsType(t1, t2),
                  'Expected coc[c] to fulfill T <: co[t]');
            });

            test('cop[p] fulfills T >: co[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'cop', [new ExplicitInstantiation('parent')]);
              const t2 = new GenericInstantiation(
                  't', [new ExplicitInstantiation(
                      'co', [new ExplicitInstantiation('type')])]);

              assert.isTrue(
                  h.typeFulfillsType(t1, t2),
                  'Expected coc[c] to fulfill T >: co[t]');
            });

            test('conc[p] fulfills T <: con[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'contrac', [new ExplicitInstantiation('parent')]);
              const t2 = new GenericInstantiation(
                  't', [], [new ExplicitInstantiation(
                      'contra', [new ExplicitInstantiation('type')])]);

              assert.isTrue(
                  h.typeFulfillsType(t1, t2),
                  'Expected conc[p] to fulfill T <: con[t]');
            });

            test('conp[c] fulfills T >: con[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'contrap', [new ExplicitInstantiation('child')]);
              const t2 = new GenericInstantiation(
                  't', [new ExplicitInstantiation(
                      'contra', [new ExplicitInstantiation('type')])]);

              assert.isTrue(
                  h.typeFulfillsType(t1, t2),
                  'Expected conp[c] to fulfill T >: con[t]');
            });

            test('inv[t] fulfills T <: inv[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'inv', [new ExplicitInstantiation('type')]);
              const t2 = new GenericInstantiation(
                  't', [], [new ExplicitInstantiation(
                      'inv', [new ExplicitInstantiation('type')])]);

              assert.isTrue(
                  h.typeFulfillsType(t1, t2),
                  'Expected inv[t] to fulfill T <: inv[t]');
            });

            test('inv[c] does not fulfill T <: inv[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'inv', [new ExplicitInstantiation('child')]);
              const t2 = new GenericInstantiation(
                  't', [], [new ExplicitInstantiation(
                      'inv', [new ExplicitInstantiation('type')])]);

              assert.isFalse(
                  h.typeFulfillsType(t1, t2),
                  'Expected inv[child] to not fulfill T <: inv[t]');
            });

            test('inv[p] does not fulfill T <: inv[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'inv', [new ExplicitInstantiation('parent')]);
              const t2 = new GenericInstantiation(
                  't', [], [new ExplicitInstantiation(
                      'inv', [new ExplicitInstantiation('type')])]);

              assert.isFalse(
                  h.typeFulfillsType(t1, t2),
                  'Expected inv[parent] to not fulfill T <: inv[t]');
            });

            test('inv[t] fulfills T >: inv[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'inv', [new ExplicitInstantiation('type')]);
              const t2 = new GenericInstantiation(
                  't', [new ExplicitInstantiation(
                      'inv', [new ExplicitInstantiation('type')])]);

              assert.isTrue(
                  h.typeFulfillsType(t1, t2),
                  'Expected inv[t] to fulfill T >: inv[t]');
            });

            test('inv[c] does not fulfill T >: inv[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'inv', [new ExplicitInstantiation('child')]);
              const t2 = new GenericInstantiation(
                  't', [new ExplicitInstantiation(
                      'inv', [new ExplicitInstantiation('type')])]);

              assert.isFalse(
                  h.typeFulfillsType(t1, t2),
                  'Expected inv[child] to not fulfill T >: inv[t]');
            });

            test('inv[p] does not fulfill T >: inv[t]', function() {
              const h = defineHierarchy();
              const t1 = new ExplicitInstantiation(
                  'inv', [new ExplicitInstantiation('parent')]);
              const t2 = new GenericInstantiation(
                  't', [new ExplicitInstantiation(
                      'inv', [new ExplicitInstantiation('type')])]);

              assert.isFalse(
                  h.typeFulfillsType(t1, t2),
                  'Expected inv[parent] to not fulfill T >: inv[t]');
            });
          });
    });

    suite('constrained generics fulfilling each other', function() {
      suite('basic relations', function() {
        function defineHierarchy() {
          const h = new TypeHierarchy();
          const animal = h.addTypeDef('animal');
          const mammal = h.addTypeDef('mammal');
          const dog = h.addTypeDef('dog');
          dog.addParent(mammal.createInstance());
          mammal.addParent(animal.createInstance());
          h.finalize();
          return h;
        }

        test('T <: Mammal fulfills T <: Animal', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('animal')]);

          assert.isTrue(
              h.typeFulfillsType(t1, t2),
              'Expected T <: Mammal to fulfill T <: Animal');
        });

        test('T >: Mammal fulfills T <: Animal', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('animal')]);

          assert.isTrue(
              h.typeFulfillsType(t1, t2),
              'Expected T >: Mammal to fulfill T <: Animal');
        });

        test('T <: Mammal fulfills T <: Dog', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('dog')]);

          assert.isTrue(
              h.typeFulfillsType(t1, t2),
              'Expected T <: Mammal to fulfill T <: dog');
        });

        test('T >: Mammal does not fulfill T <: Dog', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('dog')]);

          assert.isFalse(
              h.typeFulfillsType(t1, t2),
              'Expected T >: Mammal to fulfill T <: dog');
        });

        test('T <: Mammal does not fulfill T >: Animal', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [new ExplicitInstantiation('animal')]);

          assert.isFalse(
              h.typeFulfillsType(t1, t2),
              'Expected T <: Mammal to fulfill T >: Animal');
        });

        test('T >: Mammal fulfills T >: Animal', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [new ExplicitInstantiation('animal')]);

          assert.isTrue(
              h.typeFulfillsType(t1, t2),
              'Expected T >: Mammal to fulfill T >: Animal');
        });

        test('T <: Mammal fulfills T >: Dog', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [], [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [new ExplicitInstantiation('dog')]);

          assert.isTrue(
              h.typeFulfillsType(t1, t2),
              'Expected T <: Mammal to fulfill T >: dog');
        });

        test('T >: Mammal fulfills T >: Dog', function() {
          const h = defineHierarchy();
          const t1 = new GenericInstantiation(
              't', [new ExplicitInstantiation('mammal')]);
          const t2 = new GenericInstantiation(
              't', [new ExplicitInstantiation('dog')]);

          assert.isTrue(
              h.typeFulfillsType(t1, t2),
              'Expected T >: Mammal to fulfill T >: dog');
        });
      });

      suite('upper bounds', function() {
        test('generics with identical upper bounds fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('t');
              const ti = new ExplicitInstantiation('t');
              const gi1 = new GenericInstantiation('g', [], [ti]);
              const gi2 = new GenericInstantiation('g', [], [ti]);
              h.finalize();

              assert.isTrue(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected generics with identical upper bounds to fulfill each other');
            });

        test('generics with upper bounds that share children fulfill each other',
            function() {
              const h = new TypeHierarchy();
              const t1d = h.addTypeDef('t1');
              const t2d = h.addTypeDef('t2');
              const cd = h.addTypeDef('c');
              const gi1 = new GenericInstantiation('g', [], [t1d.createInstance()]);
              const gi2 = new GenericInstantiation('g', [], [t2d.createInstance()]);
              cd.addParent(t1d.createInstance());
              cd.addParent(t2d.createInstance());
              h.finalize();

              assert.isTrue(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected generics with upper bounds that share children to fulfill each other');
            });

        test('generics with upper bounds that share parents do not fulfill each other', function() {
          const h = new TypeHierarchy();
          const t1d = h.addTypeDef('t1');
          const t2d = h.addTypeDef('t2');
          const p = h.addTypeDef('p');
          const gi1 = new GenericInstantiation('g', [], [t1d.createInstance()]);
          const gi2 = new GenericInstantiation('g', [], [t2d.createInstance()]);
          t1d.addParent(p.createInstance());
          t2d.addParent(p.createInstance());
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(gi1, gi2),
              'Expected generics with upper bounds that share parents to not fulfill each other');
        });

        test('generics with unrelated upper bounds do not fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('t1');
              h.addTypeDef('t2');
              const t1i = new ExplicitInstantiation('t1');
              const t2i = new ExplicitInstantiation('t2');
              const gi1 = new GenericInstantiation('g', [], [t1i]);
              const gi2 = new GenericInstantiation('g', [], [t2i]);
              h.finalize();

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
          const t = new GenericInstantiation('t', [], [animali, flieri]);
          const g = new GenericInstantiation('g', [], [mammali]);
          birdd.addParent(animali);
          birdd.addParent(flieri);
          mammald.addParent(animali);
          batd.addParent(mammali);
          batd.addParent(flieri);
          h.finalize();

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
          const t = new GenericInstantiation('t', [], [mammali]);
          const g = new GenericInstantiation('g', [], [animali, flieri]);
          birdd.addParent(animali);
          birdd.addParent(flieri);
          mammald.addParent(animali);
          batd.addParent(mammali);
          batd.addParent(flieri);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(t, g),
              'Expected T <: Mammal to fulfill G <: Animal & Flier');
        });
      });

      suite('lower bounds', function() {
        test('generics with identical lower bounds fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('t');
              const ti = new ExplicitInstantiation('t');
              const gi1 = new GenericInstantiation('g', [ti]);
              const gi2 = new GenericInstantiation('g', [ti]);
              h.finalize();

              assert.isTrue(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected generics with identical lower bounds to fulfill each other');
            });

        test('generics with lower bounds that share parents fulfill each other',
            function() {
              const h = new TypeHierarchy();
              const t1d = h.addTypeDef('t1');
              const t2d = h.addTypeDef('t2');
              h.addTypeDef('p');
              const t1i = new ExplicitInstantiation('t1');
              const t2i = new ExplicitInstantiation('t2');
              const pi = new ExplicitInstantiation('p');
              const gi1 = new GenericInstantiation('g', [t1i]);
              const gi2 = new GenericInstantiation('g', [t2i]);
              t1d.addParent(pi);
              t2d.addParent(pi);
              h.finalize();

              assert.isTrue(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected generics with lower bounds that share parents to fulfill each other');
            });

        test('generics with lower bounds that share children do not fulfill each other',
            function() {
              const h = new TypeHierarchy();
              const t1d = h.addTypeDef('t1');
              const t2d = h.addTypeDef('t2');
              const cd = h.addTypeDef('c');
              const gi1 = new GenericInstantiation('g', [t1d.createInstance()]);
              const gi2 = new GenericInstantiation('g', [t2d.createInstance()]);
              cd.addParent(t1d.createInstance());
              cd.addParent(t2d.createInstance());
              h.finalize();

              assert.isFalse(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected generics with lower bounds that share children to not fulfill each other');
            });

        test('generics with unrelated lower bounds do not fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('t1');
              h.addTypeDef('t2');
              const t1i = new ExplicitInstantiation('t1');
              const t2i = new ExplicitInstantiation('t2');
              const gi1 = new GenericInstantiation('g', [t1i]);
              const gi2 = new GenericInstantiation('g', [t2i]);
              h.finalize();

              assert.isFalse(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected generics with unrelated lower bounds to not fulfill each other');
            });
      });

      suite('multiple bounds', function() {
        test('generic with a lower bound lower than a generic with an upper bound fulfills the generic',
            function() {
              const h = new TypeHierarchy();
              const td = h.addTypeDef('t');
              h.addTypeDef('p');
              const ti = new ExplicitInstantiation('t');
              const pi = new ExplicitInstantiation('p');
              const gi1 = new GenericInstantiation('g', [ti]);
              const gi2 = new GenericInstantiation('g', [pi]);
              td.addParent(pi);
              h.finalize();

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
              const gi1 = new GenericInstantiation('g', [ti]);
              const gi2 = new GenericInstantiation('g', [], [p1i, p2i]);
              td.addParent(p1i);
              td.addParent(p2i);
              h.finalize();

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
              const gi1 = new GenericInstantiation('g', [t1i, t2i]);
              const gi2 = new GenericInstantiation('g', [], [pi]);
              t1d.addParent(pi);
              t2d.addParent(pi);
              h.finalize();

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
              const gi1 = new GenericInstantiation('g', [ti]);
              const gi2 = new GenericInstantiation('g', [], [p1i, p2i]);
              td.addParent(p1i);
              h.finalize();

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
              const gi1 = new GenericInstantiation('g', [t1i, t2i]);
              const gi2 = new GenericInstantiation('g', [], [pi]);
              t1d.addParent(pi);
              h.finalize();

              assert.isFalse(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected a generic an upper bound incompatible with one of the lower bounds to not fulfill the generic');
            });
      });

      suite('ranges', function() {
        test('generics with ranges fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('gp');
              const pd = h.addTypeDef('p');
              const td = h.addTypeDef('t');
              const cd = h.addTypeDef('c');
              const gcd = h.addTypeDef('gc');
              const gpi1 = new ExplicitInstantiation('gp');
              const gpi2 = new ExplicitInstantiation('gp');
              const pi = new ExplicitInstantiation('p');
              const ti = new ExplicitInstantiation('t');
              const ci = new ExplicitInstantiation('c');
              const gci1 = new ExplicitInstantiation('gc');
              const gci2 = new ExplicitInstantiation('gc');
              pd.addParent(gpi1);
              td.addParent(pi);
              cd.addParent(ti);
              gcd.addParent(ci);
              const gi1 = new GenericInstantiation('g', [gci1], [gpi1]);
              const gi2 = new GenericInstantiation('g', [gci2], [gpi2]);
              h.finalize();

              assert.isTrue(
                  h.typeFulfillsType(gi1, gi2),
                  'Expected generics with identical upper and lower bounds to fulfill each other');
            });

        test('generics with ranges where one encloses the other fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('gp');
              const pd = h.addTypeDef('p');
              const td = h.addTypeDef('t');
              const cd = h.addTypeDef('c');
              const gcd = h.addTypeDef('gc');
              const gpi = new ExplicitInstantiation('gp');
              const pi = new ExplicitInstantiation('p');
              const ti = new ExplicitInstantiation('t');
              const ci = new ExplicitInstantiation('c');
              const gci = new ExplicitInstantiation('gc');
              pd.addParent(gpi);
              td.addParent(pi);
              cd.addParent(ti);
              gcd.addParent(ci);
              const gi = new GenericInstantiation('g', [gci], [gpi]);
              const hi = new GenericInstantiation('h', [ci], [pi]);
              h.finalize();

              assert.isTrue(
                  h.typeFulfillsType(gi, hi),
                  'Expected generics with upper ad lower bounds where one encloses the other to fulfill each other');
            });

        test('generics with ranges that intersect fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('gp');
              const pd = h.addTypeDef('p');
              const td = h.addTypeDef('t');
              const cd = h.addTypeDef('c');
              const gcd = h.addTypeDef('gc');
              const gpi = new ExplicitInstantiation('gp');
              const pi = new ExplicitInstantiation('p');
              const ti = new ExplicitInstantiation('t');
              const ci = new ExplicitInstantiation('c');
              const gci = new ExplicitInstantiation('gc');
              pd.addParent(gpi);
              td.addParent(pi);
              cd.addParent(ti);
              gcd.addParent(ci);
              const gi = new GenericInstantiation('g', [ci], [gpi]);
              const hi = new GenericInstantiation('h', [gci], [pi]);
              h.finalize();

              assert.isTrue(
                  h.typeFulfillsType(gi, hi),
                  'Expected generics with upper and lower bounds that intersect to fulfill each other');
            });

        test('generic with ranges that do not intersect do not fulfill each other',
            function() {
              const h = new TypeHierarchy();
              h.addTypeDef('gp');
              const pd = h.addTypeDef('p');
              const td = h.addTypeDef('t');
              const cd = h.addTypeDef('c');
              const gcd = h.addTypeDef('gc');
              const gpi = new ExplicitInstantiation('gp');
              const pi = new ExplicitInstantiation('p');
              const ti = new ExplicitInstantiation('t');
              const ci = new ExplicitInstantiation('c');
              const gci = new ExplicitInstantiation('gc');
              pd.addParent(gpi);
              td.addParent(pi);
              cd.addParent(ti);
              gcd.addParent(ci);
              const gi = new GenericInstantiation('g', [gci], [ci]);
              const hi = new GenericInstantiation('h', [pi], [gpi]);
              h.finalize();

              assert.isFalse(
                  h.typeFulfillsType(gi, hi),
                  'Expected generics with upper and lower bounds that do not intersect to not fulfill each other');
            });
      });

      suite('generic bounds', function() {
        test('generics with generic bounds fulfilling eachother', function() {
          const h = new TypeHierarchy();
          h.addTypeDef('t');
          const gi1 = new GenericInstantiation(
              'g', [], [new GenericInstantiation('h')]);
          const gi2 = new GenericInstantiation(
              'g', [], [new GenericInstantiation('i')]);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(gi1, gi2),
              'Expected generics with generic bounds to fulfill eachother');
        });

        test('generic bounds are ignored', function() {
          const h = new TypeHierarchy();
          h.addTypeDef('t');
          const ti = new ExplicitInstantiation('t');
          const gi1 = new GenericInstantiation(
              'g', [], [ti, new GenericInstantiation('h')]);
          const gi2 = new GenericInstantiation(
              'g', [], [new GenericInstantiation('i'), ti]);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(gi1, gi2),
              'Expected generic bounds to be ignored');
        });
      });
    });

    suite('constrained generics fulfilling explicits', function() {
      function defineHierarchy() {
        const h = new TypeHierarchy();
        const animal = h.addTypeDef('animal');
        const mammal = h.addTypeDef('mammal');
        const dog = h.addTypeDef('dog');
        dog.addParent(mammal.createInstance());
        mammal.addParent(animal.createInstance());
        h.finalize();
        return h;
      }

      function defineHierarchy2() {
        const h = new TypeHierarchy();
        const gp = h.addTypeDef('GrandParent');
        const p = h.addTypeDef('Parent');
        const t = h.addTypeDef('Type');
        const c = h.addTypeDef('Child');
        const gc = h.addTypeDef('GrandChild');
        gc.addParent(c.createInstance());
        c.addParent(t.createInstance());
        t.addParent(p.createInstance());
        p.addParent(gp.createInstance());
        h.finalize();
        return h;
      }

      test('T <: Mammal fulfills Animal', function() {
        const h = defineHierarchy();
        const t = new GenericInstantiation(
            't', [], [new ExplicitInstantiation('mammal')]);
        const dog = new ExplicitInstantiation('animal');

        assert.isTrue(
            h.typeFulfillsType(t, dog),
            'Expected T <: Mammal to fulfill Animal');
      });

      test('T >: Mammal fulfills Animal', function() {
        const h = defineHierarchy();
        const t = new GenericInstantiation(
            't', [new ExplicitInstantiation('mammal')]);
        const dog = new ExplicitInstantiation('animal');

        assert.isTrue(
            h.typeFulfillsType(t, dog),
            'Expected T >: Mammal to fulfill Animal');
      });

      test('T <: Mammal fulfills Dog', function() {
        const h = defineHierarchy();
        const t = new GenericInstantiation(
            't', [], [new ExplicitInstantiation('mammal')]);
        const dog = new ExplicitInstantiation('dog');

        assert.isTrue(
            h.typeFulfillsType(t, dog),
            'Expected T <: Mammal to fulfill Dog');
      });

      test('T >: Mammal does not fulfill  Dog', function() {
        const h = defineHierarchy();
        const t = new GenericInstantiation(
            't', [new ExplicitInstantiation('mammal')]);
        const dog = new ExplicitInstantiation('dog');

        assert.isFalse(
            h.typeFulfillsType(t, dog),
            'Expected T >: Mammal to fulfill Dog');
      });

      test('Child <: T <: Parent fulfills GrandParent', function() {
        const h = defineHierarchy2();
        const t = new GenericInstantiation(
            'k',
            [new ExplicitInstantiation('Child')],
            [new ExplicitInstantiation('Parent')]);
        const gp = new ExplicitInstantiation('GrandParent');

        assert.isTrue(
            h.typeFulfillsType(t, gp),
            'Expected Child <: T <: Parent to fulfill GrandParent');
      });

      test('Child <: T <: Parent fulfills Type', function() {
        const h = defineHierarchy2();
        const t = new GenericInstantiation(
            'k',
            [new ExplicitInstantiation('Child')],
            [new ExplicitInstantiation('Parent')]);
        const type = new ExplicitInstantiation('Type');

        assert.isTrue(
            h.typeFulfillsType(t, type),
            'Expected Child <: T <: Parent to fulfill Type');
      });

      test('Child <: T <: Parent does not fulfill GrandChild', function() {
        const h = defineHierarchy2();
        const t = new GenericInstantiation(
            'k',
            [new ExplicitInstantiation('Child')],
            [new ExplicitInstantiation('Parent')]);
        const gc = new ExplicitInstantiation('GrandChild');

        assert.isFalse(
            h.typeFulfillsType(t, gc),
            'Expected Child <: T <: Parent to not fulfill GrandChild');
      });

      test('generics with generic bounds fulfill explicits', function() {
        const h = defineHierarchy();
        const g = new GenericInstantiation(
            'g', [], [new GenericInstantiation('h')]);
        const animal = new ExplicitInstantiation('animal');

        assert.isTrue(
            h.typeFulfillsType(g, animal),
            'Expected generics with generic bounds to fulfill explicits');
      });

      test('generic bounds are ignored', function() {
        const h = defineHierarchy();
        const t = new GenericInstantiation(
            't',
            [],
            [
              new GenericInstantiation('h'),
              new ExplicitInstantiation('mammal'),
            ]);
        const dog = new ExplicitInstantiation('animal');

        assert.isTrue(
            h.typeFulfillsType(t, dog),
            'Expected generic bounds to be ignored');
      });
    });
  });

  suite('explicit parameterized subtyping', function() {
    suite('covariant types', function() {
      test('unrelated outers do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CO);
        h.addTypeDef('x', [pa]);
        h.addTypeDef('y', [pa]);
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const xi = new ExplicitInstantiation('x', [zi]);
        const yi = new ExplicitInstantiation('y', [zi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi, yi),
            'Expected an unrelated outer type to not fulfill the type');
      });

      test('supertype outers do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CO);
        h.addTypeDef('x', [pa]);
        const yd = h.addTypeDef('y', [pa]);
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const ga = new GenericInstantiation('a');
        const gx = new ExplicitInstantiation('x', [ga]);
        const xi = new ExplicitInstantiation('x', [zi]);
        const yi = new ExplicitInstantiation('y', [zi]);
        yd.addParent(gx);

        assert.isFalse(
            h.typeFulfillsType(xi, yi),
            'Expected a supertype outer type to not fulfill the type');
      });

      test('unrelated inners do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CO);
        h.addTypeDef('x', [pa]);
        h.addTypeDef('y');
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const yi = new ExplicitInstantiation('y');
        const xi1 = new ExplicitInstantiation('x', [zi]);
        const xi2 = new ExplicitInstantiation('x', [yi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi1, xi2),
            'Expected an unrelated inner type to not fulfill the type');
      });

      test('even a single unrelated inner does not fulfill the type', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CO);
        const pb = new ParameterDefinition('b', Variance.CO);
        const pc = new ParameterDefinition('c', Variance.CO);
        h.addTypeDef('x', [pa, pb, pc]);
        h.addTypeDef('y');
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const yi = new ExplicitInstantiation('y');
        const xi1 = new ExplicitInstantiation('x', [zi, yi, zi]);
        const xi2 = new ExplicitInstantiation('x', [zi, zi, zi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi1, xi2),
            'Expected an unrelated inner type to not fulfill the type');
      });

      suite('identical outer types', function() {
        test('identical inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CO);
          h.addTypeDef('x', [pa]);
          h.addTypeDef('y');
          const yi1 = new ExplicitInstantiation('y');
          const yi2 = new ExplicitInstantiation('y');
          const xi1 = new ExplicitInstantiation('x', [yi1]);
          const xi2 = new ExplicitInstantiation('x', [yi2]);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(xi1, xi2),
              'Expected an identical inner type to fulfill the type');
        });

        test('subtype inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CO);
          h.addTypeDef('x', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const xi1 = new ExplicitInstantiation('x', [ti]);
          const xi2 = new ExplicitInstantiation('x', [pi]);
          td.addParent(pi);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(xi1, xi2),
              'Expected an subtype inner type to fulfill the type');
        });

        test('supertype inner does not fulfill type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CO);
          h.addTypeDef('x', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const xi1 = new ExplicitInstantiation('x', [pi]);
          const xi2 = new ExplicitInstantiation('x', [ti]);
          td.addParent(pi);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(xi1, xi2),
              'Expected an supertype inner type to not fulfill the type');
        });
      });

      suite('subtype outer types', function() {
        test('identical inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CO);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          h.addTypeDef('z');
          const ga = new GenericInstantiation('a');
          const zi1 = new ExplicitInstantiation('z');
          const zi2 = new ExplicitInstantiation('z');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [zi2]);
          const xi = new ExplicitInstantiation('x', [zi1]);
          yd.addParent(gx);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(yi, xi),
              'Expected an identical inner type to fulfill the type');
        });

        test('subtype inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CO);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ga = new GenericInstantiation('a');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [ti]);
          const xi = new ExplicitInstantiation('x', [pi]);
          td.addParent(pi);
          yd.addParent(gx);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(yi, xi),
              'Expected an subtype inner type to fulfill the type');
        });

        test('supertype inner does not fulfill type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CO);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ga = new GenericInstantiation('a');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [pi]);
          const xi = new ExplicitInstantiation('x', [ti]);
          td.addParent(pi);
          yd.addParent(gx);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(yi, xi),
              'Expected an supertype inner type to not fulfill the type');
        });
      });
    });

    suite('contravariant types', function() {
      test('unrelated outers do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CONTRA);
        h.addTypeDef('x', [pa]);
        h.addTypeDef('y', [pa]);
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const xi = new ExplicitInstantiation('x', [zi]);
        const yi = new ExplicitInstantiation('y', [zi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi, yi),
            'Expected an unrelated outer type to not fulfill the type');
      });

      test('supertype outers do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CONTRA);
        h.addTypeDef('x', [pa]);
        const yd = h.addTypeDef('y', [pa]);
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const ga = new GenericInstantiation('a');
        const gx = new ExplicitInstantiation('x', [ga]);
        const xi = new ExplicitInstantiation('x', [zi]);
        const yi = new ExplicitInstantiation('y', [zi]);
        yd.addParent(gx);

        assert.isFalse(
            h.typeFulfillsType(xi, yi),
            'Expected a supertype outer type to not fulfill the type');
      });

      test('unrelated inners do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CONTRA);
        h.addTypeDef('x', [pa]);
        h.addTypeDef('y');
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const yi = new ExplicitInstantiation('y');
        const xi1 = new ExplicitInstantiation('x', [zi]);
        const xi2 = new ExplicitInstantiation('x', [yi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi1, xi2),
            'Expected an unrelated inner type to not fulfill the type');
      });

      test('even a single unrelated inner does not fulfill the type', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.CONTRA);
        const pb = new ParameterDefinition('b', Variance.CONTRA);
        const pc = new ParameterDefinition('c', Variance.CONTRA);
        h.addTypeDef('x', [pa, pb, pc]);
        h.addTypeDef('y');
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const yi = new ExplicitInstantiation('y');
        const xi1 = new ExplicitInstantiation('x', [zi, yi, zi]);
        const xi2 = new ExplicitInstantiation('x', [zi, zi, zi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi1, xi2),
            'Expected an unrelated inner type to not fulfill the type');
      });

      suite('identical outer types', function() {
        test('identical inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CONTRA);
          h.addTypeDef('x', [pa]);
          h.addTypeDef('y');
          const yi1 = new ExplicitInstantiation('y');
          const yi2 = new ExplicitInstantiation('y');
          const xi1 = new ExplicitInstantiation('x', [yi1]);
          const xi2 = new ExplicitInstantiation('x', [yi2]);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(xi1, xi2),
              'Expected an identical inner type to fulfill the type');
        });

        test('subtype inner does not fulfill types', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CONTRA);
          h.addTypeDef('x', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const xi1 = new ExplicitInstantiation('x', [ti]);
          const xi2 = new ExplicitInstantiation('x', [pi]);
          td.addParent(pi);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(xi1, xi2),
              'Expected an subtype inner type to not fulfill the type');
        });

        test('supertype inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CONTRA);
          h.addTypeDef('x', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const xi1 = new ExplicitInstantiation('x', [pi]);
          const xi2 = new ExplicitInstantiation('x', [ti]);
          td.addParent(pi);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(xi1, xi2),
              'Expected an supertype inner type to fulfill the type');
        });
      });

      suite('subtype outer types', function() {
        test('identical inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CONTRA);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          h.addTypeDef('z');
          const ga = new GenericInstantiation('a');
          const zi1 = new ExplicitInstantiation('z');
          const zi2 = new ExplicitInstantiation('z');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [zi2]);
          const xi = new ExplicitInstantiation('x', [zi1]);
          yd.addParent(gx);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(yi, xi),
              'Expected an identical inner type to fulfill the type');
        });

        test('subtype inner does not fulfill types', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CONTRA);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ga = new GenericInstantiation('a');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [ti]);
          const xi = new ExplicitInstantiation('x', [pi]);
          td.addParent(pi);
          yd.addParent(gx);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(yi, xi),
              'Expected an subtype inner type to not fulfill the type');
        });

        test('supertype inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.CONTRA);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ga = new GenericInstantiation('a');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [pi]);
          const xi = new ExplicitInstantiation('x', [ti]);
          td.addParent(pi);
          yd.addParent(gx);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(yi, xi),
              'Expected an supertype inner type to fulfill the type');
        });
      });
    });

    suite('invariant types', function() {
      test('unrelated outers do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.INV);
        h.addTypeDef('x', [pa]);
        h.addTypeDef('y', [pa]);
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const xi = new ExplicitInstantiation('x', [zi]);
        const yi = new ExplicitInstantiation('y', [zi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi, yi),
            'Expected an unrelated outer type to not fulfill the type');
      });

      test('supertype outers do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.INV);
        h.addTypeDef('x', [pa]);
        const yd = h.addTypeDef('y', [pa]);
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const ga = new GenericInstantiation('a');
        const gx = new ExplicitInstantiation('x', [ga]);
        const xi = new ExplicitInstantiation('x', [zi]);
        const yi = new ExplicitInstantiation('y', [zi]);
        yd.addParent(gx);

        assert.isFalse(
            h.typeFulfillsType(xi, yi),
            'Expected a supertype outer type to not fulfill the type');
      });

      test('unrelated inners do not fulfill types', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.INV);
        h.addTypeDef('x', [pa]);
        h.addTypeDef('y');
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const yi = new ExplicitInstantiation('y');
        const xi1 = new ExplicitInstantiation('x', [zi]);
        const xi2 = new ExplicitInstantiation('x', [yi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi1, xi2),
            'Expected an unrelated inner type to not fulfill the type');
      });

      test('even a single unrelated inner does not fulfill the type', function() {
        const h = new TypeHierarchy();
        const pa = new ParameterDefinition('a', Variance.INV);
        const pb = new ParameterDefinition('b', Variance.INV);
        const pc = new ParameterDefinition('c', Variance.INV);
        h.addTypeDef('x', [pa, pb, pc]);
        h.addTypeDef('y');
        h.addTypeDef('z');
        const zi = new ExplicitInstantiation('z');
        const yi = new ExplicitInstantiation('y');
        const xi1 = new ExplicitInstantiation('x', [zi, yi, zi]);
        const xi2 = new ExplicitInstantiation('x', [zi, zi, zi]);
        h.finalize();

        assert.isFalse(
            h.typeFulfillsType(xi1, xi2),
            'Expected an unrelated inner type to not fulfill the type');
      });

      suite('identical outer types', function() {
        test('identical inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.INV);
          h.addTypeDef('x', [pa]);
          h.addTypeDef('y');
          const yi1 = new ExplicitInstantiation('y');
          const yi2 = new ExplicitInstantiation('y');
          const xi1 = new ExplicitInstantiation('x', [yi1]);
          const xi2 = new ExplicitInstantiation('x', [yi2]);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(xi1, xi2),
              'Expected an identical inner type to fulfill the type');
        });

        test('subtype inner does not fulfill type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.INV);
          h.addTypeDef('x', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const xi1 = new ExplicitInstantiation('x', [ti]);
          const xi2 = new ExplicitInstantiation('x', [pi]);
          td.addParent(pi);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(xi1, xi2),
              'Expected an subtype inner type to not fulfill the type');
        });

        test('supertype inner does not fulfill type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.INV);
          h.addTypeDef('x', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const xi1 = new ExplicitInstantiation('x', [pi]);
          const xi2 = new ExplicitInstantiation('x', [ti]);
          td.addParent(pi);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(xi1, xi2),
              'Expected an supertype inner type to not fulfill the type');
        });
      });

      suite('subtype outer types', function() {
        test('identical inner fulfills type', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.INV);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          h.addTypeDef('z');
          const ga = new GenericInstantiation('a');
          const zi1 = new ExplicitInstantiation('z');
          const zi2 = new ExplicitInstantiation('z');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [zi2]);
          const xi = new ExplicitInstantiation('x', [zi1]);
          yd.addParent(gx);
          h.finalize();

          assert.isTrue(
              h.typeFulfillsType(yi, xi),
              'Expected an identical inner type to fulfill the type');
        });

        test('subtype inner does not fulfill types', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.INV);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ga = new GenericInstantiation('a');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [ti]);
          const xi = new ExplicitInstantiation('x', [pi]);
          td.addParent(pi);
          yd.addParent(gx);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(yi, xi),
              'Expected an subtype inner type to not fulfill the type');
        });

        test('supertype inner does not fulfill types', function() {
          const h = new TypeHierarchy();
          const pa = new ParameterDefinition('a', Variance.INV);
          h.addTypeDef('x', [pa]);
          const yd = h.addTypeDef('y', [pa]);
          const td = h.addTypeDef('t');
          h.addTypeDef('p');
          const ga = new GenericInstantiation('a');
          const ti = new ExplicitInstantiation('t');
          const pi = new ExplicitInstantiation('p');
          const gx = new ExplicitInstantiation('x', [ga]);
          const yi = new ExplicitInstantiation('y', [pi]);
          const xi = new ExplicitInstantiation('x', [ti]);
          td.addParent(pi);
          yd.addParent(gx);
          h.finalize();

          assert.isFalse(
              h.typeFulfillsType(yi, xi),
              'Expected an supertype inner type to not fulfill the type');
        });
      });
    });

    suite('nested variances', function() {
      function defineNestedHierarchy() {
        const h = new TypeHierarchy();
        const coParam = new ParameterDefinition('a', Variance.CO);
        const contraParam = new ParameterDefinition('a', Variance.CONTRA);
        const invParam = new ParameterDefinition('a', Variance.INV);

        const coChildDef = h.addTypeDef('childCo', [coParam]);
        const coDef = h.addTypeDef('co', [coParam]);
        const coParentDef = h.addTypeDef('parentCo', [coParam]);
        coChildDef.addParent(coDef.createInstance());
        coDef.addParent(coParentDef.createInstance());

        const contraChildDef = h.addTypeDef('childContra', [contraParam]);
        const contraDef = h.addTypeDef('contra', [contraParam]);
        const contraParentDef = h.addTypeDef('parentContra', [contraParam]);
        contraChildDef.addParent(contraDef.createInstance());
        contraDef.addParent(contraParentDef.createInstance());

        const invChildDef = h.addTypeDef('childInv', [invParam]);
        const invDef = h.addTypeDef('inv', [invParam]);
        const invParentDef = h.addTypeDef('parentInv', [invParam]);
        invChildDef.addParent(invDef.createInstance());
        invDef.addParent(invParentDef.createInstance());

        const child = h.addTypeDef('child');
        const type = h.addTypeDef('type');
        const parent = h.addTypeDef('parent');
        child.addParent(type.createInstance());
        type.addParent(parent.createInstance());

        h.finalize();

        return h;
      }

      test('co[childCo[child]] fulfills co[co[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'childCo', [new ExplicitInstantiation('child')])]);
        const b = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'co', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected co[childCo[child]] to fulfill co[co[type]]');
      });

      test('co[childContra[parent]] fulfills co[contra[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'childContra', [new ExplicitInstantiation('parent')])]);
        const b = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected co[childContra[child]] to fulfill co[contra[type]]');
      });

      test('co[childInv[type]] fulfills co[inv[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'childInv', [new ExplicitInstantiation('type')])]);
        const b = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected co[childInv[child]] to fulfill co[inv[type]]');
      });

      test('co[childInv[child]] does not fulfill co[inv[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'childInv', [new ExplicitInstantiation('child')])]);
        const b = new ExplicitInstantiation(
            'co', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('type')])]);

        assert.isFalse(
            h.typeFulfillsType(a, b),
            'Expected co[childInv[child]] to not fulfill co[inv[type]]');
      });

      test('contra[parentCo[parent]] fulfills [contra[co[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'contra', [new ExplicitInstantiation(
                'parentCo', [new ExplicitInstantiation('parent')])]);
        const b = new ExplicitInstantiation(
            'contra', [new ExplicitInstantiation(
                'co', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected contra[parentCo[parent]] to fulfill contra[co[type]]');
      });

      test('contra[parentContra[child]] fulfills [[contra[contra[type]]',
          function() {
            const h = defineNestedHierarchy();
            const a = new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation(
                    'parentContra', [new ExplicitInstantiation('child')])]);
            const b = new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation(
                    'contra', [new ExplicitInstantiation('type')])]);

            assert.isTrue(
                h.typeFulfillsType(a, b),
                'Expected contra[parentContra[child]] to fulfill contra[contra[type]]');
          });

      test('contra[parentInv[type]] fulfills contra[inv[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'contra', [new ExplicitInstantiation(
                'parentInv', [new ExplicitInstantiation('type')])]);
        const b = new ExplicitInstantiation(
            'contra', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected contra[parentInv[type]] to fulfill contra[inv[type]]');
      });

      test('contra[parentInv[parent]] does not fulfill contra[inv[type]]',
          function() {
            const h = defineNestedHierarchy();
            const a = new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation(
                    'parentInv', [new ExplicitInstantiation('parent')])]);
            const b = new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation(
                    'inv', [new ExplicitInstantiation('type')])]);

            assert.isFalse(
                h.typeFulfillsType(a, b),
                'Expected contra[parentInv[parent]] to not fulfill contra[inv[type]]');
          });

      test('inv[co[type]] fulfills inv[co[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'co', [new ExplicitInstantiation('type')])]);
        const b = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'co', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected inv[co[type]] to fulfill inv[co[type]]');
      });

      test('inv[co[child]] does not fulfill inv[co[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'co', [new ExplicitInstantiation('child')])]);
        const b = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'co', [new ExplicitInstantiation('type')])]);

        assert.isFalse(
            h.typeFulfillsType(a, b),
            'Expected inv[co[child]] to not fulfill inv[co[type]]');
      });

      test('inv[contra[type]] fulfills inv[contra[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation('type')])]);
        const b = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected inv[contra[type]] to fulfill inv[contra[type]]');
      });

      test('inv[contra[parent]] does not fulfill inv[contra[type[[', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation('parent')])]);
        const b = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'contra', [new ExplicitInstantiation('type')])]);

        assert.isFalse(
            h.typeFulfillsType(a, b),
            'Expected inv[contra[type]] to not fulfill inv[contra[type]]');
      });

      test('inv[inv[type]] fulfills inv[inv[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('type')])]);
        const b = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('type')])]);

        assert.isTrue(
            h.typeFulfillsType(a, b),
            'Expected inv[inv[type]] to fulfill inv[inv[type]]');
      });

      test('inv[inv[child]] does not fulfill inv[inv[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('child')])]);
        const b = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('type')])]);

        assert.isFalse(
            h.typeFulfillsType(a, b),
            'Expected inv[inv[child]] to not fulfill inv[inv[type]]');
      });

      test('inv[inv[parent]] does not fulfill inv[inv[type]]', function() {
        const h = defineNestedHierarchy();
        const a = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('parent')])]);
        const b = new ExplicitInstantiation(
            'inv', [new ExplicitInstantiation(
                'inv', [new ExplicitInstantiation('type')])]);

        assert.isFalse(
            h.typeFulfillsType(a, b),
            'Expected inv[inv[parent]] to not fulfill inv[inv[type]]');
      });
    });
  });

  suite('generic parameterized subtyping', function() {
    test('generic params always fulfill explicit params', function() {
      const h = new TypeHierarchy();
      const invParam = new ParameterDefinition('inv', Variance.INV);
      h.addTypeDef('inv', [invParam]);
      h.addTypeDef('type');
      h.finalize();
      const inv1 = new ExplicitInstantiation(
          'inv', [new GenericInstantiation('g')]);
      const inv2 = new ExplicitInstantiation(
          'inv', [new ExplicitInstantiation('type')]);

      assert.isTrue(
          h.typeFulfillsType(inv1, inv2),
          'Expected generic params to always fulfill explicit params');
    });

    test('generic params always fulfill constrained generic params', function() {
      const h = new TypeHierarchy();
      const invParam = new ParameterDefinition('inv', Variance.INV);
      h.addTypeDef('inv', [invParam]);
      h.addTypeDef('type');
      h.finalize();
      const inv1 = new ExplicitInstantiation(
          'inv', [new GenericInstantiation('g')]);
      const inv2 = new ExplicitInstantiation(
          'inv', [new GenericInstantiation(
              't',
              [new ExplicitInstantiation('type')],
              [new ExplicitInstantiation('type')])]);

      assert.isTrue(
          h.typeFulfillsType(inv1, inv2),
          'Expected generic params to always fulfill constrained generic params');
    });

    suite('constrained generics', function() {
      function defineHierarchy() {
        const h = new TypeHierarchy();
        const coParam = new ParameterDefinition('co', Variance.CO);
        const conParam = new ParameterDefinition('con', Variance.CONTRA);
        const invParam = new ParameterDefinition('inv', Variance.INV);
        h.addTypeDef('co', [coParam]);
        h.addTypeDef('contra', [conParam]);
        h.addTypeDef('inv', [invParam]);
        const p = h.addTypeDef('parent');
        const t = h.addTypeDef('type');
        const c = h.addTypeDef('child');
        c.addParent(t.createInstance());
        t.addParent(p.createInstance());
        h.finalize();
        return h;
      }

      suite('covariant params', function() {
        test('co[child] fulfills co[T <: type]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('child')]);
          const co2 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);

          assert.isTrue(
              h.typeFulfillsType(co1, co2),
              'Expected co[child] to fulfill co[T <: type]');
        });

        test('co[parent] does not fulfill co[t <: type]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('parent')]);
          const co2 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);

          assert.isFalse(
              h.typeFulfillsType(co1, co2),
              'Expected co[parent] to not fulfill co[T <: type]');
        });

        test('co[child] does not fulfill co[t >: type]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('child')]);
          const co2 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);

          assert.isFalse(
              h.typeFulfillsType(co1, co2),
              'Expected co[child] to not fulfill co[T >: type]');
        });

        test('co[parent] fulfills co[t >: type]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('parent')]);
          const co2 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);

          assert.isTrue(
              h.typeFulfillsType(co1, co2),
              'Expected co[parent] to fulfill co[T >: type]');
        });

        test('co[t <: type] fulfills co[child]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);
          const co2 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('child')]);

          assert.isTrue(
              h.typeFulfillsType(co1, co2),
              'Expected co[t <: type] to fulfill co[child]');
        });

        test('co[t >: type] does not fulfill co[child]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);
          const co2 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('child')]);

          assert.isFalse(
              h.typeFulfillsType(co1, co2),
              'Expected co[t >: type] to not fulfill co[child]');
        });

        test('co[t <: type] fulfills co[parent]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);
          const co2 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('parent')]);

          assert.isTrue(
              h.typeFulfillsType(co1, co2),
              'Expected co[t <: type] to fulfill co[parent]');
        });

        test('co[t >: type] fulfills co[parent]', function() {
          const h = defineHierarchy();
          const co1 = new ExplicitInstantiation(
              'co', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);
          const co2 = new ExplicitInstantiation(
              'co', [new ExplicitInstantiation('parent')]);

          assert.isTrue(
              h.typeFulfillsType(co1, co2),
              'Expected co[t >: type] to fulfill co[parent]');
        });
      });

      suite('contravariant params', function() {
        test('contra[child] fulfills contra[T <: type]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('child')]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);

          assert.isTrue(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[child] to fulfill contra[T <: type]');
        });

        test('contra[parent] does not fulfill contra[t <: type]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('parent')]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);

          assert.isFalse(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[parent] to not fulfill contra[T <: type]');
        });

        test('contra[child] does not fulfill contra[t >: type]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('child')]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);

          assert.isFalse(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[child] to not fulfill contra[T >: type]');
        });

        test('contra[parent] fulfills contra[t >: type]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('parent')]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);

          assert.isTrue(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[parent] to fulfill contra[T >: type]');
        });

        test('contra[t <: type] fulfills contra[child]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('child')]);

          assert.isTrue(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[t <: type] to fulfill contra[child]');
        });

        test('contra[t >: type] fulfills contra[child]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('child')]);

          assert.isTrue(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[t >: type] to fulfills contra[child]');
        });

        test('contra[t <: type] does not fulfill contra[parent]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('parent')]);

          assert.isFalse(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[t <: type] to not fulfill contra[parent]');
        });

        test('contra[t >: type] fulfills contra[parent]', function() {
          const h = defineHierarchy();
          const contra1 = new ExplicitInstantiation(
              'contra', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);
          const contra2 = new ExplicitInstantiation(
              'contra', [new ExplicitInstantiation('parent')]);

          assert.isTrue(
              h.typeFulfillsType(contra1, contra2),
              'Expected contra[t >: type] to fulfill contra[parent]');
        });
      });

      suite('invariant params', function() {
        test('inv[child] fulfills inv[T <: type]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('child')]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);

          assert.isTrue(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[child] to fulfill inv[T <: type]');
        });

        test('inv[parent] does not fulfill inv[t <: type]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('parent')]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);

          assert.isFalse(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[parent] to not fulfill inv[T <: type]');
        });

        test('inv[child] does not fulfill inv[t >: type]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('child')]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);

          assert.isFalse(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[child] to not fulfill inv[T >: type]');
        });

        test('inv[parent] fulfills inv[t >: type]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('parent')]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);

          assert.isTrue(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[parent] to fulfill inv[T >: type]');
        });

        test('inv[t <: type] fulfills inv[child]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('child')]);

          assert.isTrue(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[t <: type] to fulfill inv[child]');
        });

        test('inv[t >: type] does not fulfill inv[child]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('child')]);

          assert.isFalse(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[t >: type] to fulfills inv[child]');
        });

        test('inv[t <: type] does not fulfill inv[parent]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [], [new ExplicitInstantiation('type')])]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('parent')]);

          assert.isFalse(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[t <: type] to not fulfill inv[parent]');
        });

        test('inv[t >: type] fulfills inv[parent]', function() {
          const h = defineHierarchy();
          const inv1 = new ExplicitInstantiation(
              'inv', [new GenericInstantiation(
                  't', [new ExplicitInstantiation('type')])]);
          const inv2 = new ExplicitInstantiation(
              'inv', [new ExplicitInstantiation('parent')]);

          assert.isTrue(
              h.typeFulfillsType(inv1, inv2),
              'Expected inv[t >: type] to fulfill inv[parent]');
        });
      });
    });
  });
});
