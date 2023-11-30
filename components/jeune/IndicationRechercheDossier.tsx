import Indication1 from '../../assets/images/indication-dossier-milo-1.svg'
import Indication2 from '../../assets/images/indication-dossier-milo-2.svg'
import Indication3 from '../../assets/images/indication-dossier-milo-3.svg'

type IndicationRechercheDossierProps = {}

function IndicationRechercheDossier({}: IndicationRechercheDossierProps) {
  return (
    <ol className='inline-flex flex-wrap justify-between max-w-2xl bg-primary_lighten mb-6 p-3 rounded-base'>
      <li className='text-s-regular text-center' style={{ flex: '0 0 136px' }}>
        <Indication1 focusable='false' aria-hidden='true' className='mb-2' />

        <p>1.</p>
        <p>Ouvrez le dossier du jeune dans i-milo</p>
      </li>

      <li className='text-s-regular text-center' style={{ flex: '0 0 136px' }}>
        <Indication2 focusable='false' aria-hidden='true' className='mb-2' />

        <p>2.</p>
        <p>
          Le numéro de dossier à saisir se situe dans l’adresse du navigateur
        </p>
      </li>

      <li className='text-s-regular text-center' style={{ flex: '0 0 260px' }}>
        <Indication3 focusable='false' aria-hidden='true' className='mb-2' />

        <p>3.</p>
        <p>Sélectionnez-le pour le copier et collez-le ici</p>
      </li>
    </ol>
  )
}

export default IndicationRechercheDossier
