import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import React, { FormEvent, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import Input from 'components/ui/Form/Input'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import Table from 'components/ui/Table/Table'
import { TBody } from 'components/ui/Table/TBody'
import TD from 'components/ui/Table/TD'
import { TH } from 'components/ui/Table/TH'
import { THead } from 'components/ui/Table/THead'
import { TR } from 'components/ui/Table/TR'
import { ValueWithError } from 'components/ValueWithError'
import { BaseConseiller } from 'interfaces/conseiller'
import {
  compareJeunesByNom,
  getNomJeuneComplet,
  JeuneFromListe,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import useMatomo from 'utils/analytics/useMatomo'
import { usePortefeuille } from 'utils/portefeuilleContext'
import redirectedFromHome from 'utils/redirectedFromHome'

const ConseillerIntrouvableSuggestionModal = dynamic(
  import('components/ConseillerIntrouvableSuggestionModal'),
  { ssr: false }
)

function Reaffectation(_props: PageProps) {
  const [portefeuille] = usePortefeuille()

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
    JeuneFromListe[] | undefined
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

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

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

  function selectionnerBeneficiaire(beneficiaire: JeuneFromListe) {
    setErreurReaffectation(undefined)

    if (idsBeneficiairesSelected.value.includes(beneficiaire.id)) {
      setIdsBeneficiairesSelected({
        value: idsBeneficiairesSelected.value.filter(
          (id) => id !== beneficiaire.id
        ),
      })
    } else {
      setIdsBeneficiairesSelected({
        value: idsBeneficiairesSelected.value.concat(beneficiaire.id),
      })
    }
  }

  function toggleTousLesBeneficiaires() {
    setErreurReaffectation(undefined)

    if (idsBeneficiairesSelected.value.length !== beneficiaires!.length) {
      setIdsBeneficiairesSelected({
        value: beneficiaires!.map((beneficiaire) => beneficiaire.id),
      })
    } else {
      setIdsBeneficiairesSelected({ value: [] })
    }
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
      setBeneficiaires([...beneficiairesDuConseiller].sort(compareJeunesByNom))
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

  async function reaffecterBeneficiaires(e: FormEvent) {
    e.preventDefault()
    if (isReaffectationEnCours) {
      return
    }

    let formInvalid = false
    if (isReaffectationTemporaire.value === undefined) {
      setIsReaffectationTemporaire({
        ...isReaffectationTemporaire,
        error: 'Veuillez choisir un type de réaffectation',
      })
      formInvalid = true
    }

    if (!conseillerDestination.value) {
      setConseillerDestination({
        ...conseillerDestination,
        error: 'Veuillez rechercher un conseiller de destination',
      })
      formInvalid = true
    }

    if (idsBeneficiairesSelected.value.length === 0) {
      setIdsBeneficiairesSelected({
        ...idsBeneficiairesSelected,
        error: 'Veuillez sélectionner au moins un bénéficiaire',
      })
      formInvalid = true
    }

    if (formInvalid) {
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

  useMatomo(trackingTitle, aDesBeneficiaires)

  return (
    <>
      {isReaffectationSuccess && (
        <SuccessAlert
          label={'Les bénéficiaires ont été réaffectés avec succès'}
          onAcknowledge={() => setReaffectationSuccess(false)}
        />
      )}

      <p className='text-s-bold text-content_color mb-6'>
        Tous les champs sont obligatoires
      </p>

      <form onSubmit={reaffecterBeneficiaires} className='grow'>
        <Etape numero={1} titre='Choisissez un type de réaffectation'>
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
              id='type-reaffectation--temporaire'
            />

            <RadioBox
              isSelected={isReaffectationTemporaire.value === false}
              onChange={() => handleInputTypeReaffectation(false)}
              label='Définitive'
              name='type-reaffectation'
              id='type-reaffectation--definitive'
            />
          </div>
        </Etape>

        <Etape
          numero={2}
          titre='Saisissez le conseiller dont les bénéficiaires sont à réaffecter'
        >
          <ChoixConseiller
            name='initial'
            idConseillerSelectionne={conseillerInitial.value?.id}
            onInput={resetConseillerInitial}
            onChoixConseiller={fetchListeBeneficiaires}
            error={conseillerInitial.error}
          />
        </Etape>

        {beneficiaires && beneficiaires.length > 0 && (
          <>
            <Etape
              numero={3}
              titre='Sélectionnez les bénéficiaires à réaffecter'
            >
              {idsBeneficiairesSelected.error && (
                <InputError id='beneficiairs--error' className='mb-2'>
                  {idsBeneficiairesSelected.error}
                </InputError>
              )}
              <ul>
                <li
                  onClick={toggleTousLesBeneficiaires}
                  className='rounded-base p-4 flex focus-within:bg-primary_lighten shadow-base mb-2 cursor-pointer hover:bg-primary_lighten'
                >
                  <input
                    id='reaffectation-tout-selectionner'
                    type='checkbox'
                    className='mr-4'
                    checked={
                      idsBeneficiairesSelected.value.length ===
                      beneficiaires.length
                    }
                    readOnly={true}
                  />
                  <label
                    htmlFor='reaffectation-tout-selectionner'
                    onClick={(e) => e.stopPropagation()}
                  >
                    Tout sélectionner
                  </label>
                </li>

                {beneficiaires.map((beneficiaire: JeuneFromListe) => (
                  <li
                    key={beneficiaire.id}
                    onClick={() => selectionnerBeneficiaire(beneficiaire)}
                    className='rounded-base p-4 flex focus-within:bg-primary_lighten shadow-base mb-2 cursor-pointer hover:bg-primary_lighten'
                  >
                    <input
                      id={'checkbox-' + beneficiaire.id}
                      type='checkbox'
                      checked={idsBeneficiairesSelected.value.includes(
                        beneficiaire.id
                      )}
                      readOnly={true}
                      className='mr-4 ml-6'
                    />
                    <label
                      htmlFor={'checkbox-' + beneficiaire.id}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getNomJeuneComplet(beneficiaire)}
                    </label>
                  </li>
                ))}
              </ul>
            </Etape>

            <Etape
              numero={4}
              titre='Saisissez le conseiller à qui affecter les bénéficiaires'
            >
              <ChoixConseiller
                name='destinataire'
                idConseillerSelectionne={conseillerDestination.value?.id}
                onInput={resetConseillerDestination}
                onChoixConseiller={(conseiller) =>
                  setConseillerDestination({ value: conseiller })
                }
                error={conseillerDestination.error}
              />
            </Etape>

            <div className='w-full flex justify-center gap-2'>
              <Button type='submit'>
                <IconComponent
                  name={IconName.Send}
                  focusable={false}
                  aria-hidden={true}
                  className={`w-6 h-6 mr-2 fill-blanc`}
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

export const getServerSideProps: GetServerSideProps<PageProps> = async (
  context
) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user },
  } = sessionOrRedirect
  if (!user.estSuperviseur) {
    return { notFound: true }
  }

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  return {
    props: {
      returnTo: redirectTo,
      pageTitle: 'Réaffectation',
      withoutChat: true,
    },
  }
}

export default withTransaction(Reaffectation.name, 'page')(Reaffectation)

function ChoixConseiller({
  idConseillerSelectionne,
  name,
  onChoixConseiller,
  onInput,
  error,
}: {
  name: string
  onInput: () => void
  onChoixConseiller: (conseiller: BaseConseiller) => void
  idConseillerSelectionne?: string
  error?: string
}) {
  const id = 'conseiller-' + name

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

  async function rechercherConseiller() {
    if (queryConseiller.value.length < 2) return
    if (choixConseillers) return

    const { getConseillers } = await import('services/conseiller.service')
    setRechercheConseillerEnCours(true)
    const conseillers = await getConseillers(queryConseiller.value)
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
          invalid={Boolean(queryConseiller.error)}
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
          <THead>
            <TR isHeader={true}>
              <TH>Conseiller</TH>
              <TH>E-mail conseiller</TH>
            </TR>
          </THead>
          <TBody>
            {choixConseillers.map((conseiller) => (
              <TR
                key={conseiller.id}
                onClick={() => choisirConseiller(conseiller)}
              >
                <TD isBold>
                  <input
                    type='radio'
                    id={'choix-' + name + '--' + conseiller.id}
                    name={'choix-' + name}
                    checked={idConseillerSelectionne === conseiller.id}
                    readOnly={true}
                    required={true}
                    className='mr-2'
                  />
                  <label
                    htmlFor={'choix-' + name + '--' + conseiller.id}
                    onClick={(e) => e.stopPropagation()}
                  >
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
          </TBody>
        </Table>
      )}
    </>
  )
}
