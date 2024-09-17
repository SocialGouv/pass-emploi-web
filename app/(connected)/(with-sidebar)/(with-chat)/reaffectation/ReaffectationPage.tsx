'use client'

import { withTransaction } from '@elastic/apm-rum-react'
import dynamic from 'next/dynamic'
import React, {
  FormEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'

import RadioBox from 'components/action/RadioBox'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Etape, NumeroEtape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import RecapitulatifErreursFormulaire, {
  LigneErreur,
} from 'components/ui/Notifications/RecapitulatifErreursFormulaire'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import Table from 'components/ui/Table/Table'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import TR from 'components/ui/Table/TR'
import { ValueWithError } from 'components/ValueWithError'
import {
  BeneficiaireFromListe,
  compareBeneficiairesByNom,
  getNomBeneficiaireComplet,
} from 'interfaces/beneficiaire'
import { BaseConseiller, StructureConseiller } from 'interfaces/conseiller'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'

type StructureReaffectation =
  | StructureConseiller.POLE_EMPLOI
  | StructureConseiller.POLE_EMPLOI_BRSA
  | StructureConseiller.POLE_EMPLOI_AIJ

const ConseillerIntrouvableSuggestionModal = dynamic(
  () => import('components/ConseillerIntrouvableSuggestionModal'),
  { ssr: false }
)

type ReaffectationProps = {
  estSuperviseurResponsable: boolean
}

function ReaffectationPage({ estSuperviseurResponsable }: ReaffectationProps) {
  const [portefeuille] = usePortefeuille()
  const conseillerInitialRef = useRef<{
    resetRechercheConseiller: () => void
  }>(null)

  const toutSelectionnerCheckboxRef = useRef<HTMLInputElement>(null)
  const formErrorsRef = useRef<HTMLDivElement>(null)

  const [structureReaffectation, setStructureReaffectation] = useState<
    ValueWithError<StructureReaffectation | undefined>
  >({ value: undefined })

  const [isReaffectationTemporaire, setIsReaffectationTemporaire] = useState<
    ValueWithError<boolean | undefined>
  >({ value: undefined })

  const [conseillerInitial, setConseillerInitial] = useState<
    ValueWithError<BaseConseiller | undefined>
  >({ value: undefined })
  const [conseillerDestination, setConseillerDestination] = useState<
    ValueWithError<BaseConseiller | undefined>
  >({ value: undefined })

  const [beneficiaires, setBeneficiaires] = useState<
    BeneficiaireFromListe[] | undefined
  >()
  const [idsBeneficiairesSelected, setIdsBeneficiairesSelected] = useState<
    ValueWithError<string[]>
  >({ value: [] })

  const [isReaffectationEnCours, setReaffectationEnCours] =
    useState<boolean>(false)
  const [isReaffectationSuccess, setReaffectationSuccess] =
    useState<boolean>(false)
  const [erreurReaffectation, setErreurReaffectation] = useState<
    string | undefined
  >()

  const [showModalConseillerIntrouvable, setShowModalConseillerIntrouvable] =
    useState<boolean>(false)

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
    setReaffectationSuccess(false)
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
    conseiller: ValueWithError<BaseConseiller | undefined>
  ) {
    if (conseiller.value?.id === conseillerInitial.value?.id) {
      setConseillerDestination({
        value: undefined,
        error:
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

  async function fetchListeBeneficiaires(conseiller: BaseConseiller) {
    setConseillerInitial({ value: conseiller })

    const { getJeunesDuConseillerParId } = await import(
      'services/jeunes.service'
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
        error: 'Aucun bénéficiaire trouvé pour ce conseiller',
      })
      setTrackingTitle('Réaffectation jeunes – Etape 2 – Erreur')
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
        error: 'Veuillez rechercher un conseiller initial',
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
        error: 'Veuillez rechercher un conseiller de destination',
      })
      isFormValid = false
    }

    return isFormValid
  }

  async function reaffecterBeneficiaires(e: FormEvent) {
    e.preventDefault()
    if (isReaffectationEnCours) return
    if (!formIsValid()) {
      formErrorsRef.current!.focus()
      return
    }

    setReaffectationEnCours(true)
    try {
      const { reaffecter } = await import('services/jeunes.service')
      await reaffecter(
        conseillerInitial.value!.id,
        conseillerDestination.value!.id,
        idsBeneficiairesSelected.value,
        isReaffectationTemporaire.value!
      )
      resetAll()
      setReaffectationSuccess(true)
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Succès réaff.')
    } catch (erreur) {
      setErreurReaffectation(
        'Suite à un problème inconnu la réaffectation a échoué. Vous pouvez réessayer.'
      )
      setTrackingTitle('Réaffectation jeunes – Etape 2 – Erreur')
    } finally {
      setReaffectationEnCours(false)
    }
  }

  function getErreurs(): LigneErreur[] {
    let erreurs = []
    if (isReaffectationTemporaire.error)
      erreurs.push({
        ancre: '#structure-reaffectation--CEJ',
        label: 'Le champ type de réaffectation est vide.',
        titreChamp: 'Type de réaffectation',
      })

    if (doitAfficherErreurConseillerInitial())
      erreurs.push({
        ancre: '#conseiller-initial',
        label:
          'Le champ E-mail ou nom et prénom du conseiller initial est vide.',
        titreChamp: 'Conseiller initial',
      })
    if (
      conseillerInitial.value &&
      !conseillerInitial.error &&
      idsBeneficiairesSelected.error
    )
      erreurs.push({
        ancre: '#reaffectation-tout-selectionner',
        label: 'Le champ Bénéficiaires à réaffecter est vide.',
        titreChamp: 'Bénéficiaires à réaffecter',
      })
    if (
      conseillerInitial.value &&
      !conseillerInitial.error &&
      conseillerDestination.error
    )
      erreurs.push({
        ancre: '#conseiller-destinataire',
        label:
          'Le champ E-mail ou nom et prénom du conseiller de destination est vide.',
        titreChamp: 'Conseiller de destination',
      })

    return erreurs
  }

  function doitAfficherErreurConseillerInitial() {
    return !conseillerInitial.value && conseillerInitial.error
  }

  useMatomo(trackingTitle, portefeuille.length > 0)

  return (
    <>
      {isReaffectationSuccess && (
        <SuccessAlert
          label={'Les bénéficiaires ont été réaffectés avec succès'}
          onAcknowledge={() => setReaffectationSuccess(false)}
        />
      )}

      <RecapitulatifErreursFormulaire
        erreurs={getErreurs()}
        ref={formErrorsRef}
      />

      <p className='text-s-bold text-content_color mb-6'>
        Tous les champs sont obligatoires
      </p>

      <form onSubmit={reaffecterBeneficiaires} className='grow'>
        {estSuperviseurResponsable && (
          <Etape numero={1} titre='Choisissez un accompagnement'>
            {structureReaffectation.error && (
              <InputError id='structure-reaffectation--error' className='mb-2'>
                {structureReaffectation.error}
              </InputError>
            )}
            <div className='flex flex-wrap' id='structure-reaffectation--CEJ'>
              <RadioBox
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
              isSelected={isReaffectationTemporaire.value === true}
              onChange={() => handleInputTypeReaffectation(true)}
              label='Temporaire'
              name='type-reaffectation'
            />

            <RadioBox
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
            onChoixConseiller={fetchListeBeneficiaires}
            error={conseillerInitial.error}
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

        {beneficiaires && beneficiaires.length > 0 && (
          <>
            <Etape
              numero={numerosEtapes[2]}
              titre='Sélectionnez les bénéficiaires à réaffecter'
            >
              {idsBeneficiairesSelected.error && (
                <InputError id='beneficiairs--error' className='mb-2'>
                  {idsBeneficiairesSelected.error}
                </InputError>
              )}
              <ul>
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
                        onChange={() => selectionnerBeneficiaire(beneficiaire)}
                        readOnly={true}
                        className='mr-4 ml-6'
                      />
                      {getNomBeneficiaireComplet(beneficiaire)}
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
                error={conseillerDestination.error}
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
    </>
  )
}

export default withTransaction(
  ReaffectationPage.name,
  'page'
)(ReaffectationPage)

const ChoixConseiller = forwardRef(
  (
    {
      idConseillerSelectionne,
      structureReaffectation,
      name,
      onChoixConseiller,
      onInput,
      error,
    }: {
      name: string
      onInput: () => void
      onChoixConseiller: (conseiller: BaseConseiller) => void
      idConseillerSelectionne?: string
      structureReaffectation?: StructureReaffectation
      error?: string
    },
    ref
  ) => {
    const id = 'conseiller-' + name

    const inputRef = useRef<HTMLInputElement>(null)

    const [queryConseiller, setQueryConseiller] = useState<ValueWithError>({
      value: '',
    })
    const [choixConseillers, setChoixConseillers] = useState<
      BaseConseiller[] | undefined
    >()

    const [rechercheConseillerEnCours, setRechercheConseillerEnCours] =
      useState<boolean>(false)

    function handleInputQuery(value: string) {
      setChoixConseillers(undefined)
      setQueryConseiller({ value })
      onInput()
    }

    useImperativeHandle(ref, () => ({
      resetRechercheConseiller: resetRechercheConseiller,
    }))

    function resetRechercheConseiller() {
      inputRef.current!.value = ''
      setChoixConseillers(undefined)
      setQueryConseiller({ value: '' })
    }

    async function rechercherConseiller() {
      if (queryConseiller.value.length < 2) return
      if (choixConseillers) return

      const { getConseillers } = await import('services/conseiller.service')
      setRechercheConseillerEnCours(true)
      const conseillers = await getConseillers(
        queryConseiller.value,
        structureReaffectation
      )
      if (conseillers.length) setChoixConseillers(conseillers)
      else {
        setQueryConseiller({
          ...queryConseiller,
          error: 'Aucun conseiller ne correspond',
        })
      }
      setRechercheConseillerEnCours(false)
    }

    function choisirConseiller(conseiller: BaseConseiller): void {
      if (conseiller.id !== idConseillerSelectionne) {
        onChoixConseiller(conseiller)
      }
    }

    return (
      <>
        <Label htmlFor={id}>E-mail ou nom et prénom du conseiller</Label>
        {queryConseiller.error && (
          <InputError id={id + '--error'} className='mb-2'>
            {queryConseiller.error}
          </InputError>
        )}
        {error && (
          <InputError id={id + '--error'} className='mb-2'>
            {error}
          </InputError>
        )}

        <div className='flex'>
          <Input
            type='search'
            id={id}
            onChange={handleInputQuery}
            required={true}
            invalid={Boolean(queryConseiller.error || error)}
            ref={inputRef}
          />

          <Button
            className='ml-4 shrink-0'
            label={'Rechercher un conseiller ' + name}
            style={ButtonStyle.SECONDARY}
            disabled={queryConseiller.value.length < 2}
            type='button'
            onClick={rechercherConseiller}
            isLoading={rechercheConseillerEnCours}
          >
            <IconComponent
              name={IconName.Search}
              focusable={false}
              aria-hidden={true}
              className='w-6 h-6'
            />
            Rechercher un conseiller
          </Button>
        </div>

        {choixConseillers && choixConseillers.length > 0 && (
          <Table caption={{ text: 'Choix du conseiller ' + name }}>
            <thead>
              <TR isHeader={true}>
                <TH>Conseiller</TH>
                <TH>E-mail conseiller</TH>
              </TR>
            </thead>
            <tbody>
              {choixConseillers.map((conseiller) => (
                <TR key={conseiller.id} className='relative rotate-0'>
                  <TD isBold>
                    <label className='before:fixed before:inset-0 before:z-10 cursor-pointer'>
                      <input
                        type='radio'
                        name={'choix-' + name}
                        checked={idConseillerSelectionne === conseiller.id}
                        required={true}
                        className='mr-2'
                        onChange={() => choisirConseiller(conseiller)}
                        aria-describedby={error ? id + '--error' : undefined}
                      />
                      {conseiller.firstName} {conseiller.lastName}
                    </label>
                  </TD>
                  <TD>
                    {conseiller.email ?? (
                      <span aria-label='non renseignée'>-</span>
                    )}
                  </TD>
                </TR>
              ))}
            </tbody>
          </Table>
        )}
      </>
    )
  }
)
ChoixConseiller.displayName = 'ChoixConseiller'
