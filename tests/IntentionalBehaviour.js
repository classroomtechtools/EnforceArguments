import test from 'ava';
import {Enforce} from '../src/modules/EnforceArguments.js';

test("Default types that are incompatible are not type-checked", t => {

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
