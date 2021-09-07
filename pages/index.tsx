import type { NextPage } from 'next'
import { useState } from 'react';

import AddRdvModal from "components/rdv/AddRdvModal";
import Button from "components/Button";

import AddIcon from '../assets/icons/add.svg'

type HomeProps = {

}

const Home = ({} : HomeProps) => {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <span className="flex justify-between">
        <h1 className='h2-semi text-bleu_nuit'>Mes rendez-vous à venir</h1>
        <Button onClick={() => setShowModal(true)}> 
          <AddIcon focusable="false" aria-hidden="true"/>
            Fixer un rendez-vous
        </Button>
      </span>

      <AddRdvModal
        onClose={() => setShowModal(false)}
        onAdd={ ()=> {} }
        show={showModal}
      />
    </>
  )
}

export default Home
