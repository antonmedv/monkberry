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

Benchmarks covers a few use cases, and compare Monkberry with [React](https://facebook.github.io/react/) and innerHTML.
Also it's contains real site code for tests.

* [Benchmarks](http://monkberry.github.io/benchmark/)

## License

The MIT License (MIT) Copyright © 2016 Medvedev Anton
