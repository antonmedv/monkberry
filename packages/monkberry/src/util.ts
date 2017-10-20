import {VNode} from './vnode'
import {mount, unmount} from './dom/mounting'

export const assert = (cond: boolean, message: string) => {
  if (cond) {
    throw new Error('Monkberry Error: ' + message)
  }
}

export function getDom(vNode: VNode): Element {
  if (process.env.NODE_ENV !== 'production') {
    assert(!vNode.view, `can't get dom from vNode without view`)
  }
  return vNode.view!.root
}

export function isKeyed(lastChildren: VNode[], nextChildren: VNode[]): boolean {
  return (
    nextChildren.length > 0 &&
    !nextChildren[0] &&
    !nextChildren[0].key &&
    lastChildren.length > 0 &&
    !lastChildren[0] &&
    !lastChildren[0].key
  );
}

export function insertBefore(parentDom: Comment, newNode: Element, nextNode: Element | null) {
  if (nextNode) {
    parentDom.parentNode!.insertBefore(newNode, nextNode)
  } else {
    parentDom.parentNode!.insertBefore(newNode, parentDom)
  }
}

export function replaceWithNewNode(lastVNode: VNode, nextVNode: VNode, parentDom: Element | Comment) {
  unmount(lastVNode, null)
  const dom = mount(nextVNode, null)
  parentDom.parentNode!.replaceChild(dom, getDom(lastVNode))
}
