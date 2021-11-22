import React from 'react'
import Link from 'next/link'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import { Jeune } from 'interfaces'
import { DetailsJeune } from 'components/jeune/DetailsJeune'
import { GetServerSideProps } from 'next'
import fetchJson from 'utils/fetchJson'


interface FicheJeuneProps {
	jeune: Jeune
}

const FicheJeune = ({ jeune }: FicheJeuneProps) => {
  return (
    <div className={'flex flex-col'}>
      <div className={'flex items-center mb-8'}>
        <Link href='/mes-jeunes' passHref>
          <a className='mr-6'>
            <BackIcon
              role='img'
              focusable='false'
              aria-label='Retour sur la liste de tous les jeunes'
            />

          </a>
        </Link>
        <p className='h4-semi text-bleu_nuit'>Liste de mes jeunes</p>

      </div>
      <DetailsJeune id={jeune.id} firstName={jeune.firstName} lastName={jeune.lastName} />
    </div>

  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const dataJeune = await fetchJson(
    `${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}/`
  )

  if (!dataJeune) {
    return {
      notFound: true,
    }
  }
  return {
    props: {
      jeune: dataJeune
    },
  }
}

export default FicheJeune
