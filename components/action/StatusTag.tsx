import { ActionStatus } from 'interfaces/action'
import React from 'react'

interface TagProps {
  status: ActionStatus
}

const mappedStatus: {
  [key in ActionStatus]: { label: string; color: string; colorLighten: string }
} = {
  [ActionStatus.NotStarted]: {
    label: 'À réaliser',
    color: 'accent_1',
    colorLighten: 'accent_1_lighten',
  },
  [ActionStatus.InProgress]: {
    label: 'Commencée',
    color: 'accent_3',
    colorLighten: 'accent_3_lighten',
  },
  [ActionStatus.Done]: {
    label: 'Terminée',
    color: 'accent_2',
    colorLighten: 'accent_2_lighten',
  },
}

const Tag = ({ status }: TagProps) => {
  const { label, color, colorLighten } = mappedStatus[status]
  return (
    <span
      className={`table-cell text-xs-medium border border-solid border-${color} text-${color} px-4 py-[2px] bg-${colorLighten} rounded-x_large whitespace-nowrap`}
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
