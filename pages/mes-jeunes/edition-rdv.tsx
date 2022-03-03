import { Jeune } from 'interfaces/jeune'
import { GetServerSideProps } from 'next'
import { JeunesService } from 'services/jeunes.service'
import withDependance from 'utils/injectionDependances/withDependance'
import { withMandatorySessionOrRedirect } from 'utils/withMandatorySessionOrRedirect'
import Etape1Icon from '../../assets/icons/etape_1.svg'
import styles from '../../styles/components/Layouts.module.css'

interface EditionRdvProps {
  jeunes: Jeune[]
  withoutChat: true
}

function EditionRdv({ jeunes }: EditionRdvProps) {
  return (
    <>
      <div className={styles.content}>
        <form>
          <div className='text-sm-regular text-bleu_nuit mb-8'>
            Tous les champs sont obligatoires
          </div>

          <fieldset className='border-none'>
            <legend className='flex items-center text-m-medium mb-4'>
              <Etape1Icon
                role='img'
                focusable='false'
                aria-label='Étape 1'
                className='mr-2'
              />
              Bénéficiaires
            </legend>
            <label htmlFor='beneficiaire' className='text-base-medium'>
              <span aria-hidden='true'>*</span> Rechercher et ajouter un jeune
              <p className='text-bleu_nuit text-sm-regular ml-2'>
                Nom et prénom
              </p>
            </label>
            <select
              id='beneficiaire'
              name='beneficiaire'
              className='text-sm text-bleu_nuit w-full p-[12px] mb-[20px] border border-bleu_nuit rounded-medium cursor-pointer'
              required
            >
              <option aria-hidden hidden disabled value={undefined} />
              {jeunes.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.lastName} {j.firstName}
                </option>
              ))}
            </select>
          </fieldset>
        </form>
      </div>
    </>
  )
}

export const getServerSideProps: GetServerSideProps<EditionRdvProps> = async (
  context
) => {
  const sessionOrRedirect = await withMandatorySessionOrRedirect(context)
  if (!sessionOrRedirect.hasSession) {
    return { redirect: sessionOrRedirect.redirect }
  }

  const jeunesService = withDependance<JeunesService>('jeunesService')
  const {
    session: { user, accessToken },
  } = sessionOrRedirect
  const jeunes = await jeunesService.getJeunesDuConseiller(user.id, accessToken)

  return {
    props: {
      jeunes: jeunes,
      withoutChat: true,
    },
  }
}

export default EditionRdv
