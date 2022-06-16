import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { MouseEvent, useState } from 'react'

import FailureMessage from 'components/FailureMessage'
import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import BulleMessageSensible from 'components/ui/BulleMessageSensible'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { compareJeunesByLastName, Jeune } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { RequestError } from 'utils/httpClient'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { useLeavePageModal } from 'utils/useLeavePageModal'

interface EnvoiMessageGroupeProps extends PageProps {
  jeunes: Jeune[]
  returnTo: string
}

function EnvoiMessageGroupe({ jeunes, returnTo }: EnvoiMessageGroupeProps) {
  const { data: session } = useSession<true>({ required: true })
  const [chatCredentials] = useChatCredentials()
  const router = useRouter()
  const messagesService = useDependance<MessagesService>('messagesService')

  const [selectedJeunesIds, setSelectedJeunesIds] = useState<string[]>([])
  const [message, setMessage] = useState<string>('')
  const [erreurMessage, setErreurMessage] = useState<string | undefined>(
    undefined
  )
  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)
  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)

  const initialTracking = 'Message - Rédaction'

  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  function formIsValid(): boolean {
    return Boolean(selectedJeunesIds.length && message)
  }

  function formHasChanges(): boolean {
    return Boolean(selectedJeunesIds.length || message)
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
    try {
      await messagesService.signIn(chatCredentials!.token)
      await messagesService.sendNouveauMessageGroupe(
        { id: session!.user.id, structure: session!.user.structure },
        selectedJeunesIds,
        message,
        session!.accessToken,
        chatCredentials!.cleChiffrement
      )
      await router.push(`${returnTo}?envoiMessage=succes`)
    } catch (error) {
      setConfirmBeforeLeaving(true)
      setErreurMessage(
        error instanceof RequestError
          ? error.message
          : "Suite à un problème inconnu l'envoi du message a échoué. Vous pouvez réessayer."
      )
      setTrackingLabel('Message - Échec envoi message')
    }
  }

  function clearDeletionError(): void {
    setErreurMessage(undefined)
    setTrackingLabel(initialTracking)
  }

  useMatomo(trackingLabel)
  useMatomo(showLeavePageModal ? 'Message - Modale Annulation' : undefined)

  useLeavePageModal(
    formHasChanges() && confirmBeforeLeaving,
    openLeavePageConfirmationModal
  )

  return (
    <>
      {erreurMessage && (
        <FailureMessage
          label={erreurMessage}
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
              aria-label='Étape 1'
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
              aria-label='Étape 2'
              className='mr-2 w-8 h-8'
            />
            Écrivez votre message
          </legend>

          <label
            htmlFor='message'
            className='flex text-base-medium items-center'
          >
            <span aria-hidden='true'>*</span> Message
            <span className='ml-2'>
              <BulleMessageSensible />
            </span>
          </label>

          <textarea
            id='message'
            name='message'
            rows={10}
            className={`w-full text-sm p-4  border border-solid border-black rounded-medium mt-4 ${
              erreurMessage ? 'mb-[8px]' : 'mb-14'
            }`}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
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
              aria-label='Quitter la rédaction du message groupé'
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
      jeunes: [...jeunes].sort(compareJeunesByLastName),
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
