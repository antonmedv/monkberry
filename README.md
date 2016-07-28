# Monkberry
[![npm](https://img.shields.io/npm/v/monkberry.svg)](https://www.npmjs.com/package/monkberry)
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
* Source maps
* Custom tags
* Blazingly fast (only necessary dom updates)

## Documentation

Documentation available on [monkberry.js.org](http://monkberry.js.org) site.

## Development

If you want to hack on Monkberry, the first step is to fork the repo.

```sh
# Build compiler
npm run build

# Build parser
npm run build:parser

# Watch changes and rebuild
npm run watch

# Start tests server
testem
```

## Plugins

* [Atom Package](https://atom.io/packages/language-monkberry)
* [Sublime Text Package](https://github.com/monkberry/language-monkberry)

## Performance

#### [Benchmarks](http://monkberry.github.io/benchmark/)

Why is Monkberry so fast? Even in comparison with React, Monkberry is **10 times faster**, sometimes **100 times faster**.
It's because Monkberry will do only necessary dom updates, and does it in a completely different way than React does.
Monkberry compiles template to plain JavaScript to gain an advantage by using v8 **hidden classes** and **reduce call stack**.
There is no virtual dom (in general, an react app have to keep 3 virtual doms), for example next template will be generated to JavaScript code which will do only necessary dom updates on state changes.

```twig
<div>
  ...
    <h1>{{ title }}</h1>
  ...
</div>
```

Will be compiled to code like this:

```js
function (state) {
  h1.textContent = state.title;
}
```

Benchmarks covers a few use cases and compares Monkberry with React and innerHTML. Also, it contains real site code and data.


## License

The MIT License (MIT) Copyright © 2016 Medvedev Anton
