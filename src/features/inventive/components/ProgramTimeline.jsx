import React from "react";
import TimeLine from "./TimeLine";
import "../styles/Inventive.css"
const ProgramTimeline = () => {
  const phases = [
    {
      id: 1,
      phase: "PHASE 1 ",
      title: "OUTREACH",
      week: "WEEK 1 - WEEK 2",
      dates: "Sept, 14 - Sept, 28",
      description:
        "Registration opens for students to apply with their ideas and solutions.",
    },
    {
      id: 2,
      phase: "PHASE 2  ",
      title: "INTAKE",
      week: "WEEK 3 ",
      dates: "Sept, 29 - Oct, 10",
      description: "Present your ideas.",
    },
    {
      id: 3,
      phase: "PHASE 3 ",
      title: "SELECTION",
      week: "WEEK 4 ",
      dates: "Oct, 11 - Oct, 18",
      description:
        "Projects selected based on usefulness, novelty, ethics, feasibility. Assigning student mentors, facilities and alumni for guiding",
    },
    {
      id: 4,
      phase: "PHASE 4 ",
      title: "INCUBATION",
      week: "WEEK 5 - WEEK 11 ",
      dates: "Oct, 19 - Dec, 14",
      description: "Project work in progress",
    },
    {
      id: 5,
      phase: "PHASE 5",
      dates: "Dec, 14 - Dec, 21",
      title: "SHOWCASE",
      week: "WEEK 12",
      description:
        "Showcase of projects. Patent filing support for worthy projects",
    },
  ];

  return (
    <div className="w-full bg-black py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12 md:space-y-16 ">
        {/* Title */}
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <h2 className="titleTimeline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 sm:mb-4">
            Program <span className="text-yellow-400">Timeline</span>
          </h2>
          <div className="flex justify-center">
            <div className="w-20 sm:w-24 md:w-32 h-1 bg-yellow-400 rounded-full"></div>
          </div>
        </div>
        <div className=" timeLines  phases max-w-7xl mx-auto space-y-8 sm:space-y-12 md:space-y-16 relative">
        {/* Timeline */}
        {phases.map((element, idx) => (
          <TimeLine key={element.id} phase={element} isReverse={idx % 2 !== 0} />
        ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramTimeline;