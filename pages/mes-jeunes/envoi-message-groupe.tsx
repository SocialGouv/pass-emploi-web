import { withTransaction } from '@elastic/apm-rum-react'
import ExitPageConfirmationModal from 'components/ExitPageConfirmationModal'
import FailureMessage from 'components/FailureMessage'
import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import Button, { ButtonStyle } from 'components/ui/Button'
import ButtonLink from 'components/ui/ButtonLink'
import { compareJeunesByLastName, Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { MouseEvent, useState } from 'react'
import { MessagesService } from 'services/messages.service'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { Container, useDependance } from 'utils/injectionDependances'
import BackIcon from '../../assets/icons/arrow_back.svg'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import Etape2Icon from '../../assets/icons/etape_2.svg'
import SendIcon from '../../assets/icons/send.svg'
import { RequestError } from '../../utils/fetchJson'

interface EnvoiMessageGroupeProps {
  jeunes: Jeune[]
  withoutChat: true
  pageTitle: string
  from: string
}

function EnvoiMessageGroupe({ jeunes, from }: EnvoiMessageGroupeProps) {
  const { data: session } = useSession<true>({ required: true })
  const router = useRouter()
  const messagesService = useDependance<MessagesService>('messagesService')

  const [selectedJeunes, setSelectedJeunes] = useState<Jeune[]>([])
  const [message, setMessage] = useState<string>('')
  const [erreurMessage, setErreurMessage] = useState<string | undefined>(
    undefined
  )
  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)

  const initialTracking = 'Message - Rédaction'

  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  const formIsValid = () => message !== '' && selectedJeunes.length !== 0

  function formHasChanges(): boolean {
    return Boolean(selectedJeunes.length >= 1 || message)
  }

  function openExitPageConfirmationModal(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setShowLeavePageModal(true)
  }

  async function envoyerMessageGroupe(
    e: MouseEvent<HTMLButtonElement>
  ): Promise<void> {
    e.preventDefault()
    e.stopPropagation()

    if (!formIsValid()) return
    try {
      await messagesService.signIn(session!.firebaseToken)
      await messagesService.sendNouveauMessageGroupe(
        { id: session!.user.id, structure: session!.user.structure },
        selectedJeunes,
        message,
        session!.accessToken
      )
      await router.push(`${from}?envoiMessage=succes`)
    } catch (error) {
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

  return (
    <>
      <div className={`flex items-center ${styles.header}`}>
        {!formHasChanges() && (
          <Link href={from}>
            <a className='items-center mr-4'>
              <BackIcon role='img' focusable='false' aria-hidden={true} />
              <span className='sr-only'>Page précédente</span>
            </a>
          </Link>
        )}
        {formHasChanges() && (
          <button
            className='items-center mr-4'
            onClick={openExitPageConfirmationModal}
          >
            <BackIcon role='img' focusable='false' aria-hidden={true} />
            <span className='sr-only'>
              Quitter la rédaction d&apos;un message à plusieurs jeunes
            </span>
          </button>
        )}
        <h1 className='text-l-medium text-bleu_nuit'>
          Message multi-destinataires
        </h1>
      </div>
      <div className={`${styles.content} max-w-[500px] m-auto`}>
        {erreurMessage && (
          <FailureMessage
            label={erreurMessage}
            onAcknowledge={clearDeletionError}
          />
        )}

        <form>
          <div className='text-sm-regular text-bleu_nuit mb-8'>
            Tous les champs sont obligatoires
          </div>

          <fieldset className='border-none mb-10'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape1Icon
                role='img'
                focusable='false'
                aria-label='Étape 1'
                className='mr-2'
              />
              Destinataires
            </legend>
            <JeunesMultiselectAutocomplete
              jeunes={jeunes}
              onUpdate={setSelectedJeunes}
            />
          </fieldset>

          <fieldset className='border-none'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape2Icon
                role='img'
                focusable='false'
                aria-label='Étape 2'
                className='mr-2'
              />
              Écrivez votre message
            </legend>

            <label htmlFor='message' className='text-base-medium'>
              <span aria-hidden='true'>*</span> Message
            </label>

            <textarea
              id='message'
              name='message'
              rows={10}
              className={`w-full text-sm text-bleu_nuit p-4  border border-solid border-black rounded-medium mt-4 ${
                erreurMessage ? 'mb-[8px]' : 'mb-14'
              }`}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </fieldset>

          <div className='flex justify-center'>
            {!formHasChanges() && (
              <ButtonLink
                href={from}
                style={ButtonStyle.SECONDARY}
                className='mr-3'
              >
                Annuler
              </ButtonLink>
            )}
            {formHasChanges() && (
              <Button
                aria-label='Quitter la rédaction du message groupé'
                onClick={openExitPageConfirmationModal}
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
              <SendIcon aria-hidden='true' focusable='false' className='mr-2' />
              Envoyer
            </Button>
          </div>
          {showLeavePageModal && (
            <ExitPageConfirmationModal
              message="Vous allez quitter la page d'édition d’un message à plusieurs jeunes."
              onCancel={() => setShowLeavePageModal(false)}
              destination={from}
            />
          )}
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { jeunesService } = Container.getDIContainer().dependances
  const {
    session: { user, accessToken },
  } = sessionOrRedirect

  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)

  return {
    props: {
      jeunes: [...jeunes].sort(compareJeunesByLastName),
      withoutChat: true,
      pageTitle: 'Message multi-destinataires',
      from: context.req.headers.referer ?? '/mes-jeunes',
    },
  }
}

export default withTransaction(
  EnvoiMessageGroupe.name,
  'page'
)(EnvoiMessageGroupe)
