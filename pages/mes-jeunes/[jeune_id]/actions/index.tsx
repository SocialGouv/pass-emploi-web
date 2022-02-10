import Action from 'components/action/Action'
import AddActionModal from 'components/action/AddActionModal'
import { AppHead } from 'components/AppHead'
import Button from 'components/ui/Button'
import SuccessMessage from 'components/SuccessMessage'
import { ActionJeune, ActionStatus } from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { ActionJeuneJson } from 'interfaces/json/action'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import React, { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'

/**
 * relative path since babel doesn't support alliases, see https://github.com/airbnb/babel-plugin-inline-react-svg/pull/17
 * TODO: workaround for path
 */
import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg'

type Props = {
  jeune: Jeune
  actionsEnCours: ActionJeune[]
  deleteSuccess: boolean
}

const sortLastUpdate = (action1: ActionJeune, action2: ActionJeune) =>
  new Date(action1.lastUpdate).getTime() >
  new Date(action2.lastUpdate).getTime()
    ? -1
    : 1

function Actions({ jeune, actionsEnCours, deleteSuccess }: Props) {
  const [showModal, setShowModal] = useState<boolean | undefined>(undefined)
  const [showSuccessMessage, setShowSuccessMessage] = useState(deleteSuccess)
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

  useMatomo(
    showSuccessMessage
      ? 'Actions jeune - Succès - Suppression Action'
      : 'Actions jeune'
  )

  useMatomo(showModal === false ? 'Actions jeune' : undefined)

  return (
    <>
      <AppHead
        titre={`Mes jeunes - Actions de ${jeune.firstName} ${jeune.lastName}`}
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

      {showModal && (
        <AddActionModal
          onClose={() => setShowModal(false)}
          onAdd={() => {
            // addToActionEnCours(newAction) uncomment when be sends id
            Router.reload()
          }} //reload, since we dont have the id after add
          show={showModal}
        />
      )}

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
          <li key={action.id} className='border-b-2 border-bleu_blanc'>
            <Action action={action} jeuneId={jeune.id} />
          </li>
        ))}
      </ul>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === UserStructure.POLE_EMPLOI) {
    return { notFound: true }
  }

  const { actionsService, jeunesService } =
    Container.getDIContainer().dependances
  const [dataDetailsJeune, dataActionsJeune] = await Promise.all([
    jeunesService.getJeuneDetails(
      context.query.jeune_id as string,
      accessToken
    ),
    actionsService.getActionsJeune(
      context.query.jeune_id as string,
      accessToken
    ),
  ])

  if (!dataDetailsJeune || !dataActionsJeune) {
    return {
      notFound: true,
    }
  }

  const userActions: ActionJeune[] = dataActionsJeune.map(
    (userActionJson: ActionJeuneJson) => ({
      ...userActionJson,
      status: userActionJson.status || ActionStatus.NotStarted,
    })
  )

  return {
    props: {
      jeune: dataDetailsJeune,
      actionsEnCours: userActions.sort(sortLastUpdate),
      deleteSuccess: Boolean(context.query.deleteSuccess),
    },
  }
}

export default Actions
