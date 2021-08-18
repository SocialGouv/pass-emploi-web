import React, { useState } from "react";
import Modal from "components/Modal";
import ActionEditMode from "components/action/ActionEditMode";

type ActionModalProps = {
  show: boolean
  onClose: any
  onAdd: any
}

const AddActionModal = ({ show, onClose, onAdd }: ActionModalProps) => {
  const [content, setContent] = useState('');
  const [comment, setComment] = useState('');


  const handleAddClick = (event: any) => {
    event.preventDefault();

    const now = new Date()
    let newAction = {
      id: '',
      content,
      comment,
      isDone: false,
      creationDate: now,
      lastUpdate: now,
    }

    fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes/test/action`, {
        method: 'POST',
        headers:{'content-type': 'application/json'},
        body: JSON.stringify(newAction)
      }).then(function(response) {
        onAdd(newAction);
        onClose()
        console.log(response)
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
        <ActionEditMode 
              content={content}
              comment={comment}
              onContentChange={(newContent: string) => setContent(newContent)}
              onCommentChange={(newComment: string) => setComment(newComment)}
        />

        <input type="submit" value="AJOUTER" /> 
      </form>
    </Modal>
    )
};

export default AddActionModal;