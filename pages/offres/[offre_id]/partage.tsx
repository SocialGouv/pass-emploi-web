import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useState } from 'react'

import JeunesMultiselectAutocomplete from 'components/jeune/JeunesMultiselectAutocomplete'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import Label from 'components/ui/Form/Label'
import Textarea from 'components/ui/Form/Textarea'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BaseJeune } from 'interfaces/jeune'
import { DetailOffreEmploi } from 'interfaces/offre-emploi'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import { MessagesService } from 'services/messages.service'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useChatCredentials } from 'utils/chat/chatCredentialsContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type PartageOffresProps = PageProps & {
  offre: DetailOffreEmploi
  jeunes: BaseJeune[]
  withoutChat: true
}

function PartageOffre({ offre, jeunes }: PartageOffresProps) {
  const messagesService = useDependance<MessagesService>('messagesService')
  const [chatCredentials] = useChatCredentials()

  const [idsJeunesSelectionnes, setIdsJeunesSelectionnes] = useState<string[]>(
    []
  )
  const [message, setMessage] = useState<string | undefined>()

  function partager(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    messagesService.partagerOffre({
      idOffre: offre.id,
      idsJeunes: idsJeunesSelectionnes,
      cleChiffrement: chatCredentials!.cleChiffrement,
      message,
    })
  }

  return (
    <>
      <p>Offre n°{offre.id}</p>
      <p>{offre.titre}</p>

      <form onSubmit={partager} className='mt-8'>
        <fieldset className='border-none flex flex-col mb-8'>
          <legend className='flex items-center text-m-bold mb-4'>
            <IconComponent
              name={IconName.Chiffre1}
              role='img'
              focusable='false'
              aria-label='Étape 1'
              className='mr-2 w-8 h-8'
            />
            Bénéficiaires
          </legend>

          <JeunesMultiselectAutocomplete
            jeunes={jeunes}
            typeSelection='Bénéficiaires'
            onUpdate={setIdsJeunesSelectionnes}
          />
        </fieldset>

        <fieldset className='border-none'>
          <legend className='flex items-center text-m-bold mb-4'>
            <IconComponent
              name={IconName.Chiffre2}
              role='img'
              focusable='false'
              aria-label='Étape 2'
              className='mr-2 w-8 h-8'
            />
            Écrivez votre message
          </legend>

          <Label htmlFor='message' withBulleMessageSensible={true}>
            Message
          </Label>
          <Textarea
            id='message'
            rows={10}
            onChange={(e) => {
              setMessage(e.target.value)
            }}
          />
        </fieldset>

        <div className='flex justify-center'>
          <Button
            onClick={() => {}}
            style={ButtonStyle.SECONDARY}
            className='mr-3 p-2'
          >
            Annuler
          </Button>

          <Button
            type='submit'
            className='flex items-center p-2'
            disabled={false}
            isLoading={false}
            onClick={() => {}}
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
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  PartageOffresProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { user, accessToken } = sessionOrRedirect.session
  const offresEmploiService = withDependance<OffresEmploiService>(
    'offresEmploiService'
  )
  const jeunesService = withDependance<JeunesService>('jeunesService')

  const offre = await offresEmploiService.getOffreEmploiServerSide(
    context.query.offre_id as string,
    accessToken
  )
  if (!offre) return { notFound: true }

  const jeunes = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )
  return {
    props: {
      offre,
      jeunes,
      pageTitle: 'Partager une offre',
      withoutChat: true,
    },
  }
}

export default withTransaction(PartageOffre.name, 'page')(PartageOffre)
