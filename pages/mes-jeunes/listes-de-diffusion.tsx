import { GetServerSideProps } from 'next'
import React from 'react'

import EmptyStateImage from 'assets/images/empty_state.svg'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import withDependance from 'utils/injectionDependances/withDependance'

export default function ListesDiffusion() {
  return (
    <div className='mx-auto my-0 flex flex-col items-center'>
      <EmptyStateImage
        aria-hidden={true}
        focusable={false}
        className='w-[360px] h-[200px] mb-16'
      />
      <p className='text-base-bold mb-12'>
        Vous n’avez aucune liste de diffusion.
      </p>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }
  const listesDeDiffusionService = withDependance<ListesDeDiffusionService>(
    'listesDeDiffusionService'
  )
  const { user, accessToken } = sessionOrRedirect.session
  const listesDeDiffusion = await listesDeDiffusionService.getListesDeDiffusion(
    user.id,
    accessToken
  )
  return {
    props: {
      pageTitle: 'Listes de diffusion - Portefeuille',
      pageHeader: 'Mes listes de diffusion',
      listesDiffusion: listesDeDiffusion,
    },
  }
}
