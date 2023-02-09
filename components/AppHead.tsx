import Head from 'next/head'

interface AppHeadProps {
  titre: string
  hasMessageNonLu: boolean
}

export default function AppHead({ titre, hasMessageNonLu }: AppHeadProps) {
  const title = `${
    hasMessageNonLu ? 'Nouveau(x) message(s)' : titre
  } - Espace conseiller CEJ`
  return (
    <Head>
      <title>{title}</title>
      <meta
        name='description'
        content="Espace conseiller de l'outil du Contrat d'Engagement Jeune"
      />
      <meta name='application-name' content='CEJ conseiller' />
      <meta name='format-detection' content='telephone=no' />
      <meta name='mobile-web-app-capable' content='yes' />
      <meta name='theme-color' content='#3B69D1' />
      <meta name='apple-mobile-web-app-capable' content='yes' />
      <meta name='apple-mobile-web-app-status-bar-style' content='default' />
      <meta name='apple-mobile-web-app-title' content='CEJ conseiller' />
      <meta name='viewport' content='width=device-width, initial-scale=1' />

      <link rel='shortcut icon' href='/favicon.png' />
      <link rel='apple-touch-icon' href='/favicon.png' />
      <link
        rel='icon'
        href={`/${hasMessageNonLu ? 'favicon_notif' : 'favicon'}.png`}
      />
      <link rel='manifest' href='/manifest.webmanifest' />
    </Head>
  )
}
