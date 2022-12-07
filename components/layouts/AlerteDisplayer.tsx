import React, { useEffect, useState } from 'react'

import AlertLink from 'components/ui/Notifications/AlertLink'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import { StructureConseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { useConseiller } from 'utils/conseiller/conseillerContext'

interface AlerteDisplayerProps {
  hideOnLargeScreen?: boolean
}

export default function AlerteDisplayer({
  hideOnLargeScreen = false,
}: AlerteDisplayerProps) {
  const [conseiller] = useConseiller()
  const [alertes, setAlertes] = useState<DictAlertes>(ALERTES)

  const [alerte, setAlerte] = useAlerte()
  const [alerteAAfficher, setAlerteAAfficher] = useState<
    AlerteAffichee | undefined
  >()

  async function closeAlerte(): Promise<void> {
    setAlerte(undefined)
  }

  useEffect(() => {
    if (conseiller?.structure) {
      setAlertes(getAlertesForStructure(conseiller.structure))
    }
  }, [conseiller?.structure])

  useEffect(() => {
    setAlerteAAfficher(alerte && alertes[alerte.key])
  }, [alerte, alertes, setAlerte])

  return (
    <div className={hideOnLargeScreen ? 'layout_s:hidden' : ''}>
      {alerte && alerteAAfficher && (
        <SuccessAlert label={alerteAAfficher.title} onAcknowledge={closeAlerte}>
          <>
            {alerteAAfficher.sub}

            {alerteAAfficher.link && (
              <AlertLink
                href={alerteAAfficher.link.buildHref(alerte.target)}
                label={alerteAAfficher.link.label}
                onClick={closeAlerte}
              />
            )}
          </>
        </SuccessAlert>
      )}
    </div>
  )
}

type AlerteAffichee = {
  title: string
  sub?: string
  link?: {
    label: string
    buildHref: (target?: string) => string
  }
}

type DictAlertes = { [key in AlerteParam]: AlerteAffichee }
const ALERTES: DictAlertes = {
  creationEvenement: {
    title: 'L’événement a bien été créé',
    sub: 'Vous pouvez modifier l’événement dans la page de détail',
    link: {
      label: 'Voir le détail de l’événement',
      buildHref: (target?: string) => '/mes-jeunes/edition-rdv?idRdv=' + target,
    },
  },
  modificationEvenement: { title: 'L’événement a bien été modifié' },
  suppressionEvenement: { title: 'L’événement a bien été supprimé' },
  recuperationBeneficiaires: {
    title: 'Vous avez récupéré vos bénéficiaires avec succès',
  },
  suppressionBeneficiaire: {
    title: 'Le compte du bénéficiaire a bien été supprimé',
  },
  creationBeneficiaire: {
    title: 'Le bénéficiaire a été ajouté à votre portefeuille',
    link: {
      label: 'Voir le détail du bénéficiaire',
      buildHref: (target?: string) => '/mes-jeunes/' + target,
    },
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
  clotureAC: { title: 'Cet événement a bien été clos' },
  creationListeDiffusion: { title: 'La liste de diffusion a bien été créée' },
}

const ALERTES_MILO: DictAlertes = {
  ...ALERTES,
  choixAgence: { title: 'Votre Mission locale a été ajoutée à votre profil' },
}

function getAlertesForStructure(structure?: string): DictAlertes {
  switch (structure as StructureConseiller) {
    case StructureConseiller.MILO:
      return ALERTES_MILO
    case StructureConseiller.POLE_EMPLOI:
    case StructureConseiller.PASS_EMPLOI:
    default:
      return ALERTES
  }
}
