import React, { useEffect } from 'react'
import { GetServerSideProps } from 'next'
import { DossierMilo } from 'interfaces/jeune'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import { MessageErreurDossierContext } from 'context/hooks'
import Router from 'next/router'

interface DossierJeuneProps {
  dossier?: DossierMilo
  erreurMessage?: string
}

function DossierJeune({ dossier, erreurMessage }: DossierJeuneProps) {
  useEffect(() => {
    // console.log('erreurMessage, ', erreurMessage)
    if (erreurMessage) {
      Router.push('/mes-jeunes/milo-creation-jeune')
    }
  }, [erreurMessage])

  return (
    <MessageErreurDossierContext.Provider value={erreurMessage || null}>
      {dossier && (
        <div>
          <p>{dossier.id}</p>
          <p>{dossier.prenom}</p>
          <p>{dossier.nom}</p>
          <p>{dossier.email}</p>
          <p>{dossier.codePostal}</p>
          <p>{dossier.dateDeNaissance}</p>
        </div>
      )}
    </MessageErreurDossierContext.Provider>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const { conseillerService } = Container.getDIContainer().dependances
  const {
    session: { accessToken },
  } = sessionOrRedirect

  let dataDossierJeune

  try {
    dataDossierJeune = await conseillerService.getDossierJeune(
      context.query.dossier_id as string,
      accessToken
    )
  } catch (e) {
    // console.log('**********e', e.message)
    return {
      props: {
        erreurMessage: (e as Error).message,
      },
    }
  }

  // if (!dataDossierJeune) {
  //   return {
  //     notFound: true,
  //   }
  // }

  return {
    props: {
      dossier: dataDossierJeune,
    },
  }
}

export default DossierJeune
