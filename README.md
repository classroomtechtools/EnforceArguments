# EnforceArguments

A V8 GAS library which enables the ability for the developer to guarantee that functions receive arguments that match the expected types -- including instances of classes.

![](enforcearguments.gif?raw=true "EnforcedArguments")

This library lets you
- Declare required arguments and throws `TypeError` in their absence
- Declare expected types, and throws `TypeError` on mismatch
- Enforce arity (number of arguments) and throws `TypeError` on mismatch
- Works for either positional arguments or destructured arguments (which we'll call "named arguments")
- Can declare types `string`, `object`, `number`, `boolean`, `array` as enforced types, and can even enforce **instances of classes**, such as `Date`

All arguments checked for type can also be `null` value.

## Quickstart

Add library `M4wxut0XaxZerFMk3i2mDVfD8R0iiSsw_` with `Enforce` identifier. See examples below on how to use.

## Example

Declaration is done in (preferably) the first line of the function by passing an object where keys are the name of the arguments, and values are strings that indicate the type. Use `!` to indicate it is `required`:

### Positional arguments example

```js
function drink (liquid, speed=1) {
	Enforce.positional(arguments, {liquid: '!string', speed: 'number'}, 'drink');
}
drink('water');  // okay, speed = 1
drink(124);      // TypeError wrong type
drink();         // TypeError requires liquid
drink('coke', 'water'); // TypeError too many
```

> For `Enforce.positional`, the programmer needs to declare the keys in the object in the same order they are defined in the function signature.

This function receives the `arguments` keyword and an object that defines the expected positional parameters, with their types as strings. These strings should match the `typeof` result on the passed values.

In case it is called incorrectly, a `TypeError` is raised. The string `"drink"` is given to `Enforce.positional` as the last argument as a (optional) comment that will display when the error is thrown.

### Destructured arguments example

Works on the same principal above and used in much of the same way.

```js
function drink({liquid, speed=1}={}) {
	Enforce.named(arguments, {liquid: '!string', speed: 'number'}, 'drink');
}
drink({liquid: 'water'});  // okay, speed = 1
drink({speed: 10});        // TypeError missing "liquid"
drink({nothing: ''});      // TypeError no "nothing" expected
drink();                   // TypeError missing "liquid"
```

> The `arguments` keyword is used to send the arguments actually passed to `EnforceArguments`, and can't be sensibly be anything else, given the use case

So, basically, you use `Enforce.positional(arguments, ...)` inside functions that utilize positional parameters, and `Enforce.named(arguments, ...)`for those functions using destructured arguments.

## Discussion

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
importantFunction({id: 1234, name: 'name', values: [1,2]);
```

But if you forget the `id`, `name`, or `values` parameters, it'll throw a `TypeError` with the list of required parameters. If you pass an object of the wrong type, it'll throw an error telling you which type it is expecting.

If you pass it an extra property, for example `checked` (you misspelled `check`), it'll also throw a `TypeError`. You can also pass the arguments in a different order and still be correct:

```js
importantFunction({name: 'name', values: [1,2], id: 1234);
```

Using named arguments that are enforce is more convenient and more readable, for the following reasons:

- More readable
- Easier to recall
- If you get it wrong, let's you know immediately

## Motivation

One motivation is that I far prefer named arguments, and need a convenient way to check for instances of classes, too. In addition to that, type checking and remembering what functions take *so much* of the developer's mental energy when building and debugging in vanilla JavaScript. In addition, if you're writing a library, you'll be doing your user a favor by throwing errors early if they don't use the API in the intended manner.

Also, while I *far* prefer using named arguments, GAS libraries expose their functions with positional arguments only. So I used this library to expose library functions, but also lets me write with named arguments:

```js
function internalFunction_({id, name}={}) {
	Enforce.named(arguments, {id: '!number', name: 'string'});
}

/**
 * @param {Number} id
 * @param {String} name
 */
function exportedFunction(id, name) {
	Enforce.positional(arguments, {id: '!number', name: 'string'});
}
```

## Notes & More

### Performance

This library was written so that tye type checking with positional arguments gets the bigger performance penalty than with using named arguments. When you call `Enforce.positional` it converts the passed `arguments` into what that would look like had they been named arguments, and continues. This decision was made because there is already a performance penalty (outside of the use of this library) with using destructuring.

You should also note that there is additional computation involved with the additional overhead of type checking introduced. The potential exists that there will be some performance degradation. Some simple performance tests conducted only indicate a difference of 100 milliseconds at 20K calls for named arguments, but a 200 millisecond penalty for positional arguments.

The author does not see any real risk in slowing it down noticeably for end users. Further performance could be gained by copying and pasting into your project. 

### Optionals

The `Enforce.*` methods consider a `null` passed value as valid. This means that what we are enforcing is "optional" types, which is quite useful. It means that you can write a function that takes an `id` as a `number` argument, which if it really is a number get the thing at that `id`, but if it's `null` create a new one.

```js
function getSpreadsheet({id=null}={}) {
	Enforce.named(arguments, {id: 'number'});  // not required, and so will be null be default
	if (id === null) {
		return SpreadsheetApp.create(…);
	}
	return SpreadsheetApp.openById(id);
}

getSpreadsheet({id: null});  
// same as
getSpreadsheet();
```

You can also use this method with class methods.

### Use them classes

You won't need as much boilerplate code to ensure the variables are of the expected type.

```js
const ssConstructorArgs = {id: '!number'};

class Spreadsheet {
	constructor (id) {
		Enforce.positional(arguments, ssConstructorArgs);
		this.id = id;
	}
	static fromId ({id}={}) {
		Enforce.named(arguments, ssConstructorArgs);
		return new Spreadsheet(id);
	}
}
```


### Declarative vs Decorate

The following is an alternative, but more verbose, way of achieving the same thing. The only real reason to use this method is if one of the arguments needs to be an **instance of a class** and it is **required**.

```js
class Request {
	constructor(greeting, noun) {		
		this.greeting = greeting;
		this.noun = noun;
	}
	get content () {
		return `{"greeting": "${this.greeting}", "noun": "${this.noun}"}`;
	}
}

// E for "enforce"; we'll use this object to enforce arguments in below function
const E = Enforce.create({request: Request, info: '!string'});
function getJson(request=E.req, info) {
  E.enforcePositional(arguments);	
  return JSON.parse(request.content);
}

// create the instance
const r = new Request("Hello", "World");

// now you can use getJson method where the first parameter is checked to ensure it is an instance of Request:
getJson(r, 'some string (also required)');
```

Notice that `E.req` makes the argument required; leave it out if the parameter is not required. You can use the usual `!` syntax with `info` for example, which is demonstrated below:

```js
const D = Enforce.new('getJson', {request: Request, info: '!string'});
function getJson(request=D.req, info=D.req) {
	D.enforcePositional(arguments);	
}
```

> Requiring an argument as in `info` in the example directly above is not recommended since you'll have to keep the declaration consistent with `"!string"` declaration anyway. 

### Function "Decorator?"

I call the above method decorating a function, but realize this is not formal function decorators. Those don't exist (yet?) in V8.
