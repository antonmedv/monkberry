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

### Wrappers

### Transforms

### Parsers

## Tests

Monkberry uses [Jasmine](http://jasmine.github.io) and [testem](https://github.com/airportyh/testem). To run test locally run:
```
testem ci
```
