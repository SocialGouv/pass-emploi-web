'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useEffect, useRef, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Etape from 'components/ui/Form/Etape'
import FileInput from 'components/ui/Form/FileInput'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import { getNomBeneficiaireComplet } from 'interfaces/beneficiaire'
import { InfoFichier } from 'interfaces/fichier'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { AlerteParam } from 'referentiel/alerteParam'
import { FormNouveauMessageGroupe } from 'services/messages.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useConfirmBeforeLeaving } from 'utils/hooks/useConfirmBeforeLeaving'
import { ApiError } from 'utils/httpClient'
import { usePortefeuille } from 'utils/portefeuilleContext'

const LeavePageConfirmationModal = dynamic(
  () => import('components/LeavePageConfirmationModal'),
  { ssr: false }
)

type EnvoiMessageGroupeProps = {
  listesDiffusion: ListeDeDiffusion[]
  returnTo: string
}

function EnvoiMessageGroupePage({
  listesDiffusion,
  returnTo,
}: EnvoiMessageGroupeProps) {
  const chatCredentials = useChatCredentials()
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const [portefeuille] = usePortefeuille()
  const [selectionError, setSelectionError] = useState<string | undefined>()
  const [messageError, setMessageError] = useState<string | undefined>()
  const [selectedJeunesIds, setSelectedJeunesIds] = useState<string[]>([])
  const [selectedListesIds, setSelectedListesIds] = useState<string[]>([])
  const [message, setMessage] = useState<string>('')
  const [pieceJointe, setPieceJointe] = useState<File | undefined>()
  const [isSending, setIsSending] = useState<boolean>(false)
  const [erreurUploadPieceJointe, setErreurUploadPieceJointe] = useState<
    string | undefined
  >(undefined)
  const [erreurEnvoi, setErreurEnvoi] = useState<string | undefined>(undefined)

  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)
  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)
  const [leavePageUrl, setLeavePageUrl] = useState<string>(returnTo)

  const initialTracking = 'Message - Rédaction'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)
  function buildOptionsJeunes(): OptionBeneficiaire[] {
    return portefeuille.map((jeune) => ({
      id: jeune.id,
      value: getNomBeneficiaireComplet(jeune),
    }))
  }

  const isFirstRender = useRef<boolean>(true)
  const formErrorsRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const fileSelectionRef = useRef<HTMLButtonElement>(null)

  function formIsValid(): boolean {
    const selectionEstValide = isSelectedJeunesIdsValid()
    const messageEstValide = isMessageValid()

    return Boolean(selectionEstValide && messageEstValide)
  }

  function isSelectedJeunesIdsValid(): boolean {
    const selectionEstValide = Boolean(
      selectedJeunesIds.length || selectedListesIds.length
    )
    if (!selectionEstValide) {
      setSelectionError(
        'Le champ ”Destinataires” est vide. Sélectionnez au moins un destinataire.'
      )
      const selectBeneficiaires = document.getElementById(
        'select-beneficiaires'
      )
      if (selectBeneficiaires)
        selectBeneficiaires.scrollIntoView({ behavior: 'smooth' })
    }
    return selectionEstValide
  }

  function isMessageValid(): boolean {
    const messageEstValide = Boolean(message || pieceJointe)
    if (!messageEstValide) {
      setMessageError(
        'Le champ ”Message” est vide. Renseignez un message ou choisissez une pièce jointe.'
      )
    }
    return messageEstValide
  }

  function formHasChanges(): boolean {
    return Boolean(
      selectedJeunesIds.length ||
        selectedListesIds.length ||
        message ||
        pieceJointe
    )
  }

  function openLeavePageConfirmationModal(destination: string) {
    setLeavePageUrl(destination)
    setShowLeavePageModal(true)
    setTrackingLabel('Message - Modale Annulation')
    setConfirmBeforeLeaving(false)
  }

  function closeLeavePageConfirmationModal() {
    setShowLeavePageModal(false)
    setTrackingLabel(initialTracking)
    setConfirmBeforeLeaving(true)
  }

  async function envoyerMessageGroupe(
    e: FormEvent<HTMLFormElement>
  ): Promise<void> {
    e.preventDefault()
    e.stopPropagation()

    if (!formIsValid()) {
      formErrorsRef.current!.focus()
      return
    }

    setConfirmBeforeLeaving(false)
    setIsSending(true)
    setErreurEnvoi(undefined)

    let fileInfo: InfoFichier | undefined
    try {
      if (pieceJointe) {
        const { uploadFichier } = await import('services/fichiers.service')
        fileInfo = await uploadFichier(
          selectedJeunesIds,
          selectedListesIds,
          pieceJointe
        )
      }
    } catch (error) {
      setErreurUploadPieceJointe(
        error instanceof ApiError
          ? error.message
          : 'Suite à un problème inconnu le téléversement de la pièce jointe a échoué. Vous pouvez réessayer.'
      )
      setTrackingLabel('Message - Échec upload pièce jointe')
      setConfirmBeforeLeaving(true)
      setIsSending(false)
      return
    }

    try {
      const formNouveauMessage: FormNouveauMessageGroupe = {
        idsBeneficiaires: selectedJeunesIds,
        idsListesDeDiffusion: selectedListesIds,
        newMessage:
          message ||
          'Votre conseiller vous a transmis une nouvelle pièce jointe : ',
        cleChiffrement: chatCredentials!.cleChiffrement,
      }
      if (fileInfo) formNouveauMessage.infoPieceJointe = fileInfo

      const { sendNouveauMessageGroupe } = await import(
        'services/messages.service'
      )
      await sendNouveauMessageGroupe(formNouveauMessage)

      setAlerte(AlerteParam.envoiMessage)
      router.push(returnTo)
    } catch (error) {
      setErreurEnvoi(
        error instanceof ApiError
          ? error.message
          : "Suite à un problème inconnu l'envoi du message a échoué. Vous pouvez réessayer."
      )
      setConfirmBeforeLeaving(true)
      setTrackingLabel('Message - Échec envoi message')
    } finally {
      setIsSending(false)
    }
  }

  function clearDeletionError(): void {
    setErreurEnvoi(undefined)
    setTrackingLabel(initialTracking)
  }

  useMatomo(trackingLabel, portefeuille.length > 0)

  useConfirmBeforeLeaving(formHasChanges() && confirmBeforeLeaving)

  function enleverFichier() {
    setErreurUploadPieceJointe(undefined)
    setPieceJointe(undefined)
  }

  function updateDestinataires(selectedIds: {
    beneficiaires?: string[]
    listesDeDiffusion?: string[]
  }) {
    const { beneficiaires, listesDeDiffusion } = selectedIds
    setSelectionError(undefined)
    if (beneficiaires) setSelectedJeunesIds(beneficiaires)
    if (listesDeDiffusion) setSelectedListesIds(listesDeDiffusion)
  }

  function getErreurs(): LigneErreur[] {
    const erreurs = []
    if (selectionError)
      erreurs.push({
        ancre: '#select-beneficiaires',
        label: 'Le champ Destinataires est vide.',
        titreChamp: 'Destinataires',
      })
    if (messageError)
      erreurs.push({
        ancre: '#message',
        label: 'Le champ Message est vide.',
        titreChamp: 'Message',
      })
    return erreurs
  }

  useEffect(() => {
    if (isFirstRender.current) return

    if (pieceJointe) fileSelectionRef.current!.focus()
    else fileInputRef.current!.focus()
  }, [pieceJointe])

  useEffect(() => {
    isFirstRender.current = false
  }, [])

  return (
    <>
      {erreurEnvoi && (
        <FailureAlert label={erreurEnvoi} onAcknowledge={clearDeletionError} />
      )}

      <RecapitulatifErreursFormulaire
        erreurs={getErreurs()}
        ref={formErrorsRef}
      />

      <form onSubmit={envoyerMessageGroupe} noValidate={true}>
        <p className='text-s-bold text-content_color mb-8'>
          Tous les champs avec * sont obligatoires
        </p>

        <Etape numero={1} titre='Sélectionnez des destinataires'>
          <BeneficiairesMultiselectAutocomplete
            id={'select-beneficiaires'}
            beneficiaires={buildOptionsJeunes()}
            listesDeDiffusion={listesDiffusion}
            typeSelection='Destinataires'
            onUpdate={updateDestinataires}
            error={selectionError}
          />
          <Link
            href='/mes-jeunes/listes-de-diffusion'
            className='flex items-center pt-2 text-s-regular text-content_color underline hover:text-primary_darken'
          >
            Gérer mes listes de diffusion
            <IconComponent
              name={IconName.ChevronRight}
              aria-hidden={true}
              focusable={false}
              className='w-6 h-6 fill-current'
            />
          </Link>
        </Etape>

        <Etape numero={2} titre='Écrivez votre message'>
          <Label
            htmlFor='message'
            inputRequired={true}
            withBulleMessageSensible={true}
          >
            Message
          </Label>
          {messageError && (
            <InputError id='message--error' className='mb-2'>
              {messageError}
            </InputError>
          )}
          <Textarea
            id='message'
            rows={10}
            onChange={(nouveauMessage) => {
              if (messageError) setMessageError(undefined)
              setMessage(nouveauMessage)
            }}
            required
          />

          <div>
            <div
              id='piece-jointe-multi--desc'
              className='self-center text-xs-regular'
            >
              <p>
                Taille maximum autorisée : 5 Mo aux formats .PDF, .JPG, .PNG,
                .WEBP
              </p>
              <p>
                Attention à ne pas partager de données sensibles, à caractères
                personnelles ou de santé.
              </p>
            </div>

            <div className='my-4'>
              <FileInput
                id='piece-jointe-multi'
                ariaDescribedby='piece-jointe-multi--desc'
                onChange={setPieceJointe}
                disabled={Boolean(pieceJointe)}
                ref={fileInputRef}
                invalid={Boolean(erreurUploadPieceJointe)}
              />
            </div>

            {pieceJointe && (
              <div className='mb-4'>
                <Multiselection
                  ref={fileSelectionRef}
                  selection={[
                    {
                      id: pieceJointe.name,
                      value: pieceJointe.name,
                      avecIndication: false,
                      estUneListe: false,
                    },
                  ]}
                  typeSelection='fichier'
                  unselect={enleverFichier}
                  onYieldFocus={() => {}}
                />
              </div>
            )}

            {erreurUploadPieceJointe && (
              <InputError
                ref={(e) => e?.focus()}
                id='piece-jointe-multi--error'
                className='mb-4'
              >
                {erreurUploadPieceJointe}
              </InputError>
            )}
          </div>
        </Etape>

        <div className='flex justify-center'>
          {!formHasChanges() && (
            <ButtonLink
              href={returnTo}
              style={ButtonStyle.SECONDARY}
              className='mr-3'
            >
              Annuler
            </ButtonLink>
          )}
          {formHasChanges() && (
            <Button
              type='button'
              label='Quitter la rédaction du message groupé'
              onClick={() => openLeavePageConfirmationModal(returnTo)}
              style={ButtonStyle.SECONDARY}
              className='mr-3 p-2'
            >
              Annuler
            </Button>
          )}

          <Button
            type='submit'
            className='flex items-center p-2'
            isLoading={isSending}
          >
            <IconComponent
              name={IconName.Send}
              aria-hidden={true}
              focusable={false}
              className='mr-2 h-4 w-4 fill-white'
            />
            Envoyer
          </Button>
        </div>
        {showLeavePageModal && (
          <LeavePageConfirmationModal
            titre='Souhaitez-vous quitter la rédaction du message multi-destinataires ?'
            commentaire='Les informations saisies seront perdues.'
            onCancel={closeLeavePageConfirmationModal}
            destination={leavePageUrl}
          />
        )}
      </form>
    </>
  )
}

export default withTransaction(
  EnvoiMessageGroupePage.name,
  'page'
)(EnvoiMessageGroupePage)
