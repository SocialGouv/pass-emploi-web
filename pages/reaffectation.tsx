import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import dynamic from 'next/dynamic'
import React, { FormEvent, useRef, useState } from 'react'

import RadioBox from 'components/action/RadioBox'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import { Etape } from 'components/ui/Form/Etape'
import { InputError } from 'components/ui/Form/InputError'
import Label from 'components/ui/Form/Label'
import SelectAutocomplete from 'components/ui/Form/SelectAutocomplete'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import SuccessAlert from 'components/ui/Notifications/SuccessAlert'
import { ValueWithError } from 'components/ValueWithError'
import { BaseConseiller, Conseiller } from 'interfaces/conseiller'
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

interface ReaffectationProps extends PageProps {
  conseillersEtablissement: Conseiller[]
}

type OptionConseiller = {
  id: string
  value: string
}

function Reaffectation({ conseillersEtablissement }: ReaffectationProps) {
  const [portefeuille] = usePortefeuille()

  const [queryConseillerInitial, setQueryConseillerInitial] =
    useState<ValueWithError>({ value: '' })
  const [conseillerInitial, setConseillerInitial] = useState<
    BaseConseiller | undefined
  >()
  const [queryConseillerDestination, setQueryConseillerDestination] =
    useState<ValueWithError>({ value: '' })
  const [conseillerDestination, setConseillerDestination] = useState<
    BaseConseiller | undefined
  >()

  const [
    isRechercheBeneficiairesSubmitted,
    setRechercheBeneficiairesSubmitted,
  ] = useState<boolean>(false)
  const [beneficiaires, setBeneficiaires] = useState<JeuneFromListe[]>([])

  const [idsBeneficiairesSelected, setIdsBeneficiairesSelected] = useState<
    ValueWithError<string[]>
  >({ value: [] })
  const [isReaffectationEnCours, setReaffectationEnCours] =
    useState<boolean>(false)
  const [isReaffectationSuccess, setReaffectationSuccess] =
    useState<boolean>(false)
  const [erreurReaffectation, setErreurReaffectation] = useState<
    string | undefined
  >(undefined)
  const [isReaffectationTemporaire, setIsReaffectationTemporaire] = useState<
    ValueWithError<boolean | undefined>
  >({ value: undefined })
  const [showModalConseillerIntrouvable, setShowModalConseillerIntrouvable] =
    useState<boolean>(false)

  const inputConseillerInitialRef = useRef<HTMLInputElement>(null)
  const [trackingTitle, setTrackingTitle] = useState<string>(
    'Réaffectation jeunes – Etape 1 – Saisie mail cons. ini.'
  )

  const aDesBeneficiaires = portefeuille.length === 0 ? 'non' : 'oui'

  const conseillersOptions: OptionConseiller[] =
    conseillersEtablissement.map(conseillerToOption)

  function conseillerToOption(conseiller: Conseiller): OptionConseiller {
    let value: string = `${conseiller.firstName} ${conseiller.lastName}`
    if (conseiller.email) value += ` (${conseiller.email})`

    return {
      id: conseiller.id,
      value,
    }
  }

  function handleInputTypeReaffectation(isTemporaire: boolean) {
    setErreurReaffectation(undefined)
    setIsReaffectationTemporaire({ value: isTemporaire })
  }

  function handleInputConseillerInitial(inputValue: string) {
    setErreurReaffectation(undefined)
    setQueryConseillerInitial({ value: inputValue })

    const optionSelectionnee = conseillersOptions.find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
    if (optionSelectionnee) {
      setConseillerInitial(
        conseillersEtablissement.find(({ id }) => id === optionSelectionnee.id)
      )
    }

    resetFormOnNewInputConseillerInitial()
  }

  function handleInputConseillerDestination(inputValue: string) {
    setQueryConseillerDestination({ value: inputValue })
    const optionSelectionnee = conseillersOptions.find(
      ({ value }) =>
        value.localeCompare(inputValue, undefined, {
          sensitivity: 'base',
        }) === 0
    )
    if (optionSelectionnee) {
      setConseillerDestination(
        conseillersEtablissement.find(({ id }) => id === optionSelectionnee.id)
      )
    }

    setErreurReaffectation(undefined)
  }

  function resetAll() {
    setQueryConseillerInitial({ value: '' })
    setConseillerInitial(undefined)
    inputConseillerInitialRef.current!.value = ''
    resetFormOnNewInputConseillerInitial()
    setIsReaffectationTemporaire({ value: undefined })
  }

  function resetFormOnNewInputConseillerInitial() {
    setRechercheBeneficiairesSubmitted(false)
    setBeneficiaires([])
    setIdsBeneficiairesSelected({ value: [] })
    setReaffectationSuccess(false)
    setErreurReaffectation(undefined)
    setQueryConseillerDestination({ value: '' })
    setConseillerDestination(undefined)
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

    if (idsBeneficiairesSelected.value.length !== beneficiaires.length) {
      setIdsBeneficiairesSelected({
        value: beneficiaires.map((beneficiaire) => beneficiaire.id),
      })
    } else {
      setIdsBeneficiairesSelected({ value: [] })
    }
  }

  async function fetchListeBeneficiaires() {
    if (!conseillerInitial && !queryConseillerInitial.value) {
      setQueryConseillerInitial({
        ...queryConseillerInitial,
        error: 'Veuillez rechercher les bénéficiaires d’un conseiller',
      })
      return
    }

    try {
      const { getJeunesDuConseillerParEmail, getJeunesDuConseillerParId } =
        await import('services/jeunes.service')

      let beneficiairesDuConseiller: JeuneFromListe[]
      if (conseillerInitial) {
        beneficiairesDuConseiller = await getJeunesDuConseillerParId(
          conseillerInitial.id
        )
      } else {
        const { conseiller, jeunes } = await getJeunesDuConseillerParEmail(
          queryConseillerInitial.value
        )
        setConseillerInitial(conseiller)
        beneficiairesDuConseiller = jeunes
      }

      setRechercheBeneficiairesSubmitted(true)
      if (beneficiairesDuConseiller.length > 0) {
        setBeneficiaires(
          [...beneficiairesDuConseiller].sort(compareJeunesByNom)
        )
        setTrackingTitle(
          'Réaffectation jeunes – Etape 2 – Réaff. jeunes vers cons. dest.'
        )
      } else {
        setQueryConseillerInitial({
          ...queryConseillerInitial,
          error: 'Aucun bénéficiaire trouvé pour ce conseiller',
        })
      }
    } catch (err) {
      const erreur = (err as Error).message
        ? 'Aucun conseiller ne correspond'
        : "Une erreur inconnue s'est produite"
      setQueryConseillerInitial({ ...queryConseillerInitial, error: erreur })
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Erreur')
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

    if (!conseillerDestination && !queryConseillerDestination.value) {
      setQueryConseillerDestination({
        ...queryConseillerDestination,
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
      const { getConseillerByEmail } = await import(
        'services/conseiller.service'
      )
      const idConseillerDestination = (
        conseillerDestination ??
        (await getConseillerByEmail(queryConseillerDestination.value))
      ).id

      const { reaffecter } = await import('services/jeunes.service')
      await reaffecter(
        conseillerInitial!.id,
        idConseillerDestination,
        idsBeneficiairesSelected.value,
        isReaffectationTemporaire.value!
      )
      resetAll()
      setReaffectationSuccess(true)
      setTrackingTitle('Réaffectation jeunes – Etape 1 – Succès réaff.')
    } catch (erreur: any) {
      if (
        erreur.message &&
        (Array.isArray(erreur.message) ||
          erreur.message.startsWith('Conseiller'))
      ) {
        setQueryConseillerDestination({
          ...queryConseillerDestination,
          error: 'Aucun conseiller ne correspond',
        })
      } else {
        setErreurReaffectation(
          'Suite à un problème inconnu la réaffectation a échoué. Vous pouvez réessayer.'
        )
      }
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

        <Etape numero={2} titre='Recherchez les bénéficiaires d’un conseiller'>
          <Label htmlFor='conseiller-initial'>
            Nom et prénom ou e-mail conseiller initial
          </Label>
          {queryConseillerInitial.error && (
            <InputError id='conseiller-initial--error' className='mb-2'>
              {queryConseillerInitial.error}
            </InputError>
          )}
          <div className='flex align-middle'>
            <SelectAutocomplete
              id='conseiller-initial'
              ref={inputConseillerInitialRef}
              onChange={handleInputConseillerInitial}
              options={conseillersOptions}
              required={true}
              invalid={Boolean(queryConseillerInitial.error)}
            />

            <Button
              className='ml-4 shrink-0'
              label='Afficher la liste des bénéficiaires'
              style={ButtonStyle.SECONDARY}
              disabled={!queryConseillerInitial.value}
              type='button'
              onClick={fetchListeBeneficiaires}
            >
              <IconComponent
                name={IconName.ArrowForward}
                focusable={false}
                aria-hidden={true}
                className='w-6 h-6'
              />
              Afficher la liste des bénéficiaires
            </Button>
          </div>

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

        {isRechercheBeneficiairesSubmitted && beneficiaires.length > 0 && (
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
                  className='rounded-base p-4 flex focus-within:bg-primary_lighten shadow-base mb-2 cursor-pointer'
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
                    className='rounded-base p-4 flex focus-within:bg-primary_lighten shadow-base mb-2 cursor-pointer'
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

            <Etape numero={4} titre='Renseignez le conseiller de destination'>
              <Label htmlFor='conseiller-destination'>
                Nom et prénom ou e-mail conseiller de destination
              </Label>

              {queryConseillerDestination.error && (
                <InputError id='conseiller-destinatin--error' className='mb-2'>
                  {queryConseillerDestination.error}
                </InputError>
              )}

              <SelectAutocomplete
                id='conseiller-destination'
                onChange={handleInputConseillerDestination}
                options={conseillersOptions}
                required={true}
                invalid={Boolean(queryConseillerDestination.error)}
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
                  title='Aide conseiller CEJ manquant'
                />
              </button>
            </Etape>

            <div className='w-full flex justify-center gap-2'>
              <Button label='Réaffecter les bénéficiaires' type='submit'>
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

export const getServerSideProps: GetServerSideProps<
  ReaffectationProps
> = async (context) => {
  const { default: withMandatorySessionOrRedirect } = await import(
    'utils/auth/withMandatorySessionOrRedirect'
  )
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  if (!user.estSuperviseur) {
    return { notFound: true }
  }

  const referer = context.req.headers.referer
  const redirectTo =
    referer && !redirectedFromHome(referer) ? referer : '/mes-jeunes'

  const { getConseillerServerSide, getConseillersEtablissementServerSide } =
    await import('services/conseiller.service')
  const conseiller = await getConseillerServerSide(user, accessToken)
  if (!conseiller) {
    throw new Error(`Conseiller ${user.id} inexistant`)
  }

  const conseillersEtablissement = conseiller.agence?.id
    ? await getConseillersEtablissementServerSide(
        accessToken,
        conseiller.agence.id,
        user
      )
    : []

  return {
    props: {
      returnTo: redirectTo,
      pageTitle: 'Réaffectation',
      withoutChat: true,
      conseillersEtablissement,
    },
  }
}

export default withTransaction(Reaffectation.name, 'page')(Reaffectation)
