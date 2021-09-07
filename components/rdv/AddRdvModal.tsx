
import Modal from "components/Modal";
import Button from "components/Button";

type RdvModalProps = {
  show: boolean
  onClose: any
  onAdd: any
}

const AddRdvModal = ({ show, onClose, onAdd }: RdvModalProps) => {
  
  const handleAddClick = (event: any) => {
    console.log(event)
  }

  return(
    <Modal
      title='Créer un nouveau RDV'
      onClose={() => onClose()}
      show={show}
    >
      <form onSubmit={handleAddClick}>

        <div className='grid grid-cols-2'>

          <fieldset className="mb-[20px]">
            <label htmlFor="beneficiaire" className="text-lg text-bleu_nuit mb-[20px] block">Choisir un bénéficiaire</label>
            <select id="beneficiaire" name="beneficiaire">
              <option value="kenji">Kenji</option>
              <option value="isabelle">Isabelle</option>
            </select>
          </fieldset>
          
          <fieldset className="mb-[20px]">
            <label htmlFor="creneaux" className="text-lg text-bleu_nuit mb-[20px] block">Créneaux disponibles</label>
            <select id="creneaux" name="creneaux">
              <option value="quatorze">14:00</option>
              <option value="quinze">15:00</option>
            </select>
          </fieldset>

          <fieldset className="mb-[20px]">
            <label htmlFor="date" className="text-lg text-bleu_nuit mb-[20px] block">Choisir une date</label>
            <input type="date" id="date" name="rdv-date"
                  value="2018-07-22"
                  min="2018-01-01" max="2018-12-31"/>
          </fieldset>

          <fieldset className="mb-[20px]">
            <label htmlFor="duree" className="text-lg text-bleu_nuit mb-[20px] block">Durée du RDV</label>
            <select id="duree" name="duree">
              <option value="kenji">14:00</option>
              <option value="isabelle">15:00</option>
            </select>
          </fieldset>

          <fieldset aria-hidden="true">
          </fieldset>

          <fieldset className="mb-[20px]">
            <label htmlFor="modalite" className="text-lg text-bleu_nuit mb-[20px] block">Modalité de contact</label>
            <select id="modalite" name="modalite">
              <option value="kenji">En agence</option>
              <option value="isabelle">Par téléphone</option>
            </select>
          </fieldset>

        </div>

        <fieldset className="mb-[20px]">
            <label htmlFor="notes" className="text-lg text-bleu_nuit mb-[20px] block">Notes</label>
            <textarea id="notes" name="notes" className="w-full min-h-[60px] p-[10px]" placeholder="Écrire ici..."/>
        </fieldset>

        <Button type="submit"> 
            INVITER
        </Button>
      </form>
    </Modal>
    )
};


export default AddRdvModal;