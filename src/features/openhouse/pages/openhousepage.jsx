import { useState } from 'react'
import About from './about'
import Projects from './projects'
import HeroSection from './HeroSection'
import AttendeesSection from './AttendeesSection'
import PreviousEditions from './PreviousEditions'
import Footer from './footer'
import SponsorsSection from './sponsor'
import "./openhouse.css"

function OpenhousePage(){
  return(
    <>
    
      <HeroSection/>
      <About/>
      <AttendeesSection/>
      <Projects/>
      <PreviousEditions/>
      <SponsorsSection/>
      <Footer/>


    </>
  )
}
export default OpenhousePage