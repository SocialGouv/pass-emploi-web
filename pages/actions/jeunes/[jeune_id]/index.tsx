import React, { useState } from 'react'

import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'

import { Jeune } from 'interfaces'
import { ActionStatus, UserAction } from 'interfaces/action'

import AddActionModal from 'components/action/AddActionModal'
import ActionComp from 'components/action/Action'
import Button from 'components/Button'

import styles from 'styles/JeuneActions.module.css'

/**
 * relative path since babel doesn't support alliases, see https://github.com/airbnb/babel-plugin-inline-react-svg/pull/17
 * TODO: workaround for path
 */
import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg'
import { UserActionJson } from 'interfaces/json/action'

type Props = {
  jeune: Jeune
  actions_en_cours: UserAction[]
}

const sortLastUpdate = (action1: UserAction, action2: UserAction) =>
  new Date(action1.lastUpdate).getTime() >
  new Date(action2.lastUpdate).getTime()
    ? -1
    : 1

function Actions({ jeune, actions_en_cours }: Props) {
  const [showModal, setShowModal] = useState(false)
  const [actionsEnCours] = useState(actions_en_cours)
  const { query } = useRouter()
  const jeuneId = query.jeune_id || ''

  return (
    <>
      <div className={styles.backIntroContainer}>
        <Link href='/actions' passHref>
          <a className={`${styles.backLink} mr-[24px]`}>
            <BackIcon
              role='img'
              focusable='false'
              aria-label='Retour sur la liste de tous les jeunes'
            />
          </a>
        </Link>

        <div className={styles.titleIntroContainer}>
          <h1 className={`h2 text-bleu_nuit ${styles.title}`}>
            Les actions de {`${jeune.firstName} ${jeune.lastName}`}
          </h1>
          <p className='text-md text-bleu'>
            Retrouvez le détail des actions de votre bénéficiaire
          </p>
        </div>

        <Button onClick={() => setShowModal(true)}>
          <AddIcon
            focusable='false'
            aria-hidden='true'
            className={styles.addIcon}
          />
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

      {actionsEnCours.length === 0 && (
        <p className='text-md text-bleu mb-8'>
          {' '}
          {jeune.firstName} n&rsquo;a pas d&rsquo;actions en cours pour le
          moment
        </p>
      )}

      <ul>
        {actionsEnCours.map((action: UserAction) => (
          <li key={action.id} className={styles.listItem}>
            <ActionComp action={action} jeuneId={jeuneId} />
          </li>
        ))}
      </ul>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const [resDetailsJeune, resActionsJeune] = await Promise.all([
    fetch(`${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}`),
    fetch(`${process.env.API_ENDPOINT}/jeunes/${query.jeune_id}/actions`),
  ])

  const [dataDetailsJeune, dataActionsJeune] = await Promise.all([
    resDetailsJeune.json(),
    resActionsJeune.json(),
  ])

  if (!dataDetailsJeune || !dataActionsJeune) {
    return {
      notFound: true,
    }
  }

  let userActions: UserAction[] = []

  dataActionsJeune.map((userActionJson: UserActionJson) => {
    const newAction: UserAction = {
      ...userActionJson,
      status: userActionJson.status || ActionStatus.NotStarted,
    }
    userActions.push(newAction)
  })

  return {
    props: {
      jeune: dataDetailsJeune,
      actions_en_cours: userActions.sort(sortLastUpdate),
    },
  }
}

export default Actions
