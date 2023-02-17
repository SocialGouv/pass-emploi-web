import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { AnimationCollectivePilotage } from 'interfaces/evenement'

interface TableauAnimationsACloreProps {
  evenements: AnimationCollectivePilotage[]
}

export default function TableauAnimationsAClore({
  evenements,
}: TableauAnimationsACloreProps) {
  return (
    <>
      {evenements.length > 0 && (
        <Table asDiv={true} caption='Liste des animations collectives à clore'>
          <THead>
            <TR isHeader={true}>
              <TH>Date</TH>
              <TH>Titre de l’animation collective</TH>
              <TH>Participants</TH>
            </TR>
          </THead>

          <TBody>
            {evenements.map((evenement: AnimationCollectivePilotage) => (
              <TR
                key={evenement.id}
                href={`/mes-jeunes/edition-rdv?idRdv=${evenement.id}`}
                label={`Accéder au détail de l’animation collective : ${evenement.titre}`}
              >
                <TD>{evenement.date}</TD>
                <TD isBold>{evenement.titre}</TD>
                <TD>
                  <span className='flex flex-row justify-between'>
                    {evenement.nombreInscrits}
                    <IconComponent
                      name={IconName.ChevronRight}
                      focusable={false}
                      aria-hidden={true}
                      className='w-6 h-6 fill-content_color'
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
