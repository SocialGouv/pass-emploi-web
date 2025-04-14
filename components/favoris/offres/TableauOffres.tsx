import React, { useEffect, useState } from 'react'

import EmptyState from 'components/EmptyState'
import { IconName } from 'components/ui/IconComponent'
import { IllustrationName } from 'components/ui/IllustrationComponent'
import { TagFavori, TagMetier } from 'components/ui/Indicateurs/Tag'
import SpinningLoader from 'components/ui/SpinningLoader'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TDLink from 'components/ui/Table/TDLink'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { DetailBeneficiaire } from 'interfaces/beneficiaire'
import { Offre } from 'interfaces/favoris'
import { getOffres } from 'services/favoris.service'
import { Periode } from 'types/dates'
import { toLongMonthDate, toShortDate } from 'utils/date'

interface TableauOffresProps {
  beneficiaire: DetailBeneficiaire
  shouldFocus: boolean
  semaine: Periode
  autoriseLePartage?: boolean
}

export default function TableauOffres({
  beneficiaire,
  autoriseLePartage,
  shouldFocus,
  semaine,
}: TableauOffresProps) {
  const [offres, setOffres] = useState<Offre[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(true)

    if (autoriseLePartage) {
      getOffres(beneficiaire.id, semaine)
        .then(setOffres)
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [semaine])

  return (
    <>
      {isLoading && <SpinningLoader />}

      {!isLoading && offres.length === 0 && (
        <EmptyState
          illustrationName={IllustrationName.Checklist}
          shouldFocus={shouldFocus}
          titre={`Aucune offre en favori pour ${beneficiaire.prenom} ${beneficiaire.nom}`}
          sousTitre='Partagez des offres d’emploi, d’alternance, de service civique ou d’immersion à votre bénéficiaire depuis la partie “Offres”.'
          lien={{
            href: '/offres',
            label: 'Rechercher une offre',
            iconName: IconName.Search,
          }}
        />
      )}

      {!isLoading && offres.length > 0 && (
        <Table caption={{ text: 'Liste des offres en favoris' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Type et n° d’offre</TH>
              <TH>Titre</TH>
              <TH>Entreprise</TH>
              <TH>Statut</TH>
              <TH>Voir le détail</TH>
            </TR>
          </thead>
          <tbody>
            {offres.map((offre) => (
              <OffreRow key={offre.id} offre={offre} />
            ))}
          </tbody>
        </Table>
      )}
    </>
  )
}

function OffreRow({ offre }: { offre: Offre }) {
  return (
    <TR>
      <TD>
        <TagMetier
          label={offre.type}
          className='text-primary bg-primary-lighten'
        />
        {offre.id}
      </TD>
      <TD>{offre.titre}</TD>
      <TD>{offre.organisation}</TD>
      <TD>
        <TagFavori aPostule={offre.aPostule} />
        le&nbsp;
        <span aria-label={toLongMonthDate(offre.dateUpdate)}>
          {toShortDate(offre.dateUpdate)}
        </span>
      </TD>
      <TDLink
        href={`/offres/${offre.urlParam}/${offre.id}`}
        labelPrefix={'Ouvrir l’offre '}
      />
    </TR>
  )
}
