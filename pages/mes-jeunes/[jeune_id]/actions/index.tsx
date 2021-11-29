import Action from 'components/action/Action'
import AddActionModal from 'components/action/AddActionModal'
import Button from 'components/Button'
import SuccessMessage from 'components/SuccessMessage'
import { Jeune } from 'interfaces'
import { ActionJeune, ActionStatus } from 'interfaces/action'
import { ActionJeuneJson } from 'interfaces/json/action'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import React, { useState } from 'react'
import fetchJson from 'utils/fetchJson'

/**
 * relative path since babel doesn't support alliases, see https://github.com/airbnb/babel-plugin-inline-react-svg/pull/17
 * TODO: workaround for path
 */
import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg'
import { AppHead } from 'components/AppHead'

type Props = {
  jeune: Jeune
  actions_en_cours: ActionJeune[]
  deleteSuccess: boolean
}

const sortLastUpdate = (action1: ActionJeune, action2: ActionJeune) =>
  new Date(action1.lastUpdate).getTime() >
  new Date(action2.lastUpdate).getTime()
    ? -1
    : 1

function Actions({ jeune, actions_en_cours, deleteSuccess }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(deleteSuccess)
  const [actionsEnCours] = useState(actions_en_cours)
  const router = useRouter()

  const closeSuccessMessage = () => {
    setShowSuccessMessage(false)
    router.replace(
      {
        pathname: `/mes-jeunes/${jeune.id}/actions`,
      },
      undefined,
      { shallow: true }
    )
  }

  return (
    <>
      <AppHead
        titre={`Espace conseiller Pass Emploi - Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName}`}
      />
      <div className='flex justify-between flex-wrap w-full mb-[45px]'>
        <Link href={`/mes-jeunes/${jeune.id}`} passHref>
          <a className='p-1 mr-[24px]'>
            <BackIcon
              role='img'
              focusable='false'
              aria-label='Retour sur la fiche du jeune'
            />
          </a>
        </Link>

        <div className='mb-4 flex-auto'>
          <h1 className='h2 text-bleu_nuit mb-5'>
            Les actions de {`${jeune.firstName} ${jeune.lastName}`}
          </h1>
          <p className='text-md text-bleu'>
            Retrouvez le détail des actions de votre bénéficiaire
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <AddIcon focusable='false' aria-hidden='true' className='mr-2' />
          Créer une nouvelle action
        </Button>
      </div>

      <AddActionModal
        onClose={() => setShowModal(false)}
        onAdd={() => {
          // addToActionEnCours(newAction) uncomment when be sends id
          Router.reload()
        }} //reload, since we dont have the id after add
        show={showModal}
      />

      {showSuccessMessage && (
        <SuccessMessage
          onAcknowledge={() => closeSuccessMessage()}
          label={"L'action a bien été supprimée"}
        />
      )}

      {actionsEnCours.length === 0 && (
        <p className='text-md text-bleu mb-8'>
          {jeune.firstName} n&rsquo;a pas d&rsquo;actions en cours pour le
          moment
        </p>
      )}

      <ul>
        {actionsEnCours.map((action: ActionJeune) => (
          <li key={action.id}>
            <Action action={action} jeuneId={jeune.id} />
          </li>
        ))}
      </ul>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const [dataDetailsJeune, dataActionsJeune] = await Promise.all([
    fetchJson(`${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}`),
    fetchJson(`${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}/actions`),
  ])

  if (!dataDetailsJeune || !dataActionsJeune) {
    return {
      notFound: true,
    }
  }

  let userActions: ActionJeune[] = []

  dataActionsJeune.map((userActionJson: ActionJeuneJson) => {
    const newAction: ActionJeune = {
      ...userActionJson,
      status: userActionJson.status || ActionStatus.NotStarted,
    }
    userActions.push(newAction)
  })

  return {
    props: {
      jeune: dataDetailsJeune,
      actions_en_cours: userActions.sort(sortLastUpdate),
      deleteSuccess: Boolean(query.deleteSuccess),
    },
  }
}

export default Actions
