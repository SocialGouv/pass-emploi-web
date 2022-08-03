import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import SuccessAlert from 'components/ui/SuccessAlert'
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
  const [alerts, setAlerts] = useState<Alert[]>(ALERTS)

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

  useEffect(() => {
    if (conseiller) {
      setAlerts(getAlertsForStructure(conseiller.structure))
    }
  }, [conseiller])

  return (
    <div className={hideOnLargeScreen ? 'layout_s:hidden' : ''}>
      {alerts.map(
        (alert) =>
          router.query[alert.nom] === QueryValue.succes && (
            <SuccessAlert
              key={`alerte-${alert.nom}`}
              label={alert.message}
              onAcknowledge={() => closeSuccessAlert(alert.nom)}
            />
          )
      )}
    </div>
  )
}

export interface Alert {
  nom: QueryParam
  message: string
}

const ALERTS: Alert[] = [
  { nom: QueryParam.creationRdv, message: 'Le rendez-vous a bien été créé' },
  {
    nom: QueryParam.modificationRdv,
    message: 'Le rendez-vous a bien été modifié',
  },
  {
    nom: QueryParam.suppressionRdv,
    message: 'Le rendez-vous a bien été supprimé',
  },
  {
    nom: QueryParam.recuperationBeneficiaires,
    message: 'Vous avez récupéré vos bénéficiaires avec succès',
  },
  {
    nom: QueryParam.suppressionBeneficiaire,
    message: 'Le compte du bénéficiaire a bien été supprimé',
  },
  { nom: QueryParam.creationAction, message: 'L’action a bien été créée' },
  {
    nom: QueryParam.envoiMessage,
    message:
      'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires',
  },
]

const ALERTS_MILO: Alert[] = [
  ...ALERTS,
  {
    nom: QueryParam.choixAgence,
    message: 'Votre Mission locale a été ajoutée à votre profil',
  },
]

const ALERTS_POLE_EMPLOI: Alert[] = [
  ...ALERTS,
  {
    nom: QueryParam.choixAgence,
    message: 'Votre agence a été ajoutée à votre profil',
  },
]

function getAlertsForStructure(structure?: string): Alert[] {
  switch (structure as StructureConseiller) {
    case StructureConseiller.MILO:
      return ALERTS_MILO
    case StructureConseiller.POLE_EMPLOI:
      return ALERTS_POLE_EMPLOI
    case StructureConseiller.PASS_EMPLOI:
    default:
      return ALERTS
  }
}
