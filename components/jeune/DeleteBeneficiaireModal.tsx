import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'

import Modal from 'components/Modal'
import { ModalHandles } from 'components/ModalContainer'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { BeneficiaireWithActivity } from 'interfaces/beneficiaire'
import { SuppressionBeneficiaireFormData } from 'interfaces/json/beneficiaire'
import { MotifSuppressionBeneficiaire } from 'interfaces/referentiel'
import { getMotifsSuppression } from 'services/beneficiaires.service'
import { useCurrentConversation } from 'utils/chat/currentConversationContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

const DeleteBeneficiaireActifModal = dynamic(
  () => import('components/jeune/DeleteBeneficiaireActifModal')
)
const DeleteJeuneInactifModal = dynamic(
  () => import('components/jeune/DeleteBeneficiaireInactifModal')
)

type DeleteBeneficiaireModalProps = {
  beneficiaire: BeneficiaireWithActivity
  onSuccess: () => void
  onClose: () => void
  onError: () => void
  labelSuccess: string
}

export default function DeleteBeneficiaireModal({
  beneficiaire,
  labelSuccess,
  onSuccess,
  onClose,
  onError,
}: DeleteBeneficiaireModalProps) {
  const [portefeuille, setPortefeuille] = usePortefeuille()
  const [currentConversation, setCurrentConversation] = useCurrentConversation()

  const modalRef = useRef<ModalHandles>(null)

  const [motifsSuppression, setMotifsSuppression] = useState<
    MotifSuppressionBeneficiaire[]
  >([])

  const [
    showModaleSuccesDeleteBeneficiaire,
    setShowModaleSuccesDeleteBeneficiaire,
  ] = useState<boolean>(false)

  async function archiverJeuneActif(
    payload: SuppressionBeneficiaireFormData
  ): Promise<void> {
    try {
      const { archiverJeune } = await import('services/beneficiaires.service')
      await archiverJeune(beneficiaire.id, payload)

      setShowModaleSuccesDeleteBeneficiaire(true)
    } catch {
      onError()
      modalRef.current!.closeModal()
    }
  }

  async function supprimerJeuneInactif(): Promise<void> {
    try {
      const { supprimerJeuneInactif: _supprimerJeuneInactif } = await import(
        'services/beneficiaires.service'
      )
      await _supprimerJeuneInactif(beneficiaire.id)

      setShowModaleSuccesDeleteBeneficiaire(true)
    } catch {
      onError()
      modalRef.current!.closeModal()
    }
  }

  function removeBeneficiaireFromPortefeuille(idBeneficiaire: string): void {
    const updatedPortefeuille = [...portefeuille]
    const index = updatedPortefeuille.findIndex(
      ({ id }) => id === idBeneficiaire
    )
    if (index > -1) updatedPortefeuille.splice(index, 1)
    setPortefeuille(updatedPortefeuille)
    if (currentConversation?.id === idBeneficiaire)
      setCurrentConversation(undefined)

    onSuccess()
  }

  useEffect(() => {
    if (beneficiaire.lastActivity) {
      getMotifsSuppression().then(setMotifsSuppression)
    }
  }, [])

  return (
    <>
      {!showModaleSuccesDeleteBeneficiaire && beneficiaire.lastActivity && (
        <DeleteBeneficiaireActifModal
          ref={modalRef}
          beneficiaire={beneficiaire}
          onClose={onClose}
          motifsSuppression={motifsSuppression}
          soumettreSuppression={archiverJeuneActif}
        />
      )}

      {!showModaleSuccesDeleteBeneficiaire && !beneficiaire.lastActivity && (
        <DeleteJeuneInactifModal
          ref={modalRef}
          beneficiaire={beneficiaire}
          onClose={onClose}
          onDelete={supprimerJeuneInactif}
        />
      )}

      {showModaleSuccesDeleteBeneficiaire && (
        <Modal
          ref={modalRef}
          title={`Le compte bénéficiaire : ${beneficiaire.prenom} ${beneficiaire.nom} a bien été supprimé.`}
          onClose={() => removeBeneficiaireFromPortefeuille(beneficiaire.id)}
          titleIllustration={IllustrationName.Check}
        >
          <Button
            type='button'
            style={ButtonStyle.PRIMARY}
            className='block m-auto'
            onClick={() => modalRef.current!.closeModal()}
          >
            {labelSuccess}
          </Button>
        </Modal>
      )}
    </>
  )
}
