import React from 'react'

import { BeneficiaireSelectionneSession } from 'app/(connected)/(with-sidebar)/(without-chat)/agenda/sessions/[idSession]/DetailsSessionPage'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StatutBeneficiaire } from 'interfaces/session'

type BeneficiaireItemListProps = {
  beneficiaire: {
    id: string
    value: string
    statut: string
    commentaire?: string
  }
  dateLimiteDepassee: boolean
  onDesinscrire: (id: string) => void
  onReinscrire: (id: string) => void
}

export default function BeneficiaireItemList({
  beneficiaire,
  dateLimiteDepassee,
  onDesinscrire,
  onReinscrire,
}: BeneficiaireItemListProps) {
  const beneficiaireEstInscrit = beneficiaire.statut === 'INSCRIT'
  const beneficiaireEstPresent = beneficiaire.statut === 'PRESENT'

  function afficherStatut(
    beneficiaireAAfficher: BeneficiaireSelectionneSession
  ) {
    switch (beneficiaireAAfficher.statut) {
      case StatutBeneficiaire.INSCRIT:
        return 'Inscrit'
      case StatutBeneficiaire.PRESENT:
        return 'Présent'
      case StatutBeneficiaire.REFUS_JEUNE:
        return 'Refus jeune'
      case StatutBeneficiaire.REFUS_TIERS:
        return 'Refus tiers'
    }
  }

  return (
    <>
      <div className='flex items-center'>
        <IconComponent
          name={
            beneficiaireEstInscrit || beneficiaireEstPresent
              ? IconName.CheckCircleFill
              : IconName.Close
          }
          focusable={false}
          aria-hidden={true}
          className={`mr-2 w-6 h-6 ${
            beneficiaireEstInscrit || beneficiaireEstPresent
              ? 'fill-success'
              : 'fill-warning'
          }`}
        />
        <div className='flex flex-col'>
          <p>{beneficiaire.value}</p>
          <p>{afficherStatut(beneficiaire)}</p>
        </div>
      </div>

      {!dateLimiteDepassee && (
        <>
          {beneficiaireEstInscrit && (
            <Button
              style={ButtonStyle.SECONDARY}
              label={`Désinscrire ${beneficiaire.value}`}
              type='button'
              onClick={() => onDesinscrire(beneficiaire.id)}
            >
              Désinscrire
            </Button>
          )}

          {!beneficiaireEstInscrit && (
            <Button
              style={ButtonStyle.TERTIARY}
              label={`Réinscrire ${beneficiaire.value}`}
              type='button'
              onClick={() => onReinscrire(beneficiaire.id)}
            >
              Réinscrire
            </Button>
          )}
        </>
      )}
    </>
  )
}
