import { ProgressComptageHeure } from 'components/ui/Indicateurs/ProgressComptageHeure'
import { CompteurHeuresFicheBeneficiaire } from 'interfaces/beneficiaire'
import { toFrenchDateTime } from 'utils/date'

export function CompteursHeuresBeneficiaireFicheBeneficiaire({
  comptageHeures,
}: {
  comptageHeures?: CompteurHeuresFicheBeneficiaire | null
}) {
  return (
    <>
      {comptageHeures && (
        <div className='flex flex-col gap-2 w-full bg-primary-lighten px-6 py-4 rounded-md mt-2'>
          <p className='self-end text-xs-regular'>
            Dernière mise à jour le{' '}
            {toFrenchDateTime(comptageHeures.dateDerniereMiseAJour)}
          </p>
          <div className='flex gap-2 mt-2'>
            <div className='grow flex flex-col gap-1'>
              <ProgressComptageHeure
                heures={comptageHeures.nbHeuresDeclarees}
                label='déclarée'
                bgColor='white'
              />
            </div>

            <div className='grow flex flex-col gap-1'>
              <ProgressComptageHeure
                heures={comptageHeures.nbHeuresValidees}
                label='validée'
                bgColor='white'
              />
            </div>
          </div>
        </div>
      )}

      {!comptageHeures && (
        <div className='flex flex-col gap-2 w-full bg-primary-lighten px-6 py-4 rounded-md mt-2 text-sm text-warning'>
          Comptage des heures indisponible
        </div>
      )}
    </>
  )
}
