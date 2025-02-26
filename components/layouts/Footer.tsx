'use client'

import Link from 'next/link'
import React from 'react'

import ExternalLink from 'components/ui/Navigation/ExternalLink'
import { Conseiller } from 'interfaces/conseiller'
import { estPassEmploi } from 'interfaces/structure'
import { trackPage } from 'utils/analytics/matomo'
import { liensFooterCEJ, liensFooterPassEmploi } from 'utils/liensFooter'

type FooterProps = {
  liens?: Array<{ url: string; label: string }>
  conseiller?: Pick<Conseiller, 'structure'>
  aDesBeneficiaires?: boolean
  withPlanDuSite?: boolean
}

export default function Footer({
  liens,
  conseiller,
  aDesBeneficiaires,
  withPlanDuSite,
}: FooterProps) {
  const liensAffiches =
    liens ??
    (conseiller && estPassEmploi(conseiller.structure)
      ? liensFooterPassEmploi
      : liensFooterCEJ)

  function trackExternalLink(label: string) {
    trackPage({
      customTitle: label,
      structure: conseiller?.structure ?? null,
      aDesBeneficiaires: aDesBeneficiaires ?? null,
    })
  }

  return (
    <footer
      role='contentinfo'
      className='flex justify-center py-4 px-0 border-solid border-primary_lighten border-t-2'
    >
      <ul className='flex px-4 flex-wrap flex-col layout_base:flex-row'>
        {withPlanDuSite && (
          <li className='mr-4 text-s-regular text-primary hover:text-primary_darken inline-flex items-center whitespace-nowrap underline'>
            <Link href='/plan-du-site'>Plan du site</Link>
          </li>
        )}

        {liensAffiches.map(({ url, label }) => (
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
