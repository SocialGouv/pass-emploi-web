'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import React, { FormEvent, useEffect, useRef, useState } from 'react'

import ChoixConseiller from 'app/components/ChoixConseiller'
import RadioBox from 'components/action/RadioBox'
import ReaffectationVerificationMissionLocaleModal from 'components/ReaffectationVerificationMissionLocaleModal'
import Button from 'components/ui/Button/Button'
import Etape, { NumeroEtape } from 'components/ui/Form/Etape'
import { InputError } from 'components/ui/Form/InputError'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import SpinningLoader from 'components/ui/SpinningLoader'
import { ValueWithError } from 'components/ValueWithError'
import {
  BeneficiaireFromListe,
  compareBeneficiairesByNom,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { SimpleConseiller, StructureConseiller } from 'interfaces/conseiller'
import { AlerteParam } from 'referentiel/alerteParam'
import { StructureReaffectation } from 'services/conseiller.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { useDebounce } from 'utils/hooks/useDebounce'
import { usePortefeuille } from 'utils/portefeuilleContext'

const ConseillerIntrouvableSuggestionModal = dynamic(
  () => import('components/ConseillerIntrouvableSuggestionModal')
)

type ReaffectationProps = {
  estSuperviseurResponsable: boolean
}

function ReaffectationPage({ estSuperviseurResponsable }: ReaffectationProps) {
  const [_, setAlerte] = useAlerte()
  const [portefeuille] = usePortefeuille()

  const conseillerInitialRef = useRef<{
    resetRechercheConseiller: () => void
  }>(null)
  const loaderBeneficiairesRef = useRef<HTMLDivElement>(null)
  const etapeBeneficiairesRef = useRef<HTMLFieldSetElement>(null)

  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement>(null)
  const formErrorsRef = useRef<HTMLDivElement>(null)

  const [structureReaffectation, setStructureReaffectation] = useState<
    ValueWithError<StructureReaffectation | undefined>
  >({ value: undefined })

  const [isReaffectationTemporaire, setIsReaffectationTemporaire] = useState<
    ValueWithError<boolean | undefined>
  >({ value: undefined })

  const [conseillerInitial, setConseillerInitial] =
    useState<StateChoixConseiller>({ value: undefined })
  const conseillerInitialDebounced = useDebounce<SimpleConseiller | undefined>(
    conseillerInitial.value,
    1000
  )
  const [conseillerDestination, setConseillerDestination] =
    useState<StateChoixConseiller>({ value: undefined })

  const [
    recuperationBeneficiairesEnCours,
    setRecuperationBeneficiairesEnCours,
  ] = useState<boolean>(false)
  const [beneficiaires, setBeneficiaires] = useState<
    BeneficiaireFromListe[] | undefined
  >()
  const [idsBeneficiairesSelected, setIdsBeneficiairesSelected] = useState<
    ValueWithError<string[]>
  >({ value: [] })

  const [isReaffectationEnCours, setReaffectationEnCours] =
    useState<boolean>(false)
  const [erreurReaffectation, setErreurReaffectation] = useState<
    string | undefined
  >()

  const [showModalConseillerIntrouvable, setShowModalConseillerIntrouvable] =
    useState<boolean>(false)
  const [onConfirmationReaffectation, setOnConfirmationReaffectation] =
    useState<() => void>()

  const [trackingTitle, setTrackingTitle] = useState<string>(
    'Réaffectation jeunes – Etape 1 – Saisie mail cons. ini.'
  )

  const numerosEtapes: NumeroEtape[] = estSuperviseurResponsable
    ? [2, 3, 4, 5]
    : [1, 2, 3, 4]

  function handleInputStructureReaffectation(
    structure: StructureReaffectation
  ) {
    setErreurReaffectation(undefined)
    setStructureReaffectation({ value: structure })
  }

  function handleInputTypeReaffectation(isTemporaire: boolean) {
    setErreurReaffectation(undefined)
    setIsReaffectationTemporaire({ value: isTemporaire })
  }

  function resetConseillerInitial() {
    setConseillerInitial({ value: undefined })
    setConseillerDestination({ value: undefined })

    resetBeneficiaires()
    resetReaffectation()
  }

  function resetBeneficiaires(): void {
    setBeneficiaires(undefined)
    setIdsBeneficiairesSelected({ value: [] })
  }

  function resetReaffectation(): void {
    setAlerte(undefined)
    setErreurReaffectation(undefined)
  }

  function resetConseillerDestination() {
    setConseillerDestination({ value: undefined })
    resetReaffectation()
  }

  function resetAll() {
    conseillerInitialRef.current!.resetRechercheConseiller()
    resetConseillerInitial()
    setIsReaffectationTemporaire({ value: undefined })
  }

  function selectionnerBeneficiaire(beneficiaire: BeneficiaireFromListe) {
    setErreurReaffectation(undefined)
    let selection: string[]

    if (idsBeneficiairesSelected.value.includes(beneficiaire.id)) {
      selection = idsBeneficiairesSelected.value.filter(
        (id) => id !== beneficiaire.id
      )
      setIdsBeneficiairesSelected({ value: selection })
    } else {
      selection = idsBeneficiairesSelected.value.concat(beneficiaire.id)
      setIdsBeneficiairesSelected({ value: selection })
    }

    mettreAJourCheckboxToutSelectionner(selection.length)
  }

  function choixConseillerDestination(
    conseiller: ValueWithError<SimpleConseiller | undefined>
  ) {
    if (conseiller.value?.id === conseillerInitial.value?.id) {
      setConseillerDestination({
        value: undefined,
        errorChoice:
          'Vous ne pouvez pas réaffecter des bénéficiaires à leur conseiller initial',
      })
    } else setConseillerDestination({ value: conseiller.value })
  }

  function toggleTousLesBeneficiaires() {
    setErreurReaffectation(undefined)

    if (idsBeneficiairesSelected.value.length > 0) {
      setIdsBeneficiairesSelected({ value: [] })
      mettreAJourCheckboxToutSelectionner(0)
    } else {
      setIdsBeneficiairesSelected({
        value: beneficiaires!.map((beneficiaire) => beneficiaire.id),
      })
      mettreAJourCheckboxToutSelectionner(beneficiaires!.length)
    }
  }

  function mettreAJourCheckboxToutSelectionner(tailleSelection: number) {
    const toutSelectionnerCheckbox = toutSelectionnerCheckboxRef.current!
    const isChecked = tailleSelection === beneficiaires?.length
    const isIndeterminate =
      tailleSelection !== beneficiaires?.length && tailleSelection > 0

    toutSelectionnerCheckbox.checked = isChecked
    toutSelectionnerCheckbox.indeterminate = isIndeterminate

    if (isChecked) toutSelectionnerCheckbox.ariaChecked = 'true'
    else if (isIndeterminate) toutSelectionnerCheckbox.ariaChecked = 'mixed'
    else toutSelectionnerCheckbox.ariaChecked = 'false'
  }

  async function fetchListeBeneficiaires(conseiller: SimpleConseiller) {
    setRecuperationBeneficiairesEnCours(true)

    try {
      const { getJeunesDuConseillerParId } = await import(
        'services/beneficiaires.service'
      )
      const beneficiairesDuConseiller = await getJeunesDuConseillerParId(
        conseiller.id
      )

      if (beneficiairesDuConseiller.length > 0) {
        setBeneficiaires(
          [...beneficiairesDuConseiller].sort(compareBeneficiairesByNom)
        )
        setTrackingTitle(
          'Réaffectation jeunes – Etape 3 – Réaff. jeunes vers cons. dest.'
        )
      } else {
        setBeneficiaires(undefined)
        setConseillerInitial({
          value: conseiller,
          errorChoice: 'Aucun bénéficiaire trouvé pour ce conseiller',
        })
        setTrackingTitle('Réaffectation jeunes – Etape 2 – Erreur')
      }
    } finally {
      setRecuperationBeneficiairesEnCours(false)
    }
  }

  function formIsValid() {
    let isFormValid = true

    if (
      estSuperviseurResponsable &&
      structureReaffectation.value === undefined
    ) {
      setStructureReaffectation({
        ...structureReaffectation,
        error: 'Veuillez choisir un contrat de réaffectation',
      })
      isFormValid = false
    }

    if (isReaffectationTemporaire.value === undefined) {
      setIsReaffectationTemporaire({
        ...isReaffectationTemporaire,
        error: 'Veuillez choisir un type de réaffectation',
      })
      isFormValid = false
    }

    if (!conseillerInitial.value) {
      setConseillerInitial({
        ...conseillerInitial,
        errorInput: 'Veuillez rechercher un conseiller initial',
      })
      return false
    }

    if (idsBeneficiairesSelected.value.length === 0) {
      setIdsBeneficiairesSelected({
        ...idsBeneficiairesSelected,
        error: 'Veuillez sélectionner au moins un bénéficiaire',
      })
      isFormValid = false
    }

    if (!conseillerDestination.value) {
      setConseillerDestination({
        ...conseillerDestination,
        errorInput: 'Veuillez rechercher un conseiller de destination',
      })
      isFormValid = false
    }

    return isFormValid
  }

  async function preparerReaffectationBeneficiaires(e: FormEvent) {
    e.preventDefault()
    if (isReaffectationEnCours) return
    if (!formIsValid()) {
      formErrorsRef.current!.focus()
      return
    }

    if (
      beneficiaires!
        .filter(({ id }) => idsBeneficiairesSelected.value.includes(id))
        .some(
          ({ structureMilo }) =>
            structureMilo?.id !== conseillerDestination.value!.idStructureMilo
        )
    ) {
      setOnConfirmationReaffectation(
        () => async () => reaffecterBeneficiaires()
      )
    } else {
      await reaffecterBeneficiaires()
    }
  }

  async function reaffecterBeneficiaires() {
    setReaffectationEnCours(true)
    try {
      const { reaffecter } = await import('services/beneficiaires.service')
      await reaffecter(
        conseillerInitial.value!.id,
        conseillerDestination.value!.id,
        idsBeneficiairesSelected.value,
        isReaffectationTemporaire.value!
      )
      resetAll()
      setAlerte(AlerteParam.reaffectation)
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Succès réaff.')
    } catch {
      setErreurReaffectation(
        'Suite à un problème inconnu la réaffectation a échoué. Vous pouvez réessayer.'
      )
      setTrackingTitle('Réaffectation jeunes – Etape 2 – Erreur')
    } finally {
      setReaffectationEnCours(false)
    }
  }

  function getErreurs(): LigneErreur[] {
    const erreurs = []
    if (isReaffectationTemporaire.error)
      erreurs.push({
        ancre: '#structure-reaffectation--CEJ',
        label: 'Le champ type de réaffectation est vide.',
        titreChamp: 'Type de réaffectation',
      })

    if (!conseillerInitial.value && conseillerInitial.errorInput)
      erreurs.push({
        ancre: '#conseiller-initial',
        label:
          'Le champ E-mail ou nom et prénom du conseiller initial est vide.',
        titreChamp: 'Conseiller initial',
      })

    if (
      conseillerInitial.value &&
      !conseillerInitial.errorInput &&
      !conseillerInitial.errorChoice &&
      idsBeneficiairesSelected.error
    )
      erreurs.push({
        ancre: '#beneficiaires',
        label: 'Le champ Bénéficiaires à réaffecter est vide.',
        titreChamp: 'Bénéficiaires à réaffecter',
      })

    if (
      conseillerInitial.value &&
      !conseillerInitial.errorInput &&
      !conseillerInitial.errorChoice &&
      conseillerDestination.errorInput
    )
      erreurs.push({
        ancre: '#conseiller-destinataire',
        label:
          'Le champ E-mail ou nom et prénom du conseiller de destination est vide.',
        titreChamp: 'Conseiller de destination',
      })

    return erreurs
  }

  useEffect(() => {
    if (conseillerInitialDebounced)
      fetchListeBeneficiaires(conseillerInitialDebounced)
  }, [conseillerInitialDebounced])

  useEffect(() => {
    let ref
    if (recuperationBeneficiairesEnCours) ref = loaderBeneficiairesRef
    else if (beneficiaires?.length) ref = etapeBeneficiairesRef

    ref?.current?.focus({ preventScroll: true })
    ref?.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [recuperationBeneficiairesEnCours, beneficiaires])

  useMatomo(trackingTitle, portefeuille.length > 0)

  return (
    <>
      <RecapitulatifErreursFormulaire
        erreurs={getErreurs()}
        ref={formErrorsRef}
      />

      <p className='text-s-bold text-content_color mb-6'>
        Tous les champs sont obligatoires
      </p>

      <form onSubmit={preparerReaffectationBeneficiaires} className='grow'>
        {estSuperviseurResponsable && (
          <Etape numero={1} titre='Choisissez un accompagnement'>
            {structureReaffectation.error && (
              <InputError id='structure-reaffectation--error' className='mb-2'>
                {structureReaffectation.error}
              </InputError>
            )}
            <div className='flex flex-wrap' id='structure-reaffectation--CEJ'>
              <RadioBox
                id='structure-reaffectation-FT'
                isSelected={
                  structureReaffectation.value ===
                  StructureConseiller.POLE_EMPLOI
                }
                onChange={() =>
                  handleInputStructureReaffectation(
                    StructureConseiller.POLE_EMPLOI
                  )
                }
                label='CEJ'
                name='structure-reaffectation'
              />

              <RadioBox
                id='structure-reaffectation-BRSA'
                isSelected={
                  structureReaffectation.value ===
                  StructureConseiller.POLE_EMPLOI_BRSA
                }
                onChange={() =>
                  handleInputStructureReaffectation(
                    StructureConseiller.POLE_EMPLOI_BRSA
                  )
                }
                label='BRSA'
                name='structure-reaffectation'
              />

              <RadioBox
                id='structure-reaffectation-AIJ'
                isSelected={
                  structureReaffectation.value ===
                  StructureConseiller.POLE_EMPLOI_AIJ
                }
                onChange={() =>
                  handleInputStructureReaffectation(
                    StructureConseiller.POLE_EMPLOI_AIJ
                  )
                }
                label='AIJ'
                name='structure-reaffectation'
              />
            </div>
          </Etape>
        )}

        <Etape
          numero={numerosEtapes[0]}
          titre='Choisissez un type de réaffectation'
        >
          {isReaffectationTemporaire.error && (
            <InputError id='type-reaffectation--error' className='mb-2'>
              {isReaffectationTemporaire.error}
            </InputError>
          )}
          <div className='flex flex-wrap'>
            <RadioBox
              id='type-reaffectation-temporaire'
              isSelected={isReaffectationTemporaire.value === true}
              onChange={() => handleInputTypeReaffectation(true)}
              label='Temporaire'
              name='type-reaffectation'
            />

            <RadioBox
              id='type-reaffectation-definitive'
              isSelected={isReaffectationTemporaire.value === false}
              onChange={() => handleInputTypeReaffectation(false)}
              label='Définitive'
              name='type-reaffectation'
            />
          </div>
        </Etape>

        <Etape
          numero={numerosEtapes[1]}
          titre='Saisissez le conseiller dont les bénéficiaires sont à réaffecter'
        >
          <ChoixConseiller
            name='initial'
            ref={conseillerInitialRef}
            idConseillerSelectionne={conseillerInitial.value?.id}
            structureReaffectation={structureReaffectation.value}
            onInput={resetConseillerInitial}
            onChoixConseiller={(conseiller) =>
              setConseillerInitial({ value: conseiller })
            }
            errorInput={conseillerInitial.errorInput}
            errorChoice={conseillerInitial.errorChoice}
          />

          <button
            type='button'
            onClick={() => setShowModalConseillerIntrouvable(true)}
            className='flex text-s-medium text-primary_darken hover:text-primary items-center'
          >
            Le conseiller n’apparaît pas dans la liste déroulante. Que faire
            ?&nbsp;
            <IconComponent
              name={IconName.Help}
              focusable={false}
              aria-hidden={true}
              className='w-4 h-4 fill-primary'
            />
          </button>
        </Etape>

        {recuperationBeneficiairesEnCours && (
          <SpinningLoader ref={loaderBeneficiairesRef} />
        )}

        {!recuperationBeneficiairesEnCours &&
          beneficiaires &&
          beneficiaires?.length > 0 && (
            <>
              <Etape
                ref={etapeBeneficiairesRef}
                numero={numerosEtapes[2]}
                titre='Sélectionnez les bénéficiaires à réaffecter'
              >
                {idsBeneficiairesSelected.error && (
                  <InputError id='beneficiaires--error' className='mb-2'>
                    {idsBeneficiairesSelected.error}
                  </InputError>
                )}
                <ul
                  id='beneficiaires'
                  aria-describedby={
                    idsBeneficiairesSelected.error
                      ? 'beneficiaires--error'
                      : undefined
                  }
                >
                  <li>
                    <label className='rounded-base p-4 flex items-center focus-within:bg-primary_lighten shadow-base mb-2 cursor-pointer hover:bg-primary_lighten'>
                      <input
                        type='checkbox'
                        className='mr-4'
                        onChange={toggleTousLesBeneficiaires}
                        ref={toutSelectionnerCheckboxRef}
                      />
                      Tout sélectionner
                    </label>
                  </li>

                  {beneficiaires.map((beneficiaire: BeneficiaireFromListe) => (
                    <li key={beneficiaire.id}>
                      <label className='rounded-base p-4 flex items-center focus-within:bg-primary_lighten shadow-base mb-2 cursor-pointer hover:bg-primary_lighten'>
                        <input
                          type='checkbox'
                          checked={idsBeneficiairesSelected.value.includes(
                            beneficiaire.id
                          )}
                          onChange={() =>
                            selectionnerBeneficiaire(beneficiaire)
                          }
                          readOnly={true}
                          className='mr-4 ml-6'
                        />
                        {getNomBeneficiaireComplet(beneficiaire)}
                        {conseillerDestination?.value &&
                          beneficiaire.structureMilo?.id &&
                          beneficiaire.structureMilo.id !==
                            conseillerDestination.value?.idStructureMilo && (
                            <span className='text-warning text-xs ml-2'>
                              Mission Locale différente de{' '}
                              {conseillerDestination.value.firstName}{' '}
                              {conseillerDestination.value.lastName}
                            </span>
                          )}
                      </label>
                    </li>
                  ))}
                </ul>
              </Etape>

              <Etape
                numero={numerosEtapes[3]}
                titre='Saisissez le conseiller à qui affecter les bénéficiaires'
              >
                <ChoixConseiller
                  name='destinataire'
                  idConseillerSelectionne={conseillerDestination.value?.id}
                  structureReaffectation={structureReaffectation.value}
                  onInput={resetConseillerDestination}
                  onChoixConseiller={(conseiller) =>
                    choixConseillerDestination({ value: conseiller })
                  }
                  errorInput={conseillerDestination.errorInput}
                  errorChoice={conseillerDestination.errorChoice}
                />

                <button
                  type='button'
                  onClick={() => setShowModalConseillerIntrouvable(true)}
                  className='flex text-s-medium text-primary_darken hover:text-primary items-center'
                >
                  Le conseiller n’apparaît pas dans la liste déroulante. Que
                  faire ?&nbsp;
                  <IconComponent
                    name={IconName.Help}
                    focusable={false}
                    aria-hidden={true}
                    className='w-4 h-4 fill-primary'
                  />
                </button>
              </Etape>

              <div className='w-full flex justify-center gap-2'>
                <Button type='submit'>
                  <IconComponent
                    name={IconName.Send}
                    focusable={false}
                    aria-hidden={true}
                    className={`w-6 h-6 mr-2 fill-white`}
                  />
                  Valider mon choix
                </Button>

                {erreurReaffectation && (
                  <div className='absolute flex mt-3'>
                    <IconComponent
                      name={IconName.Error}
                      focusable={false}
                      aria-hidden={true}
                      className='fill-warning w-6 h-6 mr-2 flex-shrink-0'
                    />
                    <p className='text-warning'>{erreurReaffectation}</p>
                  </div>
                )}
              </div>
            </>
          )}
      </form>

      {showModalConseillerIntrouvable && (
        <ConseillerIntrouvableSuggestionModal
          onClose={() => setShowModalConseillerIntrouvable(false)}
        />
      )}

      {onConfirmationReaffectation && (
        <ReaffectationVerificationMissionLocaleModal
          onClose={() => setOnConfirmationReaffectation(undefined)}
          onReaffectation={onConfirmationReaffectation}
        />
      )}
    </>
  )
}

export default withTransaction(
  ReaffectationPage.name,
  'page'
)(ReaffectationPage)

type StateChoixConseiller = {
  value: SimpleConseiller | undefined
  errorInput?: string
  errorChoice?: string
}
