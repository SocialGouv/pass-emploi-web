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
      <ul className='flex px-4'>
        {liens.map(({ url, label }) => (
          <ExternalLink
            key={url}
            href={url}
            label={label}
            onClick={() => setLabelMatomo(label)}
          />
        ))}
      </ul>
    </footer>
  )
}
