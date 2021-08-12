// TODO : 
// supprimer les any 
// cleaner le css

import React, { useEffect, useState } from "react";
var ReactDOM = require('react-dom')
import styled from "styled-components";

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
    <StyledModalOverlay>
      <StyledModal>
        <StyledModalHeader>
          {title && <StyledModalTitle>{title}</StyledModalTitle>}
          <a href="#" onClick={handleCloseClick}>
            x
          </a>
        </StyledModalHeader>
        <StyledModalBody>{children}</StyledModalBody>
      </StyledModal>
    </StyledModalOverlay>
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

const StyledModalOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
`;

const StyledModal = styled.div`
  background: white;
  width: 791px;
  height: 697px;
  border-radius: 8px;
  padding: 20px;
`;

const StyledModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 25px;
`;

const StyledModalTitle = styled.div`
  padding-top: 10px;
`;

const StyledModalBody = styled.div`
  padding-top: 10px;
`;

export default Modal;