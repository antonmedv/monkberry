import {Spot, VNode} from '../vnode'
import {mount, mountChildren, unmount, unmountChildren} from './mounting'
import {getDom, insertOrAppend, replaceWithNewNode} from '../util'

export function patch(lastVNode: VNode, nextVNode: VNode, parentDom: Element | Comment) {
  patchElement(lastVNode, nextVNode, parentDom)
}

export function patchElement(lastVNode: VNode, nextVNode: VNode, parentDom: Element | Comment) {
  const nextType = nextVNode ? nextVNode.type : nextVNode
  const lastType = lastVNode ? lastVNode.type : lastVNode

  if (lastType !== nextType) {
    replaceWithNewNode(
      lastVNode,
      nextVNode,
      parentDom
    )
  } else if (lastVNode.view) {
    const view = lastVNode.view
    const lastProps = lastVNode.props
    const nextProps = nextVNode.props
    const nextRef = nextVNode.ref

    nextVNode.view = view
    if (lastVNode.spots && nextVNode.spots) {
      if (view.spots) {
        patchSpot(lastVNode.spots, nextVNode.spots, view.spots)
      } else {
        throw new Error('Monkberry Error: view without spots.')
      }
    }

    if (lastProps !== nextProps) {
      view.update(nextProps)
    }
    // if (nextRef) {
    //   if (lastVNode.ref !== nextRef) {
    //     mountRef(dom, nextRef, lifecycle)
    //   }
    // }
  } else {
    throw new Error('Monkberry Error: last vNode without view.')
  }
}


function patchSpot(lastSpot: Spot[], nextSpot: Spot[], spots: Comment[]) {
  for (let i = 0, len = lastSpot.length; i < len; i++) {
    if (lastSpot[i].children !== nextSpot[i].children) {
      patchChildren(lastSpot[i], nextSpot[i], spots[i])
    }
  }
}

function patchChildren(lastSpot: Spot, nextSpot: Spot, parentDom: Comment) {
  const lastChildren = lastSpot.children
  const nextChildren = nextSpot.children
  const lastLength = lastChildren.length
  const nextLength = nextChildren.length
  const patchKeyed = lastSpot.keyed && nextSpot.keyed

  if (lastLength === 0) {
    if (nextLength > 0) {
      mountChildren(nextChildren, parentDom)
    }
  } else if (nextLength === 0) {
    unmountChildren(lastChildren, parentDom)
  } else if (patchKeyed) {
    patchKeyedChildren(
      lastChildren,
      nextChildren,
      parentDom,
      lastLength,
      nextLength
    )
  } else {
    patchNonKeyedChildren(
      lastChildren,
      nextChildren,
      parentDom,
      lastLength,
      nextLength
    )
  }
}

export function patchNonKeyedChildren(lastChildren: VNode[],
                                      nextChildren: VNode[],
                                      parentDom: Comment,
                                      lastChildrenLength: number,
                                      nextChildrenLength: number) {
  const commonLength =
    lastChildrenLength > nextChildrenLength
      ? nextChildrenLength
      : lastChildrenLength
  let i = 0

  for (; i < commonLength; i++) {
    let nextChild = nextChildren[i]
    patch(
      lastChildren[i],
      nextChild,
      parentDom
    )
  }
  if (lastChildrenLength < nextChildrenLength) {
    for (i = commonLength; i < nextChildrenLength; i++) {
      let nextChild = nextChildren[i]
      mount(nextChild, parentDom)
    }
  } else if (lastChildrenLength > nextChildrenLength) {
    for (i = commonLength; i < lastChildrenLength; i++) {
      unmount(lastChildren[i], parentDom)
    }
  }
}

