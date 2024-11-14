import { init as initRum } from '@elastic/apm-rum'
import { render, screen } from '@testing-library/react'

import RootLayout, { metadata, viewport } from 'app/layout'
import { init as initMatomo } from 'utils/analytics/matomo'

jest.mock('utils/analytics/matomo')
jest.mock('@elastic/apm-rum')

describe('RootLayout', () => {
  beforeEach(async () => {
    // When
    render(
      <RootLayout>
        <div>Composant whatever</div>
      </RootLayout>
    )
  })

  it('affiche ses enfants', async () => {
    // Then
    expect(screen.getByText('Composant whatever')).toBeInTheDocument()
  })

  it('prépare les métadonnées de head', async () => {
    expect(metadata).toEqual({
      title: 'Espace conseiller',
      description: 'Espace conseiller de l’outil du Contrat d’Engagement Jeune',
      applicationName: 'CEJ conseiller',
      icons: {
        icon: '/cej-favicon.png',
        shortcut: '/cej-favicon.png',
        apple: '/cej-favicon.png',
      },
    })
    expect(viewport).toEqual({
      themeColor: '#3B69D1',
    })
  })

  it('initialise les analytics', async () => {
    // Then
    expect(initMatomo).toHaveBeenCalledWith({
      siteId: 'NEXT_PUBLIC_MATOMO_SOCIALGOUV_SITE_ID',
      url: 'NEXT_PUBLIC_MATOMO_SOCIALGOUV_URL',
    })
  })

  it('initialise le monitoring des comportements utilisateurs', async () => {
    // Then
    expect(initRum).toHaveBeenCalledWith({
      active: false,
      distributedTracingOrigins: ['NEXT_PUBLIC_API_ENDPOINT'],
      environment: 'development',
      serverUrl: 'APM_URL',
      serviceName: 'rum-pa-front-local',
    })
  })
})
