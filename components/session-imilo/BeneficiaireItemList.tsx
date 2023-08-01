import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StatutBeneficiaire } from 'interfaces/session'
import { BeneficiaireSelectionneSession } from 'pages/agenda/sessions/[session_id]'

type BeneficiaireItemListProps = {
  beneficiaire: BeneficiaireSelectionneSession
  dateLimiteDepassee: boolean
  onDesinscrire: (id: string) => void
}

export default function BeneficiaireItemList({
  beneficiaire,
  dateLimiteDepassee,
  onDesinscrire,
}: BeneficiaireItemListProps) {
  const beneficiaireEstInscrit =
    beneficiaire.statut === StatutBeneficiaire.INSCRIT

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
        />
        {beneficiaire.value}
        {!beneficiaireEstInscrit && beneficiaire.statut}
        {beneficiaireEstInscrit && (
          <span className='sr-only'>{beneficiaire.statut}</span>
        )}
      </div>

      {beneficiaireEstInscrit && !dateLimiteDepassee && (
        <Button
          style={ButtonStyle.SECONDARY}
          label={`Désinscrire ${beneficiaire.value}`}
          onClick={() => onDesinscrire(beneficiaire.id)}
        >
          Désinscrire
        </Button>
      )}
    </>
  )
}
