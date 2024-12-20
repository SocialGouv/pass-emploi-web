import { DateTime } from 'luxon'
import dynamic from 'next/dynamic'
import React, { useState } from 'react'

import { BlocInformationJeuneFicheBeneficiaire } from 'components/jeune/BlocInformationJeuneFicheBeneficiaire'
import { ResumeDemarchesBeneficiaire } from 'components/jeune/ResumeDemarchesBeneficiaire'
import { ResumeIndicateursJeune } from 'components/jeune/ResumeIndicateursJeune'
import {
  Demarche,
  DetailBeneficiaire,
  IndicateursSemaine,
} from 'interfaces/beneficiaire'
import {
  Conseiller,
  StructureConseiller,
  estMilo,
  estConseilDepartemental,
} from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'

const UpdateIdentifiantPartenaireModal = dynamic(
  () => import('components/jeune/UpdateIdentifiantPartenaireModal')
)

interface DetailsJeuneProps {
  jeune: DetailBeneficiaire
  conseiller: Conseiller
  demarches?: { data: Demarche[]; isStale: boolean } | null
  indicateursSemaine?: IndicateursSemaine
}

export default function DetailsJeune({
  jeune,
  conseiller,
  demarches,
  indicateursSemaine,
}: DetailsJeuneProps) {
  const [_, setAlerte] = useAlerte()

  const [identifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(jeune.idPartenaire)
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
    modifierIdentifiantPartenaire(jeune.id, nouvelleValeur)
      .then(() => {
        setIdentifiantPartenaire(nouvelleValeur)
        setShowIdentifiantPartenaireModal(false)
        setAlerte(AlerteParam.modificationIdentifiantPartenaire)
      })
      .catch(() => {
        setShowIdentifiantPartenaireModal(false)
      })
  }

  function trackEventOnCopieIdentifiantPartenaire() {
    trackEvent({
      structure: StructureConseiller.POLE_EMPLOI,
      categorie: 'fiche jeune',
      action: 'copie identifiant pe',
      nom: '',
      aDesBeneficiaires: true,
    })
  }

  return (
    <>
      <div className='flex flex-row items-stretch gap-x-6'>
        {estMilo(conseiller) && (
          <ResumeIndicateursJeune
            idBeneficiaire={jeune.id}
            debutDeLaSemaine={debutSemaine}
            finDeLaSemaine={finSemaine}
            indicateursSemaine={indicateursSemaine}
          />
        )}

        {estConseilDepartemental(conseiller) && demarches && (
          <ResumeDemarchesBeneficiaire
            debutDeLaSemaine={debutSemaine}
            finDeLaSemaine={finSemaine}
            demarches={demarches.data}
          />
        )}

        <BlocInformationJeuneFicheBeneficiaire
          idBeneficiaire={jeune.id}
          dateFinCEJ={jeune.dateFinCEJ}
          email={jeune.email}
          situations={jeune.situations}
          conseiller={conseiller}
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
    </>
  )
}
