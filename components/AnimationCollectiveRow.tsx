import React, { ReactElement, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagMetier, TagStatut } from 'components/ui/Indicateurs/Tag'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import TD from 'components/ui/Table/TD'
import TR from 'components/ui/Table/TR'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import { toFrenchTime, toMonthday } from 'utils/date'

export function AnimationCollectiveRow(
  animationCollective: AnimationCollective
) {
  const [estCache, setEstCache] = useState<boolean>(
    animationCollective.estCache ?? false
  )
  const [loadingChangerVisibilite, setLoadingChangerVisibilite] =
    useState<boolean>(false)

  function getHref(ac: AnimationCollective): string {
    if (ac.isSession) return `agenda/sessions/${ac.id}`
    else return `/mes-jeunes/edition-rdv?idRdv=${ac.id}`
  }

  async function handleChangerVisibiliteSession() {
    setLoadingChangerVisibilite(true)

    const { changerVisibiliteSession } = await import(
      'services/sessions.service'
    )

    await changerVisibiliteSession(animationCollective.id, estCache)

    setEstCache(!estCache)
    setLoadingChangerVisibilite(false)
  }

  return (
    <TR
      key={animationCollective.id}
      href={getHref(animationCollective)}
      label={labelLien(animationCollective)}
      titreRow={`Consulter ${animationCollective.type} ${animationCollective.titre}`}
    >
      <TD>
        {toFrenchTime(animationCollective.date)} - {animationCollective.duree}{' '}
        min
      </TD>
      <TD>
        {animationCollective.titre}
        <span className='block text-s-regular'>
          {animationCollective.sousTitre}
        </span>
      </TD>
      <TD>{tagType(animationCollective)}</TD>
      <TD className='flex text-center'>
        {animationCollective.isSession && (
          <>
            {loadingChangerVisibilite && <SpinningLoader />}

            {!loadingChangerVisibilite && (
              <IconComponent
                aria-label={estCache ? 'Non visible' : 'Visible'}
                className='inline h-6 w-6 fill-primary cursor-pointer'
                focusable={false}
                name={estCache ? IconName.VisibilityOff : IconName.VisibilityOn}
                onClick={handleChangerVisibiliteSession}
                role='img'
                title={estCache ? 'Non visible' : 'Visible'}
              />
            )}
          </>
        )}

        {!animationCollective.isSession && (
          <IconComponent
            aria-label={estCache ? 'Non visible' : 'Visible'}
            className='inline h-6 w-6 fill-primary'
            focusable={false}
            name={estCache ? IconName.VisibilityOff : IconName.VisibilityOn}
            role='img'
            title={estCache ? 'Non visible' : 'Visible'}
          />
        )}
      </TD>
      <TD>
        {animationCollective.statut && tagStatut(animationCollective)}
        {!animationCollective.statut && (
          <>
            -<span className='sr-only'>information non disponible</span>
          </>
        )}
      </TD>
    </TR>
  )
}

function labelLien(ac: AnimationCollective): string {
  return `Consulter ${ac.type} ${statusProps(ac).label} du ${toMonthday(
    ac.date
  )} à ${toFrenchTime(ac.date)}`
}

function tagType({ isSession, type }: AnimationCollective): ReactElement {
  let tagProps: { color: string; iconName?: IconName; iconLabel?: string } = {
    color: 'additional_2',
    iconName: undefined,
    iconLabel: undefined,
  }

  if (type === 'Atelier') tagProps.color = 'accent_2'
  if (type === 'Information collective') tagProps.iconName = IconName.Error
  if (isSession)
    tagProps = {
      color: 'accent_1',
      iconName: IconName.Lock,
      iconLabel: 'Informations de la session non modifiables',
    }

  return (
    <TagMetier
      label={type}
      color={tagProps.color}
      backgroundColor={tagProps.color + '_lighten'}
      iconName={tagProps.iconName}
      iconLabel={tagProps.iconLabel}
    />
  )
}

function statusProps({ type, statut }: AnimationCollective): {
  label: string
  color: string
} {
  switch (statut) {
    case StatutAnimationCollective.AVenir:
      return { label: 'À venir', color: 'accent_1' }
    case StatutAnimationCollective.AClore:
      return { label: 'À clore', color: 'warning' }

    case StatutAnimationCollective.Close:
      return {
        label: type === 'Atelier' ? 'Clos' : 'Close',
        color: 'accent_2',
      }
    case undefined:
      return {
        label: '',
        color: '',
      }
  }
}

function tagStatut(ac: AnimationCollective): JSX.Element {
  const { label, color } = statusProps(ac)
  return (
    <TagStatut
      label={label}
      color={color}
      backgroundColor={color + '_lighten'}
    />
  )
}
