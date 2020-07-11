import test from 'ava';
import {Enforce} from '../src/modules/EnforceArguments.js';

test('Enforce.create throws TypeError given parameters with incorrect types', t => {
    const incorrect_parameters = [ [], [{}], ['1', {}], [{}, {}]];
    t.plan(incorrect_parameters.length);

    incorrect_parameters.forEach(function (params) {
        t.throws(function () {
            Enforce.create(...params);
        }, {instanceOf: TypeError});
    });
});

test('Enforce.create produces object', t => {
    const result = Enforce.create({a: '!string'}, 'name');
    t.deepEqual(result.params, {a: 'string'})
    t.true(result.name == 'name');
    t.deepEqual(result.required, ['a'])
});
