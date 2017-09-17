import {render} from './dom/rendering'
import {VNode} from './vnode'

function a() {
  const div0 = document.createElement('div')
  const h1 = document.createElement('h1')
  const spot1 = document.createComment('stop1')

  div0.appendChild(h1)
  div0.appendChild(spot1)

  return {
    root: div0,
    spots: [spot1],
    update(data: any) {
      h1.textContent = data.text
    }
  }
}

function b() {
  const span = document.createElement('div')
  const i1 = document.createElement('i')
  const c1 = document.createElement('input')
  c1.type = 'checkbox'
  span.appendChild(i1)
  span.appendChild(c1)

  return {
    root: span,
    update(data: any) {
      i1.textContent = data.text
    }
  }
}


function _render({text, cond}: any): VNode {
  return {
    type: a,
    props: {text, cond},
    spots: [
      {
        keyed: true,
        children: [
          {type: b, props: {text: '1'}, key: '1'},
          {type: b, props: {text: '2'}, key: '2'},
          {type: b, props: {text: '3'}, key: '3'},
          {type: b, props: {text: '4'}, key: '4'},
          {
            type: a, props: {text: '5'}, key: '5', spots: [
            {
              keyed: true,
              children: [
                {type: b, props: {text: 'a'}, key: 'a'},
                {type: b, props: {text: 'b'}, key: 'b'},
                {type: b, props: {text: 'c'}, key: 'c'},
                {type: b, props: {text: 'd'}, key: 'd'},
              ]
            }
          ]
          },
          {type: b, props: {text: '6'}, key: '6'},
          {type: b, props: {text: '7'}, key: '7'},
          {type: b, props: {text: '8'}, key: '8'},
          {type: b, props: {text: '9'}, key: '9'},
        ]
      }
    ],
  }
}

function _render2({text, cond}: any): VNode {
  return {
    type: a,
    props: {text, cond},
    spots: [
      {
        keyed: true,
        children: [
          {type: b, props: {text: '>1<'}, key: '1'},
          {type: b, props: {text: '6'}, key: '6'},
          {type: b, props: {text: '7'}, key: '7'},
          {type: b, props: {text: '8'}, key: '8'},
          {type: b, props: {text: '9'}, key: '9'},
          {
            type: a, props: {text: '5'}, key: '5', spots: [
            {
              keyed: true,
              children: [
                {type: b, props: {text: 'c'}, key: 'c'},
                {type: b, props: {text: 'd'}, key: 'd'},
                {type: b, props: {text: 'b'}, key: 'b'},
                {type: b, props: {text: 'a'}, key: 'a'},
              ]
            }
          ]
          },
          {type: b, props: {text: '2'}, key: '2'},
          {type: b, props: {text: '3'}, key: '3'},
          {type: b, props: {text: '4'}, key: '4'},
        ]
      }
    ],
  }
}

let root = document.querySelector('#root')
render(_render({text: 'one', cond: true}), root as Element)
setTimeout(() => render(_render2({text: 'two', cond: true}), root as Element), 1000)
