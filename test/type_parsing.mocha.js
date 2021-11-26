/**
 * @license
 * Copyright 2021 Beka Westberg
 * SPDX-License-Identifier: MIT
 */

import {assert} from 'chai';
import {parseType} from '../src/type_parser';
import {GenericInstantiation, ExplicitInstantiation} from '../src/type_instantiation';

suite.only('Type parsing', function() {
  function assertParseMatches(str, expected, msg) {
    assert.isTrue(parseType(str).equals(expected), msg);
  }

  function assertInvalidType(str, msg) {
    assert.throws(() => parseType(str), Error, msg);
  }

  suite('simple generics', function() {
    test('a single lower case is valid', function() {
      assertParseMatches(
          't', new GenericInstantiation('t'),
          'Expected a single lower case letter to be a valid generic');
    });

    test('a single upper case is valid', function() {
      assertParseMatches(
          'T', new GenericInstantiation('T'),
          'Expected a single upper case letter to be a valid generic');
    });

    test('an underscore is invalid', function() {
      assertInvalidType(
          '_', 'Expected a single underscore to be an invalid generic');
    });

    test('a digit is invalid', function() {
      assertInvalidType(
          '1', 'Expected a single underscore to be an invalid generic');
    });
  });

  suite('simple explicits', function() {
    test('multiple lower case are valid', function() {
      assertParseMatches(
          'test', new ExplicitInstantiation('test'),
          'Expected multiple lower case letters to be a valid explicit');
    });

    test('multiple upper case are valid', function() {
      assertParseMatches(
          'TEST', new ExplicitInstantiation('TEST'),
          'Expected multiple upper case letters to be a valid explicit');
    });

    test('underscores are valid', function() {
      assertParseMatches(
          't_e_s_t', new ExplicitInstantiation('t_e_s_t'),
          'Expected underscores to be valid explicit characters');
    });

    test('starting underscores are invalid', function() {
      assertInvalidType(
          '_test', 'Expected starting with an underscore to be invalid');
    });

    test('digits are valid', function() {
      assertParseMatches(
          't1e2s3t', new ExplicitInstantiation('t1e2s3t'),
          'Expected digits to be valid explicit characters');
    });

    test('starting digits are invalid', function() {
      assertInvalidType(
          '1test', 'Expected starting with a digit to be invalid');
    });
  });

  suite('constrained types', function() {
    test('lower bound generics use >:', function() {
      assertParseMatches(
          't >: test1, test2',
          new GenericInstantiation(
              't',
              [
                new ExplicitInstantiation('test1'),
                new ExplicitInstantiation('test2'),
              ]),
          'Expected lower bound generics using >: to be valid');
    });

    test('lower bound generics cannot use <:', function() {
      assertInvalidType(
          'test1, test2 <: t',
          'Expected lower bound generics using <: to be invalid');
    });

    test('lower bounds with only generics', function() {
      assertParseMatches(
          'a >: b',
          new GenericInstantiation(
              'a',
              [new ExplicitInstantiation('b')]),
          'Expected generics to be able to be lower bound by generics');
    });

    test('upper bound generics use <:', function() {
      assertParseMatches(
          't <: test1, test2',
          new GenericInstantiation(
              't',
              [],
              [
                new ExplicitInstantiation('test1'),
                new ExplicitInstantiation('test2'),
              ]),
          'Expected upper bound generics using <: to be valid');
    });

    test('upper bound generics cannot use >:', function() {
      assertInvalidType(
          'test1, test2 >: t',
          'Expected upper bound generics using >: to be invalid');
    });

    test('upper bounds with only generics', function() {
      assertParseMatches(
          'a <: b',
          new GenericInstantiation(
              'a',
              [],
              [new ExplicitInstantiation('b')]),
          'Expected generics to be able to be upper bound by generics');
    });

    test('range generics use <:', function() {
      assertParseMatches(
          'test1 <: t <: test1',
          new GenericInstantiation(
              't',
              [new ExplicitInstantiation('test1')],
              [new ExplicitInstantiation('test2')]),
          'Expected generics with upper and lower bounds to be valid');
    });

    test('range generics cannot use >:', function() {
      assertInvalidType(
          'test2 >: t >: test1',
          'Expected range generics using >: to be invalid');
    });

    test('bound operator must have types', function() {
      assertInvalidType(
          '<: t', 'Expected bound operators without types to be invalid');
    });

    test('explicits cannot be bound', function() {
      assertInvalidType(
          'test1 <: test2',
          'Expected explicits to be unable to be bound by explicits');
    });
  });

  suite('parameterized types', function() {
    test('explicits are valid params', function() {
      assertParseMatches(
          'test[test1, test2]',
          new ExplicitInstantiation(
              'test',
              [
                new ExplicitInstantiation('test1'),
                new ExplicitInstantiation('test2'),
              ]),
          'Expected explicit types to be valid parameters');
    });

    test('generics are valid params', function() {
      assertParseMatches(
          'test[a, b]',
          new ExplicitInstantiation(
              'test',
              [
                new ExplicitInstantiation('a'),
                new ExplicitInstantiation('b'),
              ]),
          'Expected generic types to be valid parameters');
    });

    test('empty is not a valid param', function() {
      assertInvalidType(
          'test[a, ]',
          'Expected empty spaces to be invalid params');
    });

    test('generics cannot have params', function() {
      assertInvalidType(
          'a[test1, test2]',
          'Expected generics to be unable to have params');
    });

    test('params must be separated by commas', function() {
      assertInvalidType(
          'test[test1 test2]',
          'Expected params to need to be separated by commas');
    });
  });
});
