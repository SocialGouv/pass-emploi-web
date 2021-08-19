import React, { useState } from "react";

import { GetServerSideProps } from 'next'

import Link from 'next/link'

import { UserAction, Jeune } from 'interfaces'

import AddActionModal from "components/action/AddActionModal";
import ActionComp from "components/action/Action";
import Button from "components/Button";

import styles from 'styles/Actions.module.css'

/**
 * relative path since babel doesn't support alliases, see https://github.com/airbnb/babel-plugin-inline-react-svg/pull/17
 * TODO: workaround for path
 */
import AddIcon from '../../../../assets/icons/add.svg'
import BackIcon from '../../../../assets/icons/arrow_back.svg' 


type Props = {
  jeune: Jeune
  actions_en_cours: UserAction[]
  actions_terminees: UserAction[]
}

function Action({jeune, actions_en_cours, actions_terminees}: Props) {

  const addToActionTerminees = (action: UserAction) => {
    setActionsTerminees(actionsTerminees.concat(action))
  }

  const deleteFromActionTerminees = (action: UserAction) => {
    const indexAction = actionsTerminees.indexOf(action)
    actionsTerminees.splice(indexAction,1)
    setActionsTerminees([...actionsTerminees])
  }

  const addToActionEnCours = (action: UserAction) => {
    setActionsEnCours(actionsEnCours.concat(action))
  }

  const deleteFromActionEnCours = (action: UserAction) => {
    const indexAction = actionsEnCours.indexOf(action)
    actionsEnCours.splice(indexAction,1)
    setActionsEnCours([...actionsEnCours])
  }

  const toggleStatusAction = (action: UserAction) => {
    action.isDone = !action.isDone

    patchActionStatus(action).then(function() {
        if(action.isDone){
          addToActionTerminees(action)
          deleteFromActionEnCours(action)
        }else{
          addToActionEnCours(action)
          deleteFromActionTerminees(action)
        }
        
      }).catch(function(error) {
        console.error(error.message);
        action.isDone = !action.isDone

      });
  };


  const [showModal, setShowModal] = useState(false);
  const [actionsEnCours, setActionsEnCours] = useState(actions_en_cours);
  const [actionsTerminees, setActionsTerminees] = useState(actions_terminees);

  return (
    <div>
      <div className="page">
        <div className={styles.backIntroContainer}>
          <Link href="/" passHref>
              <a className={styles.backLink}> 
                <BackIcon role="img" focusable="false" aria-label="Retour sur la page d'acceuil"/> 
              </a>
          </Link>

          <div className={styles.titleIntroContainer}>
            <h1 className={`h2 text-bleu_nuit ${styles.title}`}>Les actions de {`${jeune.firstName} ${jeune.lastName}`} </h1>
            <p className='text-md text-bleu'>Retrouvez le détail des actions de votre bénéficiaire</p>
          </div>

          <Button onClick={() => setShowModal(true)}> 
              <AddIcon focusable="false" aria-hidden="true" className={styles.addIcon}/>
                Créer une nouvelle action
          </Button>
        </div>
        

        <AddActionModal
          onClose={() => setShowModal(false)}
          onAdd={(newAction: UserAction) => addToActionEnCours(newAction) }
          show={showModal}
        />

          
        <h2 className={`h3 text-bleu_nuit ${styles.subTitle}`}>Ses actions en cours</h2>
        <ul>
          {actionsEnCours.map((action : UserAction) => (
            <li key={action.id} className={styles.listItem}> 
              <ActionComp action = {action} toggleStatus={(action: UserAction) => toggleStatusAction(action)}/>
            </li>
          ))}
        </ul>

        <h2 className={`h3 text-bleu_nuit ${styles.subTitle}`}>Ses actions terminées</h2>
        <ul>
        {actionsTerminees.map((action : UserAction) => (
          <li key={`done_${action.id}`} className={styles.listItem}> 
            <ActionComp action = {action} toggleStatus={(action: UserAction) => toggleStatusAction(action)}/>
          </li>
        ))}
      </ul>
      </div>
      <div id="modal-root"></div> {/* TODO move to default Layout */} 
    </div>
  )
}

const patchActionStatus = async (action: UserAction) => {

  const endpoint = process.env.API_ENDPOINT

   const response = fetch(`${endpoint}/actions/${action.id}`, {
    method: 'PATCH',
    headers:{'content-type': 'application/json'},
    body: JSON.stringify({isDone: action.isDone})
   })

   return response
}


export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const res = await fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes/${query.jeune_id}/actions`)

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
