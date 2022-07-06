import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import ConfirmationUpdateRdvModal from 'components/ConfirmationUpdateRdvModal'
import FailureMessage from 'components/FailureMessage'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import Button, { ButtonStyle } from 'components/ui/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { BaseJeune, compareJeunesByNom } from 'interfaces/jeune'
import { RdvFormData } from 'interfaces/json/rdv'
import { PageProps } from 'interfaces/pageProps'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import { JeunesService } from 'services/jeunes.service'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import useSession from 'utils/auth/useSession'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { deleteQueryParams, parseUrl, setQueryParams } from 'utils/urlParser'
import { useLeavePageModal } from 'utils/useLeavePageModal'

interface EditionRdvProps extends PageProps {
  jeunes: BaseJeune[]
  typesRendezVous: TypeRendezVous[]
  returnTo: string
  idJeune?: string
  rdv?: Rdv
}

function EditionRdv({
  jeunes,
  typesRendezVous,
  idJeune,
  returnTo,
  rdv,
}: EditionRdvProps) {
  const router = useRouter()
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')
  const { data: session } = useSession<true>({ required: true })

  const [showLeavePageModal, setShowLeavePageModal] = useState<boolean>(false)
  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)
  const [payloadForConfirmationModal, setPayloadForConfirmationModal] =
    useState<RdvFormData | undefined>(undefined)

  const [showDeleteRdvModal, setShowDeleteRdvModal] = useState<boolean>(false)
  const [showDeleteRdvError, setShowDeleteRdvError] = useState<boolean>(false)
  const [hasChanges, setHasChanges] = useState<boolean>(false)

  let initialTracking: string
  if (rdv) initialTracking = `Modification rdv`
  else initialTracking = `Création rdv${idJeune ? ' jeune' : ''}`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function handleDelete(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault()
    e.stopPropagation()
    openDeleteRdvModal()
  }

  function openLeavePageModal() {
    setShowLeavePageModal(true)
    setConfirmBeforeLeaving(false)
    setTrackingTitle(`${initialTracking} - Modale Annulation`)
  }

  function closeLeavePageModal() {
    setShowLeavePageModal(false)
    setConfirmBeforeLeaving(true)
    setTrackingTitle(initialTracking)
  }

  function showConfirmationModal(payload: RdvFormData) {
    setPayloadForConfirmationModal(payload)
    setTrackingTitle(`${initialTracking} - Modale confirmation modification`)
  }

  function closeConfirmationModal() {
    setPayloadForConfirmationModal(undefined)
    setTrackingTitle(initialTracking)
  }

  function openDeleteRdvModal() {
    setShowDeleteRdvModal(true)
    setTrackingTitle(initialTracking + ' - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setShowDeleteRdvModal(false)
    setTrackingTitle(initialTracking)
  }

  function aDesJeunesDUnAutrePortefeuille(): boolean {
    if (rdv) {
      return rdv.jeunes.some(
        ({ id }) => !jeunes.some((jeune) => jeune.id === id)
      )
    }
    return false
  }

  async function soumettreRendezVous(payload: RdvFormData): Promise<void> {
    setConfirmBeforeLeaving(false)
    if (!rdv) {
      await rendezVousService.postNewRendezVous(
        session!.user.id,
        payload,
        session!.accessToken
      )
    } else {
      await rendezVousService.updateRendezVous(
        rdv.id,
        payload,
        session!.accessToken
      )
    }

    const { pathname, query } = getCleanUrlObject(returnTo)
    const queryParam = rdv ? 'modificationRdv' : 'creationRdv'
    await router.push({
      pathname,
      query: setQueryParams(query, { [queryParam]: 'succes' }),
    })
  }

  async function deleteRendezVous(): Promise<void> {
    setShowDeleteRdvError(false)
    setShowDeleteRdvModal(false)
    try {
      await rendezVousService.deleteRendezVous(rdv!.id, session!.accessToken)
      const { pathname, query } = getCleanUrlObject(returnTo)
      await router.push({
        pathname,
        query: setQueryParams(query, { suppressionRdv: 'succes' }),
      })
    } catch (e) {
      setShowDeleteRdvError(true)
    }
  }

  useLeavePageModal(hasChanges && confirmBeforeLeaving, openLeavePageModal)

  useMatomo(trackingTitle)

  return (
    <>
      {showDeleteRdvError && (
        <FailureMessage
          label="Votre rendez-vous n'a pas été supprimé, veuillez essayer ultérieurement"
          onAcknowledge={() => setShowDeleteRdvError(false)}
        />
      )}

      {rdv && (
        <Button
          style={ButtonStyle.SECONDARY}
          onClick={handleDelete}
          aria-label={`Supprimer le rendez-vous du ${rdv.date}`}
          className='mb-4'
        >
          <IconComponent
            name={IconName.Delete}
            aria-hidden='true'
            focusable='false'
            className='mr-2 w-4 h-4'
          />
          Supprimer
        </Button>
      )}

      <EditionRdvForm
        jeunes={jeunes}
        typesRendezVous={typesRendezVous}
        idJeune={idJeune}
        rdv={rdv}
        redirectTo={returnTo}
        aDesJeunesDUnAutrePortefeuille={aDesJeunesDUnAutrePortefeuille()}
        conseillerIsCreator={!rdv || session?.user.id === rdv.createur?.id}
        conseillerEmail={session?.user.email ?? ''}
        onChanges={setHasChanges}
        soumettreRendezVous={soumettreRendezVous}
        leaveWithChanges={openLeavePageModal}
        showConfirmationModal={showConfirmationModal}
      />

      {showLeavePageModal && (
        <LeavePageConfirmationModal
          message={`Vous allez quitter la ${
            rdv ? 'modification du' : 'création d’un nouveau'
          } rendez-vous`}
          commentaire={`Toutes les informations ${
            rdv ? 'modifiées' : 'saisies'
          } seront perdues`}
          onCancel={closeLeavePageModal}
          destination={returnTo}
        />
      )}
      {payloadForConfirmationModal && (
        <ConfirmationUpdateRdvModal
          onCancel={closeConfirmationModal}
          onConfirmation={() =>
            soumettreRendezVous(payloadForConfirmationModal)
          }
        />
      )}
      {showDeleteRdvModal && (
        <DeleteRdvModal
          aDesJeunesDUnAutrePortefeuille={aDesJeunesDUnAutrePortefeuille()}
          onClose={closeDeleteRdvModal}
          performDelete={deleteRendezVous}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<EditionRdvProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')
  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)
  const typesRendezVous = await rendezVousService.getTypesRendezVous(
    accessToken
  )

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !comingFromHome(referer) ? referer : '/mes-jeunes'
  const props: EditionRdvProps = {
    jeunes: [...jeunes].sort(compareJeunesByNom),
    typesRendezVous: typesRendezVous,
    withoutChat: true,
    returnTo: redirectTo,
    pageTitle: 'Nouveau rendez-vous',
  }

  const idRdv = context.query.idRdv as string | undefined
  if (idRdv) {
    const rdv = await rendezVousService.getDetailsRendezVous(idRdv, accessToken)
    if (!rdv) return { notFound: true }
    props.rdv = rdv
    props.idJeune = rdv.jeunes[0].id
    props.pageTitle = 'Modification rendez-vous'
    props.pageHeader = 'Modification rendez-vous'
  } else if (referer) {
    const regex = /mes-jeunes\/(?<idJeune>[\w-]+)/
    const match = regex.exec(referer)
    if (match?.groups?.idJeune) props.idJeune = match.groups.idJeune
  }

  return { props }
}

export default withTransaction(EditionRdv.name, 'page')(EditionRdv)

function comingFromHome(referer: string): boolean {
  return referer.split('?')[0].endsWith('/index')
}

function getCleanUrlObject(url: string): {
  pathname: string
  query: Record<string, string | string[]>
} {
  const { pathname, query } = parseUrl(url)
  return {
    pathname,
    query: deleteQueryParams(query, [
      'modificationRdv',
      'creationRdv',
      'suppressionRdv',
    ]),
  }
}
