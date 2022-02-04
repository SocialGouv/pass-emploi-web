import { AppHead } from 'components/AppHead'
import Button from 'components/Button'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Router from 'next/router'
import React, { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddIcon from '../../assets/icons/add_person.svg'
import { RechercheJeune } from 'components/jeune/RechercheJeune'
import { TableauJeunes } from 'components/jeune/TableauJeunes'

type MesJeunesProps = {
  structureConseiller: string
  conseillerJeunes: Jeune[]
}

function MesJeunes({ structureConseiller, conseillerJeunes }: MesJeunesProps) {
  const [queryJeune, setQueryJeune] = useState('')
  const [listeJeunesFiltres, setListJeunesFiltres] = useState<Jeune[]>([])

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

  const onSearch = (query: string | undefined) => {
    const querySplit = query?.toLowerCase().split(/-|\s/)
    setQueryJeune(query!)
    if (query !== '') {
      const jeunesFiltresResult = conseillerJeunes.filter((jeune) => {
        for (let i = 0; i < querySplit!.length; i++) {
          const jeuneLastName = jeune.lastName.replace(/’/i, "'")
          if (jeuneLastName.toLowerCase().includes(querySplit![i])) {
            return true
          }
          return false
        }
      })
      setListJeunesFiltres(jeunesFiltresResult)
    } else {
      setListJeunesFiltres(conseillerJeunes)
    }
  }

  useMatomo('Mes jeunes')
  useMatomo(
    listeJeunesFiltres.length === 1
      ? 'Clic sur Rechercher - Recherche avec résultats'
      : 'Clic sur Rechercher - Recherche sans résultats'
  )

  return (
    <>
      <AppHead titre='Mes jeunes' />
      <span className='flex flex-wrap justify-between mb-12'>
        <h1 className='h2-semi text-bleu_nuit'>Mes Jeunes</h1>
        {(structureConseiller === UserStructure.MILO ||
          structureConseiller === UserStructure.POLE_EMPLOI) && (
          <Button onClick={handleAddJeune}>
            <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
            Ajouter un jeune
          </Button>
        )}
      </span>

      <RechercheJeune onSearchFilterBy={onSearch} />

      <TableauJeunes
        jeunes={queryJeune?.length > 0 ? listeJeunesFiltres : conseillerJeunes}
      />
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
      conseillerJeunes:
        [...jeunes].sort((jeune1: Jeune, jeune2: Jeune) =>
          jeune1.lastName.localeCompare(jeune2.lastName)
        ) || [],
    },
  }
}

export default MesJeunes
