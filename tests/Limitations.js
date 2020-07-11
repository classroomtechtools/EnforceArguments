import test from 'ava';
import {Enforce} from '../src/modules/EnforceArguments.js';

test("When arguments are assigned default values, they are not type-checked", t => {
    function Function ({a='wrong type for default'}={}) {
        Enforce.named(arguments, {a: 'number'});
        return a;
    }
    let result = Function();  // with default
    t.true(result == 'wrong type for default');

    function Function (a='wrong type for default') {
        Enforce.positional(arguments, {a: 'number'});
        return a;
    }
    result = Function();
    t.true(result == 'wrong type for default');
});

test("Types are 'optionals': null values are valid", t => {
    function Function1 (a, b, c) {
        Enforce.positional(arguments, {a: '!string', b: 'number', c: Date});
        return a;
    }
    let result = Function1(null, null, null);
    t.true(result == null);

    function Function2 ({a, b, c}={}) {
        Enforce.named(arguments, {a: '!string', b: 'number', c: Date});
        return a;
    }
    result = Function2({a: null, b: null, c: null});
    t.true(result == null);
});
