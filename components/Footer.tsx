import React, { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import styles from 'styles/components/Layouts.module.css'
import { ExternalLink } from './ui/ExternalLink'
import { liens } from 'referentiel/liens'

export const Footer = () => {
  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(undefined)

  useMatomo(labelMatomo)

  return (
    <footer role='contentinfo' className={styles.footer}>
      <ul className='flex px-4 flex-wrap'>
        {liens.map(({ url, label }) => (
          <li
            key={label.toLowerCase().replace(/\s/g, '-')}
            className={`mr-4 text-bleu_nuit fill-bleu_nuit hover:text-primary hover:fill-primary`}
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
