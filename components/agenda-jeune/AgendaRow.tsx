import Link from 'next/link'
import React from 'react'

import StatusTag from 'components/action/StatusTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { Tag } from 'components/ui/Indicateurs/Tag'
import { EntreeAgenda } from 'interfaces/agenda'
import { StructureConseiller } from 'interfaces/conseiller'

interface AgendaRowProps {
  entree: EntreeAgenda
  jeuneId: string
}

export default function AgendaRow({ entree, jeuneId }: AgendaRowProps) {
  const props: {
    [type in typeof entree.type]: {
      href: string
      iconName: IconName
      label: string
    }
  } = {
    action: {
      href: `/mes-jeunes/${jeuneId}/actions/`,
      iconName: IconName.Actions,
      label: `Consulter l'action ${entree.titre}, de statut ${entree.statut}`,
    },
    evenement: {
      href: `/mes-jeunes/edition-rdv?idRdv=`,
      iconName: IconName.Calendar,
      label: `Consulter l'événement du ${entree.titre}`,
    },
  }
  const { href, iconName, label } = props[entree.type]

  return (
    <li className='mt-4 text-base-regular rounded-small shadow-s hover:bg-primary_lighten'>
      <Link
        href={href + entree.id}
        aria-label={label}
        className='p-4 flex w-full gap-5'
      >
        <div className='mx-5'>
          <IconComponent
            name={iconName}
            focusable={false}
            aria-label={entree.type}
            title={entree.type}
            className='w-6 h-6'
          />
        </div>

        <div className='grow'>{entree.titre}</div>

        <div className='flex justify-end'>
          {entree.statut && <StatusTag status={entree.statut} />}
          {entree.source === StructureConseiller.MILO && (
            <Tag
              label='Non modifiable'
              color='accent_2'
              backgroundColor='accent_2_lighten'
              iconName={IconName.Lock}
            />
          )}
          <IconComponent
            name={IconName.ChevronRight}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 ml-3 fill-content_color'
          />
        </div>
      </Link>
    </li>
  )
}
