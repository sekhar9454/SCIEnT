import React from 'react'
import Footer from '../../../components/footer'
import { useState } from 'react'
import { useAccordionButton } from 'react-bootstrap'
import ScientMembers from '../components/ScientMembers'


const Team = () => {
  return (
    <div className='w-full m-0 p-0 overflow-hidden'>
      <ScientMembers/>
      <footer className='w-full clear-both'>
        <Footer/>
      </footer>
    </div>
  )
}

export default Team
