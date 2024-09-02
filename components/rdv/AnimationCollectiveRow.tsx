import React, { ChangeEvent, ReactElement, useState } from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import {
  TagMetier,
  TagStatut as _TagStatut,
  TagType,
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
    <TR className='grid grid-cols-subgrid grid-rows-[repeat(3,auto) layout_m:grid-rows-[auto] col-span-full'>
      <TD className='col-start-1 col-end-3 !rounded-tl-base !rounded-bl-none !p-0 !pt-2 !pl-2 layout_m:col-end-2 layout_m:!rounded-l-base layout_m:flex layout_m:flex-col layout_m:justify-center layout_m:!p-2'>
        <div className='text-m-bold'>{toLongMonthDate(date)}</div>
        <div>
          {toFrenchTime(date)} -{' '}
          <span className='sr-only'>
            durée{' '}
            {toFrenchDuration(animationCollective.duree, {
              a11y: true,
            })}
          </span>
          <span className='inline-flex items-center' aria-hidden={true}>
            <IconComponent
              name={IconName.ScheduleOutline}
              focusable={false}
              title='durée'
              className='inline w-[1em] h-[1em] fill-[currentColor] mr-1'
            />
            {toFrenchDuration(animationCollective.duree)}
          </span>
        </div>
      </TD>

      <TD className='row-start-2 row-end-5 rounded-bl-base !pt-0 !pb-2 !pl-2 layout_m:row-span-1 layout_m:rounded-none layout_m:flex layout_m:flex-col layout_m:justify-center layout_m:!p-2'>
        <div className='text-base-bold'>{animationCollective.titre}</div>
        {animationCollective.sousTitre && (
          <div>{animationCollective.sousTitre}</div>
        )}
        <div className='mt-1 flex gap-2'>
          <TagType {...animationCollective} isSmallTag={true} />
          <Visiblite
            {...animationCollective}
            estCache={estCache}
            onChangerVisibliteSession={permuterVisibiliteSession}
          />
        </div>
      </TD>

      <TD className='row-start-2 col-start-2 !p-0 layout_m:row-start-1 layout_m:col-start-3 layout_m:flex layout_m:items-center layout_m:justify-center layout_m:!p-2'>
        <Inscrits {...animationCollective} />
      </TD>

      <TD className='row-start-3 !p-0 !pb-2 layout_m:row-start-1 layout_m:col-start-4 layout_m:flex layout_m:items-center layout_m:justify-center layout_m:!p-2'>
        <TagStatut {...animationCollective} />
      </TD>

      <TDLink
        className='row-span-3 flex items-center justify-center !p-2 !pl-4 layout_m:row-span-1 layout_m:!p-2'
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
    <div>
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
    </div>
  )
}
