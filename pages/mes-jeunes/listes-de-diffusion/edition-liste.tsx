import { withTransaction } from '@elastic/apm-rum-react'
import React from 'react'

import BeneficiairesMultiselectAutocomplete from 'components/jeune/BeneficiairesMultiselectAutocomplete'
import Button, { ButtonStyle } from 'components/ui/Button/Button'
import ButtonLink from 'components/ui/Button/ButtonLink'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import IconComponent, { IconName } from 'components/ui/IconComponent'

function EditionListeDiffusion() {
  return (
    <>
      <p className='text-s-bold text-content_color mb-4'>
        Tous les champs avec * sont obligatoires
      </p>

      <form>
        <Label htmlFor='titre-liste' inputRequired={true}>
          Titre
        </Label>
        <Input
          type='text'
          id='titre-liste'
          required={true}
          onChange={() => {}}
        />
        <BeneficiairesMultiselectAutocomplete
          beneficiaires={[]}
          typeSelection='Destinaires'
          onUpdate={() => {}}
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

export default withTransaction(
  EditionListeDiffusion.name,
  'page'
)(EditionListeDiffusion)
