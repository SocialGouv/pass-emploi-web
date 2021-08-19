
import React, { useEffect, useState } from "react";
var ReactDOM = require('react-dom')


import CloseIcon from '../assets/icons/close.svg' 

import styles from 'styles/components/Modal.module.css'


type ModalProps = {
  title: string
  show: boolean
  onClose: any
  children: any
}

const Modal = ({ show, onClose, children, title }: ModalProps) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick = (e: any) => {
    e.preventDefault();
    onClose();
  };

  const modalContent = show ? (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={`text-blanc ${styles.modalHeader}`}>
          {title && <div className={`h4-semi ${styles.modalTitle}`}>{title}</div>}
          <a href="#" onClick={handleCloseClick}>
            <CloseIcon role="img" focusable="false" aria-label="Fermer la modal"/> 
          </a>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("modal-root")
    );
  } else {
    return null;
  }
};

export default Modal;