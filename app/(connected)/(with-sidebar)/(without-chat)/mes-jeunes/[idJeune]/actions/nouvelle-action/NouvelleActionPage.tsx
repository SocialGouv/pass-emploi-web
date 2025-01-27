'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import React, { useState } from 'react'

import { EditionActionForm } from 'components/action/EditionActionForm'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import {
  ActionPredefinie,
  SituationNonProfessionnelle,
} from 'interfaces/action'
import { ActionFormData } from 'interfaces/json/action'
import useMatomo from 'utils/analytics/useMatomo'
import { useConfirmBeforeLeaving } from 'utils/hooks/useConfirmBeforeLeaving'
import { usePortefeuille } from 'utils/portefeuilleContext'

type EditionActionProps = {
  idBeneficiaire: string
  categories: SituationNonProfessionnelle[]
  actionsPredefinies: ActionPredefinie[]
  returnTo: string
}

function NouvelleActionPage({
  idBeneficiaire,
  categories,
  actionsPredefinies,
  returnTo,
}: EditionActionProps) {
  const [portefeuille] = usePortefeuille()

  const [succesCreation, setSuccesCreation] = useState<boolean>(false)

  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)

  const initialTracking = 'Actions jeune – Création action'
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  async function creerAction(action: ActionFormData) {
    setConfirmBeforeLeaving(false)

    const { creerAction: _creerAction } = await import(
      'services/actions.service'
    )
    await _creerAction(action, idBeneficiaire)

    setTrackingTitle('Actions jeune – Succès création action')
    setSuccesCreation(true)
  }

  function resetForm() {
    setSuccesCreation(false)
    setConfirmBeforeLeaving(true)
    setTrackingTitle(initialTracking)
  }

  useConfirmBeforeLeaving(confirmBeforeLeaving)

  useMatomo(trackingTitle, portefeuille.length > 0)

  return (
    <>
      {!succesCreation && (
        <EditionActionForm
          actionsPredefinies={actionsPredefinies}
          categories={categories}
          returnTo={returnTo}
          soumettreAction={creerAction}
        />
      )}

      {succesCreation && (
        <div className='text-center'>
          <IllustrationComponent
            name={IllustrationName.Check}
            className='m-auto fill-success_darken w-[180px] h-[180px]'
            aria-hidden={true}
            focusable={false}
          />
          <h2 className='text-m-bold mb-2'>Action enregistrée !</h2>
          <p>
            L’action est en route vers l’application de votre bénéficiaire. De
            votre côté, retrouvez l’action dans la fiche bénéficiaire !
          </p>
          <div className='mt-10 flex justify-center gap-4'>
            <Button style={ButtonStyle.SECONDARY} onClick={resetForm}>
              Créer une nouvelle action
            </Button>
            <ButtonLink href={returnTo} style={ButtonStyle.PRIMARY}>
              Consulter la liste des actions
            </ButtonLink>
          </div>
        </div>
      )}
    </>
  )
}

export default withTransaction(
  NouvelleActionPage.name,
  'page'
)(NouvelleActionPage)
