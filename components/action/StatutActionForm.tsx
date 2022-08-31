import React, { FormEvent, useState } from 'react'

import RadioButton from './RadioButton'

import RadioButtonStatus from 'components/action/RadioButtonStatus'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { StatutAction } from 'interfaces/action'

interface StatutActionFormProps {
  updateStatutAction: (statutChoisi: StatutAction) => void
  qualifierAction: (isSituationNonProfessionnelle: boolean) => void
  statutCourant: StatutAction
  estAQualifier: boolean
}

function StatutActionForm({
  updateStatutAction,
  qualifierAction,
  statutCourant,
  estAQualifier,
}: StatutActionFormProps) {
  const [isSituationNonProfessionnelle, setIsSituationNonProfessionnelle] =
    useState<boolean | undefined>(undefined)

  function submit(e: FormEvent) {
    e.preventDefault()

    if (isSituationNonProfessionnelle !== undefined) {
      qualifierAction(isSituationNonProfessionnelle)
    }
  }

  return (
    <div className='border-t border-solid border-grey_100 pt-5'>
      <h2 className='text-m-bold pb-6'>Statut</h2>
      <form className='flex flex-raw mb-10'>
        {Object.values(StatutAction).map((status: StatutAction) => (
          <RadioButtonStatus
            key={status.toLowerCase()}
            status={status}
            isSelected={statutCourant === status}
            onChange={updateStatutAction}
          />
        ))}
      </form>

      {estAQualifier && (
        <div className='border border-solid border-grey_100 bg-primary_lighten rounded-medium p-2 mb-2'>
          <h2 className='text-m-bold'>
            S’agit-il d’une Situation Non Professionnelle ?
          </h2>
          <form className='flex flex-col w-fit' onSubmit={submit}>
            <div className='my-4'>
              <RadioButton
                isSelected={isSituationNonProfessionnelle === true}
                onChange={() => setIsSituationNonProfessionnelle(true)}
                name='option-snp'
                id='options-snp--oui'
                label='Il s’agit d’une Situation Non Professionnelle'
              />
            </div>
            <div>
              <RadioButton
                isSelected={isSituationNonProfessionnelle === false}
                onChange={() => setIsSituationNonProfessionnelle(false)}
                name='option-snp'
                id='options-snp--non'
                label='Il ne s’agit pas d’une Situation Non Professionnelle'
              />
            </div>
            <Button
              type='submit'
              className='mt-8 mb-2 w-fit'
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
