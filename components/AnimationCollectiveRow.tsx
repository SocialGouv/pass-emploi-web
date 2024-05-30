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
import { trackEvent } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchTime, toMonthday } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

export function AnimationCollectiveRow(
  animationCollective: AnimationCollective
) {
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

  async function handleChangerVisibiliteSession() {
    setLoadingChangerVisibilite(true)

    const { changerVisibiliteSession } = await import(
      'services/sessions.service'
    )
    const doitEtreVisible = estCache
    await changerVisibiliteSession(animationCollective.id, doitEtreVisible)

    setEstCache(!doitEtreVisible)
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
    <TR
      key={animationCollective.id}
      href={getHref(animationCollective)}
      linkLabel={labelLien(animationCollective)}
      rowLabel={`Consulter ${animationCollective.type} ${animationCollective.titre}`}
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
      <TD className='flex justify-center items-center'>
        {animationCollective.isSession && (
          <>
            {loadingChangerVisibilite && <SpinningLoader className='w-6 h-6' />}

            {!loadingChangerVisibilite && (
              <button
                type='button'
                onClick={handleChangerVisibiliteSession}
                className='flex text-s-medium text-primary_darken hover:text-primary items-center justify-center'
              >
                <IconComponent
                  aria-label={estCache ? 'Non visible' : 'Visible'}
                  className='inline m-auto h-6 w-6 fill-primary cursor-pointer'
                  focusable={false}
                  name={
                    estCache ? IconName.VisibilityOff : IconName.VisibilityOn
                  }
                  role='img'
                  title={estCache ? 'Non visible' : 'Visible'}
                />
                <span className='sr-only'>
                  Rendre {estCache ? 'non visible' : 'visible'} l’évènement.
                </span>
              </button>
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
