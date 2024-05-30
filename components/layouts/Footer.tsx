'use client'

import React from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'
import { trackPage } from 'utils/analytics/matomo'

type FooterProps = {
  conseiller: Conseiller | null
  aDesBeneficiaires: boolean | null
}

export default function Footer({ conseiller, aDesBeneficiaires }: FooterProps) {
  const liens =
    conseiller && estPoleEmploiBRSA(conseiller) ? liensBRSA : liensCEJ

  function trackExternalLink(label: string) {
    trackPage({
      customTitle: label,
      structure: conseiller?.structure ?? null,
      aDesBeneficiaires,
    })
  }

  return (
    <footer
      role='contentinfo'
      className='flex justify-center py-4 px-0 border-solid border-primary_lighten border-t-2'
    >
      <ul className='flex px-4 flex-wrap flex-col layout_base:flex-row'>
        {liens.map(({ url, label }) => (
          <li
            key={label.toLowerCase().replace(/\s/g, '-')}
            className='mr-4 text-s-regular text-primary hover:text-primary_darken'
          >
            <ExternalLink
              key={url}
              href={url}
              label={label}
              onClick={() => trackExternalLink(label)}
            />
          </li>
        ))}
      </ul>
    </footer>
  )
}

const liensCEJ = [
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/web_accessibilite/',
    label: "Niveau d'accessibilité: non conforme",
  },
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/web_conditions_generales',
    label: "Conditions Générales d'Utilisation",
  },
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/web_mentions_legales',
    label: 'Mentions légales',
  },
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/web_politique_de_confidentialite',
    label: 'Politique de confidentialité',
  },
]
const liensBRSA = [
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/web_pass_emploi_accessibilite/',
    label: "Niveau d'accessibilité: non conforme",
  },
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/web_pass_emploi_conditions_generales',
    label: "Conditions Générales d'Utilisation",
  },
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/pass_emploi_mentions_legales/',
    label: 'Mentions légales',
  },
  {
    url: 'https://doc.pass-emploi.beta.gouv.fr/legal/web_pass_emploi_politique_de_confidentialite',
    label: 'Politique de confidentialité',
  },
]