export function patchKeyedChildren(a: VNode[],
                                   b: VNode[],
                                   dom: Comment,
                                   aLength: number,
                                   bLength: number) {
  let
    aEnd = aLength - 1,
    bEnd = bLength - 1,
    aStart = 0,
    bStart = 0,
    i,
    j,
    aNode,
    bNode,
    nextNode,
    nextPos,
    node,
    aStartNode = a[aStart],
    bStartNode = b[bStart],
    aEndNode = a[aEnd],
    bEndNode = b[bEnd]

  // Step 1
  // tslint:disable-next-line
  outer: {
    // Sync nodes with the same key at the beginning.
    while (aStartNode.key === bStartNode.key) {
      patch(aStartNode, bStartNode, dom)
      aStart++
      bStart++
      if (aStart > aEnd || bStart > bEnd) {
        break outer
      }
      aStartNode = a[aStart]
      bStartNode = b[bStart]
    }

    // Sync nodes with the same key at the end.
    while (aEndNode.key === bEndNode.key) {
      patch(aEndNode, bEndNode, dom)
      aEnd--
      bEnd--
      if (aStart > aEnd || bStart > bEnd) {
        break outer
      }
      aEndNode = a[aEnd]
      bEndNode = b[bEnd]
    }
  }

  if (aStart > aEnd) {
    if (bStart <= bEnd) {
      nextPos = bEnd + 1
      nextNode = nextPos < bLength ? getDom(b[nextPos]) : null
      while (bStart <= bEnd) {
        node = b[bStart]
        bStart++
        insertOrAppend(dom, mount(node, null), nextNode)
      }
    }
  } else if (bStart > bEnd) {
    while (aStart <= aEnd) {
      unmount(a[aStart++], dom)
    }
  } else {
    const aLeft = aEnd - aStart + 1
    const bLeft = bEnd - bStart + 1
    const sources = new Array(bLeft)

    // Mark all nodes as inserted.
    for (i = 0; i < bLeft; i++) {
      sources[i] = -1
    }
    let moved = false
    let pos = 0
    let patched = 0

    // When sizes are small, just loop them through
    if (bLeft <= 4 || aLeft * bLeft <= 16) {
      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i]
        if (patched < bLeft) {
          for (j = bStart; j <= bEnd; j++) {
            bNode = b[j]
            if (aNode.key === bNode.key) {
              sources[j - bStart] = i

              if (pos > j) {
                moved = true
              } else {
                pos = j
              }
              patch(aNode, bNode, dom)
              patched++
              a[i] = null as any
              break
            }
          }
        }
      }
    } else {
      const keyIndex = new Map()

      // Map keys by their index in array
      for (i = bStart; i <= bEnd; i++) {
        keyIndex.set(b[i].key, i)
      }

      // Try to patch same keys
      for (i = aStart; i <= aEnd; i++) {
        aNode = a[i]

        if (patched < bLeft) {
          j = keyIndex.get(aNode.key)

          if (!(j === void 0)) {
            bNode = b[j]
            sources[j - bStart] = i
            if (pos > j) {
              moved = true
            } else {
              pos = j
            }
            patch(aNode, bNode, dom)
            patched++
            a[i] = null as any
          }
        }
      }
    }
    // fast-path: if nothing patched remove all old and add all new
    if (aLeft === aLength && patched === 0) {
      unmountChildren(a, dom)
      while (bStart < bLeft) {
        node = b[bStart]
        bStart++
        insertOrAppend(dom, mount(node, null), null)
      }
    } else {
      i = aLeft - patched
      while (i > 0) {
        aNode = a[aStart++]
        if (!(aNode === null)) {
          unmount(aNode, dom)
          i--
        }
      }
      if (moved) {
        const seq = lis(sources)
        j = seq.length - 1
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === -1) {
            pos = i + bStart
            node = b[pos]
            nextPos = pos + 1
            insertOrAppend(dom, mount(node, null), nextPos < bLength ? getDom(b[nextPos]) : null)
          } else {
            if (j < 0 || i !== seq[j]) {
              pos = i + bStart
              node = b[pos]
              nextPos = pos + 1
              insertOrAppend(dom, getDom(node), nextPos < bLength ? getDom(b[nextPos]) : null)
            } else {
              j--
            }
          }
        }
      } else if (patched !== bLeft) {
        // when patched count doesn't match b length we need to insert those new ones
        // loop backwards so we can use insertBefore
        for (i = bLeft - 1; i >= 0; i--) {
          if (sources[i] === -1) {
            pos = i + bStart
            node = b[pos]
            nextPos = pos + 1
            insertOrAppend(dom, mount(node, null), nextPos < bLength ? getDom(b[nextPos]) : null)
          }
        }
      }
    }
  }
}

