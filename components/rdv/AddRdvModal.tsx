import { creneaux, durees, modalites } from "referentiel/rdv";

import Modal from "components/Modal";
import Button from "components/Button";
import { useEffect, useState } from "react";
import { Jeune } from "interfaces";
import { RdvJson } from "interfaces/json/rdv";

type RdvModalProps = {
  show: boolean
  onClose: any
  onAdd: any
}

const conseiller_id = 1

const AddRdvModal = ({ show, onClose, onAdd }: RdvModalProps) => {
  const [jeunes, setJeunes] = useState<Jeune[]>([])

  const [jeune, selectJeune] = useState("")
  const [creneau, selectCreneau] = useState("")
  const [duree, selectDuree] = useState("")
  const [modalite, selectModalite] = useState("")
  const [date, selectDate] = useState("")
  const [notes, selectNotes] = useState("")
  
  useEffect(() => {
    async function fetchData(): Promise<Jeune[]> {
      const res = await fetch(`${process.env.API_ENDPOINT}/conseiller/jeunes`)
      return await res.json()
    }

    fetchData().then((data) => {
      const defaultJeune:Jeune = {
        id:'',
        firstName:'',
        lastName:''
      }

      setJeunes([defaultJeune, ...data])
    })
  },[])

  const FormIsValid = () => duree!=="" && creneau!=='' && modalite!=='' && jeune!=='' && date!==''

  const handleAddClick = (event: any) => {
    event.preventDefault()
    const rdvDate = new Date(date)
    const hours:number = Number(creneau.substring(0, 2))
    rdvDate.setUTCHours(hours)

    const newRdv:RdvJson = {
      id:'',
      title:'titre',
      subtitle:'sous-titre',
      jeuneId: jeune,
      date: rdvDate.toUTCString(),
      duration:duree,
      modality:modalite,
      comment: notes,
    }

    fetch(`${process.env.API_ENDPOINT}/conseillers/${conseiller_id}/rendezvous`, {
      method: 'POST',
      headers:{'content-type': 'application/json'},
      body: JSON.stringify(newRdv)
    }).then(function(response) {
      onClose()
      onAdd()
    });
  }

  return(
    <Modal
      title='Créer un nouveau RDV'
      onClose={() => onClose()}
      show={show}
    >
      <form method="POST" role="form" onSubmit={handleAddClick} >

        <div className="flex">
            <div className="pr-[20px]" style={{flexBasis:'50%'}}>
                <label htmlFor="beneficiaire" className="text-lg text-bleu_nuit mb-[20px] block">Choisir un bénéficiaire <span aria-hidden="true">*</span></label>
                <select id="beneficiaire" name="beneficiaire" value={jeune} onChange={e => selectJeune(e.target.value)} required className="text-sm text-bleu_nuit w-full p-[12px] mb-[20px] cursor-pointer border border-bleu_nuit rounded-medium">
                  {jeunes.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.firstName} {j.lastName}
                    </option>
                  ))} 
                </select>
              
                <label htmlFor="date" className="text-lg text-bleu_nuit mb-[20px] block">Choisir une date <span aria-hidden="true">*</span></label>
                <input type="date" id="date" name="rdv-date"
                      value={date} onChange={e => selectDate(e.target.value)} required className="text-md text-bleu_nuit w-full p-[7px] mb-[20px] border border-bleu_nuit rounded-medium"/>        
            </div>

            <div className="pl-[20px]" style={{flexBasis:'50%'}}>
                <label htmlFor="creneaux" className="text-lg text-bleu_nuit mb-[20px] block">Créneaux disponibles <span aria-hidden="true">*</span></label>
                <select id="duree" name="duree" value={creneau} onChange={e => selectCreneau(e.target.value)} required className="text-sm text-bleu_nuit w-full p-[12px] mb-[20px] cursor-pointer border border-bleu_nuit rounded-medium">
                    {creneaux.map(cr => (
                      <option key={cr} value={cr}>
                        {cr}
                      </option>
                    ))} 
                </select>
              
                <label htmlFor="duree" className="text-lg text-bleu_nuit mb-[20px] block">Durée du RDV <span aria-hidden="true">*</span></label>
                <select id="duree" name="duree" value={duree} onChange={e => selectDuree(e.target.value)} required className="text-sm text-bleu_nuit w-full p-[12px] mb-[20px] cursor-pointer border border-bleu_nuit rounded-medium">
                    {durees.map(dr => (
                      <option key={dr.value} value={dr.value}>
                        {dr.text}
                      </option>
                    ))} 
                </select>
            
                <label htmlFor="modalite" className="text-lg text-bleu_nuit mb-[20px] block">Modalité de contact <span aria-hidden="true">*</span></label>
                <select id="modalite" name="modalite" value={modalite} onChange={e => selectModalite(e.target.value)} required className="text-sm text-bleu_nuit w-full p-[12px] mb-[20px] cursor-pointer border border-bleu_nuit rounded-medium">
                    {modalites.map(md => (
                      <option key={md} value={md}>
                        {md}
                      </option>
                    ))} 
                </select>
            </div>    

          </div>

          <label htmlFor="notes" className="text-lg text-bleu_nuit mb-[20px] block">Notes</label>
          <textarea id="notes" name="notes" value={notes} onChange={e => selectNotes(e.target.value)} className="w-full min-h-[60px] p-[10px] mb-[10px] resize-none border border-bleu_nuit rounded-medium" placeholder="Écrire ici..."/>

          <span className="text-xs text-bleu_nuit mb-[10px]" aria-hidden="true">* : champs obligatoires</span>

          <Button type="submit" disabled={!FormIsValid()} className="m-auto"> 
            <span className="px-[48px] py-[11px]">INVITER</span>
          </Button>
        </form>
    </Modal>
    )
};


export default AddRdvModal;