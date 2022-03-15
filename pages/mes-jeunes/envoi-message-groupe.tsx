import { AppHead } from 'components/AppHead'
import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import Button, { ButtonStyle } from 'components/ui/Button'
import { compareJeunesByLastName, Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import React, { MouseEvent, useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { Container, useDependance } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../assets/icons/arrow_back.svg'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import Etape2Icon from '../../assets/icons/etape_2.svg'
import SendIcon from '../../assets/icons/send.svg'
import { MessagesService } from 'services/messages.service'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { RequestError } from '../../utils/fetchJson'
import FailureMessage from 'components/FailureMessage'

interface EnvoiMessageGroupeProps {
  jeunes: Jeune[]
  withoutChat: true
  from: string
}

function EnvoiMessageGroupe({ jeunes, from }: EnvoiMessageGroupeProps) {
  const { data: session } = useSession({ required: true })
  const router = useRouter()
  const messagesService = useDependance<MessagesService>('messagesService')

  const [selectedJeunes, setSelectedJeunes] = useState<Jeune[]>([])
  const [message, setMessage] = useState<string>('')
  const [erreurMessage, setErreurMessage] = useState<string | undefined>(
    undefined
  )
  const initialTracking = 'Message - Rédaction'

  const [trackingLabel, setTrackingLabel] = useState<string>(initialTracking)

  const formIsValid = () => message !== '' && selectedJeunes.length !== 0

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

  return (
    <>
      <AppHead titre='Message multi-destinataires' />
      <div className={`flex items-center ${styles.header}`}>
        <Link href={from}>
          <a className='items-center mr-4'>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
          </a>
        </Link>
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
          {erreurMessage && (
            <InputError className='mb-12'>{erreurMessage}</InputError>
          )}

          <div className='flex justify-center'>
            <Button
              type='reset'
              style={ButtonStyle.SECONDARY}
              className='mr-3 p-2'
            >
              Annuler
            </Button>
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
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
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
      from: context.req.headers.referer ?? '/mes-jeunes',
    },
  }
}

export default EnvoiMessageGroupe
