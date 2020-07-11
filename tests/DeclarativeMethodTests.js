import test from 'ava';
import {Enforce} from '../src/modules/EnforceArguments.js';
//const test = require('ava');
//const Import = require('../project/Bundle.js');
//const {Enforce} = Import;

test("Alternative .req method", t => {
    const E = Enforce.create({a: Date}, 'name');

    function TestNamed({a=E.req}={}) {
        E.enforceNamed(arguments);
    }

    function TestPos(a=E.req) {
        E.enforcePositional(arguments);
    }

    t.throws(function () {
        TestNamed({a: 'a'});
    }, {instanceOf: TypeError});

    t.throws(function () {
        TestNamed();
    }, {instanceOf: TypeError});

    t.throws(function () {
        TestPos('a');
    }, {instanceOf: TypeError});

    t.throws(function () {
        TestPos();
    }, {instanceOf: TypeError});

});
