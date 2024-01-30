import React from 'react'

import RadioBoxStatut from 'components/action/RadioBoxStatut'
import { StatutAction } from 'interfaces/action'

interface StatutActionFormProps {
  updateStatutAction: (statutChoisi: StatutAction) => void
  statutCourant: StatutAction
  lectureSeule: boolean
}

function StatutActionForm({
  updateStatutAction,
  statutCourant,
  lectureSeule,
}: StatutActionFormProps) {
  const statuts = Object.values(StatutAction).filter(
    (statut) => statut === 'AFaire' || statut === 'Terminee'
  )

  function estStatutCourant(statutAction: StatutAction): boolean {
    if (
      statutCourant === StatutAction.Qualifiee &&
      statutAction === StatutAction.Terminee
    )
      return true
    return statutCourant === statutAction
  }

  return (
    <div className='border-b-2 border-solid border-primary_lighten pt-5'>
      <h2 className='text-m-bold text-grey_800 pb-6'>Statut</h2>
      <form className='flex flex-raw mb-10'>
        {statuts.map((statut: StatutAction) => (
          <RadioBoxStatut
            key={statut.toLowerCase()}
            status={statut}
            isSelected={estStatutCourant(statut)}
            onChange={updateStatutAction}
            isDisabled={
              statutCourant === StatutAction.Qualifiee || lectureSeule
            }
            estQualifiee={
              statut === StatutAction.Terminee &&
              statutCourant === StatutAction.Qualifiee
            }
          />
        ))}
      </form>
    </div>
  )
}

export default StatutActionForm
