import { AppHead } from 'components/AppHead'
import Button, { ButtonStyle } from 'components/ui/Button'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import { useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../assets/icons/arrow_back.svg'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import Etape2Icon from '../../assets/icons/etape_2.svg'
import SendIcon from '../../assets/icons/send.svg'

type EnvoieMessageGroupe = {
  jeunes: Jeune[]
}

function EnvoieMessageGroupe({ jeunes }: EnvoieMessageGroupe) {
  const [selectedJeunes, setSelectedJeunes] = useState<Jeune[]>([jeunes[0]])
  const [message, setMessage] = useState<string>('')

  const FormIsValid = () => message !== '' && selectedJeunes.length !== 0

  useMatomo('Message - Rédaction')

  return (
    <>
      <AppHead titre='Envoie de message à plusieurs jeunes' />
      <div className={`flex items-center ${styles.header}`}>
        <Link href={'/mes-jeunes'}>
          <a className='items-center mr-4'>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
          </a>
        </Link>
        <h1 className='text-l-medium text-bleu_nuit'>
          Envoi d’un message à plusieurs jeunes
        </h1>
      </div>
      <div className={styles.content}>
        <form method='POST' role='form' onSubmit={() => {}} onReset={() => {}}>
          <div className='text-sm-regular text-bleu_nuit mb-8'>
            Les champs marqués d&apos;une * sont obligatoires.
          </div>

          <fieldset>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape1Icon
                role='img'
                focusable='false'
                aria-label='Étape 1'
                className='mr-2'
              />
              Destinataires
            </legend>
            <label htmlFor='beneficiaire' className='text-base-regular'>
              Rechercher et ajouter des jeunes <span aria-hidden='true'>*</span>
              <span className='block text-bleu_nuit text-sm-regular mb-3'>
                Nom et prénom
              </span>
            </label>
            <select
              id='beneficiaire'
              name='beneficiaire'
              onChange={(e) => {}}
              className='text-sm text-bleu_nuit w-full p-3 mb-2 border border-bleu_nuit rounded-medium cursor-pointer'
              style={{ background: 'white' }}
              required
              disabled
            >
              <option aria-hidden hidden disabled value={undefined} />
              {jeunes.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.firstName} {j.lastName}
                </option>
              ))}
            </select>
            <p className='mb-10'>Destinataires({selectedJeunes.length})</p>
          </fieldset>

          <fieldset>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape2Icon
                role='img'
                focusable='false'
                aria-label='Étape 2'
                className='mr-2'
              />
              Écrivez votre message
            </legend>

            <label htmlFor='message'>
              Message <span aria-hidden='true'>*</span>
            </label>

            <textarea
              id='message'
              name='message'
              rows={10}
              cols={5}
              className='w-full text-sm text-bleu_nuit p-4 mb-14 border border-solid border-black rounded-medium mt-4'
              placeholder='Ajouter un message...'
              onChange={(e) => setMessage(e.target.value)}
              required
            ></textarea>
          </fieldset>

          <div className='flex justify-center'>
            <Button type='reset' style={ButtonStyle.SECONDARY} className='mr-3'>
              <span className='p-2'>Annuler</span>
            </Button>
            <Button type='submit' disabled={!FormIsValid()}>
              <span className='flex items-center p-2'>
                <SendIcon
                  aria-hidden='true'
                  focusable='false'
                  className='mr-2'
                />
                Envoyer
              </span>
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
      jeunes: jeunes,
    },
  }
}

export default EnvoieMessageGroupe
