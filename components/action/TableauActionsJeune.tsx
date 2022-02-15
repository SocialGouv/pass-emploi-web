import React from 'react'

interface TableauActionsJeuneProps {
  prenom: string
  nom: string
  elements: JSX.Element[]
}

export const TableauActionsJeune = ({
  prenom,
  nom,
  elements,
}: TableauActionsJeuneProps) => {
  return (
    <div
      role='table'
      className='table w-full'
      aria-label='Actions jeunes'
      aria-describedby='liste_jeunes_actions_table_desc'
    >
      <div id='liste_jeunes_actions_table_desc' className='visually-hidden'>
        Liste des actions de {prenom} {nom}
      </div>
      <div role='rowgroup' className='table-header-group'>
        <div role='row' className='table-row text-xs-medium text-grey_800'>
          <span
            role='columnheader'
            className='table-cell pl-4 py-4 border-b-2 border-grey_700'
          >
            Intitulé de l&apos;action
          </span>
          <span
            role='columnheader'
            className='table-cell border-b-2 border-grey_700'
          >
            Créée le
          </span>
          <span
            role='columnheader'
            className='table-cell border-b-2 border-grey_700'
          >
            Statut
          </span>
          <span className='table-cell border-b-2 border-grey_700'></span>
        </div>
      </div>

      <div role='rowgroup' className='table-row-group'>
        {elements}
      </div>
    </div>
  )
}
