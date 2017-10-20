import {VNode} from '../vnode'
import {patch} from './patching'
import {mount} from './mounting'

export interface Root {
  dom: Element
  input: VNode
}

const roots: Root[] = []

export function render(input: VNode, parentDom: Element) {
  const root = getRoot(parentDom)
  if (root) {
    patch(
      root.input,
      input,
      parentDom
    )
    root.input = input
  } else {
    mount(input, parentDom)
    setRoot(parentDom, input)
  }
}

function getRoot(dom: Element): Root | null {
  for (let i = 0, len = roots.length; i < len; i++) {
    const root = roots[i]
    if (root.dom === dom) {
      return root
    }
  }
  return null
}

function setRoot(dom: Element, input: VNode): Root {
  const root: Root = {dom, input}
  roots.push(root)
  return root
}

function removeRoot(root: Root): void {
  for (let i = 0, len = roots.length; i < len; i++) {
    if (roots[i] === root) {
      roots.splice(i, 1)
      return
    }
  }
}
