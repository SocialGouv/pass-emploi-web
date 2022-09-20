import { withTransaction } from '@elastic/apm-rum-react'

import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'

function RechercheOffres() {
  return (
    <>
      <form className='flex items-center'>
        <div className='grow'>
          <Label htmlFor='mots-cles'>
            Mots clés (intitulé, numéro d’offre, code ROME)
          </Label>
          <Input type='text' id='mots-cles' onChange={() => {}} />
        </div>

        <Button type='submit' className='ml-5'>
          Rechercher
        </Button>
      </form>
    </>
  )
}

export default withTransaction(RechercheOffres.name, 'page')(RechercheOffres)
