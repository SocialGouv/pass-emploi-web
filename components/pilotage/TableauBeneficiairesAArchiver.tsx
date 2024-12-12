import { DateTime } from 'luxon'

import {
  BeneficiaireWithActivity,
  getNomBeneficiaireComplet,
} from '../../interfaces/beneficiaire'
import { TagDate } from '../ui/Indicateurs/Tag'

import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { toLongMonthDate, toRelativeDateTime } from 'utils/date'

interface TableauBeneficiairesAArchiverProps {
  beneficiaires: BeneficiaireWithActivity[]
}

const dateFinCEJColumn = 'Fin de CEJ'
const derniereActiviteColumn = 'Dernière activité'

export default function TableauBeneficiairesAArchiver({
  beneficiaires,
}: TableauBeneficiairesAArchiverProps) {
  return (
    <>
      {beneficiaires.length > 0 && (
        <Table caption={{ text: 'Liste des bénéficiaires à archiver' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Bénéficiaire</TH>
              <TH>{dateFinCEJColumn}</TH>
              <TH>{derniereActiviteColumn}</TH>
              {/* <TH>Archiver</TH> */}
            </TR>
          </thead>

          <tbody>
            {beneficiaires.map((beneficiaire: BeneficiaireWithActivity) => (
              <TR key={beneficiaire.id}>
                <TD
                  isBold
                  className='h-full !p-2 !rounded-tl-base !rounded-bl-none layout_m:!rounded-l-base'
                >
                  <div>{getNomBeneficiaireComplet(beneficiaire)}</div>
                </TD>

                <TD>
                  <div
                    className='text-s-regular text-grey_800'
                    aria-hidden={true}
                  >
                    {dateFinCEJColumn}
                  </div>

                  {beneficiaire.dateFinCEJ && (
                    <TagDate
                      label={toLongMonthDate(
                        DateTime.fromISO(beneficiaire.dateFinCEJ)
                      )}
                    />
                  )}

                  {!beneficiaire.dateFinCEJ && (
                    <>
                      --
                      <span className='sr-only'>
                        information non disponible
                      </span>
                    </>
                  )}
                </TD>

                <TD>
                  {beneficiaire.lastActivity && (
                    <>
                      <span
                        className='text-xs-regular text-grey_800'
                        aria-hidden={true}
                      >
                        {derniereActiviteColumn}
                      </span>
                      <span className='text-s-regular'>
                        {toRelativeDateTime(beneficiaire.lastActivity!)}
                      </span>
                    </>
                  )}
                  {!beneficiaire.lastActivity && (
                    <span className='text-s-regular text-warning'>
                      Compte non activé
                    </span>
                  )}
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
