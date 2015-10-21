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
* Сompiled templates
* SourceMaps
* Custom tags
* Extremely fast!

## Example

<table>
  <tr>
    <td>
<pre>
&lt;div&gt;
  &lt;h1&gt;{{ title }}&lt;/h1&gt;
  &lt;p"&gt;
    {{ text }}
  &lt;/p&gt;
&lt;/div&gt;
</pre>
    </td>
    <td>
<pre>
<b>var</b> div = document.createElement(<b>'div'</b>);
<b>var</b> h1 = document.createElement(<b>'h1'</b>);
<b>var</b> p = document.createElement(<b>'p'</b>);

div.appendChild(h1);
div.appendChild(p);

   ...

view.update = <b>function</b> (data) {
  h1.textContent = data.title;
  p.textContent = data.text;
};
</pre>
    </td>
  </tr>
</table>

```js
import monkberry from 'monkberry';
import template from './template.html';
monkberry.mount(template);

var view = monkberry.render('template');
document.body.appendChild(view.dom()); 
```

## Documentation

## Tests

Monkberry uses [Jasmine](http://jasmine.github.io) and [testem](https://github.com/airportyh/testem). To run test locally run:
```
testem ci
```
