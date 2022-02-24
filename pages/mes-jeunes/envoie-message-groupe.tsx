import { AppHead } from 'components/AppHead'
import Button, { ButtonStyle } from 'components/ui/Button'
import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import Link from 'next/link'
import styles from 'styles/components/Layouts.module.css'
import { Container } from 'utils/injectionDependances'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import BackIcon from '../../assets/icons/arrow_back.svg'

type EnvoieMessageGroupe = {
  jeunes: Jeune[]
}

function EnvoieMessageGroupe({ jeunes }: EnvoieMessageGroupe) {
  const handleSubmit = (event: any) => {}

  return (
    <>
      <AppHead titre='Envoie de message à plusieurs jeunes' />
      <div className={`flex items-center ${styles.header}`}>
        <Link href={'/mes-jeunes'}>
          <a className='items-center mr-4'>
            <BackIcon role='img' focusable='false' aria-hidden={true} />
          </a>
        </Link>
        <h1 className='text-l-medium text-bleu_nuit'>
          Envoi d’un message à plusieurs jeunes
        </h1>
      </div>

      <form method='POST' role='form' onSubmit={handleSubmit}>
        <fieldset>
          <legend>Destinataires</legend>
          <label
            htmlFor='beneficiaire'
            className='text-sm-semi text-bleu_nuit mb-[20px] block'
          >
            Rechercher et ajouter des jeunes <span aria-hidden='true'>*</span>
            <span>Nom et prénom</span>
          </label>
          <select
            id='beneficiaire'
            name='beneficiaire'
            onChange={(e) => {}}
            className='text-sm text-bleu_nuit w-full p-[12px] mb-[20px] border border-bleu_nuit rounded-medium cursor-pointer'
            required
          >
            <option aria-hidden hidden disabled value={undefined} />
            {jeunes.map((j) => (
              <option key={j.id} value={j.id}>
                {j.firstName} {j.lastName}
              </option>
            ))}
          </select>
          Destinataires({jeunes.length})
        </fieldset>

        <fieldset>
          <legend>Écrivez votre message</legend>

          <label>Message</label>
          <textarea />
        </fieldset>

        <div className='flex m-auto'>
          <Button type='reset' disabled={false} style={ButtonStyle.SECONDARY}>
            <span className='px-[48px] py-[11px]'>Annuler</span>
          </Button>
          <Button type='submit' disabled={true}>
            <span className='px-[48px] py-[11px]'>Envoyer</span>
          </Button>
        </div>
      </form>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<{}> = async (context) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const { jeunesService } = Container.getDIContainer().dependances
  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)

  return {
    props: {
      jeunes: jeunes,
    },
  }
}

export default EnvoieMessageGroupe
