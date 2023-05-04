import React, { useState } from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { Conseiller, estPoleEmploiBRSA } from 'interfaces/conseiller'
import { liensBRSA, liensCEJ } from 'referentiel/liens'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'

type FooterProps = {
  conseiller?: Conseiller
}

export default function Footer({ conseiller }: FooterProps) {
  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(undefined)
  const liens =
    conseiller && estPoleEmploiBRSA(conseiller) ? liensBRSA : liensCEJ

  useMatomo(labelMatomo)

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
              onClick={() => setLabelMatomo(label)}
            />
          </li>
        ))}
      </ul>
    </footer>
  )
}
