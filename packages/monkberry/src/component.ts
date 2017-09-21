export type Ref = (node?: Element | null) => void

// export interface Props {
//     children?: InfernoChildren;
//     ref?: Ref | null;
//     key?: any;
//     className?: string;
//     [k: string]: any;
// }
//
// export default class Component<P, S> implements ComponentLifecycle<P, S> {
//     public static defaultProps: {}
//     public state: S
//     public props: P & Props
//     public context: any
//
//     constructor(props?: P, context?: any) {
//         this.props = props || ({} as P);
//         this.context = context || EMPTY_OBJ;
//     }
//
//     componentDidMount?(): void
//     componentWillMount?(): void
//     componentWillReceiveProps?(nextProps: P, nextContext: any): void
//     shouldComponentUpdate?(nextProps: P, nextState: S, nextContext: any): boolean
//     componentWillUpdate?(nextProps: P, nextState: S, nextContext: any): void
//     componentDidUpdate?(prevProps: P, prevState: S, prevContext: any): void
//     componentWillUnmount?(): void
//     public getChildContext?(): void;
//
//     public setState(newState: { [k in keyof S]?: S[k] }, callback?: Function) {
//         queueStateChanges(this, newState, callback);
//     }
//
//     public render(nextProps?: P, nextState?, nextContext?): any {}
// }
