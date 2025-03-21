import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'

import BlocInformationBeneficiaire from 'components/jeune/BlocInformationBeneficiaire'
import HeaderDetailBeneficiaire from 'components/jeune/HeaderDetailBeneficiaire'
import ResumeDemarchesBeneficiaire from 'components/jeune/ResumeDemarchesBeneficiaire'
import ResumeIndicateursBeneficiaire from 'components/jeune/ResumeIndicateursBeneficiaire'
import {
  Demarche,
  DetailBeneficiaire,
  IndicateursSemaine,
} from 'interfaces/beneficiaire'
import {
  estConseilDepartemental,
  estMilo,
  structureFTCej,
} from 'interfaces/structure'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'

const UpdateIdentifiantPartenaireModal = dynamic(
  () => import('components/jeune/UpdateIdentifiantPartenaireModal')
)

interface DetailsBeneficiaireProps {
  beneficiaire: DetailBeneficiaire
  withCreations: boolean
  demarches?: { data: Demarche[]; isStale: boolean } | null
  indicateursSemaine?: IndicateursSemaine
  onSupprimerBeneficiaire?: () => void
  className?: string
}

export default function DetailsBeneficiaire({
  beneficiaire,
  withCreations,
  demarches,
  indicateursSemaine,
  onSupprimerBeneficiaire,
  className,
}: DetailsBeneficiaireProps) {
  const { id, idPartenaire, dispositif, situations } = beneficiaire
  const [conseiller] = useConseiller()
  const [_, setAlerte] = useAlerte()

  const [dispositifActuel, setDispositifActuel] = useState<string>(dispositif)
  const [identifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(idPartenaire)
  const [showIdentifiantPartenaireModal, setShowIdentifiantPartenaireModal] =
    useState<boolean>(false)

  const aujourdHui = DateTime.now()
  const debutSemaine = aujourdHui.startOf('week')
  const finSemaine = aujourdHui.endOf('week')

  function openIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(true)
  }

  function closeIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(false)
  }

  async function updateIdentifiantPartenaire(
    nouvelleValeur: string
  ): Promise<void> {
    const { modifierIdentifiantPartenaire } = await import(
      'services/beneficiaires.service'
    )
    modifierIdentifiantPartenaire(id, nouvelleValeur)
      .then(() => {
        setIdentifiantPartenaire(nouvelleValeur)
        setShowIdentifiantPartenaireModal(false)
        setAlerte(AlerteParam.modificationIdentifiantPartenaire)
      })
      .catch(() => {
        setShowIdentifiantPartenaireModal(false)
      })
  }

  async function changerDispositif(nouveauDispositif: string): Promise<void> {
    const { modifierDispositif } = await import(
      'services/beneficiaires.service'
    )
    await modifierDispositif(id, nouveauDispositif)
    setDispositifActuel(nouveauDispositif)
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
    <div className={'rounded-large ' + (className ?? '')}>
      <HeaderDetailBeneficiaire
        beneficiaire={{
          id: beneficiaire.id,
          nomComplet: `${beneficiaire.prenom} ${beneficiaire.nom}`,
        }}
        dispositif={dispositifActuel}
        situation={situations[0]?.categorie}
        withCreations={withCreations}
        onSupprimerBeneficiaire={onSupprimerBeneficiaire}
      />

      <div className='rounded-b-[inherit] border border-t-0 border-grey-500 py-4 flex'>
        {estMilo(conseiller.structure) && (
          <ResumeIndicateursBeneficiaire
            debutDeLaSemaine={debutSemaine}
            finDeLaSemaine={finSemaine}
            indicateursSemaine={indicateursSemaine}
          />
        )}

        {estConseilDepartemental(conseiller.structure) && demarches && (
          <ResumeDemarchesBeneficiaire
            debutDeLaSemaine={debutSemaine}
            finDeLaSemaine={finSemaine}
            demarches={demarches.data}
          />
        )}

        <BlocInformationBeneficiaire
          beneficiaire={beneficiaire}
          dispositif={dispositifActuel}
          onChangementDispositif={changerDispositif}
          onIdentifiantPartenaireCopie={trackEventOnCopieIdentifiantPartenaire}
          identifiantPartenaire={identifiantPartenaire}
          onIdentifiantPartenaireClick={openIdentifiantPartenaireModal}
        />
      </div>

      {showIdentifiantPartenaireModal && (
        <UpdateIdentifiantPartenaireModal
          identifiantPartenaire={identifiantPartenaire}
          updateIdentifiantPartenaire={updateIdentifiantPartenaire}
          onClose={closeIdentifiantPartenaireModal}
        />
      )}
    </div>
  )
}
