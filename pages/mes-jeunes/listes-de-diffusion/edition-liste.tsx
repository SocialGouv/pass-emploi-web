import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import ConfirmationDeleteListeDiffusion from 'components/ConfirmationDeleteListeDiffusionModal'
import { BeneficiaireIndicationReaffectaction } from 'components/jeune/BeneficiaireIndications'
import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import PageActionsPortal from 'components/PageActionsPortal'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import { ValueWithError } from 'components/ValueWithError'
import { getNomJeuneComplet } from 'interfaces/jeune'
import { ListeDeDiffusion } from 'interfaces/liste-de-diffusion'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import {
  ListeDeDiffusionFormData,
  ListesDeDiffusionService,
} from 'services/listes-de-diffusion.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'
import { usePortefeuille } from 'utils/portefeuilleContext'
import redirectedFromHome from 'utils/redirectedFromHome'

type EditionListeDiffusionProps = PageProps & {
  returnTo: string
  liste?: ListeDeDiffusion
}

function EditionListeDiffusion({
  returnTo,
  liste,
}: EditionListeDiffusionProps) {
  const listesDeDiffusionService = useDependance<ListesDeDiffusionService>(
    'listesDeDiffusionService'
  )
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const [portefeuille] = usePortefeuille()
  const defaultBeneficiaires = getDefaultBeneficiaires()
  const [idsBeneficiaires, setIdsBeneficiaires] = useState<
    ValueWithError<string[]>
  >({ value: defaultBeneficiaires.map(({ id }) => id) })
  const [titre, setTitre] = useState<string | undefined>(liste?.titre)

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showErreurSoumission, setShowErreurTraitement] =
    useState<boolean>(false)
  const [showConfirmationSuppression, setShowConfirmationSuppression] =
    useState(false)

  const formIsValid = Boolean(titre) && Boolean(idsBeneficiaires.value.length)

  function hasChanges(): boolean {
    const previousIds = liste!.beneficiaires.map(({ id }) => id).sort()
    const currentIds = [...idsBeneficiaires.value].sort()
    return (
      previousIds.toString() !== currentIds.toString() || liste!.titre !== titre
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
      value: getNomJeuneComplet(beneficiaire),
    }))
  }

  function getDefaultBeneficiaires(): OptionBeneficiaire[] {
    return liste
      ? liste.beneficiaires.map((beneficiaire) => {
          return {
            value: getNomJeuneComplet(beneficiaire),
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
        : 'Aucun bénéficiaire n’est renseigné. Veuillez sélectionner au moins un bénéficiaire.',
    })
  }

  async function soumettreListe(e: FormEvent) {
    e.preventDefault()
    if (!formIsValid) return

    setIsLoading(true)
    const payload: ListeDeDiffusionFormData = {
      titre: titre!,
      idsBeneficiaires: idsBeneficiaires.value,
    }
    try {
      if (!liste) {
        await creerListe(payload)
      } else {
        await modifierListe(liste.id, payload)
      }
      // FIXME : dirty fix, problème de rafraichissement de la liste
      await router.push(returnTo + '?misc=' + Math.random())
    } catch (erreur) {
      setShowErreurTraitement(true)
      console.error(erreur)
    } finally {
      setIsLoading(false)
    }
  }

  async function creerListe(payload: ListeDeDiffusionFormData) {
    await listesDeDiffusionService.creerListeDeDiffusion(payload)
    setAlerte(AlerteParam.creationListeDiffusion)
  }

  async function modifierListe(
    idListe: string,
    payload: ListeDeDiffusionFormData
  ) {
    await listesDeDiffusionService.modifierListeDeDiffusion(idListe, payload)
    setAlerte(AlerteParam.modificationListeDiffusion)
  }

  async function supprimerListe() {
    setIsLoading(true)
    try {
      await listesDeDiffusionService.supprimerListeDeDiffusion(liste!.id)
      setAlerte(AlerteParam.suppressionListeDiffusion)
      // FIXME : dirty fix, problème de rafraichissement de la liste
      await router.push(returnTo + '?misc=' + Math.random())
    } catch (e) {
      console.error(e)
      setShowErreurTraitement(true)
    } finally {
      setIsLoading(false)
    }
  }

  useMatomo(liste ? 'Modification liste diffusion' : 'Création liste diffusion')

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

      <p className='text-s-bold text-content_color mb-4'>
        Tous les champs sont obligatoires
      </p>

      <form onSubmit={soumettreListe}>
        <Label htmlFor='titre-liste' inputRequired={true}>
          {{ main: 'Titre', helpText: 'Exemple : Ma liste de pâtissier' }}
        </Label>
        <Input
          type='text'
          id='titre-liste'
          required={true}
          defaultValue={titre}
          onChange={setTitre}
        />
        <BeneficiairesMultiselectAutocomplete
          id={'select-beneficiaires'}
          beneficiaires={buildOptionsBeneficiaires()}
          typeSelection='Bénéficiaires'
          onUpdate={updateIdsBeneficiaires}
          defaultBeneficiaires={defaultBeneficiaires}
          required={true}
          error={idsBeneficiaires.error}
          renderIndication={BeneficiaireIndicationReaffectaction}
        />

        <div className='flex gap-2 mt-6 justify-center'>
          <ButtonLink
            href='/mes-jeunes/listes-de-diffusion'
            style={ButtonStyle.SECONDARY}
          >
            Annuler {liste ? 'la modification' : ''}
          </ButtonLink>

          {liste && (
            <Button
              type='submit'
              disabled={!formIsValid || !hasChanges()}
              isLoading={isLoading}
            >
              Modifier la liste
            </Button>
          )}

          {!liste && (
            <Button type='submit' disabled={!formIsValid} isLoading={isLoading}>
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
        <ConfirmationDeleteListeDiffusion
          onConfirmation={supprimerListe}
          onCancel={() => setShowConfirmationSuppression(false)}
        />
      )}
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  EditionListeDiffusionProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession)
    return { redirect: sessionOrRedirect.redirect }

  const { accessToken } = sessionOrRedirect.session
  const listesDeDiffusionService = withDependance<ListesDeDiffusionService>(
    'listesDeDiffusionService'
  )

  const referer: string | undefined = context.req.headers.referer

  const previousUrl =
    referer && !redirectedFromHome(referer)
      ? referer
      : '/mes-jeunes/listes-de-diffusion'

  const props: EditionListeDiffusionProps = {
    pageTitle: 'Créer - Listes de diffusion - Portefeuille',
    pageHeader: 'Créer une nouvelle liste',
    returnTo: previousUrl,
    withoutChat: true,
  }

  const idListe = context.query.idListe
  if (idListe) {
    const liste = await listesDeDiffusionService.recupererListeDeDiffusion(
      idListe as string,
      accessToken
    )
    if (!liste) {
      return { notFound: true }
    }
    props.liste = liste
    props.pageTitle = 'Modifier - Listes de diffusion - Portefeuille'
    props.pageHeader = 'Modifier la liste'
  }

  return { props }
}

export default withTransaction(
  EditionListeDiffusion.name,
  'page'
)(EditionListeDiffusion)
