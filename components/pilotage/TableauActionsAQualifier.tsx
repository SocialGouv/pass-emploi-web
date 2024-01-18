import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagCategorieAction } from 'components/ui/Indicateurs/Tag'
import SortIcon from 'components/ui/SortIcon'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import TR from 'components/ui/Table/TR'
import { ActionPilotage } from 'interfaces/action'
import { TriActionsAQualifier } from 'services/actions.service'

type TableauActionsConseillerProps = {
  actions: Array<ActionPilotage>
  tri: TriActionsAQualifier | undefined
  onTriActions: (tri: TriActionsAQualifier) => void
}

export default function TableauActionsAQualifier({
  actions,
  tri,
  onTriActions,
}: TableauActionsConseillerProps) {
  function inverserTriBeneficiaires() {
    const nouvelOrdre = tri === 'ALPHABETIQUE' ? 'INVERSE' : 'ALPHABETIQUE'
    onTriActions(nouvelOrdre)
  }

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
                    tri === 'ALPHABETIQUE' ? 'inversé' : ''
                  }`}
                  title={`Afficher la liste des bénéficiaires triée par noms de famille par ordre alphabétique ${
                    tri === 'ALPHABETIQUE' ? 'inversé' : ''
                  }`}
                >
                  Bénéficiaire
                  <SortIcon
                    isSorted={tri !== undefined}
                    isDesc={tri === 'INVERSE'}
                  />
                </button>
              </TH>
              <TH>Date de réalisation</TH>
              <TH>Catégorie</TH>
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
                <TD>
                  <TagCategorieAction categorie={action.categorie?.libelle} />
                </TD>
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
