# Monkberry - JavaScript template engine
[![Build Status](https://travis-ci.org/monkberry/monkberry.svg?branch=master)](https://travis-ci.org/monkberry/monkberry)

Monkberry compile template to JavaScript code for creating nodes with DOM API and helper methods for updating content of these nodes.

```
npm install monkberry --save
```

## Features

* Small, dependency free
* Simple and minimalistic
* Fully tested
* One-way data flow
* Precompiled templates
* SourceMaps
* Custom tags
* Extremely fast!

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of Contents

  - [Example](#example)
  - [Documentation](#documentation)
    - [Getting Started](#getting-started)
    - [Expressions](#expressions)
    - [If, Else](#if-else)
    - [For](#for)
    - [Filters](#filters)
    - [Custom tags](#custom-tags)
    - [Prerender](#prerender)
    - [Wrappers](#wrappers)
    - [Transforms](#transforms)
    - [Parsers](#parsers)
  - [Tests](#tests)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

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
var view = monkberry.render('template');
document.body.appendChild(view.dom()); 

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

Require generated `template.js` and `monkberry.js` files and mount template:

```js
var monkberry = require('monkberry');
var template = require('./template.js');

monkberry.mount(template);
```

Render that view.

```js
var view = monkberry.render('template'); 
// or
var view = monkberry.render('template', {...}); 
```

Attach generated DOM nodes to the page.

```js
document.getElementById('root').appendChild(view.dom());
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
> var view = monkberry.render('example', {
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
> This is happens becouse Monkberry does not stores variables passed to `update` function, it stores only DOM nodes.
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

### Filters

Any expression support filter statement.
```twig
Hello, {{ user.name | upper }}
```

To define that filter:
```js
monkberry.filters.upper = function (text) {
  return text.toUpperCase();
};
```

Also Monkberry understand parameters for filters:
```js
monkberry.filters.replace = function (text, from, to) {
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

Any template mounted to Monkberry can be called as custom tag. 

```js
monkberry.mount(require('./views/block.html'));
```

Inside another template possible to insert that `block` templace as custom tag:

```html
<div>
  <block/>
</div>
```

One file can contains several definitions of custom tags:
```html
<my-tag>
  ...
</my-tag>
<my-second-tag>
  ...
</my-second-tag>
```

Custom tags may contains variables:
```twig
<greet>
  {{ value }}, {{ name }}!
</greet>
```

To render that custom tag, specify variables as attributes:

```twig
<greet value="Hello" name="world">
<greet value="Hello" name="{{ user.name }}">
```

### Prerender

To speedup render Monkberry can prerender DOM nodes to use them in future.

```js
monkberry.prerender('template', 10); // Preprender template 10 times.
```

Then next `render` call will use one of these prerendered views:
```js
monkberry.render('template', {...}); // Will use already created DOM nodes.
```

This is very usefull to do then browser waiting some xhr request.

To get info about prerendered template in runtime, use `monkberry.pool.store`.

### Wrappers

Every template in Monkbeery when rendered can be "wrapped" by function.

For example we have a template `logo.html`:
```twig
<div>
  <i class="svg-icon"></i>
</div>
```

And we want to insert SVG nodes inside `i` tag on render. This is can be done via wrappers:
```js
monkberry.wrappers.logo = function (view) {
  view.dom().querySelector('.svg-icon').appendChild(svgIconNodes);
  return view;
};
```

Wrappers usefull to manipulate view's nodes, adding event listeners and a lot of other staff.

### Transforms

Transformers allow to modify [AST](https://en.wikipedia.org/wiki/Abstract_syntax_tree) before compilation of templates. 
List of AST nodes can be founded here: [ast.js](https://github.com/monkberry/monkberry/blob/master/parsers/ast.js)
Example of transform which trim whitespaces: [whitespace.js](https://github.com/monkberry/monkberry/blob/master/src/optimize/whitespace.js)

Add transforms to Monkbeery before compilation:
```js
import { Compiler } from 'monkberry';
import { myTransform } from './myTransform';

var compiler = new Compiler();
compiler.transforms.custom = myTransform;
```

### Parsers

Now Monkberry support only one type of parser, mustage like (`monk` named). But it can be extender with custom parsers. Every parser must return valid [AST](https://github.com/monkberry/monkberry/blob/master/parsers/ast.js) tree.

```js
import { Compiler } from 'monkberry';
import { myParser } from './parser';

var compiler = new Compiler();
compiler.parsers.myParser = myTransform;

compiler.addSource('template', code, 'myParser');
compiler.addSource('another', code, 'monk');

var output = compiler.compile();
```

## Tests

Monkberry uses [Jasmine](http://jasmine.github.io) and [testem](https://github.com/airportyh/testem). To run test locally run:
```
testem ci
```
