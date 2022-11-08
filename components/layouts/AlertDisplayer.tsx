import { ParsedUrlQuery } from 'querystring'

import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import AlertLink from 'components/ui/Notifications/AlertLink'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import { StructureConseiller } from 'interfaces/conseiller'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { deleteQueryParams, parseUrl } from 'utils/urlParser'

interface AlertDisplayerProps {
  hideOnLargeScreen?: boolean
}

export default function AlertDisplayer({
  hideOnLargeScreen = false,
}: AlertDisplayerProps) {
  const router = useRouter()
  const [conseiller] = useConseiller()
  const [alerts, setAlerts] = useState<DictAlerts>(ALERTS)

  async function closeSuccessAlert(queryParam: QueryParam): Promise<void> {
    const { pathname, query } = parseUrl(router.asPath)
    await router.push(
      {
        pathname,
        query: deleteQueryParams(query, [queryParam]),
      },
      undefined,
      { shallow: true }
    )
  }

  function getChild(
    queryParams: ParsedUrlQuery,
    { sub }: { sub?: string }
  ): JSX.Element {
    const estUneCreationDeBeneficiaire =
      queryParams[QueryParam.creationBeneficiaire] === QueryValue.succes &&
      queryParams['idBeneficiaire']
    return (
      <>
        {sub}
        {estUneCreationDeBeneficiaire && (
          <AlertLink
            href={`/mes-jeunes/${queryParams['idBeneficiaire']}`}
            label='voir le détail du bénéficiaire'
            onClick={() => closeSuccessAlert(QueryParam.creationBeneficiaire)}
          />
        )}
      </>
    )
  }

  useEffect(() => {
    if (conseiller) {
      setAlerts(getAlertsForStructure(conseiller.structure))
    }
  }, [conseiller])

  return (
    <div className={hideOnLargeScreen ? 'layout_s:hidden' : ''}>
      {Object.keys(alerts).map((key) => {
        const queryParam = key as QueryParam
        return (
          router.query[queryParam] === QueryValue.succes && (
            <SuccessAlert
              key={`alerte-${queryParam}`}
              label={alerts[queryParam].title}
              onAcknowledge={() => closeSuccessAlert(queryParam)}
            >
              {getChild(router.query, alerts[queryParam])}
            </SuccessAlert>
          )
        )
      })}
    </div>
  )
}
type DictAlerts = { [key in QueryParam]: { title: string; sub?: string } }
const ALERTS: DictAlerts = {
  creationRdv: { title: 'Le rendez-vous a bien été créé' },
  modificationRdv: { title: 'Le rendez-vous a bien été modifié' },
  suppressionRdv: { title: 'Le rendez-vous a bien été supprimé' },
  recuperation: { title: 'Vous avez récupéré vos bénéficiaires avec succès' },
  suppression: { title: 'Le compte du bénéficiaire a bien été supprimé' },
  creationBeneficiaire: {
    title: 'Le bénéficiaire a été ajouté à votre portefeuille',
  },
  creationAction: { title: 'L’action a bien été créée' },
  suppressionAction: { title: 'L’action a bien été supprimée' },
  choixAgence: { title: 'Votre agence a été ajoutée à votre profil' },
  envoiMessage: {
    title:
      'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires',
  },
  modificationIdentifiantPartenaire: {
    title: 'L’identifiant Pôle emploi a bien été mis à jour',
  },
  ajoutCommentaireAction: {
    title: 'Votre jeune a été alerté que vous avez écrit un commentaire',
  },
  qualificationSNP: {
    title:
      'L’action a été traitée et qualifiée en Situation Non Professionnelle',
    sub: 'Les informations ont été envoyées à i-milo',
  },
  qualificationNonSNP: { title: 'L’action a été qualifiée' },
  partageOffre: { title: 'L’offre a bien été partagée' },
  suggestionRecherche: {
    title: 'La recherche et ses critères ont bien été partagés',
  },
}

const ALERTS_MILO: DictAlerts = {
  ...ALERTS,
  choixAgence: { title: 'Votre Mission locale a été ajoutée à votre profil' },
}

function getAlertsForStructure(structure?: string): DictAlerts {
  switch (structure as StructureConseiller) {
    case StructureConseiller.MILO:
      return ALERTS_MILO
    case StructureConseiller.POLE_EMPLOI:
    case StructureConseiller.PASS_EMPLOI:
    default:
      return ALERTS
  }
}
