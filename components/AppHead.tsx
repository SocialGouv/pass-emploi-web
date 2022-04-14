import Head from 'next/head'
import React from 'react'

interface AppHeadProps {
  titre: string
  hasMessageNonLu: boolean
}

export default function AppHead({ titre, hasMessageNonLu }: AppHeadProps) {
  return (
    <Head>
      <title>
        {hasMessageNonLu ? 'Nouveau(x) message(s)' : titre} - Espace conseiller
        CEJ
      </title>
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
