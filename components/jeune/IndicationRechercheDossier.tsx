import Indication1 from '../../assets/images/indication-dossier-milo-1.svg'
import Indication2 from '../../assets/images/indication-dossier-milo-2.svg'
import Indication3 from '../../assets/images/indication-dossier-milo-3.svg'

type IndicationRechercheDossierProps = {}

function IndicationRechercheDossier({}: IndicationRechercheDossierProps) {
  return (
    <div className='inline-flex flex-wrap justify-between max-w-2xl bg-primary_lighten mb-6 p-3 rounded-medium'>
      <div style={{ flex: '0 0 136px' }}>
        <Indication1 focusable='false' aria-hidden='true' className='mb-2' />
        <p className='text-s-regular'>
          <span className='w-full text-center block'>1.</span>
          <span className='text-center block'>
            Ouvrez le dossier du jeune dans i-milo
          </span>
        </p>
      </div>

      <div style={{ flex: '0 0 136px' }}>
        <Indication2 focusable='false' aria-hidden='true' className='mb-2' />
        <p className='text-s-regular'>
          <span className='w-full text-center block'>2.</span>
          <span className='text-center block'>
            Le numéro de dossier à saisir se situe dans l&apos;adresse du
            navigateur
          </span>
        </p>
      </div>

      <div style={{ flex: '0 0 260px' }}>
        <Indication3 focusable='false' aria-hidden='true' className='mb-2' />
        <p className='text-s-regular'>
          <span className='w-full text-center block'>3.</span>
          <span className='text-center block mx-2'>
            Sélectionnez-le pour le copier et collez-le ici
          </span>
        </p>
      </div>
    </div>
  )
}

export default IndicationRechercheDossier
