import { DateTime } from 'luxon'
import React from 'react'

import LienPartageOffre from 'components/offres/LienPartageOffre'
import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { DetailOffreEmploi, TypeOffre } from 'interfaces/offre'
import { toFrenchFormat, WEEKDAY_MONTH_LONG } from 'utils/date'

type DetailOffreEmploiProps = {
  offre: DetailOffreEmploi
  onLienExterne: (label: string) => void
}

export default function OffreEmploiDetail({
  offre,
  onLienExterne,
}: DetailOffreEmploiProps) {
  const dateActualisation: string | undefined =
    offre.dateActualisation &&
    toFrenchFormat(
      DateTime.fromISO(offre.dateActualisation),
      WEEKDAY_MONTH_LONG
    )

  const infoEntrepriseSrOnly =
    Boolean(offre.infoEntreprise) &&
    !Boolean(offre.infoEntreprise?.lien || offre.infoEntreprise?.detail)

  const sectionTitleStyle =
    'inline-flex items-center w-full text-m-bold pb-6 border-b border-solid border-primary_lighten'
  const dtStyle = 'mt-6 text-base-bold'
  const ddStyle =
    'mt-4 text-s-regular pb-4 border-b border-solid border-primary_lighten'
  const ulStyle = 'list-disc list-inside'
  const liStyle = 'mb-4 last:mb-0'

  return (
    <div className='max-w-2xl mx-auto'>
      <div className='flex justify-between items-center'>
        <p className='text-s-regular'>
          {dateActualisation ? 'Actualisée le ' + dateActualisation : ''}
        </p>
        {offre.type === TypeOffre.EMPLOI && (
          <LienPartageOffre
            titreOffre={offre.titre}
            href={`/offres/emploi/${offre.id}/partage`}
            style={ButtonStyle.PRIMARY}
          />
        )}
      </div>
      <h2 className='text-l-bold text-primary'>{offre.titre}</h2>

      <section aria-labelledby='heading-info' className='mt-6'>
        <h3 id='heading-info' className='sr-only'>
          Informations de l&apos;offre
        </h3>

        <dl>
          {offre.nomEntreprise && (
            <>
              <dt className='sr-only'>Entreprise</dt>
              <dd>{offre.nomEntreprise}</dd>
            </>
          )}

          {offre.localisation && (
            <>
              <dt className='sr-only'>Localisation</dt>
              <dd className='mt-6'>
                <DataTag
                  text={offre.localisation}
                  iconName={IconName.Location}
                />
              </dd>
            </>
          )}

          <dt className='sr-only'>Type de contrat</dt>
          <dd className='mt-2'>
            <DataTag
              text={offre.typeContratLibelle}
              iconName={IconName.Contrat}
            />
          </dd>

          {offre.salaire && (
            <>
              <dt className='sr-only'>Salaire</dt>
              <dd className='mt-2'>
                <DataTag text={offre.salaire} iconName={IconName.Euro} />
              </dd>
            </>
          )}

          {offre.horaires && (
            <>
              <dt className='sr-only'>Horaires</dt>
              <dd className='mt-2'>
                <DataTag text={offre.horaires} iconName={IconName.Clock} />
              </dd>
            </>
          )}
        </dl>
      </section>

      <section aria-labelledby='heading-detail' className='mt-8'>
        <h3 id='heading-detail' className={sectionTitleStyle}>
          <SectionTitleDot />
          Détail de l’offre
        </h3>

        {offre.description && (
          <p className={`${ddStyle} whitespace-pre-wrap`}>
            {offre.description}
          </p>
        )}
        {offre.urlPostulation && (
          <p className={`${ddStyle} text-primary hover:text-primary_darken`}>
            <ExternalLink
              href={offre.urlPostulation}
              label="Voir l'offre détaillée"
              onClick={() => onLienExterne('Lien Offre externe')}
            />
          </p>
        )}
      </section>

      <section aria-labelledby='heading-profil' className='mt-6'>
        <h3 id='heading-profil' className={sectionTitleStyle}>
          <SectionTitleDot />
          Profil souhaité
        </h3>

        <dl>
          {offre.experience && (
            <>
              <dt className={dtStyle}>Expériences</dt>
              <dd className={`${ddStyle} flex`}>
                {offre.experience.libelle}
                {offre.experience.exigee && (
                  <IconComponent
                    name={IconName.Important}
                    title='Expérience exigée'
                    aria-label='Expérience exigée'
                    focusable={false}
                    aria-hidden={true}
                    className='inline ml-2 h-5 w-5 fill-primary'
                  />
                )}
              </dd>
            </>
          )}

          {offre.competences.length > 0 && (
            <>
              <dt className={dtStyle}>Savoir et savoir faire</dt>
              <dd className={ddStyle}>
                <ul className={ulStyle}>
                  {offre.competences.map((competence) => (
                    <li key={competence} className={liStyle}>
                      {competence}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.competencesProfessionnelles.length > 0 && (
            <>
              <dt className={dtStyle}>Savoir être professionnel</dt>
              <dd className={ddStyle}>
                <ul className={ulStyle}>
                  {offre.competencesProfessionnelles.map((competencePro) => (
                    <li key={competencePro} className={liStyle}>
                      {competencePro}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.formations.length > 0 && (
            <>
              <dt className={dtStyle}>Formation</dt>
              <dd className={ddStyle}>
                <ul className={ulStyle}>
                  {offre.formations.map((formation) => (
                    <li key={formation} className={liStyle}>
                      {formation}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.langues.length > 0 && (
            <>
              <dt className={dtStyle}>Langue</dt>
              <dd className={ddStyle}>
                <ul className={ulStyle}>
                  {offre.langues.map((langue) => (
                    <li key={langue} className={liStyle}>
                      {langue}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}

          {offre.permis.length > 0 && (
            <>
              <dt className={dtStyle}>Permis</dt>
              <dd className={ddStyle}>
                <ul className={ulStyle}>
                  {offre.permis.map((permis) => (
                    <li key={permis} className={liStyle}>
                      {permis}
                    </li>
                  ))}
                </ul>
              </dd>
            </>
          )}
        </dl>
      </section>

      {offre.infoEntreprise && (
        <section
          aria-labelledby='heading-entreprise'
          className={infoEntrepriseSrOnly ? 'sr-only' : 'mt-6'}
        >
          <h3 id='heading-entreprise' className={sectionTitleStyle}>
            <SectionTitleDot />
            <span className='sr-only'>Informations de l&apos;</span>Entreprise
          </h3>

          <dl>
            {offre.infoEntreprise.lien && (
              <>
                <dt className='sr-only'>Lien site</dt>
                <dd className='mt-4 text-base-regular text-primary hover:text-primary_darken'>
                  <ExternalLink
                    href={offre.infoEntreprise.lien}
                    label="Site de l'entreprise"
                    onClick={() => onLienExterne('Lien Site entreprise')}
                  />
                </dd>
              </>
            )}

            {offre.infoEntreprise.adaptee && (
              <>
                <dt className='mt-4'>
                  <DataTag text='Entreprise adaptée' />
                </dt>
                <dd className='sr-only'>OUI</dd>
              </>
            )}

            {offre.infoEntreprise.accessibleTH && (
              <>
                <dt className='mt-4'>
                  <DataTag text='Entreprise handi-bienveillante'></DataTag>
                </dt>
                <dd className='sr-only'>OUI</dd>
              </>
            )}

            {offre.infoEntreprise.detail && (
              <>
                <dt className={dtStyle}>Détail de l&apos;entreprise</dt>
                <dd className='mt-4 text-s-regular whitespace-pre-wrap'>
                  {offre.infoEntreprise.detail}
                </dd>
              </>
            )}
          </dl>
        </section>
      )}
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
