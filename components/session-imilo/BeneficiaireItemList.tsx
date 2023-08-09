import React from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import { StatutBeneficiaire } from 'interfaces/session'
import { BeneficiaireSelectionneSession } from 'pages/agenda/sessions/[session_id]'

type BeneficiaireItemListProps = {
  beneficiaire: BeneficiaireSelectionneSession
  beneficiaireEstInscrit: boolean
  dateLimiteDepassee: boolean
  idBeneficiaire: string
  value: string
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

  const beneficiaireAStatutRefus =
    beneficiaire.statut !== StatutBeneficiaire.DESINSCRIT &&
    beneficiaire.statut !== StatutBeneficiaire.INSCRIT

  function afficherStatut() {
    return beneficiaire.statut === StatutBeneficiaire.REFUS_JEUNE
      ? 'Refus Jeune'
      : 'Refus Tiers'
  }

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
        <div className='flex flex-col'>
          <p>{beneficiaire.value}</p>
          {beneficiaireAStatutRefus && <span>{afficherStatut()}</span>}
          {beneficiaireEstInscrit && (
            <span className='sr-only'>{beneficiaire.statut}</span>
          )}
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
