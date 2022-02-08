import React, { useState } from 'react'
import useMatomo from 'utils/analytics/useMatomo'
import styles from 'styles/components/Layouts.module.css'
import LaunchIcon from '../assets/icons/launch.svg'

//TODO: modifier les urls
const liens = [
  {
    url: 'https://www.numerique.gouv.fr/publications/rgaa-accessibilite/obligations/',
    label: "Niveau d'accessibilité: non conforme",
  },
  {
    url: 'https://beta.gouv.fr/startups/pass-emploi.html',
    label: "Conditions Générales d'Utilisation",
  },
  {
    url: '/',
    label: 'Mentions légales',
  },
  {
    url: 'https://www.cnil.fr/fr/rgpd-par-ou-commencer',
    label: 'Politique de confidentialité',
  },
]
export const Footer = () => {
  const [labelMatomo, setLabelMatomo] = useState<string | undefined>(undefined)

  useMatomo(labelMatomo)

  return (
    <footer role='contentinfo' className={styles.footer}>
      <ul className='flex'>
        {liens.map(({ url, label }) => (
          <li key={url} className='pr-[1px] mr-4'>
            <a
              href={url}
              target='_blank'
              rel='noreferrer noopener'
              className='flex items-center text-sm-regular text-bleu_nuit'
              aria-label={`${label} (nouvelle fenêtre)`}
              onClick={() => setLabelMatomo(label)}
            >
              {label}
              <LaunchIcon
                className='ml-[6px]'
                focusable='false'
                aria-hidden={true}
              />
            </a>
          </li>
        ))}
      </ul>
    </footer>
  )
}
