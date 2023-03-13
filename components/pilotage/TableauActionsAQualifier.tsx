import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { ActionPilotage } from 'interfaces/action'

interface TableauActionsConseillerProps {
  actions: Array<ActionPilotage>
}

export default function TableauActionsAQualifier({
  actions,
}: TableauActionsConseillerProps) {
  return (
    <>
      {actions.length > 0 && (
        <Table asDiv={true} caption={{ text: 'Liste des actions à qualifier' }}>
          <THead>
            <TR isHeader={true}>
              <TH>Bénéficiaire</TH>
              <TH>Date de réalisation</TH>
              <TH>Titre de l’action</TH>
            </TR>
          </THead>

          <TBody>
            {actions.map((action: ActionPilotage) => (
              <TR
                key={action.id}
                href={`/mes-jeunes/${action.beneficiaire.id}/actions/${action.id}`}
                label={`Accéder au détail de l’action : ${action.titre}`}
              >
                <TD isBold>
                  {action.beneficiaire.nom} {action.beneficiaire.prenom}
                </TD>
                <TD>{action.dateFinReelle}</TD>
                <TD isBold>
                  <span className='flex flex-row justify-between'>
                    {action.titre}
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
