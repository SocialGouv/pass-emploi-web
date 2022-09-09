import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { BlocSituation } from 'components/jeune/BlocSituation'
import { ListeConseillersJeune } from 'components/jeune/ListeConseillersJeune'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { StructureConseiller } from 'interfaces/conseiller'
import {
  CategorieSituation,
  ConseillerHistorique,
  EtatSituation,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import withDependance from 'utils/injectionDependances/withDependance'

interface HistoriqueProps extends PageProps {
  idJeune: string
  situations: Array<{
    etat?: EtatSituation
    categorie: CategorieSituation
    dateFin?: string
  }>
  conseillers: ConseillerHistorique[]
}

interface HistoriqueConseillersProps {
  conseillers: ConseillerHistorique[]
  avecTitre: boolean
}

export enum Onglet {
  SITUATIONS = 'SITUATIONS',
  CONSEILLERS = 'CONSEILLERS',
}

function HistoriqueConseillers({
  conseillers,
  avecTitre,
}: HistoriqueConseillersProps) {
  return (
    <div className='border border-solid rounded-medium w-full p-4 mt-3 border-grey_100'>
      {avecTitre && (
        <h2 className='text-base-bold mb-4'>Historique des conseillers</h2>
      )}
      <ListeConseillersJeune id='liste-conseillers' conseillers={conseillers} />
    </div>
  )
}

function Historique({ idJeune, situations, conseillers }: HistoriqueProps) {
  const [conseiller] = useConseiller()
  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.SITUATIONS)
  const situationsTracking = 'Détail jeune – Situations'
  const conseillersTracking = 'Détail jeune – Historique conseillers'
  const initialTracking =
    conseiller?.structure === StructureConseiller.MILO
      ? situationsTracking
      : conseillersTracking
  const [tracking, setTracking] = useState<string>(initialTracking)

  async function switchTab(tab: Onglet) {
    setCurrentTab(tab)
    setTracking(
      tab === Onglet.SITUATIONS ? situationsTracking : conseillersTracking
    )
  }

  useMatomo(tracking)

  return (
    <>
      {conseiller?.structure === StructureConseiller.MILO && (
        <>
          <TabList className='mt-10'>
            <Tab
              label='Situations'
              selected={currentTab === Onglet.SITUATIONS}
              controls='liste-situations'
              onSelectTab={() => switchTab(Onglet.SITUATIONS)}
              iconName={IconName.Calendar}
            />
            <Tab
              label='Historique des conseillers'
              selected={currentTab === Onglet.CONSEILLERS}
              controls='liste-conseillers'
              onSelectTab={() => switchTab(Onglet.CONSEILLERS)}
              iconName={IconName.Actions}
            />
          </TabList>

          {currentTab === Onglet.SITUATIONS && (
            <div
              role='tabpanel'
              aria-labelledby='liste-situations--tab'
              tabIndex={0}
              id='liste-situations'
              className='mt-8 pb-8'
            >
              <BlocSituation
                idJeune={idJeune}
                situations={situations}
                versionResumee={false}
              />
            </div>
          )}

          {currentTab === Onglet.CONSEILLERS && (
            <div
              role='tabpanel'
              aria-labelledby='liste-conseillers--tab'
              tabIndex={0}
              id='liste-conseillers'
              className='mt-8 pb-8'
            >
              <HistoriqueConseillers
                conseillers={conseillers}
                avecTitre={false}
              />
            </div>
          )}
        </>
      )}

      {conseiller?.structure &&
        [
          StructureConseiller.POLE_EMPLOI,
          StructureConseiller.PASS_EMPLOI,
        ].includes(conseiller?.structure) && (
          <HistoriqueConseillers conseillers={conseillers} avecTitre={true} />
        )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<HistoriqueProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const {
    session: { accessToken },
  } = sessionOrRedirect

  const [jeune, conseillers] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    jeunesService.getConseillersDuJeuneServerSide(
      context.query.jeune_id as string,
      accessToken
    ),
  ])

  if (!jeune) {
    return { notFound: true }
  }

  return {
    props: {
      idJeune: jeune.id,
      situations: jeune.situations,
      conseillers: conseillers,
      pageTitle: 'Historique',
    },
  }
}

// TODO-GAD Faire passer le test pour supprimer le warning
export default withTransaction(Historique.name, 'page')(Historique)
