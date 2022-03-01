import { AppHead } from 'components/AppHead'
import Button, { ButtonStyle } from 'components/ui/Button'
import { compareJeunesByLastName, Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import React, { useRef, useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../assets/icons/arrow_back.svg'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import Etape2Icon from '../../assets/icons/etape_2.svg'
import RemoveIcon from '../../assets/icons/remove.svg'
import SendIcon from '../../assets/icons/send.svg'

interface EnvoiMessageGroupeProps {
  jeunes: Jeune[]
}

function EnvoiMessageGroupe({ jeunes }: EnvoiMessageGroupeProps) {
  const [selectedJeunes, setSelectedJeunes] = useState<Jeune[]>([])
  const [message, setMessage] = useState<string>('')
  const inputDestinataires = useRef<HTMLInputElement>(null)

  const formIsValid = () => message !== '' && selectedJeunes.length !== 0

  function selectJeune(inputValue: string) {
    console.log(inputValue)
    const jeune = jeunes
      .filter(isNotSelected)
      .find((j) => `${j.lastName} ${j.firstName}` === inputValue)
    if (jeune) {
      setSelectedJeunes(selectedJeunes.concat(jeune))
      inputDestinataires.current!.value = ''
    }
  }

  function unselectJeune(idJeune: string) {
    const indexSelectedJeune = selectedJeunes.findIndex((j) => j.id === idJeune)
    if (indexSelectedJeune > -1) {
      const updatedSelectedJeune = [...selectedJeunes]
      updatedSelectedJeune.splice(indexSelectedJeune, 1)
      setSelectedJeunes(updatedSelectedJeune)
    }
  }

  function isNotSelected(jeune: Jeune): boolean {
    return selectedJeunes.findIndex((j) => j.id === jeune.id) === -1
  }

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
            <label htmlFor='beneficiaire' className='text-base-medium'>
              <span aria-hidden='true'>*</span> Rechercher et ajouter des jeunes
              <span className='text-bleu_nuit text-sm-regular ml-2'>
                Nom et prénom
              </span>
            </label>
            <input
              type='text'
              id='beneficiaire'
              name='beneficiaire'
              ref={inputDestinataires}
              className='text-sm text-bleu_nuit w-full p-3 mb-2 mt-4 border border-bleu_nuit rounded-medium cursor-pointer bg-blanc'
              list='beneficiaires'
              onChange={(e) => selectJeune(e.target.value)}
              multiple={true}
              required={true}
            />
            <datalist id='beneficiaires'>
              {jeunes.filter(isNotSelected).map((jeune) => (
                <option
                  key={jeune.id}
                  value={`${jeune.lastName} ${jeune.firstName}`}
                />
              ))}
            </datalist>

            <p
              aria-label={`Destinataires sélectionnés (${selectedJeunes.length})`}
              className='mb-2'
            >
              Destinataires ({selectedJeunes.length})
            </p>
            {selectedJeunes.length > 0 && (
              <ul className='bg-grey_100 rounded-[12px] px-2 py-4'>
                {selectedJeunes.map((jeune) => (
                  <li
                    key={jeune.id}
                    className='bg-blanc w-full rounded-full px-4 py-2 mb-2 last:mb-0 flex justify-between items-center'
                  >
                    {jeune.lastName} {jeune.firstName}
                    <button
                      type='reset'
                      title='Enlever'
                      onClick={() => unselectJeune(jeune.id)}
                    >
                      <span className='sr-only'>Enlever le jeune</span>
                      <RemoveIcon focusable={false} aria-hidden={true} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
              className='w-full text-sm text-bleu_nuit p-4 mb-14 border border-solid border-black rounded-medium mt-4'
              placeholder='Ajouter un message...'
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </fieldset>

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
    },
  }
}

export default EnvoiMessageGroupe
