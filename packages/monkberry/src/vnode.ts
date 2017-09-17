export type Props = any

export interface VNode {
  type: () => View
  props: Props
  spots?: Spot[]
  view?: View
  key?: any
  ref?: Ref
  parentVNode?: VNode
}

export type Ref = (node: Element | null) => void;

export interface Spot {
  keyed: boolean
  children: VNode[]
}

export interface View {
  root: Element,
  spots?: Comment[]
  update: (props: Props) => void
}
