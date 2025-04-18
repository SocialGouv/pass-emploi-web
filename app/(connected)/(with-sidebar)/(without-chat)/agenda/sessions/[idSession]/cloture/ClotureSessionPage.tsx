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
  estAClore,
  InformationBeneficiaireSession,
  Session,
  StatutBeneficiaire,
} from 'interfaces/session'
import { AlerteParam } from 'referentiel/alerteParam'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useConseiller } from 'utils/conseiller/conseillerContext'
import { usePortefeuille } from 'utils/portefeuilleContext'

type ClotureSessionProps = {
  session: Session
  returnTo: string
  inscriptionsInitiales: InformationBeneficiaireSession[]
}

function ClotureSessionPage({
  returnTo,
  session,
  inscriptionsInitiales,
}: ClotureSessionProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()
  const [conseiller] = useConseiller()
  const [portefeuille] = usePortefeuille()
  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement | null>(null)

  const [idsSelectionnes, setIdsSelectionnes] = useState<string[]>([])
  const [emargements, setEmargements] = useState<
    Array<InformationBeneficiaireSession>
  >(inscriptionsInitiales)

  const [trackingLabel, setTrackingLabel] = useState<string>(
    'Session - Clôture de la session'
  )

  function cocherTousLesBeneficiaires() {
    if (idsSelectionnes.length === 0) {
      setIdsSelectionnes(
        session.inscriptions.map((beneficiaire) => beneficiaire.idJeune)
      )
      setEmargements(
        inscriptionsInitiales.map((beneficiaire) => {
          return { ...beneficiaire, statut: StatutBeneficiaire.PRESENT }
        })
      )
      mettreAJourCheckboxToutSelectionner(session.inscriptions.length)
    } else {
      setIdsSelectionnes([])
      setEmargements(inscriptionsInitiales)
      mettreAJourCheckboxToutSelectionner(0)
    }
  }

  function metAJourListeBeneficiairesEmarges(
    listeEmargements: InformationBeneficiaireSession[],
    beneficiaire: InformationBeneficiaireSession
  ) {
    return [
      ...listeEmargements.filter(
        (beneficiaireEmarge) =>
          beneficiaireEmarge.idJeune !== beneficiaire.idJeune
      ),
      { ...beneficiaire },
    ]
  }

  function modifierStatutBeneficiaire(
    beneficiaire: InformationBeneficiaireSession
  ) {
    let selection: string[]

    if (!Boolean(idsSelectionnes.includes(beneficiaire.idJeune))) {
      selection = idsSelectionnes.concat(beneficiaire.idJeune)
      setIdsSelectionnes(selection)
      setEmargements((currentEmargements) =>
        metAJourListeBeneficiairesEmarges(currentEmargements, {
          ...beneficiaire,
          statut: StatutBeneficiaire.PRESENT,
        })
      )
    } else {
      const beneficiaireMisAJour = inscriptionsInitiales.filter(
        (beneficiaireInitial) =>
          beneficiaireInitial.idJeune === beneficiaire.idJeune
      )[0]
      selection = idsSelectionnes.filter((id) => id !== beneficiaire.idJeune)

      setIdsSelectionnes(selection)
      setEmargements((prev) => {
        return [
          ...prev?.filter(({ idJeune }) => idJeune !== beneficiaire.idJeune),
          { ...beneficiaireMisAJour },
        ]
      })
    }

    mettreAJourCheckboxToutSelectionner(selection.length)
  }

  function mettreAJourCheckboxToutSelectionner(tailleSelection: number) {
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === session.inscriptions.length
    const isIndeterminate = !isChecked && tailleSelection > 0

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }

  async function soumettreClotureSession(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const { cloreSession } = await import('services/sessions.service')

    function updateTousLesBeneficiaires(
      liste: InformationBeneficiaireSession[]
    ) {
      liste.forEach((beneficiaire: InformationBeneficiaireSession) => {
        return setEmargements((currentEmargements) => {
          return metAJourListeBeneficiairesEmarges(
            currentEmargements,
            beneficiaire
          )
        })
      })
    }

    if (emargements.length === 0) {
      updateTousLesBeneficiaires(inscriptionsInitiales)
    } else {
      const emargementsASoumettre = inscriptionsInitiales.filter(
        (beneficiaireAEmarger) =>
          !emargements.some(
            (beneficiaireDejaCoche) =>
              beneficiaireAEmarger.idJeune === beneficiaireDejaCoche.idJeune
          )
      )
      updateTousLesBeneficiaires(emargementsASoumettre)
    }

    await cloreSession(conseiller.id, session.session.id, emargements)
    setAlerte(AlerteParam.clotureSession)
    setTrackingLabel('Session - Clôture succès')
    router.push(returnTo)
    router.refresh()
  }

  function afficherStatut(beneficiaire: InformationBeneficiaireSession) {
    switch (beneficiaire.statut) {
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

  useMatomo(trackingLabel, portefeuille.length > 0)

  return (
    <>
      <h2 className='text-m-bold'>Emarger la présence des bénéficiaires</h2>
      <p className='mt-6'>
        Vous devez valider la présence des bénéficiaires à la session en cochant
        dans la liste le nom des bénéficiaires
      </p>
      <div className='mt-6'>
        <InformationMessage label='La liste suivante se base sur les participants inscrits. Veuillez vous assurer de son exactitude.' />
      </div>

      <form onSubmit={soumettreClotureSession} className='mt-6'>
        <Table caption={{ text: 'Bénéficiaires de la session' }}>
          <thead>
            <TR isHeader={true}>
              <TH>
                <input
                  id='cloture-tout-selectionner'
                  type='checkbox'
                  title='Tout sélectionner'
                  onChange={cocherTousLesBeneficiaires}
                  className='mr-4'
                  ref={toutSelectionnerCheckboxRef}
                />
                <label htmlFor='cloture-tout-selectionner'>
                  <span className='sr-only'>Tout sélectionner</span>
                  Présence des bénéficiaires
                </label>
              </TH>
              <TH>Statut</TH>
            </TR>
          </thead>

          <tbody>
            {session.inscriptions.map((beneficiaire) => (
              <TR key={beneficiaire.idJeune}>
                <TD>
                  <label
                    className={`${
                      beneficiaire.statut === StatutBeneficiaire.PRESENT
                        ? 'text-disabled'
                        : 'before:absolute before:inset-0 before:z-10 cursor-pointer'
                    }`}
                  >
                    <input
                      disabled={
                        beneficiaire.statut === StatutBeneficiaire.PRESENT
                      }
                      type='checkbox'
                      name={beneficiaire.idJeune}
                      checked={
                        Boolean(
                          idsSelectionnes.includes(beneficiaire.idJeune)
                        ) || beneficiaire.statut === StatutBeneficiaire.PRESENT
                      }
                      onChange={() => modifierStatutBeneficiaire(beneficiaire)}
                      className='mr-4'
                    />
                    {beneficiaire.prenom} {beneficiaire.nom}
                  </label>
                </TD>
                <TD>
                  <span
                    className={`${
                      beneficiaire.statut === StatutBeneficiaire.PRESENT
                        ? 'text-disabled'
                        : ''
                    }`}
                  >
                    {afficherStatut(beneficiaire)}
                  </span>
                </TD>
              </TR>
            ))}
          </tbody>
        </Table>

        {estAClore(session) && (
          <div className='flex justify-center mt-10 p-4'>
            <ButtonLink
              href={returnTo}
              style={ButtonStyle.SECONDARY}
              className='mr-3'
            >
              Annuler la clôture
            </ButtonLink>

            <Button type='submit'>
              <IconComponent
                name={IconName.CheckCircleFill}
                focusable={false}
                aria-hidden={true}
                className='mr-2 w-4 h-4'
              />
              Clore la session
            </Button>
          </div>
        )}
      </form>
    </>
  )
}

export default withTransaction(
  ClotureSessionPage.name,
  'page'
)(ClotureSessionPage)
