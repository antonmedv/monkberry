import test from 'ava'
import {render} from 'monkberry'
import {print} from './helpers/render-to-string'
import * as $ from './_build'

test('non-keyed children', t => {
  const root = document.createElement('div')
  const props = {
    list: [1, 2, 3, 4, 5]
  }

  render($.nonKeyedList(props), root)
  t.is(print(root), '<ul><li>1</li><li>2</li><li>3</li><li>4</li><li>5</li><!-- for --></ul>')

  props.list = props.list.reverse()
  render($.nonKeyedList(props), root)
  t.is(print(root), '<ul><li>5</li><li>4</li><li>3</li><li>2</li><li>1</li><!-- for --></ul>')
})
