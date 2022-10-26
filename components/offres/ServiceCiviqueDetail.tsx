import { DetailServiceCivique } from 'interfaces/offre'
import LienPartageOffre from 'components/offres/LienPartageOffre'
import { ButtonStyle } from 'components/ui/Button/Button'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import React from 'react'
import { toShortDate } from 'utils/date'

type ServiceCiviqueDetailProps = {
  offre: DetailServiceCivique
  setTrackingMatomo: (label: string) => void
}
export default function ServiceCiviqueDetail({
  offre,
  setTrackingMatomo,
}: ServiceCiviqueDetailProps) {
  const dateDeDebutFormate: string | undefined =
    offre.dateDeDebut && toShortDate(offre.dateDeDebut)

  const dateDeFinFormate: string | undefined =
    offre.dateDeFin && toShortDate(offre.dateDeFin)

  const sectionTitleStyle =
    'inline-flex items-center w-full text-m-bold pb-6 border-b border-solid border-primary_lighten'

  const pStyle = 'mt-4 text-s-regular pb-4 '

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='flex justify-between items-center'>
        <p className='my-2 capitalize'>{offre.domaine}</p>
        <LienPartageOffre
          idOffre={offre.id}
          href={`/offres/service-civique/${offre.id}/partage`}
          style={ButtonStyle.PRIMARY}
        />
      </div>

      <h2 className='text-l-bold text-primary'>{offre.titre}</h2>

      <section aria-labelledby='heading-info' className='mt-6'>
        <h3 id='heading-info' className='sr-only'>
          Informations du service civique
        </h3>

        <dl>
          {offre.organisation && (
            <>
              <dt className='sr-only'>Organisation</dt>
              <dd>{offre.organisation}</dd>
            </>
          )}

          {offre.codeDepartement && (
            <>
              <dt className='sr-only'>Localisation</dt>
              <dd className='mt-6'>
                <DataTag
                  text={`${offre.codeDepartement} - ${offre.ville}`}
                  iconName={IconName.Location}
                />
              </dd>
            </>
          )}

          {offre.dateDeDebut && (
            <>
              <dt className='sr-only'>Date de début</dt>
              <dd className='mt-2'>
                <DataTag
                  text={'Commence le ' + dateDeDebutFormate}
                  iconName={IconName.Calendar}
                />
              </dd>
            </>
          )}

          {offre.dateDeFin && (
            <>
              <dt className='sr-only'>Date de fin</dt>
              <dd className='mt-2'>
                <DataTag
                  text={'Termine le ' + dateDeFinFormate}
                  iconName={IconName.Calendar}
                />
              </dd>
            </>
          )}
        </dl>
      </section>

      <section aria-labelledby='heading-mission' className='mt-6'>
        <h3 id='heading-mission' className={sectionTitleStyle}>
          <SectionTitleDot />
          Mission
        </h3>

        {offre.adresseMission && (
          <p className={pStyle}>
            {offre.adresseMission}, {offre.codePostal} {offre.ville}
          </p>
        )}

        {offre.description && (
          <p className={`${pStyle} whitespace-pre-wrap`}>{offre.description}</p>
        )}

        {offre.lienAnnonce && (
          <p className={`${pStyle} text-primary hover:text-primary_darken`}>
            <ExternalLink
              href={offre.lienAnnonce}
              label='Voir l’offre détaillée'
              onClick={() => setTrackingMatomo('Lien Offre externe')}
            />
          </p>
        )}
      </section>

      <section aria-labelledby='heading-organisation' className='mt-10'>
        <h3 id='heading-organisation' className={sectionTitleStyle}>
          <SectionTitleDot />
          Organisation
        </h3>

        {offre.organisation && <p className={pStyle}>{offre.organisation}</p>}

        {offre.urlOrganisation && (
          <p className={`${pStyle} text-primary hover:text-primary_darken`}>
            <ExternalLink
              href={offre.urlOrganisation}
              label='Site de l’entreprise'
              onClick={() => setTrackingMatomo('Lien Site entreprise')}
            />
          </p>
        )}

        {offre.adresseOrganisation && (
          <p className={pStyle}>{offre.adresseOrganisation}</p>
        )}

        {offre.descriptionOrganisation && (
          <p className={`${pStyle} whitespace-pre-wrap`}>
            {offre.descriptionOrganisation}
          </p>
        )}
      </section>
    </div>
  )
}

function SectionTitleDot() {
  return (
    <IconComponent
      name={IconName.DecorativePoint}
      focusable={false}
      aria-hidden={true}
      className='inline w-2 h-2 fill-primary mr-4'
    />
  )
}
