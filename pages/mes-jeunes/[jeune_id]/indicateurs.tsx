import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import React, { useEffect, useState } from 'react'

import { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { StructureConseiller } from 'interfaces/conseiller'
import { IndicateursSemaine } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

type IndicateursProps = PageProps & {
  idJeune: string
  idConseiller: string
}

function Indicateurs({ idJeune, idConseiller }: IndicateursProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')

  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()

  const aujourdHui = DateTime.now()
  const debutDeLaSemaine = aujourdHui.startOf('week')
  const finDeLaSemaine = aujourdHui.endOf('week')

  useMatomo('Détail jeune – Indicateurs')

  useEffect(() => {
    if (!indicateursSemaine) {
      jeunesService
        .getIndicateursJeune(
          idConseiller,
          idJeune,
          debutDeLaSemaine,
          finDeLaSemaine
        )
        .then(setIndicateursSemaine)
    }
  }, [
    idConseiller,
    idJeune,
    debutDeLaSemaine,
    finDeLaSemaine,
    indicateursSemaine,
    jeunesService,
  ])

  return (
    <div>
      <h2 className='text-m-bold text-content_color mb-6'>
        Semaine du {debutDeLaSemaine.toLocaleString()} au{' '}
        {finDeLaSemaine.toLocaleString()}
      </h2>

      <div className='border border-solid rounded-medium w-full p-4 border-grey_100'>
        <h3 className='text-m-bold text-content_color mb-4'>Les actions</h3>
        <ul className='flex gap-2'>
          <TileIndicateur
            valeur={indicateursSemaine?.actions.creees.toString() ?? '-'}
            label={
              indicateursSemaine?.actions.creees !== 1 ? 'Créées' : 'Créée'
            }
            bgColor='primary_lighten'
            textColor='primary_darken'
          />
          <TileIndicateur
            valeur={indicateursSemaine?.actions.enRetard.toString() ?? '-'}
            label='En retard'
            bgColor='alert_lighten'
            textColor='content_color'
            iconName={IconName.WarningRounded}
          />
          <TileIndicateur
            valeur={indicateursSemaine?.actions.terminees.toString() ?? '-'}
            label={
              indicateursSemaine?.actions.terminees !== 1
                ? 'Terminées'
                : 'Terminée'
            }
            bgColor='accent_2_lighten'
            textColor='accent_2'
            iconName={IconName.RoundedCheck}
          />
          <TileIndicateur
            valeur={indicateursSemaine?.actions.aEcheance.toString() ?? '-'}
            label='Échéance cette semaine'
            bgColor='primary_lighten'
            textColor='primary_darken'
          />
        </ul>
      </div>

      <div className='border border-solid rounded-medium w-full mt-6 p-4 border-grey_100'>
        <h3 className='text-m-bold text-content_color mb-4'>Les rendez-vous</h3>
        <ul className='flex'>
          <TileIndicateur
            valeur={indicateursSemaine?.rendezVous.toString() ?? '-'}
            label='Cette semaine'
            bgColor='primary_lighten'
            textColor='primary_darken'
          />
        </ul>
      </div>

      <div className='border border-solid rounded-medium w-full mt-6 p-4 border-grey_100'>
        <h3 className='text-m-bold text-content_color mb-4'>Les offres</h3>
        <ul className='flex gap-2'>
          <TileIndicateur
            valeur={indicateursSemaine?.offres.consultees.toString() ?? '-'}
            label={
              indicateursSemaine?.offres.consultees !== 1
                ? 'Offres consultées'
                : 'Offre consultée'
            }
            bgColor='primary_lighten'
            textColor='primary_darken'
          />
          <TileIndicateur
            valeur={
              indicateursSemaine?.favoris.offresSauvegardees.toString() ?? '-'
            }
            label={
              indicateursSemaine?.favoris.offresSauvegardees !== 1
                ? 'Favoris ajoutés'
                : 'Favori ajouté'
            }
            bgColor='primary_lighten'
            textColor='primary_darken'
          />
          <TileIndicateur
            valeur={indicateursSemaine?.offres.partagees.toString() ?? '-'}
            label={
              indicateursSemaine?.offres.partagees !== 1
                ? 'Offres partagées'
                : 'Offre partagée'
            }
            bgColor='primary_lighten'
            textColor='primary_darken'
          />
          <TileIndicateur
            valeur={
              indicateursSemaine?.favoris.recherchesSauvegardees.toString() ??
              '-'
            }
            label={
              indicateursSemaine?.favoris.recherchesSauvegardees !== 1
                ? 'Recherches sauvegardées'
                : 'Recherche sauvegardée'
            }
            bgColor='primary_lighten'
            textColor='primary_darken'
          />
        </ul>
      </div>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<IndicateursProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }

  return {
    props: {
      idJeune: context.query.jeune_id as string,
      idConseiller: user.id,
      pageTitle: 'Indicateurs',
    },
  }
}

export default withTransaction(Indicateurs.name, 'page')(Indicateurs)
