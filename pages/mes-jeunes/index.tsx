import React, { useState } from 'react'
import Router from 'next/router'

import AddJeuneModal from 'components/jeune/AddJeuneModal'
import Button from 'components/Button'

import { Jeune } from 'interfaces'

import withSession, { ServerSideHandler } from 'utils/session'

import AddIcon from '../../assets/icons/add_person.svg'
import fetchJson from 'utils/fetchJson'
import Link from 'next/link'
import ChevronRight from '../../assets/icons/chevron_right.svg'

type MesJeunesProps = {
  conseillerJeunes: Jeune[]
}

function MesJeunes({ conseillerJeunes }: MesJeunesProps) {
  const [showModal, setShowModal] = useState(false)
  const [jeunes, setJeunes] = useState<Jeune[]>(conseillerJeunes)

  const handleCloseModal = () => {
    setShowModal(false)
    Router.reload()
  }

  return (
    <>
      <span className='flex flex-wrap justify-between mb-12'>
        <h1 className='h2-semi text-bleu_nuit'>Mes Jeunes</h1>
        <Button onClick={() => setShowModal(true)}>
          <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
          Ajouter un jeune
        </Button>
      </span>

      <table className='w-full'>
        <caption className='visually-hidden'>
          Liste de mes bénéficiaires
        </caption>
        <thead>
          <tr className={'grid grid-cols-table'}>
            <th scope='col' className='text-sm text-bleu text-left p-4'>
              Nom du jeune
            </th>

            <th scope='col' className='text-sm text-bleu text-left pb-4 pt-4'>
              Identifiant
            </th>
          </tr>
        </thead>

        <tbody>
          {jeunes?.map((jeune: Jeune) => (
            <Link href={`mes-jeunes/${jeune.id}`} key={jeune.id} passHref>
              <tr
                key={jeune.id}
                className='grid grid-cols-table text-sm text-bleu_nuit cursor-pointer hover:bg-gris_blanc'
              >
                <td className='p-[16px]'>
                  {jeune.firstName} {jeune.lastName}
                </td>

                <td className='p-4'>{jeune.id}</td>
                <td className='p-4 col-end-6'>
                  <ChevronRight aria-hidden='true' focusable='false' />
                </td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>

      <AddJeuneModal onClose={handleCloseModal} show={showModal} />
    </>
  )
}

export const getServerSideProps = withSession<ServerSideHandler>(
  async ({ req, res }) => {
    const user = req.session.get('user')

    const userId = user.id

    if (user === undefined) {
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()
      return {
        props: {},
      }
    }

    const jeunes = await fetchJson(
      `${process.env.API_ENDPOINT}/conseillers/${userId}/jeunes`
    )

    return {
      props: {
        conseillerJeunes: jeunes || [],
      },
    }
  }
)

export default MesJeunes
