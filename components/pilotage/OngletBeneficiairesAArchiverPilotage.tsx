import { BeneficiaireWithActivity } from '../../interfaces/beneficiaire'

import TableauBeneficiairesAArchiver from './TableauBeneficiairesAArchiver'

import EmptyStateImage from 'assets/images/illustration-event-grey.svg'

interface OngletBeneficiairesAArchiverPilotageProps {
  beneficiaires: BeneficiaireWithActivity[]
}
export default function OngletBeneficiairesAArchiverPilotage({
  beneficiaires,
}: OngletBeneficiairesAArchiverPilotageProps) {
  return (
    <>
      {Boolean(beneficiaires && beneficiaires.length === 0) && (
        <div className='flex flex-col justify-center items-center'>
          <EmptyStateImage
            focusable={false}
            aria-hidden={true}
            className='w-[360px] h-[200px]'
          />
          <p className='mt-4 text-base-medium w-2/3 text-center'>
            Vous n’avez pas de bénéficiaires à archiver.
          </p>
        </div>
      )}

      {beneficiaires.length > 0 && (
        <TableauBeneficiairesAArchiver beneficiaires={beneficiaires} />
      )}
    </>
  )
}
