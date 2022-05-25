import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState, MouseEvent } from 'react'

import DeleteIcon from '../../assets/icons/delete.svg'
import DeleteRdvModal from '../../components/rdv/DeleteRdvModal'
import Button, { ButtonStyle } from '../../components/ui/Button'

import ConfirmationUpdateRdvModal from 'components/ConfirmationUpdateRdvModal'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import { compareJeunesByLastName, Jeune } from 'interfaces/jeune'
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
import { useLeavePageModal } from 'utils/useLeavePageModal'

interface EditionRdvProps extends PageProps {
  jeunes: Jeune[]
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
  const [selectedRdv, setSelectedRdv] = useState<Rdv | undefined>(undefined)
  const [confirmBeforeLeaving, setConfirmBeforeLeaving] =
    useState<boolean>(true)
  const [payloadForConfirmationModal, setPayloadForConfirmationModal] =
    useState<RdvFormData | undefined>(undefined)
  const [hasChanges, setHasChanges] = useState<boolean>(false)

  let initialTracking: string
  if (rdv) initialTracking = `Modification rdv`
  else initialTracking = `Création rdv${idJeune ? ' jeune' : ''}`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  const handleDelete = (e: MouseEvent<HTMLElement>, rdv: Rdv) => {
    e.preventDefault()
    e.stopPropagation()
    openDeleteRdvModal(rdv)
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

  function openDeleteRdvModal(rdv: Rdv) {
    setSelectedRdv(rdv)
    setTrackingTitle(initialTracking + ' - Modale suppression rdv')
  }

  function closeDeleteRdvModal() {
    setSelectedRdv(undefined)
    setTrackingTitle(initialTracking)
  }

  async function onDeleteRdvSuccess() {
    const [redirectPath] = returnTo.split('?')
    await router.push(`${redirectPath}?suppressionRdv=succes`)
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

    const [redirectPath] = returnTo.split('?')
    const queryParam = rdv ? 'modificationRdv' : 'creationRdv'
    await router.push(`${redirectPath}?${queryParam}=succes`)
  }

  useLeavePageModal(hasChanges && confirmBeforeLeaving, openLeavePageModal)

  useMatomo(trackingTitle)

  return (
    <>
      {rdv && (
        <div className='flex justify-end'>
          <Button
            style={ButtonStyle.SECONDARY}
            onClick={(e) => handleDelete(e, rdv)}
            aria-label={`Supprimer le rendez-vous du ${rdv.date}`}
          >
            <DeleteIcon aria-hidden='true' focusable='false' className='mr-2' />
            Supprimer
          </Button>
        </div>
      )}

      <EditionRdvForm
        jeunes={jeunes}
        typesRendezVous={typesRendezVous}
        idJeune={idJeune}
        rdv={rdv}
        redirectTo={returnTo}
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
          source={rdv ? 'edition' : 'creation'}
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
      {selectedRdv && (
        <DeleteRdvModal
          onClose={closeDeleteRdvModal}
          performDelete={() =>
            rendezVousService.deleteRendezVous(
              selectedRdv.id,
              session!.accessToken
            )
          }
          onDeleteSuccess={onDeleteRdvSuccess}
          rdv={selectedRdv}
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
    jeunes: [...jeunes].sort(compareJeunesByLastName),
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
