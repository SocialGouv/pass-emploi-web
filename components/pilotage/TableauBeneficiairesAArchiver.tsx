import {
  BaseBeneficiaire,
  BeneficiaireFromListe,
} from '../../interfaces/beneficiaire'

import { Badge } from 'components/ui/Indicateurs/Badge'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { toLongMonthDate } from 'utils/date'

interface TableauBeneficiairesAArchiverProps {
  beneficiaires: BeneficiaireFromListe[]
}

export default function TableauBeneficiairesAArchiver({
  beneficiaires,
}: TableauBeneficiairesAArchiverProps) {
  return (
    <>
      {beneficiaires.length > 0 && (
        <Table caption={{ text: 'Liste des bénéficiaires à archiver' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Date</TH>
              <TH>Titre de l’animation collective</TH>
              <TH>Participants</TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>

          <tbody>
            {beneficiaires.map((benef: BaseBeneficiaire) => (
              <TR key={benef.id}>
                <TD>{toLongMonthDate(benef.date)}</TD>
                <TD isBold>{benef.titre}</TD>
                <TD>
                  <Badge
                    count={benef.nombreInscrits}
                    textColor='accent_1'
                    bgColor='accent_1_lighten'
                    size={6}
                  />
                </TD>
                <TDLink
                  href={`/mes-jeunes/edition-rdv?idRdv=${benef.id}`}
                  labelPrefix='Archiver le jeune'
                />
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
