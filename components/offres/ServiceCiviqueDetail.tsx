import React from 'react'

import LienPartageOffre from 'components/offres/LienPartageOffre'
import PageActionsPortal from 'components/PageActionsPortal'
import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { utiliseChat } from 'interfaces/conseiller'
import { DetailServiceCivique } from 'interfaces/offre'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toShortDate } from 'utils/date'

type ServiceCiviqueDetailProps = {
  offre: DetailServiceCivique
  onLienExterne: (label: string) => void
}
export default function ServiceCiviqueDetail({
  offre,
  onLienExterne,
}: ServiceCiviqueDetailProps) {
  const [conseiller] = useConseiller()

  const dateDeDebutFormate: string | undefined =
    offre.dateDeDebut && toShortDate(offre.dateDeDebut)
  const dateDeFinFormate: string | undefined =
    offre.dateDeFin && toShortDate(offre.dateDeFin)

  const hasInfo = Boolean(
    offre.organisation ||
      offre.codeDepartement ||
      offre.ville ||
      offre.dateDeDebut ||
      offre.dateDeFin
  )
  const hasAdresse = Boolean(
    offre.adresseMission || offre.codePostal || offre.ville
  )
  const hasDescription = Boolean(
    hasAdresse || offre.description || offre.lienAnnonce
  )
  const hasOrganisation = Boolean(
    offre.organisation ||
      offre.urlOrganisation ||
      offre.adresseOrganisation ||
      offre.descriptionOrganisation
  )

  const sectionTitleStyle =
    'inline-flex items-center w-full text-m-bold text-grey_800 pb-6 border-b border-solid border-primary_lighten'
  const pStyle = 'mt-4 text-s-regular pb-4 '

  return (
    <>
      {utiliseChat(conseiller) && (
        <PageActionsPortal>
          <LienPartageOffre
            titreOffre={offre.titre}
            href={`/offres/service-civique/${offre.id}/partage`}
            style={ButtonStyle.PRIMARY}
          />
        </PageActionsPortal>
      )}

      <div className='max-w-2xl mx-auto'>
        <p className='mb-2'>
          <span className='sr-only'>Domaine : </span>
          <span className='capitalize'>{offre.domaine}</span>
        </p>

        <h2 className='text-l-bold text-primary'>{offre.titre}</h2>

        {hasInfo && (
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

              {(offre.codeDepartement || offre.ville) && (
                <>
                  <dt className='sr-only'>Localisation</dt>
                  <dd className='mt-6'>
                    <DataTag
                      text={`${offre.codeDepartement} - ${offre.ville}`}
                      iconName={IconName.LocationOn}
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
                      iconName={IconName.EventFill}
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
                      iconName={IconName.EventFill}
                    />
                  </dd>
                </>
              )}
            </dl>
          </section>
        )}

        {hasDescription && (
          <section aria-labelledby='heading-mission' className='mt-6'>
            <h3 id='heading-mission' className={sectionTitleStyle}>
              <SectionTitleDot />
              Mission
            </h3>

            <dl>
              {hasAdresse && (
                <>
                  <dt className='sr-only'>Adresse</dt>
                  <dd className={pStyle}>
                    {offre.adresseMission}, {offre.codePostal} {offre.ville}
                  </dd>
                </>
              )}

              {offre.description && (
                <>
                  <dt className='sr-only'>Description</dt>
                  <dd className={`${pStyle} whitespace-pre-wrap`}>
                    {offre.description}
                  </dd>
                </>
              )}

              {offre.lienAnnonce && (
                <>
                  <dt className='sr-only'>Lien offre</dt>
                  <dd
                    className={`${pStyle} text-primary hover:text-primary_darken`}
                  >
                    <ExternalLink
                      href={offre.lienAnnonce}
                      label='Voir l’offre détaillée'
                      onClick={() => onLienExterne('Lien Offre externe')}
                    />
                  </dd>
                </>
              )}
            </dl>
          </section>
        )}

        {hasOrganisation && (
          <section aria-labelledby='heading-organisation' className='mt-10'>
            <h3 id='heading-organisation' className={sectionTitleStyle}>
              <SectionTitleDot />
              Organisation
            </h3>

            <dl>
              {offre.organisation && (
                <>
                  <dt className='sr-only'>Nom</dt>
                  <dd className={pStyle}>{offre.organisation}</dd>
                </>
              )}

              {offre.urlOrganisation && (
                <>
                  <dt className='sr-only'>Lien organisation</dt>
                  <dd
                    className={`${pStyle} text-primary hover:text-primary_darken`}
                  >
                    <ExternalLink
                      href={offre.urlOrganisation}
                      label='Site de l’entreprise'
                      onClick={() => onLienExterne('Lien Site entreprise')}
                    />
                  </dd>
                </>
              )}

              {offre.adresseOrganisation && (
                <>
                  <dt className='sr-only'>Adresse</dt>
                  <dd className={pStyle}>{offre.adresseOrganisation}</dd>
                </>
              )}

              {offre.descriptionOrganisation && (
                <>
                  <dt className='sr-only'>Description</dt>
                  <dd className={`${pStyle} whitespace-pre-wrap`}>
                    {offre.descriptionOrganisation}
                  </dd>
                </>
              )}
            </dl>
          </section>
        )}
      </div>
    </>
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
