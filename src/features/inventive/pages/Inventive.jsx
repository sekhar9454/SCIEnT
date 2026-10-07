import React from 'react'
import InventiveHero from '../components/InventiveHero'
import InnovationJourney from '../components/InnovationJourney'
import WhyChooseInventive from '../components/WhyChooseInventive'
import ReadyToInnovate from '../components/ReadyToInnovate'
import ProgramTimeline from '../components/ProgramTimeline'
import ProgramDurationCTA from '../components/ProgramDurationCTA'
import FAQSection from '../components/FAQSection'
import Footer from '../../../components/footer'



const Inventive = () => {
  return (
    <div className=' overflow-hidden'>
        <InventiveHero/>
        <InnovationJourney/>
        <WhyChooseInventive/>
        <ReadyToInnovate/>
        <ProgramTimeline/>
        <ProgramDurationCTA/>
        <FAQSection/>
        <Footer/>
      
    </div>
  )
}

export default Inventive
