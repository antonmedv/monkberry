import test from 'ava'
import {renderToString} from './helpers/render-to-string'
import * as $ from './_build'

test('foo', t => {
  t.snapshot(renderToString($.helloWorld()))
})
