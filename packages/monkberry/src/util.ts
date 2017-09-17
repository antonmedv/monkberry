import {VNode} from './vnode'
import {mount, unmount} from './dom/mounting'

export function getDom(vNode: VNode): Element {
  if (vNode.view) {
    return vNode.view.root
  } else {
    throw new Error('Monkberry Error: a vNode without DOM.')
  }
}

export function insertOrAppend(parentDom: Comment, newNode: Element, nextNode: Element | null) {
  if (nextNode) {
    parentDom.parentNode!.insertBefore(newNode, nextNode)
  } else {
    parentDom.parentNode!.insertBefore(newNode, parentDom)
  }
}

export function replaceWithNewNode(lastVNode: VNode, nextVNode: VNode, parentDom: Comment) {
  unmount(lastVNode, null)
  const dom = mount(nextVNode, null)
  parentDom.parentNode!.replaceChild(dom, getDom(lastVNode))
}
