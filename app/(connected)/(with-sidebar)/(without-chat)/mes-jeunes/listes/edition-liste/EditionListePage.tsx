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
import InputError from 'components/ui/Form/InputError'
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
import { Liste } from 'interfaces/liste'
import { AlerteParam } from 'referentiel/alerteParam'
import { ListeFormData } from 'services/listes.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { unsafeRandomId } from 'utils/helpers'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ConfirmationDeleteListeModal = dynamic(
  () => import('components/ConfirmationDeleteListeModal')
)

type EditionListeProps = {
  returnTo: string
  liste?: Liste
}

function EditionListePage({ returnTo, liste }: EditionListeProps) {
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

    if (!titreEstValide)
      setTitre({
        ...titre,
        error: 'Le champ “Titre” est vide. Renseignez un titre.',
      })

    return titreEstValide
  }

  function hasChanges(): boolean {
    const previousIds = liste?.beneficiaires
      ? liste.beneficiaires.map(({ id }) => id).sort(compareParId)
      : []
    const currentIds = [...idsBeneficiaires.value].sort(compareParId)
    return (
      previousIds.toString() !== currentIds.toString() ||
      liste?.titre !== titre.value
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
      error: undefined,
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
    const payload: ListeFormData = {
      titre: titre.value!,
      idsBeneficiaires: idsBeneficiaires.value,
    }
    try {
      if (!liste) {
        await handleCreationListe(payload)
      } else {
        await handleModificationListe(liste.id, payload)
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

  async function handleCreationListe(payload: ListeFormData) {
    const { creerListe } = await import('services/listes.service')
    await creerListe(payload)
    setAlerte(AlerteParam.creationListe)
  }

  async function handleModificationListe(
    idListe: string,
    payload: ListeFormData
  ) {
    const { modifierListe } = await import('services/listes.service')
    await modifierListe(idListe, payload)
    setAlerte(AlerteParam.modificationListe)
  }

  async function handleSuppressionListe() {
    setIsLoading(true)
    try {
      const { supprimerListe } = await import('services/listes.service')
      await supprimerListe(liste!.id)
      setAlerte(AlerteParam.suppressionListe)
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

      <p className='text-s-bold text-content-color mb-4'>
        Les champs marqués d’une * sont obligatoires.
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
          required={false}
          error={idsBeneficiaires.error}
          Indication={BeneficiaireIndicationReaffectaction}
        />

        <div className='flex gap-2 mt-6 justify-center'>
          <ButtonLink href='/mes-jeunes/listes' style={ButtonStyle.SECONDARY}>
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
        <ConfirmationDeleteListeModal
          titreListe={liste!.titre}
          onConfirmation={handleSuppressionListe}
          onCancel={() => setShowConfirmationSuppression(false)}
        />
      )}
    </>
  )
}

export default withTransaction(EditionListePage.name, 'page')(EditionListePage)
