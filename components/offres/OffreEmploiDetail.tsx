import Image from 'next/image'
import React from 'react'

import IllustrationLogoFT from 'assets/images/logo-ft-full.svg'
import LienPartageOffre from 'components/offres/LienPartageOffre'
import SectionTitleDot from 'components/offres/SectionTitleDot'
import PageActionsPortal from 'components/PageActionsPortal'
import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { utiliseChat } from 'interfaces/conseiller'
import { DetailOffreEmploi, TypeOffre } from 'interfaces/offre'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { toMonthday } from 'utils/date'

type DetailOffreEmploiProps = {
  offre: DetailOffreEmploi
  onLienExterne: (label: string) => void
}

export default function OffreEmploiDetail({
  offre,
  onLienExterne,
}: DetailOffreEmploiProps) {
  const [conseiller] = useConseiller()

  const dateActualisation: string | undefined =
    offre.dateActualisation && toMonthday(offre.dateActualisation)

  const hasDetail = Boolean(offre.description || offre.urlPostulation)
  const hasProfil = Boolean(
    offre.experience ||
      offre.competences.length ||
      offre.competencesProfessionnelles.length ||
      offre.formations.length ||
      offre.langues.length ||
      offre.permis.length
  )
  const hasEntreprise = Boolean(
    offre.infoEntreprise?.lien ||
      offre.infoEntreprise?.adaptee ||
      offre.infoEntreprise?.accessibleTH ||
      offre.infoEntreprise?.detail
  )

  const sectionTitleStyle =
    'inline-flex items-center w-full text-m-bold text-grey_800 pb-6 border-b border-solid border-primary_lighten'
  const dtStyle = 'mt-6 text-base-bold'
  const ddStyle =
    'mt-4 text-s-regular pb-4 border-b border-solid border-primary_lighten'
  const ulStyle = 'list-disc list-inside'
  const liStyle = 'mb-4 last:mb-0'

  const typeOffre =
    offre.type === TypeOffre.ALTERNANCE ? 'alternance' : 'emploi'

  return (
    <>
      {utiliseChat(conseiller) && (
        <PageActionsPortal>
          <LienPartageOffre
            titreOffre={offre.titre}
            href={`/offres/${typeOffre}/${offre.id}/partage`}
            style={ButtonStyle.PRIMARY}
          />
        </PageActionsPortal>
      )}

      <div className='max-w-2xl mx-auto'>
        {offre.origine && (
          <p className='text-s-regular text-grey_800 mb-2 flex items-center gap-2'>
            <LogoOrigine {...offre.origine} />
            Source : {offre.origine.nom}
          </p>
        )}

        {dateActualisation && (
          <p className='text-s-regular text-grey_800 mb-2'>
            Actualisée le {dateActualisation}
          </p>
        )}
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
                    iconName={IconName.LocationOn}
                  />
                </dd>
              </>
            )}

            <dt className='sr-only'>Type de contrat</dt>
            <dd className='mt-2'>
              <DataTag
                text={offre.typeContratLibelle}
                iconName={IconName.Contract}
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
                  <DataTag text={offre.horaires} iconName={IconName.Schedule} />
                </dd>
              </>
            )}
          </dl>
        </section>

        {hasDetail && (
          <section aria-labelledby='heading-detail' className='mt-8'>
            <h3 id='heading-detail' className={sectionTitleStyle}>
              <SectionTitleDot />
              Détail de l’offre
            </h3>

            <dl>
              {offre.description && (
                <>
                  <dt className='sr-only'>Description</dt>
                  <dd className={`${ddStyle} whitespace-pre-wrap`}>
                    {offre.description}
                  </dd>
                </>
              )}
              {offre.urlPostulation && (
                <>
                  <dt className='sr-only'>Lien offre</dt>
                  <dd
                    className={`${ddStyle} text-primary hover:text-primary_darken`}
                  >
                    <ExternalLink
                      href={offre.urlPostulation}
                      label="Voir l'offre détaillée"
                      onClick={() => onLienExterne('Lien Offre externe')}
                    />
                  </dd>
                </>
              )}
            </dl>
          </section>
        )}

        {hasProfil && (
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
                      <>
                        <IconComponent
                          name={IconName.Error}
                          role='img'
                          title='Expérience exigée'
                          aria-labelledby='experience-label'
                          focusable={false}
                          className='inline ml-2 h-5 w-5 fill-primary'
                        />
                        <span id='experience-label' className='sr-only'>
                          Expérience exigée
                        </span>
                      </>
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
                      {offre.competencesProfessionnelles.map(
                        (competencePro) => (
                          <li key={competencePro} className={liStyle}>
                            {competencePro}
                          </li>
                        )
                      )}
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
        )}

        {hasEntreprise && (
          <section aria-labelledby='heading-entreprise' className='mt-6'>
            <h3 id='heading-entreprise' className={sectionTitleStyle}>
              <SectionTitleDot />
              <span className='sr-only'>Informations de l&apos;</span>Entreprise
            </h3>

            <dl>
              {offre.infoEntreprise!.lien && (
                <>
                  <dt className='sr-only'>Lien site</dt>
                  <dd className='mt-4 text-base-regular text-primary hover:text-primary_darken'>
                    <ExternalLink
                      href={offre.infoEntreprise!.lien}
                      label="Site de l'entreprise"
                      onClick={() => onLienExterne('Lien Site entreprise')}
                    />
                  </dd>
                </>
              )}

              {offre.infoEntreprise!.adaptee && (
                <>
                  <dt className='mt-4'>
                    <DataTag text='Entreprise adaptée' />
                  </dt>
                  <dd className='sr-only'>OUI</dd>
                </>
              )}

              {offre.infoEntreprise!.accessibleTH && (
                <>
                  <dt className='mt-4'>
                    <DataTag text='Entreprise handi-bienveillante'></DataTag>
                  </dt>
                  <dd className='sr-only'>OUI</dd>
                </>
              )}

              {offre.infoEntreprise!.detail && (
                <>
                  <dt className={dtStyle}>Détail de l&apos;entreprise</dt>
                  <dd className='mt-4 text-s-regular whitespace-pre-wrap'>
                    {offre.infoEntreprise!.detail}
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

function LogoOrigine({ logo, nom }: { nom: string; logo?: string }) {
  const style = 'p-1 h-10 rounded-base border border-primary_lighten'

  if (nom === 'France Travail')
    return (
      <IllustrationLogoFT
        aria-hidden={true}
        focusable={false}
        className={style}
      />
    )
  else if (!logo) return null
  else
    return (
      <span aria-hidden={true} className={style + ' relative block w-18'}>
        <Image src={logo} alt='' fill={true} className='object-cover' />
      </span>
    )
}
