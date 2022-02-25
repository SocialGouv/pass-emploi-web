import { AppHead } from 'components/AppHead'
import { AjouterJeuneButton } from 'components/jeune/AjouterJeuneButton'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import { TableauJeunes } from 'components/jeune/TableauJeunes'
import { UserStructure } from 'interfaces/conseiller'
import { compareJeunesByLastName, Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Router from 'next/router'
import React, { useCallback, useEffect, useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { Container, useDependance } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddJeuneImage from '../../assets/images/ajouter_un_jeune.svg'
import { useSession } from 'next-auth/react'
import { MessagesService } from 'services/messages.service'

type MesJeunesProps = {
  structureConseiller: string
  conseillerJeunes: Jeune[] | (Jeune & { messagesNonLus: number })[]
  isFromEmail: boolean
}

function MesJeunes({
  structureConseiller,
  conseillerJeunes,
  isFromEmail,
}: MesJeunesProps) {
  const { data: session } = useSession({ required: true })
  const messagesService = useDependance<MessagesService>('messagesService')

  const [jeunes, setJeunes] = useState<(Jeune & { messagesNonLus: number })[]>(
    []
  )
  const [listeJeunesFiltres, setListJeunesFiltres] = useState<
    (Jeune & { messagesNonLus: number })[]
  >([])

  const initialTracking = `Mes jeunes${
    conseillerJeunes.length === 0 ? ' - Aucun jeune' : ''
  }${isFromEmail ? ' - Origine email' : ''}`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const handleAddJeune = () => {
    switch (structureConseiller) {
      case UserStructure.MILO:
        Router.push('/mes-jeunes/milo/creation-jeune')
        break
      case UserStructure.POLE_EMPLOI:
        Router.push('/mes-jeunes/pole-emploi/creation-jeune')
        break
      default:
        break
    }
  }

  const onSearch = useCallback(
    (query: string) => {
      const querySplit = query.toLowerCase().split(/-|\s/)
      if (query) {
        const jeunesFiltresResult = jeunes.filter((jeune) => {
          const jeuneLastName = jeune.lastName
            .replace(/’/i, "'")
            .toLocaleLowerCase()
          for (const item of querySplit) {
            if (jeuneLastName.includes(item)) {
              return true
            }
          }
          return false
        })
        setListJeunesFiltres(jeunesFiltresResult)
        if (jeunesFiltresResult.length > 0) {
          setTrackingTitle('Clic sur Rechercher - Recherche avec résultats')
        } else {
          setTrackingTitle('Clic sur Rechercher - Recherche sans résultats')
        }
      } else {
        setListJeunesFiltres(jeunes)
        setTrackingTitle(initialTracking)
      }
    },
    [initialTracking, jeunes]
  )

  useEffect(() => {
    if (session?.firebaseToken) {
      messagesService
        .signIn(session.firebaseToken)
        .then(() => {
          return Promise.all(
            conseillerJeunes.map(async (jeune) => {
              return {
                ...jeune,
                messagesNonLus: await messagesService.countMessagesNotRead(
                  session.user.id,
                  jeune.id
                ),
              }
            })
          )
        })
        .then((jeunesAvecMessagesNonLus) => {
          setJeunes(jeunesAvecMessagesNonLus)
          setListJeunesFiltres(jeunesAvecMessagesNonLus)
        })
    }
  }, [conseillerJeunes, messagesService, session])

  useMatomo(trackingTitle)

  return (
    <>
      <AppHead titre='Mes jeunes' />
      <div className={styles.header}>
        <div className={`flex flex-wrap justify-between mb-6`}>
          <h1 className='h2-semi text-bleu_nuit'>Mes Jeunes</h1>
          {(structureConseiller === UserStructure.MILO ||
            structureConseiller === UserStructure.POLE_EMPLOI) && (
            <AjouterJeuneButton handleAddJeune={handleAddJeune} />
          )}
        </div>

        <RechercheJeune onSearchFilterBy={onSearch} />
      </div>

      <div className={`w-full flex flex-col ${styles.content}`}>
        {conseillerJeunes.length === 0 && (
          <div className='mx-auto my-0'>
            <AddJeuneImage
              aria-hidden='true'
              focusable='false'
              className='mb-16'
            />
            <p className='text-bleu_nuit text-base-medium mb-12'>
              Vous n&apos;avez pas encore intégré de jeunes.
            </p>

            <AjouterJeuneButton handleAddJeune={handleAddJeune} />
          </div>
        )}

        {conseillerJeunes.length > 0 && (
          <TableauJeunes jeunes={listeJeunesFiltres} />
        )}
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<MesJeunesProps> = async (
  context
) => {
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
      structureConseiller: user.structure,
      conseillerJeunes: [...jeunes].sort(compareJeunesByLastName) || [],
      isFromEmail: Boolean(context.query?.source),
    },
  }
}

export default MesJeunes
