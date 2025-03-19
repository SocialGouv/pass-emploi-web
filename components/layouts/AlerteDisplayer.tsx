import React, { useEffect, useState } from 'react'

import { ID_CONTENU } from 'components/globals'
import AlertLink from 'components/ui/Notifications/AlertLink'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import { Structure } from 'interfaces/structure'
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
  const alertes = getAlertesForStructure(conseiller.structure)

  const [alerte, setAlerte] = useAlerte()
  const [alerteAAfficher, setAlerteAAfficher] = useState<
    AlerteAffichee | undefined
  >()

  async function closeAlerte() {
    setAlerte(undefined)
    document.getElementById(ID_CONTENU)!.focus()
  }

  useEffect(() => {
    setAlerteAAfficher(alerte && alertes[alerte.key])
  }, [alerte, alertes, setAlerte])

  return (
    <div className={hideOnLargeScreen ? 'layout-s:hidden' : ''}>
      {alerte && alerteAAfficher && (
        <SuccessAlert label={alerteAAfficher.title} onAcknowledge={closeAlerte}>
          <>
            <p className='whitespace-pre-line'>{alerteAAfficher.sub}</p>

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
  creationRDV: {
    title: 'Le rendez-vous a bien été créé',
    sub: 'Vous pouvez modifier le rendez-vous dans la page de détail',
    link: {
      label: 'Voir le détail du rendez-vous',
      buildHref: (target?: string) => '/mes-jeunes/edition-rdv?idRdv=' + target,
    },
  },
  creationAnimationCollective: {
    title: 'L’animation collective a bien été créée',
    sub: 'Vous pouvez modifier l’animation collective dans la page de détail',
    link: {
      label: 'Voir le détail de l’animation collective',
      buildHref: (target?: string) => '/mes-jeunes/edition-rdv?idRdv=' + target,
    },
  },
  modificationRDV: { title: 'Le rendez-vous a bien été modifié' },
  modificationAnimationCollective: {
    title: 'L’animation collective a bien été modifiée',
  },
  suppressionRDV: { title: 'Le rendez-vous a bien été supprimé' },
  suppressionAnimationCollective: {
    title: 'L’animation collective a bien été supprimée',
  },
  recuperationBeneficiaires: {
    title: 'Vous avez récupéré vos bénéficiaires avec succès',
  },
  creationBeneficiaire: {
    title: 'Le bénéficiaire a été ajouté à votre portefeuille',
    link: {
      label: 'Voir le détail du bénéficiaire',
      buildHref: (target?: string) => '/mes-jeunes/' + target,
    },
  },
  choixAgence: { title: 'Votre agence a été ajoutée à votre profil' },
  envoiMessage: {
    title:
      'Votre message multi-destinataires a été envoyé en tant que message individuel à chacun des bénéficiaires',
  },
  modificationIdentifiantPartenaire: {
    title: 'L’identifiant France Travail a bien été mis à jour',
  },
  multiQualificationSNP: {
    title: 'Actions qualifiées en SNP !',
    sub:
      'Vous pouvez encore modifier ces actions, uniquement dans i-milo.\n' +
      'Délai d’actualisation entre l’app CEJ et i-milo : environ 24h.',
  },
  multiQualificationNonSNP: {
    title: 'Actions enregistrées en non-SNP',
    sub: 'C’est enregistré ! Vous pouvez poursuivre votre travail.',
  },
  partageOffre: { title: 'L’offre a bien été partagée' },
  suggestionRecherche: {
    title: 'La recherche et ses critères ont bien été partagés',
  },
  clotureAC: { title: 'Cet événement a bien été clos' },
  clotureSession: { title: 'Cet événement a bien été clos' },
  creationListeDiffusion: { title: 'La liste de diffusion a bien été créée' },
  modificationListeDiffusion: {
    title: 'La liste de diffusion a bien été modifiée',
  },
  suppressionListeDiffusion: {
    title: 'La liste de diffusion a bien été supprimée',
  },
  modificationAtelier: {
    title: 'L’atelier a bien été mis à jour',
  },
  modificationInformationCollective: {
    title: 'L’information collective a bien été mise à jour',
  },
  reaffectation: { title: 'Les bénéficiaires ont été réaffectés avec succès' },
}

const ALERTES_MILO: DictAlertes = {
  ...ALERTES,
  choixAgence: { title: 'Votre Mission Locale a été ajoutée à votre profil' },
}

function getAlertesForStructure(structure: Structure): DictAlertes {
  switch (structure) {
    case 'MILO':
      return ALERTES_MILO
    case 'POLE_EMPLOI':
    case 'POLE_EMPLOI_BRSA':
    case 'POLE_EMPLOI_AIJ':
    case 'CONSEIL_DEPT':
    case 'AVENIR_PRO':
    case 'FT_ACCOMPAGNEMENT_INTENSIF':
    case 'FT_ACCOMPAGNEMENT_GLOBAL':
    case 'FT_EQUIP_EMPLOI_RECRUT':
      return ALERTES
  }
}
