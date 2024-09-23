import React, { useRef } from 'react'

import Modal, { ModalHandles } from 'components/Modal'
import { useActualites } from 'utils/actualitesContext'

interface ActualitesModalProps {
  onClose: () => void
}

export default function ActualitesModal({ onClose }: ActualitesModalProps) {
  const modalRef = useRef<ModalHandles>(null)
  const [actualites] = useActualites()

  return (
    <Modal ref={modalRef} title='Nouveau !' onClose={onClose}>
      <div dangerouslySetInnerHTML={{ __html: actualites.content.rendered }} />
    </Modal>
  )
}
