import { DateTime } from 'luxon'
import React, { useState } from 'react'

import DeleteBeneficiaireModal from 'components/jeune/DeleteBeneficiaireModal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { TagDate } from 'components/ui/Indicateurs/Tag'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  BeneficiaireWithActivity,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { toLongMonthDate, toRelativeDateTime } from 'utils/date'

type TableauBeneficiairesAArchiverProps = {
  beneficiaires: BeneficiaireWithActivity[]
}

const dateFinCEJColumn = 'Fin de CEJ'
const derniereActiviteColumn = 'Dernière activité'

export default function TableauBeneficiairesAArchiver({
  beneficiaires,
}: TableauBeneficiairesAArchiverProps) {
  const [beneficiaireAArchiver, setBeneficiaireAArchiver] = useState<
    BeneficiaireWithActivity | undefined
  >()
  const [
    showSuppressionCompteBeneficiaireError,
    setShowSuppressionCompteBeneficiaireError,
  ] = useState<boolean>(false)

  return (
    <>
      {showSuppressionCompteBeneficiaireError && (
        <FailureAlert
          label='Suite à un problème inconnu l’archivage a échoué. Vous pouvez réessayer.'
          onAcknowledge={() => setShowSuppressionCompteBeneficiaireError(false)}
        />
      )}

      <Table caption={{ text: 'Liste des bénéficiaires à archiver' }}>
        <thead className='sr-only'>
          <TR isHeader={true}>
            <TH>Bénéficiaire</TH>
            <TH>{dateFinCEJColumn}</TH>
            <TH>{derniereActiviteColumn}</TH>
            <TH>Archiver</TH>
          </TR>
        </thead>

        <tbody>
          {beneficiaires.map((beneficiaire: BeneficiaireWithActivity) => (
            <TR key={beneficiaire.id}>
              <TD isBold>
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
                    <span className='sr-only'>information non disponible</span>
                  </>
                )}
              </TD>

              <TD>
                {beneficiaire.isActivated && (
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

                {!beneficiaire.isActivated && (
                  <span className='text-s-regular text-warning'>
                    Compte non activé
                  </span>
                )}
              </TD>

              <TD>
                <Button
                  type='button'
                  style={ButtonStyle.PRIMARY}
                  onClick={() => setBeneficiaireAArchiver(beneficiaire)}
                >
                  Archiver
                  <span className='sr-only'>
                    {getNomBeneficiaireComplet(beneficiaire)}
                  </span>
                </Button>
              </TD>
            </TR>
          ))}
        </tbody>
      </Table>

      {beneficiaireAArchiver && (
        <DeleteBeneficiaireModal
          beneficiaire={beneficiaireAArchiver}
          onClose={() => setBeneficiaireAArchiver(undefined)}
          onError={() => setShowSuppressionCompteBeneficiaireError(true)}
        />
      )}
    </>
  )
}