import {Spot, VNode} from '../vnode'
import {getDom} from '../util'

export function mount(vNode: VNode, parentDom: Element | Comment | null): Element {
  const template = vNode.type
  const view = template()

  if (parentDom) {
    if (parentDom.nodeType === 8 /* Node.COMMENT_NODE */) {
      parentDom.parentNode!.insertBefore(view.root, parentDom)
    } else {
      parentDom.appendChild(view.root)
    }
  }

  vNode.view = view

  view.update(vNode.props)

  if (vNode.spots && view.spots) {
    mountSpots(vNode.spots, view.spots)
  }

  return view.root
}

export function mountSpots(vSpots: Spot[], spots: Comment[]) {
  for (let i = 0, len = vSpots.length; i < len; i++) {
    mountChildren(vSpots[i], spots[i])
  }
}

export function mountChildren(children: VNode[], parentDom: Comment) {
  for (let child of children) {
    if (child) {
      mount(child, parentDom)
    }
  }
}

export function unmountChildren(children: VNode[], parentDom: Comment) {
  for (let i = 0, len = children.length; i < len; i++) {
    const child = children[i]
    if (child) {
      unmount(child, parentDom)
    }
  }
}

export function unmount(vNode: VNode, parentDom: Element | Comment | null) {
  const node = getDom(vNode)
  if (parentDom && node) {
    parentDom.parentNode!.removeChild(node)
  }
}
