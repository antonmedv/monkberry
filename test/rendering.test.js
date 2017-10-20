import test from 'ava'
import {renderToString} from './helpers/render-to-string'
import * as $ from './_build'

test('hello world', t => {
  t.snapshot(renderToString($.helloWorld()))
})

test('loop sibling', t => {
  t.snapshot(renderToString($.loopSibling()))
})
