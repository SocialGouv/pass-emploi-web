import Head from 'next/head'

interface AppHeadProps {
  titre: string
}

export const AppHead: React.FC<AppHeadProps> = ({ titre }) => {
  return (
    <Head>
      <title>Espace conseiller Pass Emploi - {titre}</title>
      <meta
        name='description'
        content="Espace conseiller de l'outil pass emploi"
      />
      <link rel='icon' href='/favicon.png' />
      {/* TODO: what s going on with Font?
          <link
           rel="preload"
           href='/fonts/Rubik/static/Rubik-Regular.ttf'
           as="font"
           crossOrigin=""
         /> */}
    </Head>
  )
}
