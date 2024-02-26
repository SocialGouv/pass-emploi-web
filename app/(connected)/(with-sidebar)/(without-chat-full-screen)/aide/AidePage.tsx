'use client'

import Image from 'next/image'
import React from 'react'

import avecNosRessourcesImage from 'assets/images/avec_nos_ressources.jpg'
import avecNosRessourcesImageBRSA from 'assets/images/avec_nos_ressources_brsa.jpg'
import QrcodeAppStore from 'assets/images/qrcode_app_store.svg'
import QrcodeAppStoreBRSA from 'assets/images/qrcode_brsa_app_store.svg'
import QrcodePlayStoreBRSA from 'assets/images/qrcode_brsa_play_store.svg'
import QrcodePlayStore from 'assets/images/qrcode_play_store.svg'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import {
  estMilo,
  estPoleEmploi,
  estPoleEmploiBRSA,
  StructureConseiller,
} from 'interfaces/conseiller'
import { trackPage } from 'utils/analytics/matomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'

export default function AidePage() {
  const [conseiller] = useConseiller()

  const conseillerEstBRSA = estPoleEmploiBRSA(conseiller)

  const urlSiteRessource = (() => {
    switch (conseiller.structure) {
      case StructureConseiller.MILO:
        return process.env.NEXT_PUBLIC_FAQ_MILO_EXTERNAL_LINK as string
      case StructureConseiller.POLE_EMPLOI:
        return process.env.NEXT_PUBLIC_FAQ_PE_EXTERNAL_LINK as string
      case StructureConseiller.POLE_EMPLOI_BRSA:
        return process.env.NEXT_PUBLIC_FAQ_PE_BRSA_EXTERNAL_LINK as string
    }
  })()

  const urlNousContacter = estMilo(conseiller)
    ? urlSiteRessource + 'assistance/'
    : urlSiteRessource + 'formuler-une-demande/'

  const urlClubsTestsUtilisateurs =
    urlSiteRessource + 'club-utilisateur-et-demandes-devolution/'

  const urlEmbarquerBeneficiaires = urlSiteRessource + 'embarquer-vos-jeunes/'

  const urlGuideRessources =
    urlSiteRessource + 'ressources-documentaires/guides-dutilisation/'

  const urlVideos = urlSiteRessource + 'videos/'

  const urlFAQ = urlSiteRessource + 'faq/'

  async function trackAide() {
    trackPage({ structure: conseiller.structure, customTitle: 'Aide' })
  }

  return (
    <>
      <h2 className='text-l-bold text-primary mb-8'>
        Découvrez notre site ressources, conçu spécialement pour vous guider pas
        à pas
      </h2>
      <ExternalLink
        label='Voir le site ressources'
        href={urlSiteRessource!}
        onClick={trackAide}
      />
      <section>
        <h3 className='text-m-bold my-8'>
          Partagez vos remarques ou suggestions
        </h3>
        <div className='flex gap-4 mb-16'>
          <div className='bg-primary_lighten rounded-base flex flex-col w-1/2 px-16 py-4'>
            <IllustrationComponent
              name={IllustrationName.Question}
              className='w-24 self-center fill-primary'
            />
            <p className='text-m-bold mb-2'>
              Faire une demande ou poser une question au support ?
            </p>
            <p>Nous sommes à votre disposition pour : </p>
            <ul>
              <li>Répondre à vos questions</li>
              <li>Collecter vos retours utilisateurs</li>

              {(estPoleEmploi(conseiller) || conseillerEstBRSA) && (
                <li>
                  Vous aider dans la gestion de vos modules de réaffectation
                </li>
              )}
            </ul>
            <ButtonLink
              href={urlNousContacter}
              style={ButtonStyle.PRIMARY}
              externalLink={true}
              className='mt-8 w-fit self-center'
              label='Nous contacter'
            />
          </div>
          <div className='bg-primary_lighten rounded-base flex flex-col w-1/2 px-16 py-4'>
            <IllustrationComponent
              name={IllustrationName.Forum}
              className='w-24 self-center fill-primary'
            />
            <p className='text-m-bold mb-2'>
              Les clubs et les tests utilisateurs
            </p>
            <p>
              Co-construisons ensemble une application qui répond à vos besoins
              lors des clubs et tests utilisateurs.
            </p>
            <ButtonLink
              href={urlClubsTestsUtilisateurs}
              style={ButtonStyle.PRIMARY}
              externalLink={true}
              label='En savoir plus'
              className='mt-8 w-fit self-center'
            />
          </div>
        </div>
      </section>
      <section className='mb-16'>
        <h3 className='text-m-bold mb-8'>
          Embarquez facilement vos bénéficiaires{' '}
        </h3>
        <div className='flex border border-grey_100 rounded-base py-8'>
          <div className='flex flex-col w-1/2 px-16  border-r border-grey_100'>
            <p className='text-m-bold mb-2'>Avec nos ressources</p>
            <div className='flex gap-16'>
              <div className='flex flex-col justify-between'>
                <p>
                  Retrouvez toutes les ressources vidéos, guide, flyers pour
                  aider votre bénéficiaire à prendre en main l’application{' '}
                  {conseillerEstBRSA ? 'pass emploi' : 'du CEJ'}
                </p>
                <ButtonLink
                  href={urlEmbarquerBeneficiaires}
                  style={ButtonStyle.PRIMARY}
                  externalLink={true}
                  label='Voir les ressources'
                  className='mt-8 w-fit'
                />
              </div>
              <Image
                src={
                  conseillerEstBRSA
                    ? avecNosRessourcesImageBRSA
                    : avecNosRessourcesImage
                }
                alt=''
                aria-hidden={true}
                className='w-1/3'
              />
            </div>
          </div>
          <div className='flex flex-col w-1/2 px-16 border-r border-grey_100'>
            <p className='text-m-bold mb-2'>
              Avec le mode démo {conseillerEstBRSA ? 'pass emploi' : 'du CEJ'}
            </p>
            <div className='flex gap-16'>
              <div className='flex flex-col justify-between'>
                <p className='mb-2'>
                  Il vous permet de visualiser l’application{' '}
                  {conseillerEstBRSA ? 'pass emploi' : 'du CEJ'} utilisée par
                  vos bénéficiaires.
                </p>
                <p className='mb-2'>
                  Pour accéder au mode démo, vous devez télécharger
                  l’application sur le store de votre choix puis{' '}
                  <strong>appuyer 3 fois</strong> sur le logo ”
                  {conseillerEstBRSA
                    ? 'pass emploi'
                    : 'Contrat d’Engagement Jeune'}
                  ” sur l’écran de connexion.
                </p>
                <p className='mb-2'>
                  L’application est disponible sur les stores
                </p>
              </div>
            </div>
            <div className='flex gap-4'>
              {!conseillerEstBRSA && (
                <>
                  <div>
                    <QrcodeAppStore
                      focusable={false}
                      aria-label='QR code à scanner pour télécharger l’application sur l’App Store'
                      role='img'
                    />
                    <p className='text-s-bold text-center'>App Store</p>
                  </div>
                  <div>
                    <QrcodePlayStore
                      focusable={false}
                      aria-label='QR code à scanner pour télécharger l’application sur Google Play'
                      role='img'
                    />
                    <p className='text-s-bold text-center'>Play Store</p>
                  </div>
                </>
              )}

              {conseillerEstBRSA && (
                <>
                  <div>
                    <QrcodeAppStoreBRSA
                      focusable={false}
                      aria-label='QR code à scanner pour télécharger l’application sur l’App Store'
                      role='img'
                    />
                    <p className='text-s-bold text-center'>App Store</p>
                  </div>
                  <div>
                    <QrcodePlayStoreBRSA
                      focusable={false}
                      aria-label='QR code à scanner pour télécharger l’application sur Google Play'
                      role='img'
                    />
                    <p className='text-s-bold text-center'>Play Store</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
      <section>
        <h3 className='text-m-bold mb-8'>
          Consultez nos ressources pour vous aider
        </h3>
        <div className='flex gap-4'>
          <div className='flex flex-col w-1/3 border border-grey_100 rounded-base py-8 px-16 justify-between'>
            <div className='flex flex-col'>
              <p className='text-m-bold mb-2'>Notre guide d’utilisation</p>
              <p>
                Approfondissez votre compréhension de l’application et découvrez
                les meilleures façons de l’utiliser.
              </p>
            </div>
            <ButtonLink
              href={urlGuideRessources}
              style={ButtonStyle.PRIMARY}
              externalLink={true}
              label='Voir le guide'
              className='mt-8 w-fit self-center'
            />
          </div>
          <div className='flex flex-col w-1/3 border border-grey_100 rounded-base py-8 px-16 justify-between'>
            <div className='flex flex-col'>
              <p className='text-m-bold mb-2'>Nos tutoriels vidéo</p>
              <p>
                Découvrez les différentes fonctionnalités de l’application à
                travers des vidéos explicatives
              </p>
            </div>
            <ButtonLink
              href={urlVideos}
              style={ButtonStyle.PRIMARY}
              externalLink={true}
              label='Voir les vidéos'
              className='mt-8 w-fit self-center'
            />
          </div>
          <div className='flex flex-col w-1/3 border border-grey_100 rounded-base py-8 px-16 justify-between'>
            <div className='flex flex-col'>
              <p className='text-m-bold mb-2'>Notre Foire aux questions</p>
              <p>Trouvez des réponses immédiates aux questions fréquentes.</p>
            </div>
            <ButtonLink
              href={urlFAQ}
              style={ButtonStyle.PRIMARY}
              externalLink={true}
              label='Voir les FAQ'
              className='mt-8 w-fit self-center'
            />
          </div>
        </div>
      </section>
    </>
  )
}
