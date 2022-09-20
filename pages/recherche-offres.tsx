import { withTransaction } from '@elastic/apm-rum-react'
import { GetServerSideProps } from 'next'
import { FormEvent, useState } from 'react'

import Button from 'components/ui/Button/Button'
import Input from 'components/ui/Form/Input'
import Label from 'components/ui/Form/Label'
import { PageProps } from 'interfaces/pageProps'
import { OffresEmploiService } from 'services/offres-emploi.service'
import { withMandatorySessionOrRedirect } from 'utils/auth/withMandatorySessionOrRedirect'
import { useDependance } from 'utils/injectionDependances'

type RechercheOffresProps = PageProps

function RechercheOffres() {
  const offresEmploiService = useDependance<OffresEmploiService>(
    'offresEmploiService'
  )

  const [motsCles, setMotsCles] = useState<string | undefined>()

  function rechercherOffresEmploi(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()

    offresEmploiService.searchOffresEmploi({ query: motsCles! })
  }

  return (
    <>
      <form onSubmit={rechercherOffresEmploi} className='flex items-center'>
        <div className='grow'>
          <Label htmlFor='mots-cles'>
            Mots clés (intitulé, numéro d’offre, code ROME)
          </Label>
          <Input type='text' id='mots-cles' onChange={setMotsCles} />
        </div>

        <Button type='submit' className='ml-5'>
          Rechercher
        </Button>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<
  RechercheOffresProps
> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.validSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  return {
    props: {
      pageTitle: 'Recherche d’offres',
      pageHeader: 'Offres',
    },
  }
}

export default withTransaction(RechercheOffres.name, 'page')(RechercheOffres)
