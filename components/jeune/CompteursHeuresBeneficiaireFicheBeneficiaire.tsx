import React, { useState } from 'react'

import Label from 'components/ui/Form/Label'
import { Switch } from 'components/ui/Form/Switch'
import { ProgressComptageHeure } from 'components/ui/Indicateurs/ProgressComptageHeure'
import {
  CompteurHeuresFicheBeneficiaire,
  DetailBeneficiaire,
} from 'interfaces/beneficiaire'
import { toFrenchDateTime } from 'utils/date'

import ConfirmationActivationCompteurModal from '../ConfirmationActivationCompteurModal'

export function CompteursHeuresBeneficiaireFicheBeneficiaire({
  comptageHeures,
  beneficiaire,
}: {
  comptageHeures?: CompteurHeuresFicheBeneficiaire | null
  beneficiaire: DetailBeneficiaire
}) {
  const [loadingChangerVisibilite, setLoadingChangerVisibilite] =
    useState<boolean>(false)
  const [peutVoirLeComptageDesHeures, setPeutVoirLeComptageDesHeures] =
    useState<boolean>(beneficiaire.peutVoirLeComptageDesHeures ?? false)
  const [showModalActivation, setShowModalActivation] = useState<boolean>(false)

  async function handleChangerVisibilite() {
    setLoadingChangerVisibilite(true)

    const { changerVisibiliteComptageHeures } = await import(
      'services/beneficiaires.service'
    )
    await changerVisibiliteComptageHeures(
      beneficiaire.id,
      !peutVoirLeComptageDesHeures
    )

    setPeutVoirLeComptageDesHeures(!peutVoirLeComptageDesHeures)
    setLoadingChangerVisibilite(false)
  }

  function handleSwitchActivationToggle() {
    if (!peutVoirLeComptageDesHeures) {
      setShowModalActivation(true)
      return
    }
    handleChangerVisibilite()
  }

  async function confirmerActivation() {
    await handleChangerVisibilite()
    setShowModalActivation(false)
  }

  return (
    <>
      {comptageHeures && (
        <div className='flex flex-col gap-2 w-full bg-primary-lighten px-6 py-4 rounded-md mt-2'>
          <p className='self-end text-xs-regular'>
            Dernière mise à jour le{' '}
            {toFrenchDateTime(comptageHeures.dateDerniereMiseAJour)}
          </p>
          <div className='flex gap-6 mt-2'>
            <div className='flex-0 grow flex flex-col gap-1'>
              <ProgressComptageHeure
                heures={comptageHeures.nbHeuresDeclarees}
                label='déclarée'
                bgColor='white'
              />
            </div>
            <div className='flex-0 grow flex flex-col gap-1'>
              <ProgressComptageHeure
                heures={comptageHeures.nbHeuresValidees}
                label='validée'
                bgColor='white'
              />
            </div>
          </div>
          <div className='flex gap-6 mt-4 justify-between'>
            <Label htmlFor='afficher-compteur-heures'>
              Afficher le compteur à votre bénéficiaire
            </Label>
            <Switch
              id='afficher-compteur-heures'
              checked={peutVoirLeComptageDesHeures}
              onChange={handleSwitchActivationToggle}
              isLoading={loadingChangerVisibilite}
            />
          </div>
        </div>
      )}

      {!comptageHeures && (
        <div className='flex flex-col gap-2 w-full bg-primary-lighten px-6 py-4 rounded-md mt-2 text-sm text-warning'>
          Comptage des heures indisponible
        </div>
      )}

      {showModalActivation && (
        <ConfirmationActivationCompteurModal
          onClose={() => setShowModalActivation(false)}
          onConfirmation={confirmerActivation}
        />
      )}
    </>
  )
}
