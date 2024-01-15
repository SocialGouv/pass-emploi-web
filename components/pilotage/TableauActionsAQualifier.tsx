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
import { compareJeunesByNom } from 'interfaces/jeune'

interface TableauActionsConseillerProps {
  actions: Array<ActionPilotage>
}

export default function TableauActionsAQualifier({
  actions,
}: TableauActionsConseillerProps) {
  const ALPHABETIQUE = 'ALPHABETIQUE'
  const INVERSE = 'INVERSE'
  const [actionsTriees, setActionsTriees] = useState<ActionPilotage[]>(actions)
  const [triBeneficiaires, setTriBeneficiaires] = useState<
    typeof ALPHABETIQUE | typeof INVERSE | null
  >(null)

  function inverserTriBeneficiaires() {
    const nouvelOrdre =
      triBeneficiaires === ALPHABETIQUE ? INVERSE : ALPHABETIQUE
    setTriBeneficiaires(nouvelOrdre)
  }

  function trierActions(actionsATrier: ActionPilotage[]) {
    const ordre = triBeneficiaires === ALPHABETIQUE ? 1 : -1
    return [...actionsATrier].sort(
      (action1, action2) =>
        compareJeunesByNom(action1.beneficiaire, action2.beneficiaire) * ordre
    )
  }

  useEffect(() => {
    if (!triBeneficiaires) setActionsTriees(actions)
    else setActionsTriees(trierActions(actions))
  }, [actions, triBeneficiaires])

  return (
    <>
      {actions.length > 0 && (
        <Table asDiv={true} caption={{ text: 'Liste des actions à qualifier' }}>
          <THead>
            <TR isHeader={true}>
              <TH estCliquable={true}>
                <button
                  className='flex border-none items-center w-full h-full p-4'
                  onClick={inverserTriBeneficiaires}
                  aria-label={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    triBeneficiaires === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                  title={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    triBeneficiaires === ALPHABETIQUE ? 'inversé' : ''
                  }`}
                >
                  Bénéficiaire
                  <SortIcon
                    isDesc={triBeneficiaires === INVERSE}
                    isSorted={triBeneficiaires !== null}
                  />
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
