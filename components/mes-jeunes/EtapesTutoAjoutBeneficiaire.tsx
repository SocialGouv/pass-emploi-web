import React from 'react'

import IconComponent, { IconName } from 'components/ui/IconComponent'

type EtapeTutoAjoutBeneficaire = {
  icon: IconName
  texte: React.ReactNode
}
export default function EtapesTutoAjoutBeneficiaire({
  etapes,
}: {
  etapes: Array<EtapeTutoAjoutBeneficaire>
}) {
  const styleListElement = 'flex items-center mb-6'
  const styleEtapeIcon = 'mr-2 min-w-8 min-h-8 w-8 h-8'

  return (
    <ol>
      {etapes.map((etape, index) => (
        <li key={index} className={styleListElement}>
          <IconComponent
            name={etape.icon}
            focusable={false}
            aria-hidden={true}
            className={styleEtapeIcon}
          />
          <p>{etape.texte}</p>
        </li>
      ))}
    </ol>
  )
}
