import test from 'ava'
import {renderToString} from './helpers/render-to-string'
import * as $ from './_build'

test('hello world', t => {
  t.snapshot(renderToString($.helloWorld()))
})

test('loop sibling', t => {
  t.snapshot(renderToString($.loopSibling()))
})

test('cond', t => {
  t.snapshot(renderToString($.conditions({cond: true})))
})

test('nested loops', t => {
  t.snapshot(renderToString($.nestedLoops({
    map: [
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
    ]
  })))
})

test('expression', t => {
  t.snapshot(renderToString($.expressions({name: 'Alyona'})))
})
