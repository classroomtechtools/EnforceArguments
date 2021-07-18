import test from 'ava';
import {Enforce} from '../src/modules/EnforceArguments.js';


const E = Enforce.create({a: Date}, 'E');
const F = Enforce.create({id: 'number', obj: {date: Date}}, 'F')
const G = Enforce.create({id: 'number', obj: {date: Date}, object: 'object'}, 'F')


function TestNamed({a=E.req}={}) {
    E.enforceNamed(arguments);
}

function TestPos(a=E.req) {
    E.enforcePositional(arguments);
}

function TestHybrid(id=F.req, {date=F.req, options=null}={}) {
    F.enforceHybrid(arguments);
}

function TestHybrid2(id=G.req, {date=G.req, kind=null}={}, options={}) {
    G.enforceHybrid(arguments);
    return true;
}


test("Alternative .req methods", t => {
    TestHybrid(100, {date: new Date()});
    t.pass();
});

test("Hybrid with options at end", t => {
    const result = TestHybrid2(100, {date: new Date()}, {hi: 'hi'});
    t.pass(result);
});

test("Alternative .req methods throws errors", t => {

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

    t.throws(function () {
        TestHybrid(200);   // no date!
    })

});
