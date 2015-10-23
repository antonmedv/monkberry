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

Which you can use like that: 
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

But you can also use it like CLI tool. Install Monkberry globally:

```
npm install monkberry -g
```

And compile your all your templates into single JavaScript file with next command:

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

Next you need to attach it to the page.

```js
document.getElementById('root').appendChild(view.dom());
```

Now, to update data on page:

```js
view.update({...});
// or you can update only what's needed
view.update({key: value});
```

### Expressions

You can use and JavaScript extention inside `{{` and `}}` mustache.

```html
<div class="greetings {{ visible ? '' : 'hidden' }}">
  Hello, {{ user.name + "!" }}
</div>
```

### If, Else
Can be any valid JavaScrpt expression, just like in your scripts. Inside `if` or `else` block you can use any variables like in JavaScript.
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
> View will be `Then one!`. When if you update view:
> ```js
> view.update({
>   check: false,
>   value: 'two'
> });
> ```
> View will be `Else two!`. But if you update only `check`, variable of then part will be same as before.
> ```js
> view.update({check: true});
> ```
> View will be `Then one!`. 
>
> This is happens becouse Monkberry does not stores variables you update, it stores only DOM nodes.
> Monkberry will update only one part of `if`/`else`.

### For

You can loop other arrays and objects as well. 

```twig
{% for array %}
  {{ name }}
{% endfor %}
```
In this form body of `for` has access only for variables iterating on.
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

Also you can specify key name.
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

You need to define that filter.
```js
monkberry.filters.upper = function (text) {
  return text.toUpperCase();
};
```

Also you can specify parameters for filters.
```js
monkberry.filters.replace = function (text, from, to) {
  return text.replace(from, to);
};
```

```twig
{{ text | replace(/.../, '$1') }}
```

And you can combine filters.
```twig
{{ text | lower | replace(/.../, '$1') | upper }}
```

That expression will be compiled to next JavaScript:
```js
upper(replace(lower(text), /.../, '$1'));
```

### Custom tags

### Prerender

### Wrappers

### Transforms

### Parsers

## Tests

Monkberry uses [Jasmine](http://jasmine.github.io) and [testem](https://github.com/airportyh/testem). To run test locally run:
```
testem ci
```
