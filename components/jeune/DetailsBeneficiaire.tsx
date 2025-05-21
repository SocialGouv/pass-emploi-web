import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useRef, useState } from 'react'

import BlocInformationBeneficiaire from 'components/jeune/BlocInformationBeneficiaire'
import ChangementDispositifBeneficiaireModal from 'components/jeune/ChangementDispositifBeneficiaireModal' // FIXME should use dynamic(() => import() but issue with jest
import HeaderDetailBeneficiaire from 'components/jeune/HeaderDetailBeneficiaire'
import IndicateursBeneficiaire from 'components/jeune/IndicateursBeneficiaire'
import UpdateIdentifiantPartenaireModal from 'components/jeune/UpdateIdentifiantPartenaireModal' // FIXME should use dynamic(() => import() but issue with jest
import { ModalHandles } from 'components/ModalContainer'
import {
  CompteurHeuresFicheBeneficiaire,
  ConseillerHistorique,
  Demarche,
  DetailBeneficiaire,
  estCEJ,
  IndicateursSemaine,
} from 'interfaces/beneficiaire'
import { estMilo, structureFTCej } from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'

const HistoriqueConseillersModal = dynamic(
  () => import('components/jeune/HistoriqueConseillersModal')
)

interface DetailsBeneficiaireProps {
  beneficiaire: DetailBeneficiaire
  historiqueConseillers: ConseillerHistorique[]
  withCreations: boolean
  demarches?: { data: Demarche[] } | null
  comptageHeures?: CompteurHeuresFicheBeneficiaire | null
  indicateursSemaine?: IndicateursSemaine
  onSupprimerBeneficiaire?: () => void
  className?: string
}

export default function DetailsBeneficiaire({
  beneficiaire,
  historiqueConseillers,
  withCreations,
  demarches,
  comptageHeures,
  indicateursSemaine,
  onSupprimerBeneficiaire,
  className,
}: DetailsBeneficiaireProps) {
  const { id, idPartenaire, dispositif, situationCourante } = beneficiaire
  const [conseiller] = useConseiller()
  const [_, setAlerte] = useAlerte()

  const [dispositifActuel, setDispositifActuel] = useState<string>(dispositif)
  const [identifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(idPartenaire)

  const modalDispositifRef = useRef<ModalHandles>(null)
  const [showChangementDispositif, setShowChangementDispositif] =
    useState<boolean>(false)
  const modalIdentifiantPartenaireRef = useRef<ModalHandles>(null)
  const [showIdentifiantPartenaireModal, setShowIdentifiantPartenaireModal] =
    useState<boolean>(false)
  const [showHistoriqueConseillers, setShowHistoriqueConseillers] =
    useState<boolean>(false)

  const aujourdHui = DateTime.now()
  const debutSemaine = aujourdHui.startOf('week')
  const finSemaine = aujourdHui.endOf('week')

  const doitAfficherComptageHeures = estCEJ(beneficiaire)

  async function updateIdentifiantPartenaire(
    nouvelleValeur: string
  ): Promise<void> {
    const { modifierIdentifiantPartenaire } = await import(
      'services/beneficiaires.service'
    )
    try {
      await modifierIdentifiantPartenaire(id, nouvelleValeur)
      setIdentifiantPartenaire(nouvelleValeur)
      setAlerte(AlerteParam.modificationIdentifiantPartenaire)
    } finally {
      modalIdentifiantPartenaireRef.current!.closeModal()
    }
  }

  async function changerDispositif(nouveauDispositif: string): Promise<void> {
    const { modifierDispositif } = await import(
      'services/beneficiaires.service'
    )
    try {
      await modifierDispositif(id, nouveauDispositif)
      setDispositifActuel(nouveauDispositif)
    } finally {
      modalDispositifRef.current!.closeModal()
    }
  }

  function trackEventOnCopieIdentifiantPartenaire() {
    trackEvent({
      structure: structureFTCej,
      categorie: 'fiche jeune',
      action: 'copie identifiant pe',
      nom: '',
      aDesBeneficiaires: true,
    })
  }

  return (
    <>
      <div className={'rounded-large ' + (className ?? '')}>
        <HeaderDetailBeneficiaire
          beneficiaire={{
            id: beneficiaire.id,
            nomComplet: `${beneficiaire.prenom} ${beneficiaire.nom}`,
          }}
          dispositif={dispositifActuel}
          situation={situationCourante}
          withCreations={withCreations}
          onSupprimerBeneficiaire={onSupprimerBeneficiaire}
        />

        <div className='rounded-b-[inherit] border border-t-0 border-grey-500 py-4 flex flex-wrap gap-4'>
          <IndicateursBeneficiaire
            debutDeLaSemaine={debutSemaine}
            finDeLaSemaine={finSemaine}
            comptageHeures={comptageHeures}
            indicateursSemaine={indicateursSemaine}
            demarches={demarches?.data}
            doitAfficherComptageHeures={doitAfficherComptageHeures}
          />
          <BlocInformationBeneficiaire
            beneficiaire={beneficiaire}
            identifiantPartenaire={{
              value: identifiantPartenaire,
              onClick: () => setShowIdentifiantPartenaireModal(true),
              onCopy: trackEventOnCopieIdentifiantPartenaire,
            }}
            onHistoriqueConseillers={() => setShowHistoriqueConseillers(true)}
            onChangementDispositif={
              estMilo(conseiller.structure)
                ? () => setShowChangementDispositif(true)
                : undefined
            }
          />
        </div>
      </div>

      {showChangementDispositif && (
        <ChangementDispositifBeneficiaireModal
          ref={modalDispositifRef}
          dispositif={dispositifActuel}
          onConfirm={changerDispositif}
          onCancel={() => setShowChangementDispositif(false)}
        />
      )}

      {showIdentifiantPartenaireModal && (
        <UpdateIdentifiantPartenaireModal
          ref={modalIdentifiantPartenaireRef}
          identifiantPartenaire={identifiantPartenaire}
          updateIdentifiantPartenaire={updateIdentifiantPartenaire}
          onClose={() => setShowIdentifiantPartenaireModal(false)}
        />
      )}

      {showHistoriqueConseillers && (
        <HistoriqueConseillersModal
          conseillers={historiqueConseillers}
          onClose={() => setShowHistoriqueConseillers(false)}
        />
      )}
    </>
  )
}
