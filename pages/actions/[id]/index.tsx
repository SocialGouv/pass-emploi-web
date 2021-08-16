import React, { useState } from "react";

import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'

import { UserAction, Jeune } from 'interfaces'

import AddActionModal from "components/action/AddActionModal";
import ActionComp from "components/action/Action";

type Props = {
  jeune: Jeune
  actions_en_cours: UserAction[]
  actions_terminees: UserAction[]
}

function Action({jeune, actions_en_cours, actions_terminees}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [actionsEnCours, setActionsEnCours] = useState(actions_en_cours);

  return (
    <div>
      <h1 className="text-bleu_nuit">Les actions de {`${jeune.firstName} ${jeune.lastName}`} </h1>
      <p>Retrouvez le détail des actions de votre bénéficiaire</p>

      <button onClick={() => setShowModal(true)}> Créer une nouvelle action </button>

      <AddActionModal
        onClose={() => setShowModal(false)}
        onAdd={(newAction: UserAction) => setActionsEnCours(actionsEnCours.concat(newAction)) }
        show={showModal}
      />
        
      <h2>Ses actions en cours</h2>
    
      <ul>
        {actionsEnCours.map((action : UserAction) => (
          <li key={action.id}> 
            <ActionComp 
              content={action.content}
              comment={action.comment}
            />
          </li>
        ))}
      </ul>

      <h2>Ses actions terminées</h2>

      <ul>
        {actions_terminees.map((action : UserAction) => (
          <li key={`done_${action.id}`}> 
            <ActionComp 
              content={action.content}
              comment={action.comment}
            />
          </li>
        ))}
      </ul>
      
      <div id="modal-root"></div> {/* TODO move to default Layout */} 
    </div>
  )
}


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const res = await fetch(`http://127.0.0.1:5000/jeunes/${query.id}/actions/web`) //TODO use api_endpoint

  const data = await res.json()

  if (!data) {
    return {
      notFound: true,
    }
  }

  return {
    props:  {
      jeune: data.jeune,
      actions_en_cours: data.actions.filter((action: UserAction) => !action.isDone), //TODO use UserActionJson
      actions_terminees: data.actions.filter((action: UserAction)  => action.isDone),
    } ,
  }
}

export default Action
