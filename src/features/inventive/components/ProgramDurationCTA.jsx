import React from "react";
import { useNavigate } from "react-router-dom";
const ProgramDurationCTA = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/inventiveForm");
  };
  const handleResourceClick = () => {
    window.open(
      "https://drive.google.com/drive/folders/1nIMJFEE8fKtNz-48Tivos-YxVNiUyGFI?usp=sharing",
      "_blank"
    );
  };
  return (
    <div className="relative w-full bg-black py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Duration Text */}
        <div className="mb-8">
          <p className="text-lg md:text-xl lg:text-2xl text-white font-semibold leading-relaxed">
            <span className="text-yellow-400 font-bold">TOTAL DURATION:</span>{" "}
            <span className="text-yellow-400 font-bold">12 WEEKS</span> OF
            INTENSIVE INNOVATION AND DEVELOPMENT
          </p>
        </div>

        {/* Register Button */}
        <div className="flex justify-center">
          <button
            className="group relative px-12 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold text-xl rounded-full transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-yellow-400/50 focus:outline-none focus:ring-4 focus:ring-yellow-400/30"
            onClick={handleClick}
          >
            <span className="relative z-10 tracking-wide">REGISTER NOW</span>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Button glow effect */}
            <div className="absolute inset-0 rounded-full bg-yellow-400/20 blur-xl group-hover:bg-yellow-400/40 transition-all duration-300 -z-10"></div>

            {/* Pulse ring */}
            <div className="absolute inset-0 rounded-full border-2 border-yellow-400 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
          </button>
        </div>
        <div className="mt-4 text-white">
          <p className="mb-3">Here are few resources,Check out</p>
          <div className="flex justify-center">
            <button
              className="group relative px-8 py-3 border border-yellow-400 bg-black text-yellow-400 text-lg font-semibold text-base rounded-lg
               transition-all duration-300 hover:bg-gradient-to-r from-yellow-600 to-yellow-400 hover:text-black hover:shadow-lg hover:shadow-yellow-400/40
               focus:outline-none focus:ring-2 focus:ring-yellow-300/50"
              onClick={handleResourceClick}
            >
              <span className="relative z-10 tracking-wide">Resources</span>

              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-lg bg-yellow-400/20 blur-md opacity-0 group-hover:opacity-100 -z-10 transition-all duration-300"></div>
            </button>
          </div>
        </div>

        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Subtle gradient orbs */}
          <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-yellow-400/10 rounded-full blur-2xl"></div>

          {/* Floating particles */}
          {Array.from({ length: 6 }, (_, i) => (
            <div
              key={`cta-particle-${i}`}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-30 animate-bounce"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${30 + Math.random() * 40}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramDurationCTA;