function lis(arr: number[]): number[] {
  // @see https://en.wikipedia.org/wiki/Longest_increasing_subsequence
  const p = arr.slice(0)
  const result: number[] = [0]
  let i
  let j
  let u
  let v
  let c
  const len = arr.length

  for (i = 0; i < len; i++) {
    const arrI = arr[i]

    if (arrI !== -1) {
      j = result[result.length - 1]
      if (arr[j] < arrI) {
        p[i] = j
        result.push(i)
        continue
      }

      u = 0
      v = result.length - 1

      while (u < v) {
        c = ((u + v) / 2) | 0
        if (arr[result[c]] < arrI) {
          u = c + 1
        } else {
          v = c
        }
      }

      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1]
        }
        result[u] = i
      }
    }
  }

  u = result.length
  v = result[u - 1]

  while (u-- > 0) {
    result[u] = v
    v = p[v]
  }

  return result
}


// export function patchComponent(lastVNode,
//                                nextVNode,
//                                parentDom,
//                                lifecycle: LifecycleClass,
//                                context,
//                                isSVG: boolean,
//                                isClass: boolean,
//                                isRecycling: boolean) {
//   const lastType = lastVNode.type
//   const nextType = nextVNode.type
//   const lastKey = lastVNode.key
//   const nextKey = nextVNode.key
//
//   if (lastType !== nextType || lastKey !== nextKey) {
//     replaceWithNewNode(
//       lastVNode,
//       nextVNode,
//       parentDom,
//       lifecycle,
//       context,
//       isSVG,
//       isRecycling
//     )
//     return false
//   } else {
//     const nextProps = nextVNode.props || EMPTY_OBJ
//
//     if (isClass) {
//       const instance = lastVNode.children
//       instance._updating = true
//
//       if (instance._unmounted) {
//         if (isNull(parentDom)) {
//           return true
//         }
//         replaceChild(
//           parentDom,
//           mountComponent(
//             nextVNode,
//             null,
//             lifecycle,
//             context,
//             isSVG,
//             (nextVNode.flags & VNodeFlags.ComponentClass) > 0
//           ),
//           lastVNode.dom
//         )
//       } else {
//         const hasComponentDidUpdate = !isUndefined(instance.componentDidUpdate)
//         const nextState = instance.state
//         // When component has componentDidUpdate hook, we need to clone lastState or will be modified by reference during update
//         const lastState = hasComponentDidUpdate
//           ? combineFrom(nextState, null)
//           : nextState
//         const lastProps = instance.props
//         nextVNode.children = instance
//         instance._isSVG = isSVG
//         const lastInput = instance._lastInput
//         let nextInput = instance._updateComponent(
//           lastState,
//           nextState,
//           lastProps,
//           nextProps,
//           context,
//           false,
//           false
//         )
//         // If this component was destroyed by its parent do nothing, this is no-op
//         // It can happen by using external callback etc during render / update
//         if (instance._unmounted) {
//           return false
//         }
//         let didUpdate = true
//         // Update component before getting child context
//         let childContext
//         if (!isNullOrUndef(instance.getChildContext)) {
//           childContext = instance.getChildContext()
//         }
//         if (isNullOrUndef(childContext)) {
//           childContext = context
//         } else {
//           childContext = combineFrom(context, childContext)
//         }
//
//         instance._childContext = childContext
//         if (isInvalid(nextInput)) {
//           nextInput = createVoidVNode()
//         } else if (nextInput === NO_OP) {
//           nextInput = lastInput
//           didUpdate = false
//         } else if (isStringOrNumber(nextInput)) {
//           nextInput = createTextVNode(nextInput, null)
//         } else if (isArray(nextInput)) {
//           if (process.env.NODE_ENV !== 'production') {
//             throwError(
//               'a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.'
//             )
//           }
//           throwError()
//         } else if (isObject(nextInput)) {
//           if (!isNull((nextInput as VNode).dom)) {
//             nextInput = directClone(nextInput as VNode)
//           }
//         }
//         if (nextInput.flags & VNodeFlags.Component) {
//           nextInput.parentVNode = nextVNode
//         } else if (lastInput.flags & VNodeFlags.Component) {
//           lastInput.parentVNode = nextVNode
//         }
//         instance._lastInput = nextInput
//         instance._vNode = nextVNode
//         if (didUpdate) {
//           patch(
//             lastInput,
//             nextInput,
//             parentDom,
//             lifecycle,
//             childContext,
//             isSVG,
//             isRecycling
//           )
//           if (hasComponentDidUpdate && instance.componentDidUpdate) {
//             instance.componentDidUpdate(lastProps, lastState)
//           }
//           if (!isNull(options.afterUpdate)) {
//             options.afterUpdate(nextVNode)
//           }
//           if (options.findDOMNodeEnabled) {
//             componentToDOMNodeMap.set(instance, nextInput.dom)
//           }
//         }
//         nextVNode.dom = nextInput.dom
//       }
//       instance._updating = false
//     } else {
//       let shouldUpdate = true
//       const lastProps = lastVNode.props
//       const nextHooks = nextVNode.ref
//       const nextHooksDefined = !isNullOrUndef(nextHooks)
//       const lastInput = lastVNode.children
//       let nextInput = lastInput
//
//       nextVNode.dom = lastVNode.dom
//       nextVNode.children = lastInput
//       if (lastKey !== nextKey) {
//         shouldUpdate = true
//       } else {
//         if (
//           nextHooksDefined &&
//           !isNullOrUndef(nextHooks.onComponentShouldUpdate)
//         ) {
//           shouldUpdate = nextHooks.onComponentShouldUpdate(
//             lastProps,
//             nextProps
//           )
//         }
//       }
//       if (shouldUpdate !== false) {
//         if (
//           nextHooksDefined &&
//           !isNullOrUndef(nextHooks.onComponentWillUpdate)
//         ) {
//           nextHooks.onComponentWillUpdate(lastProps, nextProps)
//         }
//         nextInput = nextType(nextProps, context)
//
//         if (isInvalid(nextInput)) {
//           nextInput = createVoidVNode()
//         } else if (isStringOrNumber(nextInput) && nextInput !== NO_OP) {
//           nextInput = createTextVNode(nextInput, null)
//         } else if (isArray(nextInput)) {
//           if (process.env.NODE_ENV !== 'production') {
//             throwError(
//               'a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.'
//             )
//           }
//           throwError()
//         } else if (isObject(nextInput)) {
//           if (!isNull((nextInput as VNode).dom)) {
//             nextInput = directClone(nextInput as VNode)
//           }
//         }
//         if (nextInput !== NO_OP) {
//           patch(
//             lastInput,
//             nextInput,
//             parentDom,
//             lifecycle,
//             context,
//             isSVG,
//             isRecycling
//           )
//           nextVNode.children = nextInput
//           if (
//             nextHooksDefined &&
//             !isNullOrUndef(nextHooks.onComponentDidUpdate)
//           ) {
//             nextHooks.onComponentDidUpdate(lastProps, nextProps)
//           }
//           nextVNode.dom = nextInput.dom
//         }
//       }
//       if (nextInput.flags & VNodeFlags.Component) {
//         nextInput.parentVNode = nextVNode
//       } else if (lastInput.flags & VNodeFlags.Component) {
//         lastInput.parentVNode = nextVNode
//       }
//     }
//   }
//   return false
// }
