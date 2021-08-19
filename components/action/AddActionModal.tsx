import React, { useState } from "react";

import { UserAction } from 'interfaces'

import Modal from "components/Modal";
import Button from "components/Button";
import ActionComponent from "components/action/Action";

type ActionModalProps = {
  show: boolean
  onClose: any
  onAdd: any
}

const now = new Date()

const actionsPredefinies : UserAction[] = [
  {
    id: '1',
    content: 'Un contenu',
    comment: 'Un commentaire',
    isDone: false,
    creationDate: now,
    lastUpdate: now,
  },
  {
    id: '2',
    content: 'Un contenu 2',
    comment: 'Un commentaire 2',
    isDone: false,
    creationDate: now,
    lastUpdate: now,
  }
]

const AddActionModal = ({ show, onClose, onAdd }: ActionModalProps) => {
  const now = new Date()

  let actionPredefinie : UserAction = {
    id: '',
    content: 'Un contenu',
    comment: 'Un commentaire',
    isDone: false,
    creationDate: now,
    lastUpdate: now,
  }

  const handleAddClick = (event: any) => {
    event.preventDefault();

    fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes/test/action`, {
        method: 'POST',
        headers:{'content-type': 'application/json'},
        body: JSON.stringify(actionPredefinie)
      }).then(function(response) {
        onAdd(actionPredefinie);
        onClose()
        return response.json();
      });
  };


  return(
    <Modal
      title='Créer une nouvelle action'
      onClose={onClose}
      show={show}
    >
      <form onSubmit={handleAddClick}>

          {actionsPredefinies.map((action: UserAction) => (
            <ActionComponent action={action} key={action.id}/>
          ))}
        
        <Button type="submit"> 
          AJOUTER
        </Button>

      </form>
    </Modal>
    )
};

export default AddActionModal;