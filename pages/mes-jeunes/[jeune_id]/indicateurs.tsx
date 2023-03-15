import { withTransaction } from '@elastic/apm-rum-react'
import { DateTime } from 'luxon'
import { GetServerSideProps } from 'next'
import React, { useEffect, useMemo, useState } from 'react'

import { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { StructureConseiller } from 'interfaces/conseiller'
import { IndicateursSemaine } from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toFrenchString } from 'utils/date'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type IndicateursProps = PageProps & {
  idJeune: string
  lectureSeule: boolean
}

function Indicateurs({ idJeune, lectureSeule }: IndicateursProps) {
  const jeunesService = useDependance<JeunesService>('jeunesService')
  const [conseiller] = useConseiller()

  const [indicateursSemaine, setIndicateursSemaine] = useState<
    IndicateursSemaine | undefined
  >()

  const aujourdHui = useMemo(() => DateTime.now(), [])
  const debutSemaine = useMemo(() => aujourdHui.startOf('week'), [aujourdHui])
  const finSemaine = useMemo(() => aujourdHui.endOf('week'), [aujourdHui])

  // On récupère les indicateurs ici parce qu'on a besoin de la timezone du navigateur
  useEffect(() => {
    if (!indicateursSemaine) {
      jeunesService
        .getIndicateursJeuneComplets(
          conseiller.id,
          idJeune,
          debutSemaine,
          finSemaine
        )
        .then(setIndicateursSemaine)
    }
  }, [idJeune, debutSemaine, finSemaine, indicateursSemaine, jeunesService])

  const tracking = `Détail jeune – Indicateurs${
    lectureSeule ? ' - hors portefeuille' : ''
  }`
  useMatomo(tracking)

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
          iconName={IconName.ImportantOutline}
        />
        <TileIndicateur
          valeur={actions?.terminees.toString() ?? '-'}
          label={actions?.terminees !== 1 ? 'Terminées' : 'Terminée'}
          bgColor='accent_2_lighten'
          textColor='accent_2'
          iconName={IconName.RoundedCheck}
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

export const getServerSideProps: GetServerSideProps<IndicateursProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')

  const {
    session: { accessToken, user },
  } = sessionOrRedirect
  if (user.structure === StructureConseiller.POLE_EMPLOI) {
    return { notFound: true }
  }

  const idBeneficiaire = context.query.jeune_id as string

  const beneficiaire = await jeunesService.getJeuneDetails(
    idBeneficiaire,
    accessToken
  )

  if (!beneficiaire) {
    return { notFound: true }
  }

  const lectureSeule = beneficiaire.idConseiller !== user.id

  return {
    props: {
      idJeune: context.query.jeune_id as string,
      lectureSeule,
      pageTitle: `${
        lectureSeule ? 'Etablissement' : 'Portefeuille'
      } - Bénéficiaire - Indicateurs`,
      pageHeader: 'Indicateurs',
    },
  }
}

export default withTransaction(Indicateurs.name, 'page')(Indicateurs)
