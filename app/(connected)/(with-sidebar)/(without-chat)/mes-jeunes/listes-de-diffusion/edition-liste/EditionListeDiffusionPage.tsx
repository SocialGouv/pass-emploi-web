'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import React, { FormEvent, useRef, useState } from 'react'

import { BeneficiaireIndicationReaffectaction } from 'components/jeune/BeneficiaireIndications'
import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import PageActionsPortal from 'components/PageActionsPortal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import { ValueWithError } from 'components/ValueWithError'
import {
  compareParId,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { AlerteParam } from 'referentiel/alerteParam'
import { ListeDeDiffusionFormData } from 'services/listes-de-diffusion.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { unsafeRandomId } from 'utils/helpers'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ConfirmationDeleteListeDiffusionModal = dynamic(
  () => import('components/ConfirmationDeleteListeDiffusionModal')
)

type EditionListeDiffusionProps = {
  returnTo: string
  liste?: ListeDeDiffusion
}

function EditionListeDiffusionPage({
  returnTo,
  liste,
}: EditionListeDiffusionProps) {
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const formErrorsRef = useRef<HTMLDivElement>(null)

  const [portefeuille] = usePortefeuille()
  const defaultBeneficiaires = getDefaultBeneficiaires()
  const [idsBeneficiaires, setIdsBeneficiaires] = useState<
    ValueWithError<string[]>
  >({ value: defaultBeneficiaires.map(({ id }) => id) })
  const [titre, setTitre] = useState<ValueWithError<string | undefined>>({
    value: liste?.titre,
  })

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showErreurSoumission, setShowErreurTraitement] =
    useState<boolean>(false)
  const [showConfirmationSuppression, setShowConfirmationSuppression] =
    useState(false)

  function formIsValid(): boolean {
    const titreEstValide = Boolean(titre.value)
    const idsBeneficiairesEstValide = idsBeneficiaires.value.length > 0

    if (!titreEstValide)
      setTitre({
        ...titre,
        error: 'Le champ “Titre” est vide. Renseignez un titre.',
      })

    if (!idsBeneficiairesEstValide)
      setIdsBeneficiaires({
        ...idsBeneficiaires,
        error:
          'Aucun bénéficiaire n’est renseigné. Sélectionnez au moins un bénéficiaire.',
      })

    return titreEstValide && idsBeneficiairesEstValide
  }

  function hasChanges(): boolean {
    const previousIds = liste?.beneficiaires
      ? liste.beneficiaires.map(({ id }) => id).sort(compareParId)
      : []
    const currentIds = [...idsBeneficiaires.value].sort(compareParId)
    return (
      previousIds.toString() !== currentIds.toString() ||
      liste!.titre !== titre.value
    )
  }

  function estUnBeneficiaireDuConseiller(
    idBeneficiaireAVerifier: string
  ): boolean {
    return portefeuille.some(({ id }) => idBeneficiaireAVerifier === id)
  }

  function buildOptionsBeneficiaires(): OptionBeneficiaire[] {
    return portefeuille.map((beneficiaire) => ({
      id: beneficiaire.id,
      value: getNomBeneficiaireComplet(beneficiaire),
    }))
  }

  function getDefaultBeneficiaires(): OptionBeneficiaire[] {
    return liste
      ? liste.beneficiaires.map((beneficiaire) => {
          return {
            value: getNomBeneficiaireComplet(beneficiaire),
            id: beneficiaire.id,
            avecIndication: !estUnBeneficiaireDuConseiller(beneficiaire.id),
          }
        })
      : []
  }

  function updateIdsBeneficiaires(selectedIds: { beneficiaires?: string[] }) {
    setIdsBeneficiaires({
      value: selectedIds.beneficiaires!,
      error: selectedIds.beneficiaires!.length
        ? undefined
        : 'Aucun bénéficiaire n’est renseigné. Sélectionnez au moins un bénéficiaire.',
    })
  }

  async function soumettreListe(e: FormEvent) {
    e.preventDefault()
    if (!formIsValid()) {
      formErrorsRef.current!.focus()
      return
    }
    if (!hasChanges()) return

    setIsLoading(true)
    const payload: ListeDeDiffusionFormData = {
      titre: titre.value!,
      idsBeneficiaires: idsBeneficiaires.value,
    }
    try {
      if (!liste) {
        await creerListe(payload)
      } else {
        await modifierListe(liste.id, payload)
      }
      // FIXME : dirty fix, problème de rafraichissement de la liste
      router.push(returnTo + '?misc=' + unsafeRandomId())
    } catch (erreur) {
      setShowErreurTraitement(true)
      console.error(erreur)
    } finally {
      setIsLoading(false)
    }
  }

  async function creerListe(payload: ListeDeDiffusionFormData) {
    const { creerListeDeDiffusion } = await import(
      'services/listes-de-diffusion.service'
    )
    await creerListeDeDiffusion(payload)
    setAlerte(AlerteParam.creationListeDiffusion)
  }

  async function modifierListe(
    idListe: string,
    payload: ListeDeDiffusionFormData
  ) {
    const { modifierListeDeDiffusion } = await import(
      'services/listes-de-diffusion.service'
    )
    await modifierListeDeDiffusion(idListe, payload)
    setAlerte(AlerteParam.modificationListeDiffusion)
  }

  async function supprimerListe() {
    setIsLoading(true)
    try {
      const { supprimerListeDeDiffusion } = await import(
        'services/listes-de-diffusion.service'
      )
      await supprimerListeDeDiffusion(liste!.id)
      setAlerte(AlerteParam.suppressionListeDiffusion)
      // FIXME : dirty fix, problème de rafraichissement de la liste
      router.push(returnTo + '?misc=' + unsafeRandomId())
    } catch (e) {
      console.error(e)
      setShowErreurTraitement(true)
    } finally {
      setIsLoading(false)
    }
  }

  function getErreurs(): LigneErreur[] {
    const erreurs = []
    if (titre.error)
      erreurs.push({
        ancre: '#titre-liste',
        label: 'Le champ Titre est vide.',
        titreChamp: 'Titre',
      })
    if (idsBeneficiaires.error)
      erreurs.push({
        ancre: '#select-beneficiaires',
        label: 'Le champ Bénéficiaires est vide.',
        titreChamp: 'Bénéficiaires',
      })
    return erreurs
  }

  useMatomo(
    liste ? 'Modification liste diffusion' : 'Création liste diffusion',
    portefeuille.length > 0
  )

  return (
    <>
      <PageActionsPortal>
        <>
          {liste && (
            <Button
              onClick={() => setShowConfirmationSuppression(true)}
              style={ButtonStyle.SECONDARY}
            >
              <IconComponent
                name={IconName.Delete}
                focusable={false}
                aria-hidden={true}
                className='mr-2 w-4 h-4'
              />
              Supprimer
            </Button>
          )}
        </>
      </PageActionsPortal>

      {showErreurSoumission && (
        <FailureAlert
          label='Une erreur s’est produite, veuillez réessayer ultérieurement.'
          onAcknowledge={() => setShowErreurTraitement(false)}
        />
      )}

      <RecapitulatifErreursFormulaire
        erreurs={getErreurs()}
        ref={formErrorsRef}
      />

      <p className='text-s-bold text-content_color mb-4'>
        Tous les champs sont obligatoires
      </p>

      <form onSubmit={soumettreListe} noValidate={true}>
        <Label htmlFor='titre-liste' inputRequired={true}>
          {{ main: 'Titre', helpText: 'Exemple : Ma liste de pâtissier' }}
        </Label>
        {titre.error && (
          <InputError id='titre--error' className='mb-2'>
            {titre.error}
          </InputError>
        )}
        <Input
          type='text'
          id='titre-liste'
          invalid={Boolean(titre.error)}
          required={true}
          defaultValue={titre.value}
          onChange={(inputValue) => setTitre({ value: inputValue })}
        />
        <BeneficiairesMultiselectAutocomplete
          id={'select-beneficiaires'}
          beneficiaires={buildOptionsBeneficiaires()}
          typeSelection='Bénéficiaires'
          onUpdate={updateIdsBeneficiaires}
          defaultBeneficiaires={defaultBeneficiaires}
          required={true}
          error={idsBeneficiaires.error}
          Indication={BeneficiaireIndicationReaffectaction}
        />

        <div className='flex gap-2 mt-6 justify-center'>
          <ButtonLink
            href='/mes-jeunes/listes-de-diffusion'
            style={ButtonStyle.SECONDARY}
          >
            Annuler {liste ? 'la modification' : ''}
          </ButtonLink>

          {liste && (
            <Button type='submit' isLoading={isLoading}>
              Modifier la liste
            </Button>
          )}

          {!liste && (
            <Button type='submit' isLoading={isLoading}>
              <IconComponent
                name={IconName.Add}
                focusable={false}
                aria-hidden={true}
                className='mr-2 w-4 h-4'
              />
              Créer la liste
            </Button>
          )}
        </div>
      </form>

      {showConfirmationSuppression && (
        <ConfirmationDeleteListeDiffusionModal
          titreListeDeDiffusion={liste!.titre}
          onConfirmation={supprimerListe}
          onCancel={() => setShowConfirmationSuppression(false)}
        />
      )}
    </>
  )
}

export default withTransaction(
  EditionListeDiffusionPage.name,
  'page'
)(EditionListeDiffusionPage)
