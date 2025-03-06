import { DateTime } from 'luxon'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

import propsStatutsActions from 'components/action/propsStatutsActions'
import TagStatutAction from 'components/action/TagStatutAction'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagStatut } from 'components/ui/Indicateurs/Tag'
import { StatutAction } from 'interfaces/action'
import { EntreeAgenda } from 'interfaces/agenda'
import { structureMilo } from 'interfaces/structure'

interface AgendaRowProps {
  entree: EntreeAgenda
  idBeneficiaire: string
}

export default function AgendaRow({ entree, idBeneficiaire }: AgendaRowProps) {
  const pathPrefix = usePathname()?.startsWith('/etablissement')
    ? '/etablissement/beneficiaires'
    : '/mes-jeunes'

  const props: {
    [type in typeof entree.type]: {
      href: string
      iconName: IconName
      label: string
    }
  } = {
    action: {
      href: `${pathPrefix}/${idBeneficiaire}/actions/`,
      iconName: IconName.ChecklistRtlFill,
      label: `Consulter l'action ${entree.titre}${statutAction()}`,
    },
    evenement: {
      href: `${pathPrefix}/edition-rdv?idRdv=`,
      iconName: IconName.EventFill,
      label: `Consulter l'événement du ${entree.titre}`,
    },
    session: {
      href: '/agenda/sessions/',
      iconName: IconName.EventFill,
      label: `Consulter la session ${entree.titre}`,
    },
  }
  const { href, iconName, label } = props[entree.type]

  function determineActionEnRetard() {
    return (
      entree.type === 'action' &&
      entree.statut === StatutAction.AFaire &&
      entree.date < DateTime.now()
    )
  }

  function statutAction(): string {
    if (!entree.statut) return ''
    if (determineActionEnRetard()) return ', de statut En retard'
    return `, de statut ${propsStatutsActions[entree.statut].label}`
  }

  return (
    <li className='mt-4 text-base-regular rounded-base shadow-base hover:bg-primary_lighten'>
      <Link
        href={href + entree.id}
        aria-label={label}
        className='p-4 flex w-full gap-5'
      >
        <div className='mx-5'>
          <IconComponent
            name={iconName}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6'
          />
        </div>

        <div className='grow'>
          {entree.titre}{' '}
          {entree.typeSession && entree.sousTitre && entree.sousTitre}
        </div>
        <div className='flex justify-end'>
          {entree.type === 'action' && (
            <TagStatutAction
              status={entree.statut!}
              actionEstEnRetard={determineActionEnRetard()}
            />
          )}

          {entree.source === structureMilo && (
            <>
              {entree.type === 'session' && entree.typeSession && (
                <TagStatut
                  label={entree.typeSession}
                  iconName={IconName.Lock}
                  iconLabel='Informations de la session non modifiables'
                  className='text-accent_1 bg-accent_1_lighten'
                />
              )}

              {entree.type !== 'session' && (
                <TagStatut
                  label='Non modifiable'
                  iconName={IconName.Lock}
                  className='text-accent_2 bg-accent_2_lighten'
                />
              )}
            </>
          )}

          <IconComponent
            name={IconName.ChevronRight}
            focusable={false}
            aria-hidden={true}
            className='w-6 h-6 ml-3 fill-white bg-primary rounded-full'
          />
        </div>
      </Link>
    </li>
  )
}
