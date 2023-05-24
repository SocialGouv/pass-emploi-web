import React, { useState } from 'react'

import { BlocInformationJeune } from 'components/jeune/BlocInformationJeune'
import { BlocSituation } from 'components/jeune/BlocSituation'
import UpdateIdentifiantPartenaireModal from 'components/jeune/UpdateIdentifiantPartenaireModal'
import { Conseiller, estMilo, StructureConseiller } from 'interfaces/conseiller'
import { DetailJeune } from 'interfaces/jeune'
import { AlerteParam } from 'referentiel/alerteParam'
import { modifierIdentifiantPartenaire } from 'services/jeunes.service'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'

interface DetailsJeuneProps {
  jeune: DetailJeune
  conseiller: Conseiller
  onDossierMiloClick: () => void
}

export const DetailsJeune = ({
  jeune,
  conseiller,
  onDossierMiloClick,
}: DetailsJeuneProps) => {
  const [_, setAlerte] = useAlerte()

  const [identifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(jeune.idPartenaire)
  const [showIdentifiantPartenaireModal, setShowIdentifiantPartenaireModal] =
    useState<boolean>(false)

  const aDesBeneficiaires = jeune.id ? 'oui' : 'non'

  function openIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(true)
  }

  function closeIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(false)
  }

  async function updateIdentifiantPartenaire(
    nouvelleValeur: string
  ): Promise<void> {
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
      avecBeneficiaires: aDesBeneficiaires,
    })
  }

  return (
    <>
      <div className='flex flex-row items-stretch gap-x-6'>
        {estMilo(conseiller) && (
          <BlocSituation
            idJeune={jeune.id}
            situations={jeune.situations}
            versionResumee={true}
          />
        )}

        <BlocInformationJeune
          idJeune={jeune.id}
          creationDate={jeune.creationDate}
          dateFinCEJ={jeune.dateFinCEJ}
          email={jeune.email}
          conseiller={conseiller}
          onIdentifiantPartenaireCopie={trackEventOnCopieIdentifiantPartenaire}
          identifiantPartenaire={identifiantPartenaire}
          onIdentifiantPartenaireClick={openIdentifiantPartenaireModal}
          urlDossier={jeune.urlDossier}
          onDossierMiloClick={onDossierMiloClick}
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
