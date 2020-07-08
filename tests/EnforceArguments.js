const test = require('ava');
const Import = require('../project/Bundle.js');
const {Enforce} = Import;

test('enforce types on arguments', t => {
    const E = Enforce.create({a: '!string', b: Date, c: 'array', d: 'number'}, 'help');
    function Pos(a, b, c, d, e, f) {
        E.enforcePositional(arguments);
    }
    function Named({a, b, c, d, e, f}={}) {
        E.enforceNamed(arguments);
    }
    const dte = new Date();
    const incorrect_params = [ [], [1, 2], ['a', 1], ['a', Date.now()], ['a', dte, 2332], ['a', dte, [], 'a']];
    const incorrect_named = [{
        /* no params */
    }, {
        a: 1, b: 2
    }, {
        a: 'a', b: Date.now()
    }, {
        a: 'a', b: dte, c: 2332
    }, {
        a: 'a', b: dte, c: [], d: 'wrong'
    }];

    t.plan(incorrect_params.length + incorrect_named.length);

    incorrect_params.forEach(function (params) {
        t.throws(function () {
            Pos(...params);
        }, {instanceOf: TypeError})
    });

    incorrect_named.forEach(function (params) {
        t.throws(function () {
            Named(...params);
        }, {instanceOf: TypeError})
    });
});

test('fail if required params not passed', t => {
    function PositionalTester(a) {
        Enforce.positional(arguments, {a: '!string'});
        return a;
    }
    const result = PositionalTester('hi');
    t.true(result === 'hi');
});

