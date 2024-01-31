'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import React, { useEffect, useState } from 'react'

import { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { IndicateursSemaine } from 'interfaces/jeune'
import { getIndicateursJeuneComplets } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchString } from 'utils/date'
import { usePortefeuille } from 'utils/portefeuilleContext'

type IndicateursProps = {
  idJeune: string
  lectureSeule: boolean
}

function IndicateursPage({ idJeune, lectureSeule }: IndicateursProps) {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()

  const aujourdHui = DateTime.now()
  const debutSemaine = aujourdHui.startOf('week')
  const finSemaine = aujourdHui.endOf('week')

  // On récupère les indicateurs ici parce qu'on a besoin de la timezone du navigateur
  useEffect(() => {
    if (!indicateursSemaine) {
      getIndicateursJeuneComplets(
        conseiller.id,
        idJeune,
        debutSemaine,
        finSemaine
      ).then(setIndicateursSemaine)
    }
  }, [idJeune, debutSemaine, finSemaine, indicateursSemaine])

  const tracking = `Détail jeune – Indicateurs${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  useMatomo(tracking, aDesBeneficiaires)

  return (
    <div>
      <h2 className='text-m-bold text-content_color mb-6'>
        Semaine du {toFrenchString(debutSemaine)} au{' '}
        {toFrenchString(finSemaine)}
      </h2>

      <IndicateursActions actions={indicateursSemaine?.actions} />

      <IndicateursRendezvous rendezVous={indicateursSemaine?.rendezVous} />

      <IndicateursOffres
        offres={indicateursSemaine?.offres}
        favoris={indicateursSemaine?.favoris}
      />
    </div>
  )
}

function IndicateursActions({
  actions,
}: Partial<Pick<IndicateursSemaine, 'actions'>>) {
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les actions</h3>
      <ul className='flex flex-wrap gap-2'>
        <TileIndicateur
          valeur={actions?.creees.toString() ?? '-'}
          label={actions?.creees !== 1 ? 'Créées' : 'Créée'}
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={actions?.enRetard.toString() ?? '-'}
          label='En retard'
          bgColor='alert_lighten'
          textColor='content_color'
          iconName={IconName.Error}
        />
        <TileIndicateur
          valeur={actions?.terminees.toString() ?? '-'}
          label={actions?.terminees !== 1 ? 'Terminées' : 'Terminée'}
          bgColor='accent_2_lighten'
          textColor='accent_2'
          iconName={IconName.CheckCircleFill}
        />
        <TileIndicateur
          valeur={actions?.aEcheance.toString() ?? '-'}
          label='Échéance cette semaine'
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
      </ul>
    </div>
  )
}

function IndicateursRendezvous({
  rendezVous,
}: Partial<Pick<IndicateursSemaine, 'rendezVous'>>) {
  return (
    <div className='border border-solid rounded-base w-full mt-6 p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les événements</h3>
      <ul className='flex'>
        <TileIndicateur
          valeur={rendezVous?.toString() ?? '-'}
          label='Cette semaine'
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
      </ul>
    </div>
  )
}

function IndicateursOffres({
  offres,
  favoris,
}: Partial<Pick<IndicateursSemaine, 'offres' | 'favoris'>>) {
  return (
    <div className='border border-solid rounded-base w-full mt-6 p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les offres</h3>
      <ul className='flex flex-wrap gap-2'>
        <TileIndicateur
          valeur={offres?.consultees.toString() ?? '-'}
          label={
            offres?.consultees !== 1 ? 'Offres consultées' : 'Offre consultée'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={favoris?.offresSauvegardees.toString() ?? '-'}
          label={
            favoris?.offresSauvegardees !== 1
              ? 'Favoris ajoutés'
              : 'Favori ajouté'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={offres?.partagees.toString() ?? '-'}
          label={
            offres?.partagees !== 1 ? 'Offres partagées' : 'Offre partagée'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
        <TileIndicateur
          valeur={favoris?.recherchesSauvegardees.toString() ?? '-'}
          label={
            favoris?.recherchesSauvegardees !== 1
              ? 'Recherches sauvegardées'
              : 'Recherche sauvegardée'
          }
          bgColor='primary_lighten'
          textColor='primary_darken'
        />
      </ul>
    </div>
  )
}

export default withTransaction(IndicateursPage.name, 'page')(IndicateursPage)
