import { Metadata } from 'next'
import { headers } from 'next/headers'

import PlanDuSitePage from 'app/(connected)/(with-sidebar)/(with-chat)/plan-du-site/PlanDuSitePage'
import {
  PageHeaderPortal,
  PageRetourPortal,
} from 'components/PageNavigationPortals'
import redirectedFromHome from 'utils/redirectedFromHome'

export const metadata: Metadata = {
  title: 'Plan du site',
}

export default async function PlanDuSite() {
  const referer = headers().get('referer')

  const returnTo =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  return (
    <>
      <PageRetourPortal lien={returnTo} />
      <PageHeaderPortal header='Plan du site' />
      <PlanDuSitePage />
    </>
  )
}
