# EnforcedNamedParameters

A V8 GAS library which …
- … enforces required parameters on function calls
- … enforces type checking on function calls
- … optionally detects extra parameters
- … optionally define default values

## Quickstart

Add the library with Project ID `M4wxut0XaxZerFMk3i2mDVfD8R0iiSsw_`. The identifier `Enforce` is the default name. Use `Enforce.create` as described below.

## Tour

You have a function which is really essential that the parameters passed to it have the right types.

```js
function importantFunction(id, name, values, check) {
	// does something important
}
```

It's just so, so important that `id` *has to be an integer*,  `name` *has to be a string* and `values` *has to be an array*, and `check` *has to be a boolean*.

Also, the first three are **required**, but `check` is not, and if not it's `true` by default.

Let's enforce it by "decorating" that function. If the function is passed anything that doesn't meet the above specification, throw an error that indicates what is missing, or what is wrong. First, declare an interface object:

```js
const I = Enforce.create({
	name: 'importantFunction',  // any name
	parameters: {
		id: '!number',
		name: '!string',
		values: '!array',
		check: 'boolean'
	}
});
```

Required parameters are indicated with `!` as the first character in the string that declares the type. Using that object, we can use the syntax of [destructuring]([https://davidwalsh.name/destructuring-function-arguments](https://davidwalsh.name/destructuring-function-arguments)) to our advantage to rewrite `importantFunction` like so:

```js
function importantFunction({
	id = I.req,
	name = I.req,
	values = I.req,
	check=true}={}) {
}
```

Now this function is supposed to be invoked in the following manner:

```js
importantFunction({id: 1234, name: 'name', values: [1,2]);
```

But if you forget the `id`, `name`, or `values` parameters, it'll throw an error with the list of required parameters. If you pass an object of the wrong type, it'll throw an error telling you which type it is expecting.

If you pass it an extra property, for example `checked` (you misspelled `check`), it won't let you know, but you can do this in the function:

```js
function importantFunction({
	id = I.req,
	name = I.req,
	values = I.req,
	...extraProperties,
	check=true}={}) {
}) {
	I.extra(extraProperties);  // first line in function body
}
```

That way, it'll alert you to the extra parameter if it's called with it.

## Discussion

Type checking and parameter checking can take up *so much* of the developer's time when building and debugging. In addition, if you're writing a library, you'll be doing your user a favor by throwing errors early if they don't use the API correctly.
Also, named parameters are more verbose, which has the added advantage of being easier to read.

This method has the additional benefit that a `null` value for any of the parameter is considered to be passing it with a valid value. This means that what we are enforcing are "optionals", which is quite useful. It means that you can write a function that takes an `id` as a `number` parameter, which if it really is a number get the thing at that `id`, but if it's `null` create a new one.

```js
const I = Enforce.create('', {id: '!number'});
function getSpreadsheet({id: I.req}={}) {
	if (id === null) {
		return SpreadsheetApp.create(…);
	}
	return SpreadsheetApp.openById(id);
}

getSpreadsheet({id: null});  // creates a new one
```

You can also use this method with class methods:

```js
const I = Enforce.create('Help constructor', {id: '!number'});
class Help {
  constructor({id=I.req, ...extra}={}) {
    I.extra(extra);
  }
}
```

### Disadvantages

You have to create an object for each method that you want to "decorate." That kinda sucks, but if function decorators were possible … which bring us to the next topic:

### "Decorating" the function

Above I described what I was doing as "decorating the function." Alas, proper [function decorators](https://www.telerik.com/blogs/decorators-in-javascript) are not yet available in the V8 runtime as of yet.
