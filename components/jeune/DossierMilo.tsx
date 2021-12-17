import { DossierMilo } from 'interfaces/jeune'

interface DossierJeuneMiloProps {
  dossier: DossierMilo
}

const DossierJeuneMilo = ({ dossier }: DossierJeuneMiloProps) => {
  return (
    <div className='border border-bleu_blanc rounded-large p-6'>
      <dl className=' text-bleu_nuit'>
        <span className='flex'>
          <dt className=''>Prénom :</dt>
          <dd className='text-sm-medium'> {dossier.prenom}</dd>
        </span>

        <span className='flex'>
          <dt className=''>Nom :</dt>
          <dd className='text-sm-medium'> {dossier.nom}</dd>
        </span>
        {/* <dt className='inline-block '>Date de naissance :</dt>
        <dd className='text-sm-medium'> {dossier.dateDeNaissance}</dd>

        <dt className='inline-block '>Code postal :</dt>
        <dd className='text-sm-medium'> {dossier.codePostal}</dd>

        <dt className='inline-block '>E-mail :</dt>
        <dd className='text-sm-medium'> {dossier.email}</dd> */}
      </dl>
    </div>
  )
}

export default DossierJeuneMilo

// TODO liste
/**
 * CSS
 * Stepper dynamique
 * Boutons Retour/Rafraichir
 * Affichage erreur pas d'email
 * matomo
 */
