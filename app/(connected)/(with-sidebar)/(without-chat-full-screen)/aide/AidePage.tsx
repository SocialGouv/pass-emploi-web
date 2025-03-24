'use client'

import Image from 'next/image'
import React from 'react'

import avecNosRessourcesImage from 'assets/images/avec_nos_ressources.webp'
import avecNosRessourcesImagePassEmploi from 'assets/images/avec_nos_ressources_pass-emploi.webp'
import QrcodeAppStoreCEJ from 'assets/images/qrcode_app_store.svg'
import QrcodeAppStorePassEmploi from 'assets/images/qrcode_passemploi_app_store.svg'
import QrcodePlayStorePassEmploi from 'assets/images/qrcode_passemploi_play_store.svg'
import QrcodePlayStoreCEJ from 'assets/images/qrcode_play_store.svg'
import { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import IllustrationComponent, {
  IllustrationName,
} from 'components/ui/IllustrationComponent'
import ExternalLink from 'components/ui/Navigation/ExternalLink'
import {
  estMilo,
  estPassEmploi,
  getUrlFormulaireSupport,
  getUrlSiteRessource,
} from 'interfaces/structure'
import { trackEvent } from 'utils/analytics/matomo'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

export default function AidePage() {
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()

  const conseillerEstPassEmploi = estPassEmploi(conseiller.structure)
  const aDesBeneficiaires = portefeuille.length > 0

  const QrcodeAppStore = conseillerEstPassEmploi
    ? QrcodeAppStorePassEmploi
    : QrcodeAppStoreCEJ
  const QrcodePlayStore = conseillerEstPassEmploi
    ? QrcodePlayStorePassEmploi
    : QrcodePlayStoreCEJ

  const urlQrcodeAppStore = conseillerEstPassEmploi
    ? process.env.NEXT_PUBLIC_APP_STORE_PASS_EMPLOI
    : process.env.NEXT_PUBLIC_APP_STORE_CEJ

  const urlQrcodePlayStore = conseillerEstPassEmploi
    ? process.env.NEXT_PUBLIC_PLAY_STORE_PASS_EMPLOI
    : process.env.NEXT_PUBLIC_PLAY_STORE_CEJ

  const urlSiteRessource = getUrlSiteRessource(conseiller.structure)
  const urlFormulaireSupport = getUrlFormulaireSupport(conseiller.structure)

  const urlClubsTestsUtilisateurs = `${urlSiteRessource}${conseillerEstPassEmploi ? 'club-utilisateur/' : 'club-utilisateur-et-demandes-devolution/'}`

  const urlEmbarquerBeneficiaires = `${urlSiteRessource}${
    conseillerEstPassEmploi
      ? 'embarquer-vos-beneficiaires/'
      : 'embarquer-vos-jeunes/'
  }`

  const urlGuideRessources = `${urlSiteRessource}${
    conseillerEstPassEmploi
      ? 'guide-dutilisation/'
      : 'ressources-documentaires/guides-dutilisation/'
  }`

  const urlVideos = urlSiteRessource + 'videos/'

  const urlFAQ = `${urlSiteRessource}${conseillerEstPassEmploi ? 'foire-aux-questions/' : 'faq/'}`

  async function trackEventAideEtRessources(action: string) {
    trackEvent({
      structure: conseiller.structure,
      categorie: 'Aide et ressources',
      action: action,
      nom: '',
      aDesBeneficiaires,
    })
  }

  useMatomo('Aide et ressources', aDesBeneficiaires)

  return (
    <>
      <h2 className='text-l-bold text-primary mb-8'>
        Découvrez notre site ressources, conçu spécialement pour vous guider pas
        à pas
      </h2>
      <div className='text-primary hover:text-primary-darken'>
        <ExternalLink
          label='Voir le site ressources'
          href={urlSiteRessource}
          onClick={() => trackEventAideEtRessources('Voir le site ressources')}
        />
      </div>
      <section>
        <h3 className='text-m-bold my-8'>
          Partagez vos remarques ou suggestions
        </h3>
        <ul className='flex flex-col mb-16 w-full layout-m:flex-row gap-4'>
          <li className='bg-primary-lighten rounded-base flex flex-col w-full px-16 py-4'>
            <IllustrationComponent
              name={IllustrationName.Question}
              className='w-24 h-24 self-center fill-primary [--secondary-fill:var(--color-white)]'
              aria-hidden={true}
            />
            <h4 className='text-m-bold mb-2'>
              Faire une demande ou poser une question au support ?
            </h4>
            <p>Nous sommes à votre disposition pour : </p>
            <ul className='list-disc'>
              <li>Répondre à vos questions</li>
              <li>Collecter vos retours utilisateurs</li>

              {!estMilo(conseiller.structure) && (
                <li>Vous aider dans la réaffectation de vos bénéficiaires</li>
              )}
            </ul>
            <ButtonLink
              href={urlFormulaireSupport}
              style={ButtonStyle.PRIMARY}
              externalIcon={IconName.OpenInNew}
              className='mt-8 w-fit self-center'
              label='Nous contacter'
              onClick={() => trackEventAideEtRessources('Demande support')}
            />
          </li>
          <li className='bg-primary-lighten rounded-base flex flex-col w-full px-16 py-4'>
            <IllustrationComponent
              name={IllustrationName.Forum}
              className='w-24 h-24 self-center fill-primary [--secondary-fill:var(--color-white)]'
              aria-hidden={true}
            />
            <h4 className='text-m-bold mb-2'>
              Les clubs et les tests utilisateurs
            </h4>
            <p>
              Co-construisons ensemble une application qui répond à vos besoins
              lors des clubs et tests utilisateurs.
            </p>
            <ButtonLink
              href={urlClubsTestsUtilisateurs}
              style={ButtonStyle.PRIMARY}
              externalIcon={IconName.OpenInNew}
              label='En savoir plus'
              className='mt-8 w-fit self-center'
              onClick={() =>
                trackEventAideEtRessources('Info club utilisateur')
              }
            />
          </li>
        </ul>
      </section>
      <section className='mb-16'>
        <h3 className='text-m-bold mb-8'>
          Embarquez facilement vos bénéficiaires
        </h3>
        <ul className='flex flex-col layout-m:flex-row gap-4 border border-grey-100 rounded-base py-8'>
          <li className='flex flex-col w-full px-16 py-4 border-r border-grey-100'>
            <h4 className='text-m-bold mb-2'>Avec nos ressources</h4>
            <div className='flex gap-16'>
              <div className='flex flex-col justify-between'>
                <p>
                  Retrouvez toutes les ressources vidéos, guide, flyers, pour
                  aider votre bénéficiaire à prendre en main l’application{' '}
                  {conseillerEstPassEmploi ? 'pass emploi' : 'du CEJ'}
                </p>
                <ButtonLink
                  href={urlEmbarquerBeneficiaires}
                  style={ButtonStyle.PRIMARY}
                  externalIcon={IconName.OpenInNew}
                  label='Voir les ressources'
                  className='mt-8 w-fit'
                  onClick={() =>
                    trackEventAideEtRessources(
                      'Ressources pour les bénéficiaires'
                    )
                  }
                />
              </div>
              <Image
                src={
                  conseillerEstPassEmploi
                    ? avecNosRessourcesImagePassEmploi
                    : avecNosRessourcesImage
                }
                alt=''
                aria-hidden={true}
                className='w-1/3 object-contain'
              />
            </div>
          </li>
          <li className='flex flex-col w-full px-16 py-4'>
            <h4 className='text-m-bold mb-2'>
              Avec le mode démo{' '}
              {conseillerEstPassEmploi ? 'pass emploi' : 'du CEJ'}
            </h4>
            <div className='flex gap-16'>
              <div className='flex flex-col justify-between'>
                <p className='mb-2'>
                  Il vous permet de visualiser l’application{' '}
                  {conseillerEstPassEmploi ? 'pass emploi' : 'du CEJ'} utilisée
                  par vos bénéficiaires.
                </p>
                <p className='mb-2'>
                  Pour accéder au mode démo, vous devez télécharger
                  l’application sur le store de votre choix puis{' '}
                  <strong>appuyer 3 fois sur le logo</strong> ”
                  {conseillerEstPassEmploi
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
              <div>
                <QrcodeAppStore focusable={false} aria-hidden={true} />
                <a
                  href={urlQrcodeAppStore}
                  className='text-center text-primary underline inline-flex items-center hover:text-primary-darken'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <span className='sr-only'>
                    Télécharger l’application sur l’
                  </span>
                  App Store
                  <IconComponent
                    name={IconName.OpenInNew}
                    className='ml-1.5 w-4 h-4 fill-current'
                    focusable={false}
                    aria-hidden={true}
                  />
                  <span className='sr-only'>(nouvelle fenêtre)</span>
                </a>
              </div>
              <div>
                <QrcodePlayStore focusable={false} aria-hidden={true} />
                <a
                  href={urlQrcodePlayStore}
                  className='text-center text-primary underline inline-flex items-center hover:text-primary-darken'
                  target='_blank'
                  rel='noreferrer noopener'
                >
                  <span className='sr-only'>
                    Télécharger l’application sur le
                  </span>
                  Play Store
                  <IconComponent
                    name={IconName.OpenInNew}
                    className='ml-1.5 w-4 h-4 fill-current'
                    focusable={false}
                    aria-hidden={true}
                  />
                  <span className='sr-only'>(nouvelle fenêtre)</span>
                </a>
              </div>
            </div>
          </li>
        </ul>
      </section>
      <section>
        <h3 className='text-m-bold mb-8'>
          Consultez nos ressources pour vous aider
        </h3>
        <ul className='flex flex-col layout-m:flex-row gap-4'>
          <li className='flex flex-col w-full border border-grey-100 rounded-base py-8 px-16 justify-between'>
            <div className='flex flex-col'>
              <h4 className='text-m-bold mb-2'>Notre guide d’utilisation</h4>
              <p>
                Approfondissez votre compréhension de l’application et découvrez
                les meilleures façons de l’utiliser.
              </p>
            </div>
            <ButtonLink
              href={urlGuideRessources}
              style={ButtonStyle.PRIMARY}
              externalIcon={IconName.OpenInNew}
              label='Voir le guide'
              className='mt-8 w-fit self-center'
              onClick={() =>
                trackEventAideEtRessources('Voir le guide d’utilisation')
              }
            />
          </li>
          <li className='flex flex-col w-full border border-grey-100 rounded-base py-8 px-16 justify-between'>
            <div className='flex flex-col'>
              <h4 className='text-m-bold mb-2'>Nos tutoriels vidéo</h4>
              <p>
                Découvrez les différentes fonctionnalités de l’application à
                travers des vidéos explicatives
              </p>
            </div>
            <ButtonLink
              href={urlVideos}
              style={ButtonStyle.PRIMARY}
              externalIcon={IconName.OpenInNew}
              label='Voir les vidéos'
              className='mt-8 w-fit self-center'
              onClick={() =>
                trackEventAideEtRessources('Voir les vidéos tutoriels')
              }
            />
          </li>
          <li className='flex flex-col w-full border border-grey-100 rounded-base py-8 px-16 justify-between'>
            <div className='flex flex-col'>
              <h4 className='text-m-bold mb-2'>Notre Foire aux questions</h4>
              <p>Trouvez des réponses immédiates aux questions fréquentes.</p>
            </div>
            <ButtonLink
              href={urlFAQ}
              style={ButtonStyle.PRIMARY}
              externalIcon={IconName.OpenInNew}
              label='Voir les FAQ'
              className='mt-8 w-fit self-center'
              onClick={() => trackEventAideEtRessources('Voir les FAQ')}
            />
          </li>
        </ul>
      </section>
    </>
  )
}
