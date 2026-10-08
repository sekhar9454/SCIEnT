import React from 'react'
import HomeTop from '../components/Home'
import FAQComponent from '../components/faqs'
import Footer from '../components/footer'
import ClubOrbit from '../components/ClubOrbit'
import Carousel from '../components/CarouselPage'
import Contact from '../components/Contact'
import MagicBento from '../components/MagicBento'
const Home = () => {
  return (
    <div className='bg-black'>
    <Carousel/>
      <HomeTop />
      <section className='py-12'>
        <MagicBento enableTilt={true} />
      </section>
      <ClubOrbit />
      <FAQComponent /> 
      <Contact />
      <Footer />
    </div>
  )
}

export default Home
