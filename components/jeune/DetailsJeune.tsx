import { useRouter } from 'next/router'
import React, { MouseEventHandler, useState } from 'react'

import { BlocInformationJeune } from 'components/jeune/BlocInformationJeune'
import { BlocSituation } from 'components/jeune/BlocSituation'
import UpdateIdentifiantPartenaireModal from 'components/jeune/UpdateIdentifiantPartenaireModal'
import { StructureConseiller } from 'interfaces/conseiller'
import { DetailJeune } from 'interfaces/jeune'
import { QueryParam, QueryValue } from 'referentiel/queryParam'
import { JeunesService } from 'services/jeunes.service'
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
  const router = useRouter()
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [showIdentifiantPartenaireModal, setShowIdentifiantPartenaireModal] =
    useState<boolean>(false)
  const [identifiantPartenaire, setIdentifiantPartenaire] = useState<
    string | undefined
  >(jeune.idPartenaire)

  function openIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(true)
  }

  function closeIdentifiantPartenaireModal() {
    setShowIdentifiantPartenaireModal(false)
  }

  async function updateIdentifiantPartenaire(
    identifiantPartenaire: string
  ): Promise<void> {
    jeunesService
      .modifierIdentifiantPartenaire(jeune.id, identifiantPartenaire)
      .then(() => {
        setIdentifiantPartenaire(identifiantPartenaire)
        setShowIdentifiantPartenaireModal(false)
        router.push({
          pathname: `/mes-jeunes/${jeune.id}`,
          query: {
            [QueryParam.modificationIdentifiantPartenaire]: QueryValue.succes,
          },
        })
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
