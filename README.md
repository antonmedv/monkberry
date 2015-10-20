# Monkberry - JavaScript template engine
[![Build Status](https://travis-ci.org/monkberry/monkberry.svg?branch=master)](https://travis-ci.org/monkberry/monkberry)

Monkberry compile template to JavaScript code which will generate DOM tree and allows to update that tree with new data then its needed. 

```
npm install monkberry --save
```

## Features

* Small, dependency free library
* Simple and minimalistic
* Fully tested
* One-way data flow
* Сompiled templates
* SourceMaps
* Custom tags
* Extremely fast!

## Example
```html
<ToDo>
  <ul>
    {% for tasks %}
      <li class="{{ complete ? 'stroke' : '' }}">
        {{ text }}
      </li>
    {% endfor %}
  <ul>
  <div>
    Total tasks {{ tasks.length }}.  
  </div>
</ToDo>
```

```js
import monkberry from 'monkberry';
import todo from './todo.html';

monkberry.mount(todo); // Mount template to monkberry.

var view = monkberry.render('ToDo'); // Render view with DOM tree.

document.body.appendChild(view.dom()); // Insert DOM tree on page.

view.update({
  tasks: [
    {
      text: "Task to-do",
      complete: false
    }, 
    {
      text: "Another task",
      complete: false
    }, 
    {
      text: "This task is done",
      complete: true    
    }
  ]
});
```

## Documentation

## Tests

Monkberry uses [Jasmine](http://jasmine.github.io) and [testem](https://github.com/airportyh/testem). To run test locally run:
```
testem ci
```
