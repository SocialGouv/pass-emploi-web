import React, { useEffect, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { ActionPilotage } from 'interfaces/action'

interface TableauActionsConseillerProps {
  actions: Array<ActionPilotage>
}

export default function TableauActionsAQualifier({
  actions,
}: TableauActionsConseillerProps) {
  const ALPHABETIQUE = 'ASC'
  const INVERSE = 'DESC'
  const [actionsTriees, setActionsTriees] = useState<ActionPilotage[]>(actions)
  const [tri, setTri] = useState<typeof ALPHABETIQUE | typeof INVERSE | null>(
    null
  )

  function inverserTri() {
    const nouvelOrdre =
      tri === null
        ? ALPHABETIQUE
        : tri === ALPHABETIQUE
          ? INVERSE
          : ALPHABETIQUE
    setTri(nouvelOrdre)
  }

  function trierActions(actionsATrier: ActionPilotage[]) {
    const ordre = tri === ALPHABETIQUE ? 1 : -1
    return [...actionsATrier].sort(
      (action1, action2) =>
        action1.beneficiaire.nom.localeCompare(action2.beneficiaire.nom) * ordre
    )
  }

  useEffect(() => {
    if (tri !== null) setActionsTriees(trierActions(actions))
  }, [tri])

  useEffect(() => {
    if (tri !== null) setActionsTriees(trierActions(actions))
    else setActionsTriees(actions)
  }, [actions])

  return (
    <>
      {actions.length > 0 && (
        <Table asDiv={true} caption={{ text: 'Liste des actions à qualifier' }}>
          <THead>
            <TR isHeader={true}>
              <TH estCliquable={true}>
                <button
                  className='flex border-none items-center w-full h-full p-4'
                  onClick={inverserTri}
                  aria-label={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    tri === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                  title={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    tri === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                >
                  Bénéficiaire
                  <SortIcon isDesc={tri === INVERSE} isSorted={tri !== null} />
                </button>
              </TH>
              <TH>Date de réalisation</TH>
              <TH>Titre de l’action</TH>
            </TR>
          </THead>

          <TBody>
            {actionsTriees.map((action: ActionPilotage) => (
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
