import { ActionStatus } from 'interfaces/action'
import React from 'react'

interface TagProps {
  status: ActionStatus
}

const mappedStatus: {
  [key: string]: { label: string; textColor: string; backgroundColor: string }
} = {
  not_started: {
    label: 'À réaliser',
    textColor: 'accent_1',
    backgroundColor: 'accent_1_lighten',
  },
  in_progress: {
    label: 'En cours',
    textColor: 'accent_3',
    backgroundColor: 'accent_3_lighten',
  },
  done: {
    label: 'Terminée',
    textColor: 'accent_2',
    backgroundColor: 'accent_2_lighten',
  },
}

const Tag = ({ status }: TagProps) => {
  const { label, textColor, backgroundColor } = mappedStatus[status]
  return (
    <span
      className={`table-cell text-xs-medium text-${textColor} px-4 py-[2px] bg-${backgroundColor} rounded-x_large`}
    >
      {label}
    </span>
  )
}

export const StatusTag = (props: any) => {
  switch (props.status) {
    case ActionStatus.InProgress:
      return <Tag status={ActionStatus.InProgress} />

    case ActionStatus.Done:
      return <Tag status={ActionStatus.Done} />

    case ActionStatus.NotStarted:
    default:
      return <Tag status={ActionStatus.NotStarted} />
  }
}
