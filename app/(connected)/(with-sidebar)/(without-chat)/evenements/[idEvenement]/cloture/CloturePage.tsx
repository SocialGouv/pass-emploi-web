'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import { useRouter } from 'next/navigation'
import { FormEvent, useRef, useState } from 'react'

import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import InformationMessage from 'components/ui/Notifications/InformationMessage'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import TH from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import {
  getNomBeneficiaireComplet,
  IdentiteBeneficiaire,
} from 'interfaces/beneficiaire'
import { Evenement, isCodeTypeAnimationCollective } from 'interfaces/evenement'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'

type ClotureProps = {
  evenement: Evenement
  returnTo: string
}

function CloturePage({ returnTo, evenement }: ClotureProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement | null>(null)
  const [idsSelectionnes, setIdsSelectionnes] = useState<string[]>([])

  function selectionnerBeneficiaire(jeune: IdentiteBeneficiaire) {
    let nouvelleSelection
    if (idsSelectionnes.includes(jeune.id)) {
      nouvelleSelection = idsSelectionnes.filter((id) => id !== jeune.id)
    } else {
      nouvelleSelection = idsSelectionnes.concat(jeune.id)
    }

    setIdsSelectionnes(nouvelleSelection)
    mettreAJourCheckboxToutSelectionner(nouvelleSelection.length)
  }

  function selectionnerTousLesBeneficiaires() {
    if (idsSelectionnes.length === 0) {
      setIdsSelectionnes(evenement.jeunes.map((jeune) => jeune.id))
      mettreAJourCheckboxToutSelectionner(evenement.jeunes.length)
    } else {
      setIdsSelectionnes([])
      mettreAJourCheckboxToutSelectionner(0)
    }
  }

  function mettreAJourCheckboxToutSelectionner(tailleSelection: number) {
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === evenement.jeunes.length
    const isIndeterminate = !isChecked && tailleSelection > 0

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }

  async function cloreAnimationCollective(event: FormEvent) {
    event.preventDefault()

    const { cloreAnimationCollective: _cloreAnimationCollective } =
      await import('services/evenements.service')

    await _cloreAnimationCollective(evenement.id, idsSelectionnes)

    setAlerte(AlerteParam.clotureAC)
    router.push(returnTo)
    router.refresh()
  }

  return (
    <>
      <h2 className='text-m-bold'>Présence des bénéficiaires</h2>
      <p className='mt-6'>
        Vous devez valider la présence des bénéficiaires{' '}
        {isCodeTypeAnimationCollective(evenement.type.code)
          ? 'à l’animation collective'
          : ''}
        en cochant dans la liste le nom des bénéficiaires
      </p>
      <div className='mt-6'>
        <InformationMessage label='La liste suivante se base sur les participants inscrits. Veuillez vous assurer de son exactitude.' />
      </div>

      <form onSubmit={cloreAnimationCollective} className='mt-6'>
        <Table caption={{ text: 'Bénéficiaires de l’animation collective' }}>
          <thead>
            <TR isHeader={true}>
              <TH>Présence</TH>
              <TH>Bénéficiaires ({evenement.jeunes.length})</TH>
            </TR>
          </thead>
          <tbody>
            <TR>
              <TD>
                <input
                  ref={toutSelectionnerCheckboxRef}
                  id='cloture-tout-selectionner'
                  type='checkbox'
                  checked={idsSelectionnes.length === evenement.jeunes.length}
                  title='Tout sélectionner'
                  onChange={selectionnerTousLesBeneficiaires}
                />
              </TD>
              <TD>
                <label
                  htmlFor='cloture-tout-selectionner'
                  className='cursor-pointer before:absolute before:inset-0 before:z-10'
                >
                  Tout sélectionner
                </label>
              </TD>
            </TR>
          </tbody>
          <tbody>
            {evenement.jeunes.map((jeune: IdentiteBeneficiaire) => (
              <TR key={jeune.id}>
                <TD>
                  <input
                    type='checkbox'
                    id={'checkbox-' + jeune.id}
                    checked={idsSelectionnes.includes(jeune.id)}
                    title={'Sélectionner ' + getNomBeneficiaireComplet(jeune)}
                    onChange={() => selectionnerBeneficiaire(jeune)}
                  />
                </TD>
                <TD>
                  <label
                    htmlFor={'checkbox-' + jeune.id}
                    className='cursor-pointer before:absolute before:inset-0 before:z-10'
                  >
                    {getNomBeneficiaireComplet(jeune)}
                  </label>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>

        <div className='flex justify-center mt-10 p-4'>
          <ButtonLink
            href={returnTo}
            style={ButtonStyle.SECONDARY}
            className='mr-3'
          >
            Annuler
          </ButtonLink>

          <Button type='submit'>
            <IconComponent
              name={IconName.CheckCircleFill}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Clore
          </Button>
        </div>
      </form>
    </>
  )
}

export default withTransaction(CloturePage.name, 'page')(CloturePage)
