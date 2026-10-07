import PastEventsGallery from "../components/EventsGallery";
import Hero from "../components/Hero";
import CanvasBackground from "../CanvasBackground";
import BenefitsSection from "../components/BenefitsSections";
import FAQ from "../components/FAQ";
import Sponsors from "../components/Sponsors";
import EventGallery from "../components/Gallery";
import Footer from "../../../components/footer";
import Countdown from "../components/Countdown";
import Timeline from "../components/Timeline";

const Contrive = () => {
  return (
    <CanvasBackground>
      <Hero />
      {/* <EventGallery/> */}
      <BenefitsSection/>
      <Timeline/>
      <Sponsors/>
      <FAQ/>
      <Countdown/>
      <Footer/>
    </CanvasBackground>
  );
};

export default Contrive;