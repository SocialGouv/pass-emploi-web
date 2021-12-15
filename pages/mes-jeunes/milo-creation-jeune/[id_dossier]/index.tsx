import React from 'react'
import { GetServerSideProps } from 'next'
import { Dossier } from 'interfaces/jeune'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

interface DossierJeuneProps {
  dossier: Dossier
}

function DossierJeune({ dossier }: DossierJeuneProps) {
  return (
    <div>
      <p>{dossier.id}</p>
      <p>{dossier.prenom}</p>
      <p>{dossier.nom}</p>
      <p>{dossier.email}</p>
      <p>{dossier.codePostal}</p>
      <p>{dossier.dateDeNaissance}</p>
    </div>
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

  const dataDossierJeune = await conseillerService.getDossierJeune(
    context.query.id_dossier as string,
    accessToken
  )

  if (!dataDossierJeune) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      dossier: dataDossierJeune,
    },
  }
}

export default DossierJeune
