import React from 'react'

import LienPartageOffre from 'components/offres/LienPartageOffre'
import { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { DataTag } from 'components/ui/Indicateurs/DataTag'
import { DetailImmersion } from 'interfaces/offre'

type ImmersionDetailProps = {
  offre: DetailImmersion
}

export default function ImmersionDetail({ offre }: ImmersionDetailProps) {
  return (
    <div className='max-w-2xl mx-auto'>
      <div className='flex justify-end'>
        <LienPartageOffre
          titreOffre={offre.titre}
          href={`/offres/immersion/${offre.id}/partage`}
          style={ButtonStyle.PRIMARY}
        />
      </div>
      <h2 className='text-l-bold text-primary'>{offre.titre}</h2>

      <section aria-labelledby='heading-info' className='mt-6'>
        <h3 id='heading-info' className='sr-only'>
          Informations de l&apos;offre
        </h3>

        <dl>
          <dt className='sr-only'>Établissement</dt>
          <dd>{offre.nomEtablissement}</dd>

          <dt className='sr-only'>Secteur d’activité</dt>
          <dd className='mt-6'>
            <DataTag text={offre.secteurActivite} />
          </dd>

          <dt className='sr-only'>Ville</dt>
          <dd className='mt-2'>
            <DataTag text={offre.ville} iconName={IconName.Location} />
          </dd>
        </dl>

        <p className='mt-8'>
          Cette entreprise peut recruter sur ce métier et être intéressée pour
          vous vous recevoir en immersion. Contactez-la en expliquant votre
          projet professionnel et vos motivations.
        </p>
        <p className='mt-2'>
          Si l’entreprise est d’accord pour vous accueillir :
        </p>
        <ul className='mt-2 list-disc list-inside'>
          <li>Prévenez votre conseiller</li>
          <li>Remplissez une convention d’immersion avec lui</li>
        </ul>
      </section>

      <section aria-labelledby='heading-contact' className='mt-8'>
        <h3
          id='heading-contact'
          className={
            'inline-flex items-center w-full text-m-bold text-grey_800 pb-6 border-b border-solid border-primary_lighten'
          }
        >
          <SectionTitleDot />
          <span className='sr-only'>Informations du </span>Contact
        </h3>

        <dl>
          {(offre.contact.prenom ||
            offre.contact.nom ||
            offre.contact.role) && (
            <div className='mt-8 text-base-bold'>
              <>
                {(offre.contact.prenom || offre.contact.nom) && (
                  <>
                    <dt className='sr-only'>Interlocuteur</dt>
                    <dd>
                      {offre.contact.prenom} {offre.contact.nom}
                    </dd>
                  </>
                )}
                {offre.contact.role && (
                  <>
                    <dt className='sr-only'>Rôle</dt>
                    <dd>{offre.contact.role}</dd>
                  </>
                )}
              </>
            </div>
          )}

          <dt className='sr-only'>Adresse</dt>
          <dd className='mt-8'>{offre.contact.adresse}</dd>

          {offre.contact.email && (
            <>
              <dt className='sr-only'>E-mail</dt>
              <dd className='mt-8'>{offre.contact.email}</dd>
            </>
          )}
          {offre.contact.telephone && (
            <>
              <dt className='sr-only'>Téléphone</dt>
              <dd className='mt-8'>{offre.contact.telephone}</dd>
            </>
          )}
        </dl>
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
