import Button from 'components/Button'
import AddJeuneModal from 'components/jeune/AddJeuneModal'
import { Jeune } from 'interfaces'
import Link from 'next/link'
import Router from 'next/router'
import React, { useState } from 'react'
import fetchJson from 'utils/fetchJson'
import withSession, { ServerSideHandler } from 'utils/session'
import AddIcon from '../../assets/icons/add_person.svg'
import ChevronRight from '../../assets/icons/chevron_right.svg'
import { AppHead } from 'components/AppHead'

type MesJeunesProps = {
  conseillerJeunes: Jeune[]
}

function MesJeunes({ conseillerJeunes }: MesJeunesProps) {
  const [showModal, setShowModal] = useState(false)

  const handleCloseModal = () => {
    setShowModal(false)
    Router.reload()
  }

  return (
    <>
      <AppHead titre='Espace conseiller Pass Emploi - Mes jeunes' />
      <span className='flex flex-wrap justify-between mb-12'>
        <h1 className='h2-semi text-bleu_nuit'>Mes Jeunes</h1>
        <Button onClick={() => setShowModal(true)}>
          <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
          Ajouter un jeune
        </Button>
      </span>

      <div
        role='table'
        className='table w-full'
        aria-label='jeunes'
        aria-describedby='table-caption'
      >
        <div id='table-caption' className='visually-hidden'>
          Liste de mes jeunes
        </div>
        <div role='rowgroup'>
          <div role='row' className='table-row grid grid-cols-table'>
            <span
              role='columnheader'
              className='table-cell text-sm text-bleu text-left p-4'
            >
              Nom du jeune
            </span>

            <span
              role='columnheader'
              className='table-cell text-sm text-bleu text-left pb-4 pt-4'
            >
              Identifiant
            </span>
          </div>
        </div>

        <div role='rowgroup'>
          {conseillerJeunes?.map((jeune: Jeune) => (
            <Link href={`mes-jeunes/${jeune.id}`} key={jeune.id} passHref>
              <a
                key={jeune.id}
                role='row'
                aria-label={`Accéder à la fiche de ${jeune.firstName} ${jeune.lastName}, identifiant ${jeune.id}`}
                className='table-row grid grid-cols-table text-sm text-bleu_nuit cursor-pointer hover:bg-gris_blanc'
              >
                <span role='cell' className='table-cell p-4' aria-hidden='true'>
                  {jeune.firstName} {jeune.lastName}
                </span>

                <span role='cell' className='table-cell p-4' aria-hidden='true'>
                  {jeune.id}
                </span>
                <span
                  role='cell'
                  className='table-cell p-4 col-end-6'
                  aria-hidden='true'
                >
                  <ChevronRight aria-hidden='true' focusable='false' />
                </span>
              </a>
            </Link>
          ))}
        </div>
      </div>

      <AddJeuneModal onClose={handleCloseModal} show={showModal} />
    </>
  )
}

export const getServerSideProps = withSession<ServerSideHandler>(
  async ({ req, res }) => {
    const user: { id: string } | undefined =
      req.session.get<{ id: string }>('user')

    if (user === undefined) {
      res.setHeader('location', '/login')
      res.statusCode = 302
      res.end()
      return {
        props: {},
      }
    }

    const jeunes = await fetchJson(
      `${process.env.API_ENDPOINT}/conseillers/${user.id}/jeunes`
    )

    return {
      props: {
        conseillerJeunes: jeunes || [],
      },
    }
  }
)

export default MesJeunes
