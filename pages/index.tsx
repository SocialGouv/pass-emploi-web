import type { GetServerSideProps } from 'next'
import Router from 'next/router'
import { useState } from 'react';

import { Rdv } from 'interfaces/rdv';
import { formatDayDate, formatHourMinuteDate } from 'utils/date';

import AddRdvModal from "components/rdv/AddRdvModal";
import Button from "components/Button";

import AddIcon from '../assets/icons/add.svg'
import CalendarIcon from '../assets/icons/calendar.svg'
import TimeIcon from '../assets/icons/time.svg'
import { RdvJson } from 'interfaces/json/rdv';
import { durees } from 'referentiel/rdv';

type HomeProps = {
  rdvs: Rdv[]
  oldRdvs: Rdv[]
}

const Home = ({rdvs, oldRdvs} : HomeProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <span className="flex justify-between mb-[20px]">
        <h1 className='h2-semi text-bleu_nuit'>Mes rendez-vous à venir</h1>
        <Button onClick={() => setShowModal(true)}> 
          <AddIcon focusable="false" aria-hidden="true"/>
            Fixer un rendez-vous
        </Button>
      </span>

      {
        rdvs?.length === 0 && <p className="text-md text-bleu mb-8">Vous n&rsquo;avez pas de rendez-vous à venir pour le moment</p>
      }

      <ul className='grid grid-cols-2 gap-5 xl:grid-cols-3 md:grid-cols-2 sm:grid-cols-1 mb-[50px]'>

      {rdvs.map((rdv:Rdv)=>(
        <li key={rdv.id} className='text-bleu_nuit p-[15px] rounded-medium'  style={{boxShadow:'0px 0px 10px rgba(118, 123, 168, 0.3)'}}>

          <p className="flex justify-between mb-[15px]">
            <span className="flex" >
              <CalendarIcon focusable="false" aria-hidden="true" className="mr-[7px]"/>
              {formatDayDate(new Date(rdv.date))}
            </span>
            <span className="flex" >
              <TimeIcon focusable="false" aria-hidden="true" className="mr-[7px]"/>
              {formatHourMinuteDate(new Date(rdv.date))}
              {` - ${rdv.duration}`}
            </span>
          </p>

          <p className="text-md-semi mb-[15px]">{rdv.title} </p>
          <p className='text-xs text-right mb-[15px]'>{rdv.modality}</p>
          {rdv.comment && <p className='text-xs'>Notes: {rdv.comment}</p>}
        </li>
      ))}
      </ul>

      <h2 className='h3-semi text-bleu_nuit mb-[20px]'>
        Historique de mes rendez-vous
      </h2>

      {
        oldRdvs?.length === 0 && <p className="text-md text-bleu mb-8">Vous n&rsquo;avez pas de rendez-vous archivés pour le moment</p>
      }

      <ul className='grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 mb-[50px]'>

      {oldRdvs.map((rdv:Rdv)=>(
        <li key={rdv.id} className='text-bleu_nuit p-[15px] rounded-medium'  style={{boxShadow:'0px 0px 10px rgba(118, 123, 168, 0.3)'}}>

          <p className="flex justify-between mb-[15px]">
            <span className="flex" >
              <CalendarIcon focusable="false" aria-hidden="true" className="mr-[7px]"/>
              {formatDayDate(new Date(rdv.date))}
            </span>
            <span className="flex" >
              <TimeIcon focusable="false" aria-hidden="true" className="mr-[7px]"/>
              {formatHourMinuteDate(new Date(rdv.date))}
              {` - ${rdv.duration}`}
            </span>
          </p>

          <p className="text-md-semi mb-[15px]">{rdv.title} </p>
          <p className='text-xs text-right mb-[15px]'>{rdv.modality}</p>
          {rdv.comment && <p className='text-xs'>Notes: {rdv.comment}</p>}
        </li>
      ))}
      </ul>

      {showModal && <AddRdvModal
        onClose={() => setShowModal(false)}
        onAdd={ ()=> {Router.reload()} }
        show={showModal}
      />}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async () => {
  const res = await fetch(`${process.env.API_ENDPOINT}/conseillers/1/rendezvous`)
  const data = await res.json()

  let serializedRdvs: Rdv[] = []

  data.map((rdvData: RdvJson) => {
    const newrdv:Rdv = {
      ...rdvData,
      duration: (durees.find((duree:any) => duree.value === rdvData.duration))?.text || rdvData.duration
    }

    serializedRdvs.push(newrdv)
  })

  if (!data) {
    return {
      notFound: true,
    }
  }

  const today = new Date()

  return {
    props:  {
      rdvs: serializedRdvs.filter(rdv => new Date(rdv.date) >= today),
      oldRdvs: serializedRdvs.filter(rdv => new Date(rdv.date) < today),
    } ,
  }
}

export default Home
