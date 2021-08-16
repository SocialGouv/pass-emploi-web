import React, { useState } from "react";
import Modal from "components/Modal";
import ActionComp from "components/action/Action";

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

    fetch('http://127.0.0.1:5000/actions/jeune/test/web', {
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
        <ActionComp 
              content={content}
              comment={comment}
              editMode={true}
              onContentChange={(newContent: string) => setContent(newContent)}
              onCommentChange={(newComment: string) => setComment(newComment)}
        />

        <input type="submit" value="AJOUTER" /> 
      </form>
    </Modal>
    )
};

export default AddActionModal;