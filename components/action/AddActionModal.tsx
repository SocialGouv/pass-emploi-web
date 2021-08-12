import Modal from "components/Modal";

type ActionModalProps = {
  show: boolean
  onClose: any
}

const AddActionModal = ({ show, onClose }: ActionModalProps) => {
  return(
    <Modal
      title='Créer une nouvelle action'
      onClose={onClose}
      show={show}
    >
      <ul>
        <li> 
          <p>Mettre à jour le modèle de lettre de motivation</p>
          <p>S inspirer du site 1jeune1solution pour trouver des gabarits de letrres de motivation</p>
        </li>
      </ul>
      <button onClick={() => onClose}>AJOUTER</button>
    </Modal>
    )
};

export default AddActionModal;