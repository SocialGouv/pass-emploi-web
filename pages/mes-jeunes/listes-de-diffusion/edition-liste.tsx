import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import React, { FormEvent, useState } from 'react'

import BeneficiairesMultiselectAutocomplete, {
  OptionBeneficiaire,
} from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'
import {
  BaseJeune,
  compareJeunesByNom,
  getNomJeuneComplet,
} from 'interfaces/jeune'
import { PageProps } from 'interfaces/pageProps'
import { JeunesService } from 'services/jeunes.service'
import { ListesDeDiffusionService } from 'services/listes-de-diffusion.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'
import withDependance from 'utils/injectionDependances/withDependance'

type EditionListeDiffusionProps = {
  beneficiaires: BaseJeune[]
} & PageProps

function EditionListeDiffusion({ beneficiaires }: EditionListeDiffusionProps) {
  const listesDeDiffusionService = useDependance<ListesDeDiffusionService>(
    'listesDeDiffusionService'
  )

  const [titre, setTitre] = useState<string | undefined>()
  const [idsDestinataires, setIdsDestinataires] = useState<string[]>([])

  function buildOptionsDestinataires(): OptionBeneficiaire[] {
    return beneficiaires.map((beneficiaire) => ({
      id: beneficiaire.id,
      value: getNomJeuneComplet(beneficiaire),
    }))
  }

  function creerListe(e: FormEvent) {
    e.preventDefault()

    listesDeDiffusionService.creerListeDeDiffusion({
      titre: titre!,
      idsDestinataires,
    })
  }

  return (
    <>
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
          onUpdate={setIdsDestinataires}
          required={true}
        />

        <div className='flex gap-2 mt-6 justify-center'>
          <ButtonLink
            href='/mes-jeunes/listes-de-diffusion'
            style={ButtonStyle.SECONDARY}
          >
            Annuler
          </ButtonLink>
          <Button type='submit'>
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
