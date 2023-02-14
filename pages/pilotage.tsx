import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'

import { OngletActionsPilotage } from 'components/pilotage/OngletActionsPilotage'
import { IconName } from 'components/ui/IconComponent'
import Tab from 'components/ui/Navigation/Tab'
import TabList from 'components/ui/Navigation/TabList'
import { ActionPilotage, MetadonneesActions } from 'interfaces/action'
import { PageProps } from 'interfaces/pageProps'
import { ActionsService } from 'services/actions.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type PilotageProps = PageProps & {
  actions: Array<ActionPilotage>
  metadonneesActions: MetadonneesActions
}

export enum Onglet {
  ACTIONS = 'ACTIONS',
  ANIMATIONS_COLLECTIVES = 'ANIMATIONS_COLLECTIVES',
}

function Pilotage({ actions, metadonneesActions }: PilotageProps) {
  const actionsService = useDependance<ActionsService>('actionsService')
  const [conseiller] = useConseiller()

  const [currentTab, setCurrentTab] = useState<Onglet>(Onglet.ACTIONS)
  const [totalActions, setTotalActions] = useState<number>(
    metadonneesActions.nombreTotal
  )

  async function chargerActions(
    page: number
  ): Promise<{ actions: ActionPilotage[]; metadonnees: MetadonneesActions }> {
    const result = await actionsService.getActionsAQualifierClientSide(
      conseiller!.id,
      page
    )

    setTotalActions(result.metadonnees.nombreTotal)
    return result
  }

  return (
    <div>
      <TabList className='mt-10'>
        <Tab
          label='Actions à qualifier'
          count={totalActions}
          selected={currentTab === Onglet.ACTIONS}
          controls='liste-actions-à-qualifier'
          onSelectTab={() => setCurrentTab(Onglet.ACTIONS)}
          iconName={IconName.Calendar}
        />
        {/*<Tab*/}
        {/*  label='Animations à clore'*/}
        {/*  count={99}*/}
        {/*  selected={currentTab === Onglet.ANIMATIONS_COLLECTIVES}*/}
        {/*  controls='liste-animations-collectives-à-clore'*/}
        {/*  onSelectTab={() => setCurrentTab(Onglet.ANIMATIONS_COLLECTIVES)}*/}
        {/*  iconName={IconName.Calendar}*/}
        {/*/>*/}
      </TabList>

      {currentTab === Onglet.ACTIONS && (
        <div
          role='tabpanel'
          aria-labelledby='liste-actions-à-qualifier--tab'
          tabIndex={0}
          id='liste-actions-à-qualifier'
          className='mt-8 pb-8 border-b border-primary_lighten'
        >
          <OngletActionsPilotage
            actionsInitiales={{
              actions: actions,
              page: 1,
              metadonnees: metadonneesActions,
            }}
            getActions={chargerActions}
          />
        </div>
      )}

      {/*{currentTab === Onglet.ANIMATIONS_COLLECTIVES && (*/}
      {/*  <div*/}
      {/*    role='tabpanel'*/}
      {/*    aria-labelledby='animations_collectives--tab'*/}
      {/*    tabIndex={0}*/}
      {/*    id='liste-animations-collectives-à-clore'*/}
      {/*    className='mt-8 pb-8 border-b border-primary_lighten'*/}
      {/*  >*/}
      {/*    animations collectives*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const actionsService = withDependance<ActionsService>('actionsService')
  const {
    session: {
      accessToken,
      user: { id },
    },
  } = sessionOrRedirect

  const { actions, metadonnees } =
    await actionsService.getActionsAQualifierServerSide(id, accessToken)

  return {
    props: {
      pageTitle: 'Pilotage',
      actions,
      metadonneesActions: metadonnees,
    },
  }
}

export default withTransaction(Pilotage.name, 'page')(Pilotage)
