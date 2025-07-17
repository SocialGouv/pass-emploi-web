import Link from 'next/link'
import React, { useState } from 'react'

import Button from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

export default function ListeBoutonsAjoutsFicheBeneficiaire({
  idBeneficiaire,
}: {
  idBeneficiaire: string
}) {
  const [afficherBoutons, setAfficherBoutons] = useState<boolean>(false)

  return (
    <div className='relative'>
      <Button
        aria-controls='liste-boutons-ajouts'
        aria-expanded={afficherBoutons}
        onClick={() => setAfficherBoutons(!afficherBoutons)}
      >
        <IconComponent
          name={IconName.Add}
          focusable={false}
          aria-hidden={true}
          className='shrink-0 mr-2 w-4 h-4'
        />
        Ajouter
        <IconComponent
          name={IconName.ChevronDown}
          focusable={false}
          aria-hidden={true}
          className='shrink-0 ml-2 w-4 h-4'
        />
      </Button>

      {afficherBoutons && (
        <div
          className='absolute w-max right-0 z-30 bg-white rounded-base shadow-base p-4 text-base-regular'
          id='liste-boutons-ajouts'
        >
          <Link
            href={`/mes-jeunes/edition-rdv?idJeune=${idBeneficiaire}`}
            title='Ajouter un rendez-vous'
            className='p-2 cursor-pointer flex gap-5 items-center hover:text-primary font-bold'
          >
            Un rendez-vous
          </Link>
          <Link
            href={`/mes-jeunes/${idBeneficiaire}/actions/nouvelle-action`}
            title='Ajouter une action'
            className='p-2 cursor-pointer flex gap-5 items-center hover:text-primary font-bold'
          >
            Une action
          </Link>
          <Link
            href='/agenda?onglet=mission-locale'
            title='Ajouter une animation collective'
            className='p-2 cursor-pointer flex gap-5 items-center hover:text-primary font-bold'
          >
            Une animation collective
          </Link>
        </div>
      )}
    </div>
  )
}
