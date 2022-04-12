import Head from 'next/head'
import React from 'react'

interface AppHeadProps {
  titre: string
}

export const AppHead: React.FC<AppHeadProps> = ({ titre }) => {
  return (
    <Head>
      <title>Espace conseiller CEJ - {titre}</title>
      <meta
        name='description'
        content="Espace conseiller de l'outil du Contrat d'Engagement Jeune"
      />
      <link rel='icon' href='/favicon.png' />
      <link
        rel='preload'
        href='/fonts/Marianne/static/Marianne-Regular.otf'
        as='font'
        crossOrigin=''
      />
    </Head>
  )
}
