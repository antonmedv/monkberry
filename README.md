# Monkberry
[![Build Status](https://travis-ci.org/monkberry/monkberry.svg?branch=master)](https://travis-ci.org/monkberry/monkberry)

Monkberry is **blazingly fast**, **small `1kb`** and **simple** JavaScript library for building **web user interfaces**.

## Example

Monkberry comes with powerfull templating engine, which is compiled to JavaScript.

```twig
<ol>
  {% for todos %}
    <li>
      {% if complete %}
        <del>{{ text }}</del>
      {% else %}
        <em>{{ text }}</em>
      {% endif %}
    </li>
  {% endfor %}
</ol>
```

and then

```js
import Monkberry from 'monkberry';
import Template from 'template.monk';

const view = Monkberry.render(Template, document.body);

view.update({todos: [...]});
```

## Features

* Small **`1kb`** minified & gzipped
* Simple, small learning curve
* Fully tested
* Precompiled templates
* SourceMaps
* Custom tags
* Blazingly fast (only necessary dom updates)

## Documentation

Documentation available on [monkberry.js.org](http://monkberry.js.org) site.

## Table of Contents

  - [Example](#example)
  - [Documentation](#documentation)
    - [Getting Started](#getting-started)
    - [Expressions](#expressions)
    - [If, Else](#if-else)
    - [For](#for)
    - [Default values](#default-values)
    - [Filters](#filters)
    - [Custom tags](#custom-tags)
    - [Spread attributes](#spread-attributes)
    - [Importing](#importing)
    - [Event Handling](#event-handling)
    - [Globals](#globals)
    - [Prerender](#prerender)
    - [Transforms](#transforms)
    - [Unsafe](#unsafe)
    - [Comments](#comments)
    - [Blocks](#blocks)
  - [API Reference](#api-reference)
    - [Monkberry](#monkberry)
      - [monkberry.render(template, node[, options])](#monkberryrendername-values-nocache)
      - [monkberry.prerender(template, times)](#monkberryprerendername-times) 
      - [Monkberry.prototype.appendTo(toNode)](#viewappendtotonode)
      - [Monkberry.prototype.insertBefore(toNode)](#viewinsertbeforetonode)
      - [Monkberry.prototype.createDocument()](#viewcreatedocument)
      - [Monkberry.prototype.update(data)](#viewupdatedata)
      - [Monkberry.prototype.remove()](#viewremoveforce)
      - [Monkberry.prototype.querySelector(query)](#viewqueryselectorquery)
  - [Tests](#tests)
  - [Plugins](#plugins)
  - [Benchmarks](#benchmarks)

## Example

Monkberry will compile this template:
```html
<div>
  <h1>{{ title }}</h1>
  <p>
    {{ text }}
  </p>
</div>
```

To JavaScript code like this:
```js
var div = document.createElement('div');
var h1 = document.createElement('h1');
var p = document.createElement('p');

div.appendChild(h1);
div.appendChild(p);

   ...

view.update = function (data) {
  h1.textContent = data.title;
  p.textContent = data.text;
};
```

Which can be used like that: 
```js
var view = Monkberry.render(template, document.body);

view.update({
  title: 'Monkberry',
  text: 'JavaScript DOM template engine'
});
```

## Documentation

### Getting Started

Monkberry has support for both browserify via [monkberrify](https://github.com/monkberry/monkberrify) and for webpack via [monkberry-loader](https://github.com/monkberry/monkberry-loader). 

Monkberry can be used like CLI tool. Install Monkberry globally:

```
npm install monkberry -g
```

To compile all templates into single JavaScript file with source map run next command:

```
monkberry --source-map --output template.js templates/*.html
```

Require generated `template.js` and `monkberry.js` files and render that view.

```js
var Monkberry = require('monkberry');
var Template = require('./template.js');

var view = Monkberry.render(Template, document.body);
```


Now, to update data of view on page:

```js
view.update({...});
// or update only what's needed
view.update({key: value});
```

### Expressions

Monkberry perceives everything inside `{{` and `}}` mustache as JavaScript expression.

```html
<div class="greetings {{ visible ? '' : 'hidden' }}">
  Hello, {{ user.name + "!" }}
</div>
```

### If, Else
Can be any valid JavaScrpt expressions.
```twig
{% if count < 0 || count > 10 %}
  ...
{% else %}
  ...
{% endif %}
```
Any number on variables in `if`:
```twig
{% if array.indexOf(search) != -1 %}
  ...
{% endif %}
```

> Note what Monkberry update only one of `if`/`else` block.
> ```twig
> {% if check %}
>   Then {{ value }}!
> {% else %}
>   Else {{ value }}!
> {% endif %}
> ```
> Render that template:
> ```js
> var view = Monkberry.render(Example, document.body);
> view.update({
>   check: true,
>   value: 'one'
> });
> ```
> View will be `Then one!`. When if update view:
> ```js
> view.update({
>   check: false,
>   value: 'two'
> });
> ```
> View will be `Else two!`. But if update only `check`, variable of then part will be same as before.
> ```js
> view.update({check: true});
> ```
> View will be `Then one!`. 
>
> This is happens because Monkberry does not stores variables passed to `update` function, it stores only DOM nodes.
> Monkberry will update only one part of `if`/`else`.

### For

Monkberry can loop other arrays and objects as well. 

```twig
{% for array %}
  {{ name }}
{% endfor %}
```
In this form, body of `for` has access only for variables iterating on.
```js
view.update({
  array: [
    {name: 'Anton'},
    ...
  ]
});
```

To access outer scope specify iterator name.

```twig
{% for user of array %}
  {{ user.name }}
{% endfor %}
```

Also key can be specified.
```twig
{% for key, user of array %}
  {{ key }}: {{ user.name }}
{% endfor %}
```

### Default values

```twig
<div class="foo {{ modify || 'baz' }}">
    {{ content || "No content" }}
</div>
```

View rendered without data will be filled with default data:

```twig
<div class="foo baz">
    No content
</div>
```

Note if you will use some variable in right side of _OR_ operator, what can't be used as default data.
  
```twig
{{ content || "No content" + foo }}
```



### Filters

Any expression support filter statement.
```twig
Hello, {{ user.name | upper }}
```

To define that filter:
```js
Template.filters.upper = function (text) {
  return text.toUpperCase();
};
```

Also Monkberry understand parameters for filters:
```js
template.filters.replace = function (text, from, to) {
  return text.replace(from, to);
};
```

```twig
{{ text | replace(/.../, '$1') }}
```

And allow to combine filters:
```twig
{{ text | lower | replace(/.../, '$1') | upper }}
```

That expression will be compiled to next JavaScript:
```js
upper(replace(lower(text), /.../, '$1'));
```

Filters can be used in expressions, `if` and `for` statements.

### Custom tags

Custom tag template `greet.monk`:
```twig
<div>
  {{ value }}, {{ name }}!
</div>
```

To render that custom tag in another template:

```twig
{% import greet from './greet.monk' %}
<greet value="Hello" name="world">
<greet value="Hello" name="{{ user.name }}">
```

### Spread attributes

Spread attributes allow easily convert object into node attributes.  
The properties of the object that you pass in are copied onto the node's attributes.

```twig
<input {{...attr}}/>
```

```js
view.update({attr: {
  id: 'foo', 
  value: 'baz'
}});
```

You can combine it with other attributes.

```twig
<input {{...attr}} value={{ value }}/>
```

Note what later updates of attributes override previous ones.

```js
view.update({value: 'baz'});
// ...
view.update({attr: {value: 'new baz'}}); // Will override previous value.
```

Spread operator also works well with custom attributes. In fact, this is best way to pass data into custom tag. 
 
```twig
<my-tag {{...attr}}/>
``` 
 
```twig
<my-tag>
    <input type={{ type }} value={{ value }}>
</my-tag>
``` 

### Importing

It is possible to require template within another template. 
  
```twig
{% import Component './Component.monk' %}

    <Component/>
 
```

Also it's possible to include any JS file or module:

```twig
{% import upperCase 'upper-case' %}
// ...
{{ upperCase(name) }}
```

### Event Handling

There are a few ways to deal with event handling in Monkberry.
Add event listener to node directly: 
 
```js
view.querySelector('.button').addEventListener('click', function (event) {
    ...
});
```

But this is difficult when dealing with conditions and loops.

Better approach is to use [event delegating](https://github.com/monkberry/events).

```js
view.on('click', '.button', function (event) {
    ...
});
```

### Globals

Monkberry also support global variables. This is very usefull if using `window` variable inside of templates. 
Or if using translation function like this: `{{ __('greeting') + userName }}`. 

To do it, you need to specify globals as array of variables names for compiler to pass. Read monkberry loaders docs for more info.   

### Prerender

To speedup render Monkberry can prerender DOM nodes to use them in future.

```js
Monkberry.prerender(Template, 10); // Preprender template 10 times.
```

Then next `render` call will use one of these prerendered views:
```js
Monkberry.render(Template, node); // Will use already created DOM nodes.
```

This is very usefull to do then browser waiting some xhr request.

### Transforms

Transformers allow to modify [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) before compilation of templates. 
List of AST nodes can be founded here: [ast.js](https://github.com/monkberry/parser/blob/master/src/ast.js)
Example of transform which trim whitespaces: [whitespace.js](https://github.com/monkberry/monkberry/blob/master/src/optimize/whitespace.js)

Add transforms to Monkbeery before compilation:
```js
import { Compiler } from 'monkberry';
import { myTransform } from './myTransform';

var compiler = new Compiler();
compiler.transforms.custom = myTransform;
```

### Unsafe

Monkberry escape all inserted variables by default. But if some times you want to insert 
some HTML template via variable you can you _unsafe_ statement which is using `innerHTML`. 
Improper use of the _unsafe_ statement can open you up to a [cross-site scripting (XSS)](https://en.wikipedia.org/wiki/Cross-site_scripting) attack. 

```twig
{% unsafe '<a href="XSS">...</a>' %}
{% unsafe html %}
```

### Comments

You can use standard html comments.
 
```twig
<!-- Comment does here -->
```

Comments will be cut out from template. 

## API Reference

Monkberry API strictly follows [semantic versioning](http://semver.org).  

### Monkberry
  
#### Monkberry.render(template, node, options)

Render template, and returns new `Monkberry` instance.

#### Monkberry.prerender(template, times)

Generates views for future calls of render method.

#### Monkberry.prototype.appendTo(toNode)

Append rendered view nodes to specified node.

* `toNode`: `Element` - DOM node.

#### Monkberry.prototype.insertBefore(toNode)

Insert rendered view nodes before specified node.

* `toNode`: `Element` - DOM node.

#### Monkberry.prototype.createDocument()

Return view's nodes. Note what if your template contains more then one root element, `createDocument` function will 
return `DocumentFragment` what contains all these nodes. If you have only one root node, it will be returned as is.

#### Monkberry.prototype.update(data)

Update rendered template with new data. You can specify only part of data to update or update entire data.

* `data`: `Object|Array` - values to update in template.

Example:

```js
var data = {
    title: 'Title #1',
    content: '...'
};

view.update({title: 'Title #2'});
```

#### Monkberry.prototype.remove([)

Remove view's nodes from document, and puts it to pool for future reuse.


#### view.querySelector(query)

Select node by query.

* `query`: `string` - query to select node.

> Note what this function uses [Element.matches()](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches) for checking root nodes. Include polyfill for matches if you use it.

If you template contains more then one nodes on first level, `querySelector` will look other all subtrees. Array of all top level nodes can be accessed by `view.nodes[]` array. 

> Note what querySelector can not work with template which have if/for/custom node on first level.
> ```twig
> {% if cond %}
>     ...
> {% endif %}
> ```
> You will got exception like this: `Can not use querySelector with non-element nodes on first level.`
> 
> Solution is to wrap such statement into another node:
> ```twig
> <div>
>     {% if cond %}
>         ...
>     {% endif %}
> </div>
> ``` 


## Tests

Monkberry uses [Jasmine](http://jasmine.github.io) and [testem](https://github.com/airportyh/testem). To run test locally run:
```
testem ci
```

## Plugins

* [Atom Package](https://atom.io/packages/language-monkberry)
* [Sublime Text Package](https://github.com/monkberry/language-monkberry)

## Benchmarks

Benchmarks covers a few use cases, and compare Monkberry with [React](https://facebook.github.io/react/) and innerHTML.
Also it's contains real site code for tests.

* [monkberry.js.org/benchmark](http://monkberry.github.io/benchmark/)
