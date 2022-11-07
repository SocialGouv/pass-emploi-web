import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { useState } from 'react'

import ConfirmationUpdateRdvModal from 'components/ConfirmationUpdateRdvModal'
import LeavePageConfirmationModal from 'components/LeavePageConfirmationModal'
import DeleteRdvModal from 'components/rdv/DeleteRdvModal'
import { EditionRdvForm } from 'components/rdv/EditionRdvForm'
import RenseignementAgenceModal from 'components/RenseignementAgenceModal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { StructureConseiller } from 'interfaces/conseiller'
import { BaseJeune, compareJeunesByNom } from 'interfaces/jeune'
import { RdvFormData } from 'interfaces/json/rdv'
import { PageProps } from 'interfaces/pageProps'
import { Rdv, TypeRendezVous } from 'interfaces/rdv'
import { Agence } from 'interfaces/referentiel'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { ConseillerService } from 'services/conseiller.service'
import { JeunesService } from 'services/jeunes.service'
import { ReferentielService } from 'services/referentiel.service'
import { RendezVousService } from 'services/rendez-vous.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { useLeavePageModal } from 'utils/hooks/useLeavePageModal'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { deleteQueryParams, parseUrl, setQueryParams } from 'utils/urlParser'

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
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const rendezVousService =
    useDependance<RendezVousService>('rendezVousService')
  const [conseiller, setConseiller] = useConseiller()
  const referentielService =
    useDependance<ReferentielService>('referentielService')
  const conseillerService =
    useDependance<ConseillerService>('conseillerService')

  const [showAgenceModal, setShowAgenceModal] = useState<boolean>(false)
  const [agences, setAgences] = useState<Agence[]>([])

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

  async function openAgenceModal() {
    if (!agences.length) {
      setAgences(
        await referentielService.getAgencesClientSide(conseiller!.structure)
      )
    }
    setShowAgenceModal(true)
    setTrackingTitle(initialTracking + ' - Pop-in sélection agence')
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
      await rendezVousService.postNewRendezVous(payload)
    } else {
      await rendezVousService.updateRendezVous(rdv.id, payload)
    }

    const { pathname, query } = getCleanUrlObject(returnTo)
    const queryParam = rdv ? QueryParam.modificationRdv : QueryParam.creationRdv
    await router.push({
      pathname,
      query: setQueryParams(query, { [queryParam]: QueryValue.succes }),
    })
  }

  async function deleteRendezVous(): Promise<void> {
    setShowDeleteRdvError(false)
    setShowDeleteRdvModal(false)
    try {
      await rendezVousService.deleteRendezVous(rdv!.id)
      const { pathname, query } = getCleanUrlObject(returnTo)
      await router.push({
        pathname,
        query: setQueryParams(query, {
          [QueryParam.suppressionRdv]: QueryValue.succes,
        }),
      })
    } catch (e) {
      setShowDeleteRdvError(true)
    }
  }

  async function renseignerAgence(agence: {
    id?: string
    nom: string
  }): Promise<void> {
    await conseillerService.modifierAgence(agence)
    setConseiller({ ...conseiller!, agence })
    setTrackingTitle(initialTracking + ' - Succès ajout agence')
    setShowAgenceModal(false)
  }

  useLeavePageModal(hasChanges && confirmBeforeLeaving, openLeavePageModal)

  useMatomo(trackingTitle)

  function recupererJeunesDeLEtablissement() {
    if (conseiller?.agence?.id) {
      return jeunesService.getJeunesDeLEtablissement(conseiller.agence.id)
    }
    return Promise.resolve([])
  }

  return (
    <>
      {showDeleteRdvError && (
        <FailureAlert
          label="Votre rendez-vous n'a pas été supprimé, veuillez essayer ultérieurement"
          onAcknowledge={() => setShowDeleteRdvError(false)}
        />
      )}

      {rdv && (
        <Button
          style={ButtonStyle.SECONDARY}
          onClick={handleDelete}
          label={`Supprimer le rendez-vous du ${rdv.date}`}
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
        jeunesConseiller={jeunes}
        recupererJeunesDeLEtablissement={recupererJeunesDeLEtablissement}
        typesRendezVous={typesRendezVous}
        idJeune={idJeune}
        rdv={rdv}
        redirectTo={returnTo}
        aDesJeunesDUnAutrePortefeuille={aDesJeunesDUnAutrePortefeuille()}
        conseillerIsCreator={!rdv || conseiller?.id === rdv.createur?.id}
        conseiller={conseiller}
        onChanges={setHasChanges}
        soumettreRendezVous={soumettreRendezVous}
        leaveWithChanges={openLeavePageModal}
        showConfirmationModal={showConfirmationModal}
        renseignerAgence={openAgenceModal}
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

      {showAgenceModal && agences.length && (
        <RenseignementAgenceModal
          structureConseiller={conseiller!.structure}
          referentielAgences={agences}
          onAgenceChoisie={renseignerAgence}
          onContacterSupport={() => {}}
          onClose={() => {}}
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

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI)
    return {
      redirect: { destination: '/mes-jeunes', permanent: false },
    }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const rendezVousService =
    withDependance<RendezVousService>('rendezVousService')
  const jeunes = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

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
    pageTitle: 'Mes rendez-vous - Créer',
    pageHeader: 'Créer un nouveau rendez-vous',
  }

  const idRdv = context.query.idRdv as string | undefined
  const idJeune = context.query.idJeune as string | undefined
  if (idRdv) {
    const rdv = await rendezVousService.getDetailsRendezVous(idRdv, accessToken)
    if (!rdv) return { notFound: true }
    props.rdv = rdv
    props.idJeune = rdv.jeunes[0].id
    props.pageTitle = 'Mes rendez-vous - Modifier'
    props.pageHeader = 'Modifier le rendez-vous'
  } else if (idJeune) {
    props.idJeune = idJeune
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
      QueryParam.modificationRdv,
      QueryParam.creationRdv,
      QueryParam.suppressionRdv,
    ]),
  }
}
