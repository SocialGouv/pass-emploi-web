import AddActionModal from 'components/action/AddActionModal'
import { TableauActionsJeune } from 'components/action/TableauActionsJeune'
import { AppHead } from 'components/AppHead'
import SuccessMessage from 'components/SuccessMessage'
import Button from 'components/ui/Button'
import {
  ActionJeune,
  ActionStatus,
  compareActionsDatesDesc,
} from 'interfaces/action'
import { UserStructure } from 'interfaces/conseiller'
import { Jeune } from 'interfaces/jeune'
import { ActionJeuneJson } from 'interfaces/json/action'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import Router, { useRouter } from 'next/router'
import React, { useState } from 'react'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg'

type Props = {
  jeune: Jeune
  actionsEnCours: ActionJeune[]
  deleteSuccess: boolean
}

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
      <div className={`flex justify-between flex-wrap w-full ${styles.header}`}>
        <Link href={`/mes-jeunes/${jeune.id}`}>
          <a className='p-1 mr-[24px]'>
            <BackIcon
              role='img'
              focusable='false'
              aria-label='Retour sur la fiche du jeune'
            />
          </a>
        </Link>

        <div className='flex-auto'>
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

      <div className={styles.content}>
        {showModal && (
          <AddActionModal
            onClose={() => setShowModal(false)}
            onAdd={Router.reload}
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
          <p className='text-md text-bleu'>
            {jeune.firstName} n&rsquo;a pas d&rsquo;actions en cours pour le
            moment
          </p>
        )}
        {actionsEnCours.length != 0 && (
          <TableauActionsJeune jeune={jeune} actions={actionsEnCours} />
        )}
      </div>
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

  const userActions: ActionJeune[] = dataActionsJeune
    .map((userActionJson: ActionJeuneJson) => ({
      ...userActionJson,
      status: userActionJson.status || ActionStatus.NotStarted,
    }))
    .sort(compareActionsDatesDesc)

  return {
    props: {
      jeune: dataDetailsJeune,
      actionsEnCours: userActions,
      deleteSuccess: Boolean(context.query.deleteSuccess),
    },
  }
}

export default Actions
