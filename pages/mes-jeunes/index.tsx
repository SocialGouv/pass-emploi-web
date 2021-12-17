import { AppHead } from 'components/AppHead'
import Button from 'components/Button'
import AddJeuneModal from 'components/jeune/AddJeuneModal'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Router from 'next/router'
import React, { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddIcon from '../../assets/icons/add_person.svg'
import ChevronRight from '../../assets/icons/chevron_right.svg'

type MesJeunesProps = {
  conseillerJeunes: Jeune[]
}

function MesJeunes({ conseillerJeunes }: MesJeunesProps) {
  const [showModal, setShowModal] = useState(false)

  const handleCloseModal = () => {
    setShowModal(false)
    Router.reload()
  }

  const handleAddJeune = () => {
    Router.push('/mes-jeunes/milo/creation-jeune')

    /**
     * À décommenter lors de l'activation de la modale de création jeune pour Pôle emploi
     */
    //setShowModal(true)
  }

  useMatomo(showModal ? 'Mes jeunes - Modale création jeune' : 'Mes jeunes')

  return (
    <>
      <AppHead titre='Mes jeunes' />
      <span className='flex flex-wrap justify-between mb-12'>
        <h1 className='h2-semi text-bleu_nuit'>Mes Jeunes</h1>
        <Button onClick={handleAddJeune}>
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

      {showModal && (
        <AddJeuneModal onClose={handleCloseModal} show={showModal} />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<MesJeunesProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { jeunesService } = Container.getDIContainer().dependances
  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)

  return {
    props: {
      conseillerJeunes: jeunes || [],
    },
  }
}

export default MesJeunes
