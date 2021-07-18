import test from 'ava';
import {Enforce} from '../src/modules/EnforceArguments.js';

function Func(id, {sheetId, something, other=null}={}) {
    Enforce.hybrid(arguments, {id: '!number', obj: {sheetId: '!number', something: '!string', other: 'string'}}, 'Func');
    return id;
}

function Func2(obj, {one, two, three, four=null}={}) {
    Enforce.hybrid(arguments, {obj: '!object', _: {one: '!string', two: '!number', three: '!string', four: 'string'}});
    return obj.value + two;
}

test('Hybrid approach with positional then calling typecheck works', t => {
    const expected = 100;
    const actual = Func(expected, {sheetId: 1.5, something: 'nice'});
    t.true(actual === expected);
});

test('Hybrid with first param "object"', t => {
    const expected = 4;
    const actual = Func2({value: 2}, {one: '', two: 2, three: ''});
    t.true(actual === expected);
});

test('Hybrid with missing first param', t => {
    t.throws(function () {
        Func2();
    }, {instanceOf: TypeError});
});

test('Hybrid with mismatched first param', t => {
    t.throws(function () {
        Func2(2, {two: 2});
    }, {instanceOf: TypeError});
});

test('no destructred object with required param throws exception', t => {
    t.throws(function () {
        Func(200, {other: "other"});
    }, {instanceOf: TypeError});
});

test('required named param missing throw exception', t => {
    t.throws(function () {
        Func(200);
    }, {instanceOf: TypeError});
});

test('wrong type in named parameters throws exception', t => {
    t.throws(function () {
        Func(200, {sheetId: 'slkfjsdf'});
    }, {instanceOf: TypeError});
});