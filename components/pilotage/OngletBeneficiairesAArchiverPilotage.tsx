import EmptyState from 'components/EmptyState'
import TableauBeneficiairesAArchiver from 'components/pilotage/TableauBeneficiairesAArchiver'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { BeneficiaireWithActivity } from 'interfaces/beneficiaire'

type OngletBeneficiairesAArchiverPilotageProps = {
  beneficiaires: BeneficiaireWithActivity[]
}

export default function OngletBeneficiairesAArchiverPilotage({
  beneficiaires,
}: OngletBeneficiairesAArchiverPilotageProps) {
  return (
    <>
      {beneficiaires.length === 0 && (
        <EmptyState
          illustrationName={IllustrationName.People}
          titre='Vous n’avez pas de bénéficiaires à archiver.'
        />
      )}

      {beneficiaires.length > 0 && (
        <TableauBeneficiairesAArchiver beneficiaires={beneficiaires} />
      )}
    </>
  )
}
