import React from 'react'
import Link from 'next/link'
import BackIcon from '../../../assets/icons/arrow_back.svg'
import {Jeune} from 'interfaces'
import {DetailsJeune} from 'components/jeune/DetailsJeune'
import {GetServerSideProps} from 'next'
import fetchJson from 'utils/fetchJson'
import {RdvJeune} from 'interfaces/rdv'

interface FicheJeuneProps {
    jeune: Jeune,
    rdv: RdvJeune[]
}

const FicheJeune = ({jeune, rdv}: FicheJeuneProps) => {
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
            <DetailsJeune jeune={jeune} rdv={rdv}
        /></div>

    )
}

export const getServerSideProps: GetServerSideProps = async ({query}) => {
    const [resInfoJeune, resRdvJeune] = await Promise.all([
        fetchJson(
            `${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}/`
        ),
        fetchJson(
            `${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}/rendezvous`
        ),
  ])

    if (!resInfoJeune || !resRdvJeune) {
        return {
            notFound: true,
        }
    }
    return {
        props: {
            jeune: resInfoJeune,
            rdv: resRdvJeune
        },
    }
}

export default FicheJeune
