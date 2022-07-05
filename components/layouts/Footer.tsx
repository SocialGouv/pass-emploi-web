import React, { useState } from 'react'

import ExternalLink from 'components/ui/ExternalLink'
import { liens } from 'referentiel/liens'
import styles from 'styles/components/Layouts.module.css'
import useMatomo from 'utils/analytics/useMatomo'

export const Footer = () => {
  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(undefined)

  useMatomo(labelMatomo)

  return (
    <footer role='contentinfo' className={styles.footer}>
      <ul className='flex px-4 flex-wrap flex-col layout_base:flex-row'>
        {liens.map(({ url, label }) => (
          <li key={label.toLowerCase().replace(/\s/g, '-')} className={`mr-4`}>
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
