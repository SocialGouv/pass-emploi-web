import React, { ReactElement, useState } from 'react'

import IconToggle from 'components/ui/Form/IconToggle'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import {
  TagMetier,
  TagStatut as _TagStatut,
} from 'components/ui/Indicateurs/Tag'
import { SpinningLoader } from 'components/ui/SpinningLoader'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import {
  AnimationCollective,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import {
  toFrenchDuration,
  toFrenchTime,
  toLongMonthDate,
  toMonthday,
} from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

export function AnimationCollectiveRow({
  animationCollective,
}: {
  animationCollective: AnimationCollective
}) {
  const { date } = animationCollective

  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const [estCache, setEstCache] = useState<boolean>(
    animationCollective.estCache ?? false
  )
  const [loadingChangerVisibilite, setLoadingChangerVisibilite] =
    useState<boolean>(false)

  function getHref(ac: AnimationCollective): string {
    if (ac.isSession) return `agenda/sessions/${ac.id}`
    else return `/mes-jeunes/edition-rdv?idRdv=${ac.id}`
  }

  async function permuterVisibiliteSession() {
    setLoadingChangerVisibilite(true)

    const { changerVisibiliteSession } = await import(
      'services/sessions.service'
    )
    const doitDevenirVisible = estCache
    await changerVisibiliteSession(animationCollective.id, doitDevenirVisible)

    setEstCache(!doitDevenirVisible)
    setLoadingChangerVisibilite(false)

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Session i-milo',
      action: 'clic visibilité',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  return (
    <TR>
      <TD>
        <div className='text-m-bold'>{toLongMonthDate(date)}</div>
        {toFrenchTime(date)} -{' '}
        <span className='inline-flex items-center'>
          <IconComponent
            name={IconName.ScheduleOutline}
            role='img'
            aria-label='durée'
            title='durée'
            className='inline w-[1em] h-[1em] fill-[currentColor] mr-1'
          />
          <span
            aria-label={toFrenchDuration(animationCollective.duree, {
              a11y: true,
            })}
          >
            {toFrenchDuration(animationCollective.duree)}
          </span>
        </span>
      </TD>

      <TD>
        <div className='text-base-bold'>{animationCollective.titre}</div>
        {animationCollective.sousTitre && (
          <div>{animationCollective.sousTitre}</div>
        )}
        <div className='mt-1 flex gap-2'>
          <TagType {...animationCollective} />
          <Visiblite
            {...animationCollective}
            loadingChangerVisibilite={loadingChangerVisibilite}
            estCache={estCache}
            onChangerVisibliteSession={permuterVisibiliteSession}
          />
        </div>
      </TD>

      <TD>
        {animationCollective.statut && <TagStatut {...animationCollective} />}
        {!animationCollective.statut &&
          -(<span className='sr-only'>information non disponible</span>)}
      </TD>

      <TDLink
        href={getHref(animationCollective)}
        label={labelLien(animationCollective)}
      />
    </TR>
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
  }
}

function labelLien(ac: AnimationCollective): string {
  return `Consulter ${ac.type} ${ac.titre} du ${toMonthday(
    ac.date
  )} à ${toFrenchTime(ac.date)}`
}

function TagType({ isSession, type }: AnimationCollective): ReactElement {
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
      className='!px-2 !py-1 !text-xs !font-bold [&>svg]:!w-4 [&>svg]:!h-4'
    />
  )
}

function TagStatut(ac: AnimationCollective): ReactElement {
  const { label, color } = statusProps(ac)
  return (
    <_TagStatut
      label={label}
      color={color}
      backgroundColor={color + '_lighten'}
      className='!px-2 !py-1 !text-xs !font-bold'
    />
  )
}

function Visiblite({
  id,
  isSession,
  titre,
  loadingChangerVisibilite,
  estCache,
  onChangerVisibliteSession,
}: {
  loadingChangerVisibilite: boolean
  estCache: boolean
  onChangerVisibliteSession: () => void
} & AnimationCollective): ReactElement {
  return (
    <>
      {isSession && (
        <>
          {loadingChangerVisibilite && (
            <SpinningLoader alert={true} className='!m-0 w-6 h-6' />
          )}

          {!loadingChangerVisibilite && (
            <IconToggle
              id={`${id}--visibilite`}
              label={'Visibilité de l’événement ' + titre}
              checked={!estCache}
              checkedState={{
                iconName: IconName.VisibilityOn,
                actionTitle: 'Cacher l’événement',
              }}
              uncheckedState={{
                iconName: IconName.VisibilityOff,
                actionTitle: 'Rendre visible l’événement',
              }}
              onToggle={onChangerVisibliteSession}
              className='relative z-20 h-6 w-6 fill-primary hover:fill-primary_darken'
            />
          )}
        </>
      )}

      {!isSession && (
        <IconComponent
          aria-label={estCache ? 'Non visible' : 'Visible'}
          className='inline h-6 w-6 fill-primary'
          focusable={false}
          name={estCache ? IconName.VisibilityOff : IconName.VisibilityOn}
          role='img'
          title={estCache ? 'Non visible' : 'Visible'}
        />
      )}
    </>
  )
}
