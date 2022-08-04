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
      <link
        rel='icon'
        href={`/${hasMessageNonLu ? 'favicon_notif' : 'favicon'}.png`}
      />
      <link
        rel='preload'
        href='/fonts/Marianne/static/Marianne-Regular.otf'
        as='font'
        crossOrigin=''
      />
    </Head>
  )
}
