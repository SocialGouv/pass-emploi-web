import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Badge } from 'components/ui/Indicateurs/Badge'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { AnimationCollectivePilotage } from 'interfaces/evenement'

interface TableauAnimationsACloreProps {
  animationsCollectives: AnimationCollectivePilotage[]
}

export default function TableauAnimationsAClore({
  animationsCollectives,
}: TableauAnimationsACloreProps) {
  return (
    <>
      {animationsCollectives.length > 0 && (
        <Table
          asDiv={true}
          caption={{ text: 'Liste des animations collectives à clore' }}
        >
          <THead>
            <TR isHeader={true}>
              <TH>Date</TH>
              <TH>Titre de l’animation collective</TH>
              <TH>Participants</TH>
            </TR>
          </THead>

          <TBody>
            {animationsCollectives.map((ac: AnimationCollectivePilotage) => (
              <TR
                key={ac.id}
                href={`/mes-jeunes/edition-rdv?idRdv=${ac.id}`}
                label={`Accéder au détail de l’animation collective : ${ac.titre}`}
              >
                <TD>{ac.date}</TD>
                <TD isBold>{ac.titre}</TD>
                <TD>
                  <span className='flex flex-row justify-between'>
                    <Badge
                      count={ac.nombreInscrits}
                      textColor='accent_1'
                      bgColor='accent_1_lighten'
                      size={6}
                    />
                    <IconComponent
                      name={IconName.ChevronRight}
                      focusable={false}
                      aria-hidden={true}
                      className='w-6 h-6 fill-primary'
                    />
                  </span>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </>
  )
}
