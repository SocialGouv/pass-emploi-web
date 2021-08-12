
import { GetStaticProps, GetStaticPaths } from 'next'
import { UserAction } from '../../../interfaces'

type Props = {
  actions: UserAction[]
}


function Action({actions}: Props) {
  return (
    <div>
       <h1>Les actions de Kenjic Girac</h1>
        <p>retrouvez le détail des actions de votre bénéficiaire</p>

        <button> Créer une nouvelle action </button>

        <h2>Ses actions en cours</h2>

        <ul>
      {actions.map((action : UserAction) => (
        <li key='action.id'>{action.contenu}</li>
      ))}
    </ul>

        <h2>Ses actions terminées</h2>
      
      
    </div>
  )
}

// doc https://nextjs.org/docs/basic-features/data-fetching#getstaticpaths-static-generation
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [
      { params: { id: 'un-id' } },
    ],
    fallback: false 
  };
}

export const getStaticProps: GetStaticProps = async () => {
  return {  
    props: {
      actions: [
          {contenu: 'Prendre contact avec un employeur pour un stage', commentaire: '', isDone : false, creationDate: '', lastUpdate : ''},
          {contenu: 'Participer à un atelier CV à la Mission Locale Antenne vieux port de Marseille le 19.08.2021 à 10H', commentaire: 'Commentaire : Se rendre à l’adresse suivante : 19 Rue Vacon, 13001 Marseille et arriver 15 min en avance', isDone : false, creationDate: '', lastUpdate : ''},
          {contenu: 'Compléter le dossier d’aide au permis', commentaire: '', isDone : true, creationDate: '', lastUpdate : ''},
      ],
    } 
  }
}

export default Action
