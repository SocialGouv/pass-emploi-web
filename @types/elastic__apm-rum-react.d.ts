declare module '@elastic/apm-rum-react' {
  import { Transaction } from '@elastic/apm-rum'
  import { ComponentType } from 'react'
  export const withTransaction: <T>(
    name: string,
    eventType: 'page',
    callback: (tr: Transaction, props: T) => any = () => {}
  ) => <T>(component: ComponentType<T>) => ComponentType<T>
}
