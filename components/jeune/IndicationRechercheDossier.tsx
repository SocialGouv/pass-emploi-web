import Indication1 from 'assets/images/indication-dossier-milo-1.svg'
import Indication2 from 'assets/images/indication-dossier-milo-2.svg'
import Indication3 from 'assets/images/indication-dossier-milo-3.svg'

function IndicationRechercheDossier() {
  return (
    <ol className='inline-flex flex-wrap justify-between max-w-2xl bg-primary-lighten mb-6 p-3 rounded-base list-decimal list-inside marker:font-bold'>
      <li className='text-s-regular text-center' style={{ flex: '0 0 136px' }}>
        <Indication1 focusable={false} aria-hidden={true} className='my-2' />
        Ouvrez le dossier du jeune dans i-milo
      </li>

      <li className='text-s-regular text-center' style={{ flex: '0 0 136px' }}>
        <Indication2 focusable={false} aria-hidden={true} className='my-2' />
        Le numéro de dossier se trouve dans l’URL du dossier du jeune dans
        i-milo après &apos;/dossiers/&apos; et comporte 7 chiffres sans espaces
        ni caractères spéciaux.
      </li>

      <li className='text-s-regular text-center' style={{ flex: '0 0 260px' }}>
        <Indication3 focusable={false} aria-hidden={true} className='my-2' />
        Copiez le numéro de dossier depuis la barre d’adresse puis collez-le
        dans le champ &quot;Numéro de dossier&quot;.
      </li>
    </ol>
  )
}

export default IndicationRechercheDossier
