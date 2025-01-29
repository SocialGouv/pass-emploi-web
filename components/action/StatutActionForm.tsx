import React from 'react'

import RadioBox from 'components/action/RadioBox'
import { StatutAction } from 'interfaces/action'

interface StatutActionFormProps {
  updateStatutAction: (statutChoisi: StatutAction) => void
  statutCourant: StatutAction
  lectureSeule: boolean
  avecQualification: boolean
}

function StatutActionForm({
  updateStatutAction,
  statutCourant,
  lectureSeule,
  avecQualification,
}: StatutActionFormProps) {
  const estQualifiee = statutCourant === StatutAction.TermineeQualifiee
  const disabled = estQualifiee || lectureSeule
  const actionTerminee =
    avecQualification && statutCourant
      ? StatutAction.TermineeAQualifier
      : StatutAction.Terminee

  return (
    <div className='border-b-2 border-solid border-primary_lighten pt-5'>
      <h2 className='text-m-bold text-grey_800 pb-6'>Statut</h2>
      <form className='flex flex-raw mb-10'>
        <RadioBox
          id='option-statut-afaire'
          isSelected={statutCourant === StatutAction.AFaire}
          onChange={() => updateStatutAction(StatutAction.AFaire)}
          name='option-statut'
          label='À faire'
          disabled={disabled}
        />

        <RadioBox
          id='option-statut-terminee'
          isSelected={estQualifiee || statutCourant === actionTerminee}
          onChange={() => updateStatutAction(actionTerminee)}
          name='option-statut'
          label={
            'Terminée' +
            (avecQualification && !estQualifiee ? ' - À qualifier' : '')
          }
          disabled={disabled}
        />
      </form>
    </div>
  )
}

export default StatutActionForm
