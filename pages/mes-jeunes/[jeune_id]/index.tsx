import React from 'react'
import Link from 'next/link'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import { Jeune } from 'interfaces'
import { DetailsJeune } from 'components/jeune/FicheJeune'
import { GetServerSideProps } from 'next'
import fetchJson from 'utils/fetchJson'

interface FicheJeuneProps {
	jeune: Jeune
}

const FicheJeune = ({ jeune }: FicheJeuneProps) => {
	return (
		<>
			<div className='flex'>
				<Link href='/mes-jeunes' passHref>
					<a className='mr-[24px]'>
						<BackIcon
							role='img'
							focusable='false'
							aria-label='Retour sur la liste de tous les jeunes'
						/>
					</a>
				</Link>
				<div className=''>
					<p className='h4-semi text-bleu_nuit'>Liste de mes jeunes</p>
					<DetailsJeune id={'HBDD'} firstName={'Lala'} lastName={'MIA'} />
				</div>
			</div>
		</>
	)
}

/*export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const data = await fetchJson(
        `${process.env.API_ENDPOINT}/conseiller/jeunes/${query.jeune_id}`
    )

    if (!data) {
        return {
            notFound: true,
        }
    }

    return {
        props: {
            jeune: data.jeune,
        },
    }
}*/

export default FicheJeune
