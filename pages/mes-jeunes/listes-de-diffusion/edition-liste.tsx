import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import React, { FormEvent, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import { RequiredValue } from 'components/RequiredValue'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import FailureAlert from 'components/ui/Notifications/FailureAlert'
import {
  BaseJeune,
  compareJeunesByNom,
  getNomJeuneComplet,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { AlerteParam } from 'referentiel/alerteParam'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { useAlerte } from 'utils/alerteContext'
import useMatomo from 'utils/analytics/useMatomo'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type EditionListeDiffusionProps = PageProps & {
  beneficiaires: BaseJeune[]
  returnTo: string
}

function EditionListeDiffusion({
  beneficiaires,
  returnTo,
}: EditionListeDiffusionProps) {
  const listesDeDiffusionService = useDependance<ListesDeDiffusionService>(
    'listesDeDiffusionService'
  )
  const router = useRouter()
  const [_, setAlerte] = useAlerte()

  const [titre, setTitre] = useState<string | undefined>()
  const [idsDestinataires, setIdsDestinataires] = useState<
    RequiredValue<string[]>
  >({ value: [] })

  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [erreurCreation, setErreurCreation] = useState<boolean>(false)
  const formIsValid = Boolean(titre) && Boolean(idsDestinataires.value.length)

  function buildOptionsDestinataires(): OptionBeneficiaire[] {
    return beneficiaires.map((beneficiaire) => ({
      id: beneficiaire.id,
      value: getNomJeuneComplet(beneficiaire),
    }))
  }

  function updateIdsDestinataires(ids: string[]) {
    setIdsDestinataires({
      value: ids,
      error: ids.length
        ? undefined
        : 'Aucun bénéficiaire n’est renseigné. Veuillez sélectionner au moins un bénéficiaire.',
    })
  }

  async function creerListe(e: FormEvent) {
    e.preventDefault()
    if (!formIsValid) return

    setIsCreating(true)
    try {
      await listesDeDiffusionService.creerListeDeDiffusion({
        titre: titre!,
        idsDestinataires: idsDestinataires.value,
      })

      setAlerte(AlerteParam.creationListeDiffusion)
      await router.push(returnTo)
    } catch (erreur) {
      setErreurCreation(true)
      console.error(erreur)
    } finally {
      setIsCreating(false)
    }
  }

  useMatomo('Création liste diffusion')

  return (
    <>
      {erreurCreation && (
        <FailureAlert
          label='Une erreur s’est produite, veuillez réessayer ultérieurement.'
          onAcknowledge={() => setErreurCreation(false)}
        />
      )}

      <p className='text-s-bold text-content_color mb-4'>
        Tous les champs avec * sont obligatoires
      </p>

      <form onSubmit={creerListe}>
        <Label htmlFor='titre-liste' inputRequired={true}>
          Titre
        </Label>
        <Input
          type='text'
          id='titre-liste'
          required={true}
          onChange={setTitre}
        />
        <BeneficiairesMultiselectAutocomplete
          beneficiaires={buildOptionsDestinataires()}
          typeSelection='Destinaires'
          onUpdate={updateIdsDestinataires}
          required={true}
          error={idsDestinataires.error}
        />

        <div className='flex gap-2 mt-6 justify-center'>
          <ButtonLink
            href='/mes-jeunes/listes-de-diffusion'
            style={ButtonStyle.SECONDARY}
          >
            Annuler
          </ButtonLink>
          <Button type='submit' disabled={!formIsValid} isLoading={isCreating}>
            <IconComponent
              name={IconName.Add}
              focusable={false}
              aria-hidden={true}
              className='mr-2 w-4 h-4'
            />
            Créer la liste
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  EditionListeDiffusionProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession)
    return { redirect: sessionOrRedirect.redirect }

  const { user, accessToken } = sessionOrRedirect.session
  const jeunesService: JeunesService =
    withDependance<JeunesService>('jeunesService')
  const beneficiaires = await jeunesService.getJeunesDuConseillerServerSide(
    user.id,
    accessToken
  )

  return {
    props: {
      beneficiaires: [...beneficiaires].sort(compareJeunesByNom),
      pageTitle: 'Créer - Listes de diffusion - Portefeuille',
      pageHeader: 'Créer une nouvelle liste',
      returnTo: '/mes-jeunes/listes-de-diffusion',
      withoutChat: true,
    },
  }
}

export default withTransaction(
  EditionListeDiffusion.name,
  'page'
)(EditionListeDiffusion)
