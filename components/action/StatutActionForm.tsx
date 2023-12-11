import React, { FormEvent, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import RadioBoxStatut from 'components/action/RadioBoxStatut'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { StatutAction } from 'interfaces/action'

interface StatutActionFormProps {
  updateStatutAction: (statutChoisi: StatutAction) => void
  qualifierAction: (isSituationNonProfessionnelle: boolean) => void
  statutCourant: StatutAction
  estAQualifier: boolean
  lectureSeule: boolean
}

function StatutActionForm({
  updateStatutAction,
  qualifierAction,
  statutCourant,
  estAQualifier,
  lectureSeule,
}: StatutActionFormProps) {
  const [isSituationNonProfessionnelle, setIsSituationNonProfessionnelle] =
    useState<boolean | undefined>(undefined)

  const statuts = Object.values(StatutAction).filter(
    (statut) => statut === 'EnCours' || statut === 'Terminee'
  )

  function estStatutCourant(statutAction: StatutAction): boolean {
    if (
      statutCourant === StatutAction.Qualifiee &&
      statutAction === StatutAction.Terminee
    )
      return true
    return statutCourant === statutAction
  }

  function submit(e: FormEvent) {
    e.preventDefault()

    if (isSituationNonProfessionnelle !== undefined) {
      qualifierAction(isSituationNonProfessionnelle)
    }
  }

  return (
    <div className='border-b-2 border-solid border-primary_lighten pt-5'>
      <h2 className='text-m-bold text-grey_800 pb-6'>Statut</h2>
      <form className='flex flex-raw mb-10'>
        {statuts.map((statutAction: StatutAction) => (
          <RadioBoxStatut
            key={statutAction.toLowerCase()}
            status={statutAction}
            isSelected={estStatutCourant(statutAction)}
            onChange={updateStatutAction}
            isDisabled={
              (statutCourant === StatutAction.Terminee && !estAQualifier) ||
              lectureSeule
            }
          />
        ))}
      </form>

      {estAQualifier && !lectureSeule && (
        <div className='border border-solid border-grey_100 bg-primary_lighten rounded-base p-4 mb-10'>
          <h2 className='text-m-bold text-grey_800 mb-2'>
            S’agit-il d’une Situation Non Professionnelle ?
          </h2>
          <form className='flex flex-col w-fit' onSubmit={submit}>
            <div className='my-4'>
              <RadioBox
                isSelected={isSituationNonProfessionnelle === true}
                onChange={() => setIsSituationNonProfessionnelle(true)}
                name='option-snp'
                id='options-snp--oui'
                label='Il s’agit d’une Situation Non Professionnelle'
              />
            </div>
            <div className='mb-6'>
              <RadioBox
                isSelected={isSituationNonProfessionnelle === false}
                onChange={() => setIsSituationNonProfessionnelle(false)}
                name='option-snp'
                id='options-snp--non'
                label='Il ne s’agit pas d’une Situation Non Professionnelle'
              />
            </div>
            <Button
              type='submit'
              className='w-fit'
              label='Enregistrer la situation'
              style={ButtonStyle.PRIMARY}
              disabled={isSituationNonProfessionnelle === undefined}
            >
              Enregistrer
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}

export default StatutActionForm
