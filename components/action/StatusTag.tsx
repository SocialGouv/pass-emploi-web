import { ActionStatus } from 'interfaces/action'
import React from 'react'

const NotStarted = () => (
  <span className='table-cell text-xs-medium text-accent_1 px-4 py-[2px] bg-accent_1_lighten rounded-x_large'>
    À réaliser
  </span>
)

const InProgress = () => (
  <span className='table-cell text-xs-medium text-accent_3 px-4 py-[2px] bg-accent_3_lighten rounded-x_large'>
    En cours
  </span>
)

const Done = () => (
  <span className='table-cell text-xs-medium text-accent_2 px-4 py-[2px] bg-accent_2_lighten rounded-x_large'>
    Terminée
  </span>
)

export const Status = (props: any) => {
  switch (props.status) {
    case ActionStatus.InProgress:
      return <InProgress />

    case ActionStatus.Done:
      return <Done />

    case ActionStatus.NotStarted:
    default:
      return <NotStarted />
  }
}
