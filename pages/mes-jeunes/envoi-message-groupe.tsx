import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { MouseEvent, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import { Etape } from 'components/ui/Form/Etape'
import FileInput from 'components/ui/Form/FileInput'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import Multiselection from 'components/ui/Form/Multiselection'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { InfoFichier } from 'interfaces/fichier'
import {
  BaseJeune,
  compareJeunesByNom,
  getNomJeuneComplet,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { FichiersService } from 'services/fichiers.service'
import { JeunesService } from 'services/jeunes.service'
import {
  FormNouveauMessageGroupe,
  MessagesService,
} from 'services/messages.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useLeavePageModal } from 'utils/hooks/useLeavePageModal'
import { ApiError } from 'utils/httpClient'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

interface EnvoiMessageGroupeProps extends PageProps {
  jeunes: BaseJeune[]
  returnTo: string
}

function EnvoiMessageGroupe({ jeunes, returnTo }: EnvoiMessageGroupeProps) {
  const [chatCredentials] = useChatCredentials()
  const router = useRouter()
  const messagesService = useDependance<MessagesService>('messagesService')
  const fichiersService = useDependance<FichiersService>('fichiersService')
  const [_, setAlerte] = useAlerte()

  const [selectedJeunesIds, setSelectedJeunesIds] = useState<string[]>([])
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

  const initialTracking = 'Message - Rédaction'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  function buildOptionsJeunes(): OptionBeneficiaire[] {
    return jeunes.map((jeune) => ({
      id: jeune.id,
      value: getNomJeuneComplet(jeune),
    }))
  }

  function formIsValid(): boolean {
    return Boolean(selectedJeunesIds.length && (message || pieceJointe))
  }

  function formHasChanges(): boolean {
    return Boolean(selectedJeunesIds.length || message || pieceJointe)
  }

  function openLeavePageConfirmationModal(e?: MouseEvent) {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setShowLeavePageModal(true)
    setConfirmBeforeLeaving(false)
  }

  function closeLeavePageConfirmationModal() {
    setShowLeavePageModal(false)
    setConfirmBeforeLeaving(true)
  }

  async function envoyerMessageGroupe(
    e: MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    e.preventDefault()
    e.stopPropagation()

    if (!formIsValid()) return

    setConfirmBeforeLeaving(false)
    setIsSending(true)
    setErreurEnvoi(undefined)

    let fileInfo: InfoFichier | undefined
    try {
      if (pieceJointe) {
        fileInfo = await fichiersService.uploadFichier(
          selectedJeunesIds,
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
        idsDestinataires: selectedJeunesIds,
        newMessage:
          message ||
          'Votre conseiller vous a transmis une nouvelle pièce jointe : ',
        cleChiffrement: chatCredentials!.cleChiffrement,
      }
      if (fileInfo) formNouveauMessage.infoPieceJointe = fileInfo

      await messagesService.signIn(chatCredentials!.token)
      await messagesService.sendNouveauMessageGroupe(formNouveauMessage)

      await router.push(returnTo)
      setAlerte(AlerteParam.envoiMessage)
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

  useMatomo(trackingLabel)
  useMatomo(showLeavePageModal ? 'Message - Modale Annulation' : undefined)

  useLeavePageModal(
    formHasChanges() && confirmBeforeLeaving,
    openLeavePageConfirmationModal
  )

  function enleverFichier() {
    setErreurUploadPieceJointe(undefined)
    setPieceJointe(undefined)
  }

  return (
    <>
      {erreurEnvoi && (
        <FailureAlert label={erreurEnvoi} onAcknowledge={clearDeletionError} />
      )}

      <form>
        <div className='text-s-regular text-primary_darken mb-8'>
          Tous les champs sont obligatoires
        </div>

        <Etape numero={1} titre='Destinataires'>
          <BeneficiairesMultiselectAutocomplete
            beneficiaires={buildOptionsJeunes()}
            typeSelection='Destinataires'
            onUpdate={setSelectedJeunesIds}
          />
        </Etape>

        <Etape numero={2} titre='Écrivez votre message'>
          <Label
            htmlFor='message'
            inputRequired={true}
            withBulleMessageSensible={true}
          >
            Message
          </Label>

          <Textarea id='message' rows={10} onChange={setMessage} required />

          <div>
            <div
              id='piece-jointe-multi--desc'
              className='self-center text-xs-regular'
            >
              <p>
                Taille maximum autorisée : 5 Mo aux formats .PDF, .JPG, .PNG
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
              />
            </div>

            {pieceJointe && (
              <div className='mb-4'>
                <Multiselection
                  selection={[
                    {
                      id: pieceJointe.name,
                      value: pieceJointe.name,
                      avecIndication: false,
                    },
                  ]}
                  typeSelection='fichier'
                  unselect={enleverFichier}
                />
              </div>
            )}

            {erreurUploadPieceJointe && (
              <InputError id='piece-jointe-multi--error' className='mb-4'>
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
              label='Quitter la rédaction du message groupé'
              onClick={openLeavePageConfirmationModal}
              style={ButtonStyle.SECONDARY}
              className='mr-3 p-2'
            >
              Annuler
            </Button>
          )}

          <Button
            type='submit'
            disabled={!formIsValid()}
            className='flex items-center p-2'
            isLoading={isSending}
            onClick={envoyerMessageGroupe}
          >
            <IconComponent
              name={IconName.Send}
              aria-hidden='true'
              focusable='false'
              className='mr-2 h-4 w-4 fill-blanc'
            />
            Envoyer
          </Button>
        </div>
        {showLeavePageModal && (
          <LeavePageConfirmationModal
            message="Vous allez quitter la page d'édition d’un message à plusieurs jeunes."
            commentaire='Toutes les informations saisies seront perdues ainsi que les pièces jointes attachées.'
            onCancel={closeLeavePageConfirmationModal}
            destination={returnTo}
          />
        )}
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  EnvoiMessageGroupeProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  const jeunes = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

  const referer: string | undefined = context.req.headers.referer

  const previousUrl =
    referer && !comingFromHome(referer) ? referer : '/mes-jeunes'
  return {
    props: {
      jeunes: [...jeunes].sort(compareJeunesByNom),
      withoutChat: true,
      pageTitle: 'Message multi-destinataires',
      returnTo: previousUrl,
    },
  }
}

export default withTransaction(
  EnvoiMessageGroupe.name,
  'page'
)(EnvoiMessageGroupe)

function comingFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/index')
}
