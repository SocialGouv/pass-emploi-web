import { AppHead } from 'components/AppHead'
import { GetServerSideProps } from 'next'
import React from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

type SupervisionProps = {}

function Supervision({}: SupervisionProps) {
  useMatomo('Supervision')

  return (
    <>
      <AppHead titre='Supervision' />
      <span className='flex flex-wrap justify-between mb-12'>
        <h1 className='h2-semi text-bleu_nuit'>Transfert de portefeuille</h1>
      </span>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<SupervisionProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (!user.estSuperviseur) {
    return { notFound: true }
  }

  return {
    props: {},
  }
}

export default Supervision
