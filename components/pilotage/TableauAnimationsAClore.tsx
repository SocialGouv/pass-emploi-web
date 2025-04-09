import React from 'react'

import { Badge } from 'components/ui/Indicateurs/Badge'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { AnimationCollectivePilotage } from 'interfaces/evenement'
import { toLongMonthDate } from 'utils/date'

interface TableauAnimationsACloreProps {
  animationsCollectives: AnimationCollectivePilotage[]
}

export default function TableauAnimationsAClore({
  animationsCollectives,
}: TableauAnimationsACloreProps) {
  return (
    <>
      {animationsCollectives.length > 0 && (
        <Table caption={{ text: 'Liste des animations collectives à clore' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Date</TH>
              <TH>Titre de l’animation collective</TH>
              <TH>Participants</TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>

          <tbody>
            {animationsCollectives.map((ac: AnimationCollectivePilotage) => (
              <TR key={ac.id}>
                <TD>{toLongMonthDate(ac.date)}</TD>
                <TD isBold>{ac.titre}</TD>
                <TD>
                  <Badge
                    count={ac.nombreInscrits}
                    className='text-accent-1 bg-accent-1-lighten'
                  />
                </TD>
                <TDLink
                  href={`/mes-jeunes/edition-rdv?idRdv=${ac.id}`}
                  labelPrefix='Accéder au détail de l’animation collective du'
                />
              </TR>
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}
