'use client'

import React from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'
import { liensBRSA, liensCEJ } from 'referentiel/liens'
import styles from 'styles/components/Layouts.module.css'
import { trackPage, userStructureDimensionString } from 'utils/analytics/matomo'

type FooterProps = {
  conseiller?: Conseiller
}

export default function Footer({ conseiller }: FooterProps) {
  const liens =
    conseiller && estPoleEmploiBRSA(conseiller) ? liensBRSA : liensCEJ

  function trackExternalLink(label: string) {
    const structure = !conseiller
      ? 'visiteur'
      : userStructureDimensionString(conseiller.structure)

    trackPage({
      structure: structure,
      customTitle: label,
    })
  }

  return (
    <footer role='contentinfo' className={styles.footer}>
      <ul className='flex px-4 flex-wrap flex-col layout_base:flex-row'>
        {liens.map(({ url, label }) => (
          <li
            key={label.toLowerCase().replace(/\s/g, '-')}
            className='mr-4 text-s-regular text-primary_darken hover:text-primary'
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
