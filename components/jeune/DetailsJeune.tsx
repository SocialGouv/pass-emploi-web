import React, { MouseEventHandler, useState } from 'react'

import { BlocInformationJeune } from 'components/jeune/BlocInformationJeune'
import { BlocSituation } from 'components/jeune/BlocSituation'
import UpdateIdentifiantPartenaireModal from 'components/jeune/UpdateIdentifiantPartenaireModal'
import { StructureConseiller } from 'interfaces/conseiller'
import { DetailJeune } from 'interfaces/jeune'
import { AlerteParam } from 'referentiel/alerteParam'
import { JeunesService } from 'services/jeunes.service'
import { useAlerte } from 'utils/alerteContext'
import { trackEvent } from 'utils/analytics/matomo'
import { useDependance } from 'utils/injectionDependances'

interface DetailsJeuneProps {
  jeune: DetailJeune
  structureConseiller: StructureConseiller | undefined
  onDossierMiloClick: () => void
  onDeleteJeuneClick: MouseEventHandler<HTMLButtonElement>
}

export const DetailsJeune = ({
  jeune,
  structureConseiller,
  onDossierMiloClick,
  onDeleteJeuneClick,
}: DetailsJeuneProps) => {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const [_, setAlerte] = useAlerte()

  const [identifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(jeune.idPartenaire)
  const [showIdentifiantPartenaireModal, setShowIdentifiantPartenaireModal] =
    useState<boolean>(false)

  function openIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(true)
  }

  function closeIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(false)
  }

  async function updateIdentifiantPartenaire(
    nouvelleValeur: string
  ): Promise<void> {
    jeunesService
      .modifierIdentifiantPartenaire(jeune.id, nouvelleValeur)
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
    })
  }

  return (
    <>
      <div className='flex flex-row items-stretch gap-x-6'>
        {structureConseiller === StructureConseiller.MILO && (
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
          structureConseiller={structureConseiller}
          onIdentifiantPartenaireCopie={trackEventOnCopieIdentifiantPartenaire}
          identifiantPartenaire={identifiantPartenaire}
          onIdentifiantPartenaireClick={openIdentifiantPartenaireModal}
          urlDossier={jeune.urlDossier}
          onDossierMiloClick={onDossierMiloClick}
          onDeleteJeuneClick={onDeleteJeuneClick}
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
