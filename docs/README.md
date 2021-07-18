# EnforceArguments

Type checking for AppsScripts V8 functions. Build call signatures and check for expected types at runtime. 

Advanced features, such as checking argument is an instance of a class, also available.

## Quickstart

Install:

- Library `1K6Ts55BjQFDFTTfnDQsAIH3ZWO7yy9-jUCG4Wayot5UUN6ZmS4vqTxqU`

```js
// Example 1:
// a function where first param is required, second is optional:
function UsingPosArgs (a, b=10) {
    Enforce.positional(arguments, {a: '!string', b: 'number'});
}
UsingPosArgs('required');  // executes without error, b will be 10
UsingPosArgs();  // fails with error
```

That way, we can define that some positional arguments are required.

```js
// Example 2:
// a function that uses objects for parameters, a is required
function UsingNamedArgs ({a, b=10, c=[]}={}) {
    Enforce.named(arguments, {a: '!string', b: 'number', c: 'array'});
}
UsingNamedArgs({a: 'required', c: []});  // executes without error:
UsingNamedArgs({a: 'required', c: true});  // fails with error
```

Some programming languages call this way of defining functions as using "named parameters." In JavaScript it's aligned with destructuring.

```js
// Example 3:
// a function whose first parameter is named, but second is an object …
// … and some keys are required, but others not
function UsingHybridArgs (id, {sheetId, options={}}={}) {
    Enforce.hybrid(arguments, {id: '!number', obj: {sheetId: '!number', options: 'object'}});
}
UsingHybridArgs(100, {sheetId: 1});   // executes without error
UsingHybridArgs();  // error, first param id is required
UsingHybridArgs(100);  // error, sheetId is required
```

Above, we have both positional and named parameters. Very useful and solved elegantly.


## Why

Bugs or unexpected behaviours can result due to JavaScripts leniency when it comes to passing arguments. TypeScript does type checking better, but it's unlikely AppsScripts platform itself will have such typing features. 

You can use TypeScript via node and clasp, which is especially useful for keeping things internally consistent in the project itself. But libraries that are written to be consumed by other AppsScripts projects need to define entry-points, written and consumed by AppsScripts runtime, where type-checking would be compelling.

### Advantages

Software that has runtime type checks means:

* You can assume that required arguments are *always* present
* You can assume that some particular arguments are a particular type
* You can also use an argument as `null` to indicate “nothing”

This library lets you …

- Declare required arguments, which will throw `TypeError` in their absence
- Declare arguments to have particular types, and will throw  `TypeError` if it isn’t
- Enforce arity (number of arguments) and throws `TypeError` on mismatch

### Disdavantages

Functions arguments cannot be typechecked in arrow functions, as it uses the `arguments` keyword. You have to use function declarations.

Of course, using arrow fuctions elsewhere in your project is perfectly fine.

## Declaring Types

With this library, you have to annotate, in your function, the types your arguments are supposed to be. You do that with strings for the following namesake types:

- `"number"`
- `"string"`
- `"object"`
- `"boolean"`
- `"function"` (for callbacks, but could also be class instances)

To indicate it is required, place a bang in front, i.e. `"!string"`.

> **Note**: If an object can be a string or null, then it is covered by declaring it as string. If null is passed, it will not fail type-checking. In type-checking parlance, really what we're doing is declaring "optionals."

Please see below "Advanced" section for how to define instances of classes as required. That is how `date` type can be checked.

## Recipes

Let's say you're making a function `drink` with two parameters, the first a `string` ("kind" of liquid) and the second is a `number` how fast to drink ("rate"). 

Use `Enforce.positional` because your function's parameters are declared positionally. This is done in (preferably) the first line of the function, where you use JavaScript's `arguments` reserved word, and additionally supplying an object where keys are the name of the arguments, and values are strings that indicate the type.

### Positional arguments example

```js
// declare:
function drink (liquid, speed=1) {
    Enforce.positional(arguments, {liquid: '!string', speed: 'number'}, 'drink');
}

// use:
drink('water');  // Yes, (speed = 1)
drink(124);      // No, first param must be a string
drink();         // No, needs at least one param
drink('coke', 'water'); // No, second param has to be a number
```

> **Note**: Starting with `'!'` for `liquid` means that it is required. For positional arguments, all of your required parameters should be placed ahead of those optional ones. It is up to the programmer to do that properly in the call signature.

There is one thing to be careful of when using `Enforce.positional`. The order of properties declared second paramter (`{liquid, speed}`) has to match the same order in the function siganture (`drink(liquid, speed)`)

### Destructured arguments example

You could also make this `drink` function more verbose and more clear, by using destructured parameters. (Other languages might refer to them as "named" parameters.) 

```js
// declare
function drink({liquid, speed=1}={}) {
    Enforce.named(arguments, {liquid: '!string', speed: 'number'}, 'drink');
}
drink({liquid: 'water'});  // Yes, speed = 1
drink({speed: 10});        // No, missing "liquid"
drink({nothing: ''});      // No, "nothing" is unexpected
drink({lquid: 'coffee'})   // No, spelling error
drink();                   // No, liquid is required
```

So, basically, you use `Enforce.positional(arguments, ...)` inside functions that utilize positional parameters, and `Enforce.named(arguments, ...)`for those functions using destructured arguments.

### Hybrid arguments

Let's make a more abstract function, called `verb`, where you define the `kind`, `actor`, and `target`. You also need to pass it an `options` argument. Finally, the first parameter is an `id` number.

This is what the call signature looks like:
```js
function verb(id, {kind, actor, target}={}, options={}) {

}
```

### Example: `importantFunction`

You have a function which is really essential that the arguments passed to it have the right types.

