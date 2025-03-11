import { DateTime } from 'luxon'
import Link from 'next/link'
import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'
import TileIndicateur from 'components/ui/TileIndicateur'
import { IndicateursSemaine, MetadonneesFavoris } from 'interfaces/beneficiaire'
import { toShortDate } from 'utils/date'

export function BlocIndicateurs({
  debutSemaine,
  finSemaine,
  indicateursSemaine,
  idBeneficiaire,
  pathPrefix,
  metadonneesFavoris,
}: {
  debutSemaine: DateTime
  finSemaine: DateTime
  indicateursSemaine: IndicateursSemaine
  idBeneficiaire: string
  pathPrefix: string
  metadonneesFavoris?: MetadonneesFavoris
}) {
  return (
    <>
      <h2 className='text-m-bold text-grey_800 mb-6'>
        Semaine du {toShortDate(debutSemaine)} au {toShortDate(finSemaine)}
      </h2>
      <IndicateursActions
        actions={indicateursSemaine.actions}
        idBeneficiaire={idBeneficiaire}
        pathPrefix={pathPrefix}
      />
      <IndicateursRendezvous rendezVous={indicateursSemaine.rendezVous} />
      <IndicateursOffres
        offres={indicateursSemaine.offres}
        favoris={indicateursSemaine.favoris}
        idBeneficiaire={idBeneficiaire}
        pathPrefix={pathPrefix}
        metadonneesFavoris={metadonneesFavoris}
      />
    </>
  )
}

interface IndicateursActionsProps extends Pick<IndicateursSemaine, 'actions'> {
  idBeneficiaire: string
  pathPrefix: string
}
function IndicateursActions({
  actions,
  idBeneficiaire,
  pathPrefix,
}: IndicateursActionsProps) {
  return (
    <div className='border border-solid rounded-base w-full p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les actions</h3>
      <ul className='flex flex-wrap gap-2'>
        <TileIndicateur
          valeur={actions?.creees.toString() ?? '-'}
          label={actions?.creees !== 1 ? 'Créées' : 'Créée'}
          color='PRIMARY'
        />
        <TileIndicateur
          valeur={actions?.enRetard.toString() ?? '-'}
          label='En retard'
          color='ALERT'
          iconName={IconName.Error}
        />
        <TileIndicateur
          valeur={actions?.terminees.toString() ?? '-'}
          label={actions?.terminees !== 1 ? 'Terminées' : 'Terminée'}
          color='ACCENT_2'
          iconName={IconName.CheckCircleFill}
        />
        <TileIndicateur
          valeur={actions?.aEcheance.toString() ?? '-'}
          label='Échéance cette semaine'
          color='PRIMARY'
        />
      </ul>
      <LienVersActions
        idBeneficiaire={idBeneficiaire}
        pathPrefix={pathPrefix}
      />
    </div>
  )
}

function IndicateursRendezvous({
  rendezVous,
}: Pick<IndicateursSemaine, 'rendezVous'>) {
  return (
    <div className='border border-solid rounded-base w-full mt-6 p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les événements</h3>
      <ul className='flex'>
        <TileIndicateur
          valeur={rendezVous?.toString() ?? '-'}
          label='Cette semaine'
          color='PRIMARY'
        />
      </ul>
    </div>
  )
}
interface IndicateursOffresProps
  extends Pick<IndicateursSemaine, 'offres' | 'favoris'> {
  idBeneficiaire: string
  pathPrefix: string
  metadonneesFavoris?: MetadonneesFavoris
}

function IndicateursOffres({
  offres,
  favoris,
  idBeneficiaire,
  pathPrefix,
  metadonneesFavoris,
}: IndicateursOffresProps) {
  return (
    <div className='border border-solid rounded-base w-full mt-6 p-4 border-grey_100'>
      <h3 className='text-m-bold text-content_color mb-4'>Les offres</h3>
      <ul className='flex flex-wrap gap-2'>
        <TileIndicateur
          valeur={offres?.consultees.toString() ?? '-'}
          label={
            offres?.consultees !== 1 ? 'Offres consultées' : 'Offre consultée'
          }
          color='PRIMARY'
        />
        <TileIndicateur
          valeur={favoris?.offresSauvegardees.toString() ?? '-'}
          label={
            favoris?.offresSauvegardees !== 1
              ? 'Favoris ajoutés'
              : 'Favori ajouté'
          }
          color='PRIMARY'
        />
        <TileIndicateur
          valeur={offres?.partagees.toString() ?? '-'}
          label={
            offres?.partagees !== 1 ? 'Offres partagées' : 'Offre partagée'
          }
          color='PRIMARY'
        />
        <TileIndicateur
          valeur={favoris?.recherchesSauvegardees.toString() ?? '-'}
          label={
            favoris?.recherchesSauvegardees !== 1
              ? 'Recherches sauvegardées'
              : 'Recherche sauvegardée'
          }
          color='PRIMARY'
        />
      </ul>
      {metadonneesFavoris?.autoriseLePartage && (
        <LienVersFavoris
          idBeneficiaire={idBeneficiaire}
          pathPrefix={pathPrefix}
        />
      )}
    </div>
  )
}

function LienVersActions({
  idBeneficiaire,
  pathPrefix,
}: {
  idBeneficiaire?: string
  pathPrefix: string
}) {
  return (
    <div className='flex justify-end mt-4'>
      <Link
        href={`${pathPrefix}/${idBeneficiaire}?onglet=actions`}
        className='flex float-right items-center text-content_color underline hover:text-primary hover:fill-primary'
      >
        Voir toutes les actions
        <IconComponent
          name={IconName.ChevronRight}
          className='w-4 h-5 fill-[inherit]'
          aria-hidden={true}
          focusable={false}
        />
      </Link>
    </div>
  )
}

export function LienVersFavoris({
  idBeneficiaire,
  pathPrefix,
}: {
  idBeneficiaire: string
  pathPrefix: string
}) {
  return (
    <div className='flex justify-end mt-4'>
      <Link
        href={`${pathPrefix}/${idBeneficiaire}/favoris`}
        className='flex items-center text-content_color underline hover:text-primary hover:fill-primary'
      >
        Voir tous les favoris
        <IconComponent
          name={IconName.ChevronRight}
          className='w-4 h-5 fill-[inherit]'
          aria-hidden={true}
          focusable={false}
        />
      </Link>
    </div>
  )
}
