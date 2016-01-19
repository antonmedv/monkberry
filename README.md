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
    - [Default values](#default-values)
    - [Filters](#filters)
    - [Custom tags](#custom-tags)
    - [Spread attributes](#spread-attributes)
    - [Importing](#importing)
    - [Event Handling](#event-handling)
    - [Globals](#globals)
    - [Prerender](#prerender)
    - [Wrappers](#wrappers)
    - [Transforms](#transforms)
    - [Parsers](#parsers)
    - [Unsafe](#unsafe)
    - [Comments](#comments)
  - [API Reference](#api-reference)
    - [Monkberry](#monkberry)
      - [monkberry.render(name, [values, [noCache]])](#monkberryrendername-values-nocache)
      - [monkberry.prerender(name, times)](#monkberryprerendername-times)
      - [monkberry.mount(templates)](#monkberrymounttemplates)
    - [Monkberry.View](#monkberryview)
      - [view.appendTo(toNode)](#viewappendtotonode)
      - [view.insertBefore(toNode)](#viewinsertbeforetonode)
      - [view.createDocument()](#viewcreatedocument)
      - [view.update(data)](#viewupdatedata)
      - [view.remove([force])](#viewremoveforce)
      - [view.getElementById(id)](#viewgetelementbyidid)
      - [view.querySelector(query)](#viewqueryselectorquery)
  - [Tests](#tests)
  - [Benchmarks](#benchmarks)

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
view.appendTo(document.body); 

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
document.getElementById('root').appendChild(view.createDocument());
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

### Default values

Render of view contains two phase: node creation and update of node contents with data.

```js
var view = monkberry.render('template', data);
// Equals to:
var view = monkberry.render('template');
view.update(data);
```

Some times data for view does not available and it's use full to place come data as default.
Best way to do it is use logical _OR_ operator `||`.

```twig
<div class="foo {{ modify || 'baz' }}">
    {{ content || "No content" }}
</div>
```

In this case on first phase of render view will be filled with default data:

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

### Spread attributes

Spread attributes allow easily convert object into node attributes.  
The properties of the object that you pass in are copied onto the node's attributes.

```twig
<input {{...attr}}/>
```

```js
var view = monkberry.render('template', {attr: {
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
{% import './path/to/template.html' %}

    <template/>
 
```

Import statement will require that template and automatically mount it to monkberry.

### Event Handling

There are a few ways to deal with event handling in Monkberry.
Add event listener to node directly: 
 
```js
view.querySelector('.button').addEventListener('click', function (event) {
    ...
});
```

But this is difficult when dealing with conditions and loops (it's is possible to solve if using [wrappers](#wrappers)).

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
  view.querySelector('.svg-icon').appendChild(svgIconNodes);
  return view;
};
```

Wrappers usefull to manipulate view's nodes, adding event listeners and a lot of other staff.

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

### Parsers

Now Monkberry support only one type of parser, mustage like (`monk` named). But it can be extender with custom parsers. Every parser must return valid [AST](https://github.com/monkberry/parser/blob/master/src/ast.js) tree.

```js
import { Compiler } from 'monkberry';
import { myParser } from './parser';

var compiler = new Compiler();
compiler.parsers.myParser = myTransform;

compiler.addSource('template', code, 'myParser');
compiler.addSource('another', code, 'monk');

var output = compiler.compile();
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

Then using Monkberry via `require('monkberry')` single instance returned. 
To create a new Monkberry object or extend prototype use `monkberry.constructor`.
  
#### monkberry.render(name, [values, [noCache]])

Generates DOM nodes, and returns new `Monkberry.View` instance.

* `name`: `string` - name of template.
* `values`: `Object` - Optional. Data to update view.
* `noCache`: `boolean` - Optional. Use or not cached view from pool.

#### monkberry.prerender(name, times)

Generates views for future calls of render method.

* `name`: `string` - name of template.
* `times`: `number` - how many times.

#### monkberry.mount(templates)

Add template to monkberry.

* `templates`: `Object` - monkberry compiled templates.

Example:

```js
monkberry.mount(require('./template.monk'));
``` 
 
### Monkberry.View

#### view.appendTo(toNode)

Append rendered view nodes to specified node.

* `toNode`: `Element` - DOM node.

#### view.insertBefore(toNode)

Insert rendered view nodes before specified node.

* `toNode`: `Element` - DOM node.

#### view.createDocument()

Return view's nodes. Note what if your template contains more then one root element, `createDocument` function will 
return `DocumentFragment` what contains all these nodes. If you have only one root node, it will be returned as is.

#### view.update(data)

Update rendered template with new data. You can specify only part of data to update or update entire data.

* `data`: `Object|Array` - values to update in template.

Example:

```js
var data = {
    title: 'Title #1',
    content: '...'
};

var view = monkberry.render('...', data);

view.update({title: 'Title #2'});
```

#### view.remove([force])

Remove view's nodes from document, and puts it to pool for future reuse.

* `force`: `boolean` - Optional. False be default. If true, removed view will not be putted into pool.


#### view.querySelector(query)

Select node by query.

* `query`: `string` - query to select node.

> Note what this function uses [Element.matches()](https://developer.mozilla.org/en-US/docs/Web/API/Element/matches) for checking root nodes. Include polyfill for matches if you use it.

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

## Benchmarks

Benchmarks covers a few use cases, and compare Monkberry with [React](https://facebook.github.io/react/) and [temple-wat](https://github.com/KosyanMedia/temple).
Also it's contains real site code for soft/hard update tests.

* [monkberry.github.io/benchmark](http://monkberry.github.io/benchmark/)
* [github.com/monkberry/benchmark](https://github.com/monkberry/benchmark)