```js
function importantFunction(id, name, values, check) {
    // does something important
}
```

It's just so, so important that `id` *has to be an integer*,  `name` *has to be a string* and `values` *has to be an array*, and `check` *has to be a boolean*.

Also, the first three are **required**, but `check` is not, and if not it's `true` by default.

If the function is passed anything that doesn't meet the above specification, throw an error that indicates what is missing, or what is wrong.

Required parameters are indicated with `!` as the first character in the string that declares the type. Using that object, we can use the syntax of [destructuring]([https://davidwalsh.name/destructuring-function-arguments](https://davidwalsh.name/destructuring-function-arguments)) to our advantage to rewrite `importantFunction` like so:

```js
function importantFunction({id, name, values, check=true}={}) {
    Enforce.named(arguments, {id: '!number', name: 'string', values: 'array'}, 'importantFunction');
}
```
Now this function is supposed to be invoked in the following manner:
```js
importantFunction({id: 1234, name: 'name', values: [1,2]});
```

But if you forget the `id`, `name`, or `values` parameters, it'll throw a `TypeError`. If you pass an object of the wrong type, it'll throw an error telling you which type it is expecting.

If you pass it an extra property, for example `checked` (you misspelled `check`), it'll also throw a `TypeError`. You can also pass the arguments in a different order and still be correct:

```js
importantFunction({name: 'name', values: [1,2], id: 1234);
```

Using named arguments that are enforced is more convenient and more readable. The author uses them extensively.

## Notes & More

### Performance

Type checking with positional arguments gets the bigger performance penalty than with using named arguments. `Enforce.positional` has to do more work in preparation for the checking than `Enforce.named`.

Naturally, there is additional computation involved with the additional overhead of type checking introduced. Some simple performance tests conducted only indicate a difference of 100 milliseconds at 20K calls for named arguments, but a 200 millisecond penalty for positional arguments.

The author does not see any real risk in slowing it down noticeably for end users.

### Known limitations

Use of this library has a limitation involving use of default values , which has to do with how `arguments` variable works in JavaScript. Consider the following case:

```js
function someFunc(a=1) {  // default value is a number
  Enforce.positional(arguments, {a: 'string'});  // but we define as a string here
}

// call without any arguments
// a is absent in function call, and so
// "arguments" keyword does not contain anything for `a`
someFunc();  // no error!
```

Above, we’ve defined a function with a parameter `a` that has a default value of `1`. Yet, we also specify through the interface of `Enforce.positional` that we are expecting a type `string`. When we invoke the function, we are expecting it to catch that issue. After all, the variable `a` will be `1`, right?

The issue is that the code uses `arguments` to determine type checks, and when default value is used, that argument is `undefined` inside of the `arguments` variable. So there’s now way for `Enforce.positional` to know that the default value has an incompatible type with it.

The same applies to `Enforce.named`.

This is a potential gotcha, but one that is not a show-stopper. The programmer has to ensure that the default value is compatible string type that is declared in the interface.

### A Note on `null` values: Optionals

The `Enforce.*` methods consider a `null` passed value as valid. This means that what we are enforcing are "optional" types, which is quite useful. It means that you can write a function that takes an `id` as a `number` argument, which if it really is a number get the thing at that `id`, but if it's `null` create a new one.

```js
function getSpreadsheet({id=null}={}) {
    Enforce.named(arguments, {id: 'number'});  // not required, and so null will be the default
    if (id === null) {
        return SpreadsheetApp.create(…);
    }
    return SpreadsheetApp.openById(id);
}

getSpreadsheet({id: null});
// same as
getSpreadsheet();
```

### Class methods

While the documentation has focused on unbound functions, they can also be used with class methods:

```js
class SomeClass {
    constructor (id, {value}) {
        Enforce.hybrid(arguemnts, {id: 'number', obj: {value: '!string'}})
    }
}
```


### Advanced

The following is an alternative, but slightly more verbose, way of getting runtime type-checking for functions. It must be used in cases where you can to check for non-native types, such as dates or instances of classes.

The use case this method solves is if you have a function where one of the arguments needs to be an instance of a class **and** it is required. Using our above method, this is not possible to do, since we indicate required parameters with a `’!’` in front, but when asking for class instances, you pass the actual class itself. (No room to prepend a string.)

For example, how would you declare a function that requires a `Date` object?

```js
function FunctionDateRequired(date) {
    Enforce.positional(arguments, {date: Date});  // not indicated as required!
}
```

So, we use the this alternative method, which is a more “declarative” version of annotating our functions. It involves creating an "Enforce" object manually, and then indicating it's required with it.

```js
// E for "enforce"; we'll use this object to enforce arguments in below function
const E = Enforce.create({date: Date, info: '!string'});

function getSomething(request=E.req, info) {  // E.req makes it required
    E.enforcePositional(arguments);
    ...
}

// create the instance
const d = new Date();

// now you can use getJson method where the first parameter is checked to ensure it is an instance of Request:
getSomething(d, 'some string (also required)');
```

Notice that `E.req` makes the argument required; leave it out if the parameter is not required. You could also use this method to define `info` as required, too!

```js
const D = Enforce.create({request: Request, info: 'string'});

function getJson(request=D.req, info=D.req) {
    D.enforcePositional(arguments);
}
```

The way this works is actually quite interesting. Default parameters such as `D.req` is only evaluated if it is not passed. You can even define the default as the result of a function call!

The library defines the `.req` as a "get" property, which means that when it's evaluated it calls the function, which is possible to do as described above. Since it is only called when not present, the function simply raises a type error.

> **Note**: Because of the decoupling involved above, the TypeError you receive is not as helpful as using the "normal" method of using this library.