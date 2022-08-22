import React from 'react'

import RadioButtonStatus from 'components/action/RadioButtonStatus'
import { StatutAction } from 'interfaces/action'

interface StatutActionFormProps {
  updateAction: (statutChoisi: StatutAction) => Promise<void>
  statutCourant: StatutAction
}

function StatutActionForm({
  updateAction,
  statutCourant,
}: StatutActionFormProps) {
  return (
    <div className='border-t border-solid border-grey_100 pt-5'>
      <h2 className='text-m-bold pb-6'>Statut</h2>
      <form className='flex flex-raw mb-10'>
        {Object.values(StatutAction).map((status: StatutAction) => (
          <RadioButtonStatus
            key={status.toLowerCase()}
            status={status}
            isSelected={statutCourant === status}
            onChange={updateAction}
          />
        ))}
      </form>
    </div>
  )
}

export default StatutActionForm
