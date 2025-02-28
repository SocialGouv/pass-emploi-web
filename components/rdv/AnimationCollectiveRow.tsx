import React, { ReactElement, useState } from 'react'

import Visibilite from 'components/rdv/Visibilite'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { TagStatut as _TagStatut, TagType } from 'components/ui/Indicateurs/Tag'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TR from 'components/ui/Table/TR'
import {
  AnimationCollective,
  EtatVisibilite,
  StatutAnimationCollective,
} from 'interfaces/evenement'
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchDuration, toFrenchTime, toLongMonthDate } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

export function AnimationCollectiveRow({
  animationCollective,
}: {
  animationCollective: AnimationCollective
}) {
  const { date } = animationCollective
  const duree = toFrenchDuration(animationCollective.duree)
  const dureeA11y = toFrenchDuration(animationCollective.duree, { a11y: true })

  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const [etatVisibilite, setEtatVisibilite] = useState<EtatVisibilite>(
    animationCollective.etatVisibilite
  )

  function getHref(): string {
    if (animationCollective.isSession)
      return `agenda/sessions/${animationCollective.id}`
    else return `/mes-jeunes/edition-rdv?idRdv=${animationCollective.id}`
  }

  async function updateVisibiliteSession(nouvelEtat: EtatVisibilite) {
    switch (nouvelEtat) {
      case 'auto-inscription':
        const { changerAutoinscriptionSession } = await import(
          'services/sessions.service'
        )
        await changerAutoinscriptionSession(animationCollective.id, true)
        break
      case 'visible':
      case 'non-visible':
        const { changerVisibiliteSession } = await import(
          'services/sessions.service'
        )
        await changerVisibiliteSession(
          animationCollective.id,
          nouvelEtat === 'visible'
        )
        break
    }

    setEtatVisibilite(nouvelEtat)

    trackEvent({
      structure: conseiller.structure,
      categorie: 'Session i-milo',
      action: 'clic visibilité agenda',
      nom: '',
      aDesBeneficiaires: portefeuille.length > 0,
    })
  }

  return (
    <TR className='grid grid-cols-subgrid grid-rows-[repeat(3,auto) layout_base:grid-rows-[auto] col-span-full'>
      <TD className='col-start-1 col-end-3 rounded-tl-base! rounded-bl-none! p-0! pt-2! pl-2! layout_base:col-end-2 layout_base:rounded-l-base! layout_base:flex layout_base:flex-col layout_base:justify-center layout_base:p-2!'>
        <div className='text-m-bold'>{toLongMonthDate(date)}</div>
        <div>
          <span aria-label={toFrenchTime(date, { a11y: true })}>
            {toFrenchTime(date)} -{' '}
          </span>
          <span className='inline-flex items-center'>
            <IconComponent
              name={IconName.ScheduleOutline}
              focusable={false}
              role='img'
              aria-labelledby={animationCollective.id + '--duree'}
              className='inline w-[1em] h-[1em] fill-current mr-1'
            />
            <span
              id={animationCollective.id + '--duree'}
              aria-label={'durée ' + dureeA11y}
            >
              {duree}
            </span>
          </span>
        </div>
      </TD>

      <TD className='row-start-2 row-end-4 rounded-bl-base pt-0! pb-2! pl-2! layout_base:row-span-1 layout_base:rounded-none layout_base:flex layout_base:flex-col layout_base:justify-center layout_base:p-2!'>
        <div className='text-base-bold'>{animationCollective.titre}</div>
        {animationCollective.sousTitre && (
          <div>{animationCollective.sousTitre}</div>
        )}
        <div className='mt-1 flex gap-2 flex-wrap'>
          <TagType {...animationCollective} isSmallTag={true} />
          <Visibilite
            {...animationCollective}
            etatVisibilite={etatVisibilite}
            onChangerVisibliteSession={updateVisibiliteSession}
          />
        </div>
      </TD>

      <TD className='row-start-2 col-start-2 p-0! layout_base:row-start-1 layout_base:col-start-3 layout_base:flex layout_base:items-center layout_base:justify-center layout_base:p-2!'>
        <Inscrits {...animationCollective} />
      </TD>

      <TD className='row-start-3 p-0! pb-2! layout_base:row-start-1 layout_base:col-start-4 layout_base:flex layout_base:items-center layout_base:justify-center layout_base:p-2!'>
        <TagStatut {...animationCollective} />
      </TD>

      <TDLink
        className='row-span-3 flex items-center justify-center p-2! pl-4! layout_base:row-span-1 layout_base:p-2!'
        href={getHref()}
        labelPrefix={`Consulter ${animationCollective.type} du`}
      />
    </TR>
  )
}

function statusProps({ type, statut }: AnimationCollective): {
  label: string
  style: string
} {
  switch (statut) {
    case StatutAnimationCollective.AVenir:
      return { label: 'À venir', style: 'text-accent_1 bg-accent_1_lighten' }
    case StatutAnimationCollective.AClore:
      return { label: 'À clore', style: 'text-warning bg-warning_lighten' }

    case StatutAnimationCollective.Close:
      return {
        label: type === 'Atelier' ? 'Clos' : 'Close',
        style: 'text-accent_2 bg-accent_2_lighten',
      }
  }
}

function TagStatut(animationCollective: AnimationCollective): ReactElement {
  const { label, style } = statusProps(animationCollective)
  return (
    <_TagStatut
      label={label}
      className={style + ' px-2! py-1! text-xs! font-bold!'}
    />
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
          <span className='text-m-bold'>{nombreParticipants}</span>{' '}
          {aPlusieursParticipants ? 'inscrits' : 'inscrit'}
        </>
      )}

      {aUneCapaciteLimite && aAtteintLaCapaciteLimite && (
        <span className='text-base-bold text-warning'>Complet</span>
      )}

      {aUneCapaciteLimite && !aAtteintLaCapaciteLimite && (
        <>
          <span className='text-m-bold'>{nombreParticipants}</span>{' '}
          {nombreParticipants !== 1 ? 'inscrits' : 'inscrit'} /
          {nombreMaxParticipants}
        </>
      )}
    </div>
  )
}
