import React from "react";
import a from "../assets/a.png";
import b from "../assets/b.jpg";
import "./Home.css";
import { MagicCardGroup, MagicCard } from "./MagicBento";

const Home = () => {
  return (
    
    <div className="home-main-container">
      <MagicCardGroup className="card-container">
        <MagicCard className="card">
          <img src={a} alt="Our Vision" />
          <div className="overlay">
            <h2>OUR VISION</h2>
            <p>

To inspire students to innovate, and help transform idea concepts to socially relevant products.
<br />

</p>
<p>

<br/>
To build an ecosystem that will encourage more students to aspire and build real-world ready innovations that make a positive difference to society.

            </p>
          </div>
        </MagicCard>
        <MagicCard className="Mission_card">
          <img src={b} alt="Our Mission" />
          <div className="overlay">
            <h2>OUR MISSION</h2>
            <p>
            Encourage students to come up with innovative ideas and apply their technical knowledge to solve problems. 
            <br />
            </p>

            <p>
Help transform the concepts into prototypes, and further assist in developing them into viable real-world solutions. <br />
</p>
<p>
Offer a conducive space and necessary tools to collaborate and work on projects that span across disciplines. <br/>
</p>
<p>
Provide an ecosystem of mentorship, training, industry interface, and material assistance to help advance the progress of innovation and entrepreneurship.
            </p>
          </div>
        </MagicCard>
      </MagicCardGroup>

      <div className="initiative-container">
        <div className="container-ini">
          <span className="vertical-text">INITIATIVE</span>
          <div className="horizontal-text">
            OF THE <br />
            <span className="yr">1990</span> <br />
            BATCH <br />
            OF NIT <br />
            TRICHY
          </div>
        </div>
        <div className="content-column">
          <p>
            This initiative was launched by the Class of 1990 during their Silver Jubilee Reunion of 2015 in partnership with the institute. The innovation center would be unique as it would be operated around-the-clock on all days.
            
            The Class of 1990 provided funds for equipment and interiors for the center in collaboration with the institute, enabling students to collaborate across branches and tap into the knowledge of faculty and alumni to make their projects practical.
            <br />
            On the 24th of December 2015, the SCIEnT Facility was inaugurated by Mr. Uma Maheswaran, Mission Director, GSLV, ISRO, in the presence of Dr. Sundarrajan, then Director of NIT Trichy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
