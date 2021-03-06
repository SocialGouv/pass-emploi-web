import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { ChangeEvent, MouseEvent, useRef, useState } from 'react'

import FailureMessage from 'components/FailureMessage'
import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import BulleMessageSensible from 'components/ui/BulleMessageSensible'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { InputError } from 'components/ui/InputError'
import Multiselection from 'components/ui/Multiselection'
import { InfoFichier } from 'interfaces/fichier'
import { BaseJeune, compareJeunesByNom } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { FichiersService } from 'services/fichiers.service'
import { JeunesService } from 'services/jeunes.service'
import {
  FormNouveauMessageGroupe,
  MessagesService,
} from 'services/messages.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { ApiError } from 'utils/httpClient'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { parseUrl, setQueryParams } from 'utils/urlParser'
import { useLeavePageModal } from 'utils/useLeavePageModal'

interface EnvoiMessageGroupeProps extends PageProps {
  jeunes: BaseJeune[]
  returnTo: string
}

function EnvoiMessageGroupe({ jeunes, returnTo }: EnvoiMessageGroupeProps) {
  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials] = useChatCredentials()
  const router = useRouter()
  const messagesService = useDependance<MessagesService>('messagesService')
  const fichiersService = useDependance<FichiersService>('fichiersService')

  const [selectedJeunesIds, setSelectedJeunesIds] = useState<string[]>([])
  const [message, setMessage] = useState<string>('')
  const [pieceJointe, setPieceJointe] = useState<File | undefined>()
  const hiddenFileInput = useRef<HTMLInputElement>(null)
  const [isSending, setIsSending] = useState<boolean>(false)
  const [erreurUploadPieceJointe, setErreurUploadPieceJointe] = useState<
    string | undefined
  >(undefined)
  const [erreurEnvoi, setErreurEnvoi] = useState<string | undefined>(undefined)

  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)
  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)

  const initialTracking = 'Message - R??daction'
  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

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
          pieceJointe,
          session!.accessToken
        )
      }
    } catch (error) {
      setErreurUploadPieceJointe(
        error instanceof ApiError
          ? error.message
          : 'Suite ?? un probl??me inconnu le t??l??versement de la pi??ce jointe a ??chou??. Vous pouvez r??essayer.'
      )
      setTrackingLabel('Message - ??chec upload pi??ce jointe')
      setConfirmBeforeLeaving(true)
      setIsSending(false)
      return
    }

    try {
      const formNouveauMessage: FormNouveauMessageGroupe = {
        conseiller: {
          id: session!.user.id,
          structure: session!.user.structure,
        },
        idsDestinataires: selectedJeunesIds,
        newMessage:
          message ||
          'Votre conseiller vous a transmis une nouvelle pi??ce jointe : ',
        accessToken: session!.accessToken,
        cleChiffrement: chatCredentials!.cleChiffrement,
      }
      if (fileInfo) formNouveauMessage.infoPieceJointe = fileInfo

      await messagesService.signIn(chatCredentials!.token)
      await messagesService.sendNouveauMessageGroupe(formNouveauMessage)

      const { pathname, query } = parseUrl(returnTo)
      await router.push({
        pathname,
        query: setQueryParams(query, {
          [QueryParam.envoiMessage]: QueryValue.succes,
        }),
      })
    } catch (error) {
      setErreurEnvoi(
        error instanceof ApiError
          ? error.message
          : "Suite ?? un probl??me inconnu l'envoi du message a ??chou??. Vous pouvez r??essayer."
      )
      setConfirmBeforeLeaving(true)
      setTrackingLabel('Message - ??chec envoi message')
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

  function ouvrirSelectionFichier() {
    hiddenFileInput.current!.click()
  }

  function ajouterPieceJointe(event: ChangeEvent<HTMLInputElement>) {
    if (!event.target.files || !event.target.files[0]) return

    const fichierSelectionne = event.target.files[0]
    setPieceJointe(fichierSelectionne)

    hiddenFileInput.current!.value = ''
  }

  function enleverFichier() {
    setErreurUploadPieceJointe(undefined)
    setPieceJointe(undefined)
  }

  return (
    <>
      {erreurEnvoi && (
        <FailureMessage
          label={erreurEnvoi}
          onAcknowledge={clearDeletionError}
        />
      )}

      <form>
        <div className='text-s-regular text-primary_darken mb-8'>
          Tous les champs sont obligatoires
        </div>

        <fieldset className='border-none mb-10'>
          <legend className='flex items-center text-m-medium mb-4'>
            <IconComponent
              name={IconName.Chiffre1}
              role='img'
              focusable='false'
              aria-label='??tape 1'
              className='mr-2 w-8 h-8'
            />
            Destinataires
          </legend>
          <JeunesMultiselectAutocomplete
            jeunes={jeunes}
            typeSelection='Destinataires'
            onUpdate={setSelectedJeunesIds}
          />
        </fieldset>

        <fieldset className='border-none'>
          <legend className='flex items-center text-m-medium mb-4'>
            <IconComponent
              name={IconName.Chiffre2}
              role='img'
              focusable='false'
              aria-label='??tape 2'
              className='mr-2 w-8 h-8'
            />
            ??crivez votre message
          </legend>

          <label
            htmlFor='message'
            className='flex text-base-medium items-center'
          >
            <span aria-hidden='true'>*</span>&nbsp;Message
            <span className='ml-2'>
              <BulleMessageSensible />
            </span>
          </label>

          <textarea
            id='message'
            name='message'
            rows={10}
            className={`w-full text-sm p-4  border border-solid border-black rounded-medium mt-4 ${
              erreurEnvoi ? 'mb-[8px]' : 'mb-8'
            }`}
            onChange={(e) => setMessage(e.target.value)}
            required
          />

          <div>
            <div id='piece-jointe-multi--desc' className='self-center text-xs'>
              <p>
                Taille maximum autoris??e : 5 Mo aux formats .PDF, .JPG, .PNG
              </p>
              <p>
                Attention ?? ne pas partager de donn??es sensibles, ?? caract??res
                personnelles ou de sant??.
              </p>
            </div>

            <div className='my-4'>
              <Button
                type='button'
                controls='piece-jointe-multi'
                describedBy='piece-jointe-multi--desc'
                style={ButtonStyle.SECONDARY}
                onClick={ouvrirSelectionFichier}
                disabled={Boolean(pieceJointe)}
              >
                <IconComponent
                  name={IconName.File}
                  aria-hidden={true}
                  focusable={false}
                  className='h-4 w-4 mr-2'
                />
                <label
                  htmlFor='piece-jointe-multi'
                  className='cursor-pointer'
                  onClick={(e) => e.preventDefault()}
                >
                  Ajouter une pi??ce jointe
                </label>
                <input
                  id='piece-jointe-multi'
                  type='file'
                  ref={hiddenFileInput}
                  aria-describedby={
                    erreurUploadPieceJointe
                      ? 'piece-jointe-multi--error'
                      : undefined
                  }
                  aria-invalid={erreurUploadPieceJointe ? true : undefined}
                  onChange={ajouterPieceJointe}
                  className='hidden'
                  accept='.pdf, .png, .jpeg, .jpg'
                />
              </Button>
            </div>

            {pieceJointe && (
              <div className='mb-4'>
                <Multiselection
                  selection={[
                    {
                      id: pieceJointe.name,
                      value: pieceJointe.name,
                      withInfo: false,
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
        </fieldset>

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
              label='Quitter la r??daction du message group??'
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
            onClick={envoyerMessageGroupe}
            isLoading={isSending}
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
            message="Vous allez quitter la page d'??dition d???un message ?? plusieurs jeunes."
            commentaire='Toutes les informations saisies seront perdues ainsi que les pi??ces jointes attach??es.'
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

  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)

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
