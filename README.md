# Monkberry - JavaScript template engine
[![Build Status](https://travis-ci.org/monkberry/monkberry.svg?branch=master)](https://travis-ci.org/monkberry/monkberry)

Monkberry compile template to JavaScript code for creating nodes with DOM API and helper methods for updating content of these nodes.

<hr>

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

view.update = <b>function</b> (data) {
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

## Tests

Monkberry uses [Jasmine](http://jasmine.github.io) and [testem](https://github.com/airportyh/testem). To run test locally run:
```
testem ci
```
