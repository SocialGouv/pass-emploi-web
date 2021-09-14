import React, { useState } from "react";
import router from 'next/router'

import { UserAction } from 'interfaces'
import { actionsPredefinies } from "referentiel/action";

import Modal from "components/Modal";
import Button from "components/Button";


import actionStyles from 'styles/components/Action.module.css'
import styles from 'styles/components/AddActionModal.module.css'

type ActionModalProps = {
  show: boolean
  onClose: any
  onAdd: any
}

const now = new Date()


const defaultAction: UserAction ={
  id: '',
  content: '',
  comment:'',
  isDone: false,
  lastUpdate: now,
  creationDate: now,
}

const AddActionModal = ({ show, onClose, onAdd }: ActionModalProps) => {
  const handleSlectedChange = (event: any) => {
     let currentAction = actionsPredefinies?.find(action => action.id === event.target.value)

    if(currentAction){
      currentAction.isDone = true
      setSelectedAction(currentAction)
    }
  };

  const handleAddClick = (event: any) => {
    event.preventDefault();

    if(noSelectedAction()){
      return
    }

    const now = new Date()
    selectedAction.id = Date.now().toString()
    selectedAction.isDone = false
    selectedAction.lastUpdate = now
    selectedAction.creationDate = now

    fetch(`${process.env.API_ENDPOINT}/jeunes/${router.query.jeune_id}/action`, {
        method: 'POST',
        headers:{'content-type': 'application/json'},
        body: JSON.stringify(selectedAction)
      }).then(function(response) {
        setSelectedAction(defaultAction);
        onAdd(selectedAction);
        onClose()
      });
  };

  const noSelectedAction = () => Boolean(selectedAction.id === '')

  const [selectedAction, setSelectedAction] = useState(defaultAction);

  return(
    <Modal
      title='Créer une nouvelle action'
      onClose={() => {setSelectedAction(defaultAction); onClose()}}
      show={show}
    >
      <div  style={{marginBottom: "30px"}}>
        <Button type="button"> 
            ACTIONS PRÉDÉFINIES
        </Button>
      </div>
      <form onSubmit={handleAddClick}>

        <div className={styles.scrollableContainer}>

          {actionsPredefinies.map((action: UserAction) => (
            <div className={`${styles.actionContainer} ${actionStyles.container} ${action.id === selectedAction.id ? actionStyles.isDone : ''}`} key={action.id}>
            <input type="radio" id={action.id} checked={action.isDone && selectedAction.id === action.id} value={action.id} aria-checked={action.isDone && selectedAction.id === action.id} onChange={handleSlectedChange}/>
            <label htmlFor={action.id} ><span></span>
              <div>
                <p className='text-lg'>{action.content}</p>
                <p className='text-sm'>{action.comment}</p>
              </div>
            </label>
          </div>
          ))}

        </div>

        <div className={styles.submitContainer}>
          <Button type="submit" disabled={noSelectedAction()}> 
            AJOUTER
          </Button>
        </div>

      </form>
    </Modal>
    )
};

export default AddActionModal;