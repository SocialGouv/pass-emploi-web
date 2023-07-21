import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'

type BeneficiaireItemListProps = {
  beneficiaireEstInscrit: boolean
  idBeneficiaire: string
  value: string
  statut: string
  onClick: (id: string) => void
}

export default function BeneficiaireItemList({
  beneficiaireEstInscrit,
  idBeneficiaire,
  value,
  statut,

  onClick,
}: BeneficiaireItemListProps) {
  return (
    <>
      <div className='flex'>
        <IconComponent
          name={
            beneficiaireEstInscrit ? IconName.CheckCircleFill : IconName.Close
          }
          focusable={false}
          aria-hidden={true}
          className={`mr-2 w-6 h-6 ${
            beneficiaireEstInscrit ? 'fill-success' : 'fill-warning'
          }`}
          aria-label={statut}
        />
        {value}
        {!beneficiaireEstInscrit && <span>{statut}</span>}
      </div>

      {beneficiaireEstInscrit && (
        <Button
          style={ButtonStyle.SECONDARY}
          label={`Désinscrire ${value}`}
          onClick={() => onClick(idBeneficiaire)}
        >
          Désinscrire
        </Button>
      )}
    </>
  )
}
