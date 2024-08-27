import React, { ChangeEvent, ReactElement, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import {
  TagMetier,
  TagStatut as _TagStatut,
} from 'components/ui/Indicateurs/Tag'
import SelectButton from 'components/ui/SelectButton'
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
  function getHref(ac: AnimationCollective): string {
    if (ac.isSession) return `agenda/sessions/${ac.id}`
    else return `/mes-jeunes/edition-rdv?idRdv=${ac.id}`
  }

  async function permuterVisibiliteSession(visibilite: boolean) {
    const { changerVisibiliteSession } = await import(
      'services/sessions.service'
    )
    await changerVisibiliteSession(animationCollective.id, visibilite)
    setEstCache(!visibilite)

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
            estCache={estCache}
            onChangerVisibliteSession={permuterVisibiliteSession}
          />
        </div>
      </TD>

      <TD>
        <Inscrits {...animationCollective} />
      </TD>

      <TD>
        <TagStatut {...animationCollective} />
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
  estCache,
  onChangerVisibliteSession,
}: {
  estCache: boolean
  onChangerVisibliteSession: (visible: boolean) => Promise<void>
} & AnimationCollective): ReactElement {
  const selectId = id + '--visibilite'

  async function changerVisibilite(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    await onChangerVisibliteSession(value === 'visible')
  }

  return (
    <>
      {isSession && (
        <>
          <label htmlFor={selectId} className='sr-only'>
            Visibilité de l’événement {titre}
          </label>
          <SelectButton
            id={selectId}
            onChange={changerVisibilite}
            value={estCache ? 'non-visible' : 'visible'}
            className={`z-20 text-xs-bold ${estCache ? 'text-content_color border-grey_800 bg-grey_100' : 'border-success text-success bg-success_lighten'}`}
          >
            <option value='visible'>Visible</option>
            <option value='non-visible'>Non visible</option>
          </SelectButton>
        </>
      )}

      {!isSession && (
        <TagMetier
          label='Visible'
          color='success'
          backgroundColor='success_lighten'
          className='!px-2 !py-1 !text-xs !font-bold'
        />
      )}
    </>
  )
}

function Inscrits({
  nombreMaxParticipants,
  nombreParticipants,
}: AnimationCollective): ReactElement {
  const aUneCapaciteLimite = nombreMaxParticipants !== undefined
  const aAtteintLaCapaciteLimite = nombreParticipants >= nombreMaxParticipants!
  const aPlusieursParticipants = nombreParticipants !== 1

  return (
    <>
      {!aUneCapaciteLimite && (
        <>
          <span className='text-m-bold'>{nombreParticipants}</span> inscrit
          {aPlusieursParticipants ? 's' : ''}
        </>
      )}

      {aUneCapaciteLimite && aAtteintLaCapaciteLimite && (
        <span className='text-base-bold text-warning'>Complet</span>
      )}

      {aUneCapaciteLimite && !aAtteintLaCapaciteLimite && (
        <>
          <span className='text-m-bold'>{nombreParticipants}</span> inscrit
          {nombreParticipants !== 1 ? 's' : ''} /{nombreMaxParticipants}
        </>
      )}
    </>
  )
}
