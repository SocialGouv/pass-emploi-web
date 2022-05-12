import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'

import ConfirmationUpdateRdvModal from 'components/ConfirmationUpdateRdvModal'
import ExitPageConfirmationModal from 'components/ExitPageConfirmationModal'
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

interface EditionRdvProps extends PageProps {
  jeunes: Jeune[]
  typesRendezVous: TypeRendezVous[]
  idJeune?: string
  rdv?: Rdv
  returnTo: string
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
  const [payloadForConfirmationModal, setPayloadForConfirmationModal] =
    useState<RdvFormData | undefined>(undefined)
  // FIXME const [hasChanges, setHasChanges] = useState<boolean>(false)

  let initialTracking: string
  if (rdv) initialTracking = `Modification rdv`
  else initialTracking = `Création rdv${idJeune ? ' jeune' : ''}`
  const [trackingTitle, setTrackingTitle] = useState<string>(initialTracking)

  function openLeavePageModal() {
    setShowLeavePageModal(true)
    setTrackingTitle(`${initialTracking} - Modale Annulation`)
  }

  function closeLeavePageModal() {
    setShowLeavePageModal(false)
    setTrackingTitle(initialTracking)
  }

  function showConfirmationModale(payload: RdvFormData) {
    setPayloadForConfirmationModal(payload)
    setTrackingTitle(`${initialTracking} - Modale confirmation modification`)
  }

  function closeConfirmationModale() {
    setPayloadForConfirmationModal(undefined)
    setTrackingTitle(initialTracking)
  }

  async function soumettreRendezVous(payload: RdvFormData): Promise<void> {
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

  useMatomo(trackingTitle)

  return (
    <>
      {/*FIXME back bouton triggers modale when hasChanges*/}
      <EditionRdvForm
        jeunes={jeunes}
        typesRendezVous={typesRendezVous}
        idJeune={idJeune}
        rdv={rdv}
        redirectTo={returnTo}
        conseillerIsCreator={!rdv || session?.user.id === rdv.createur?.id}
        conseillerEmail={session?.user.email ?? ''}
        onChanges={(_) => {
          /*setHasChanges*/
        }}
        soumettreRendezVous={soumettreRendezVous}
        leaveWithChanges={openLeavePageModal}
        showConfirmationModal={showConfirmationModale}
      />

      {showLeavePageModal && (
        <ExitPageConfirmationModal
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
          onCancel={closeConfirmationModale}
          onConfirmation={() =>
            soumettreRendezVous(payloadForConfirmationModal)
          }
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
