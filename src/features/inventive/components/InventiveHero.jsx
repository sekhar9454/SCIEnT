import React from "react";
import "../styles/Inventive.css";

const InventiveHero = () => {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 opacity-30">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <linearGradient id="gridGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#FFA500" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#FF8C00" stopOpacity="0.4" />
            </linearGradient>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E90FF" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#0066CC" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Dynamic Grid Lines */}
          {Array.from({ length: 40 }, (_, i) => (
            <g key={`grid-${i}`}>
              <path
                d={`M${i * 30} 0 Q${i * 30 + 200} ${200 + i * 10} ${
                  i * 30 + 100
                } 800`}
                stroke="url(#gridGradient)"
                strokeWidth="1"
                fill="none"
                opacity="0.6"
                className="animate-pulse"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            </g>
          ))}

          {/* Curved accent lines */}
          <path
            d="M-100 400 Q300 200 600 400 T1300 300"
            stroke="url(#blueGradient)"
            strokeWidth="2"
            fill="none"
            className="animate-pulse"
          />
          <path
            d="M-100 600 Q400 400 800 600 T1400 500"
            stroke="url(#gridGradient)"
            strokeWidth="3"
            fill="none"
            opacity="0.8"
            className="animate-pulse"
          />
        </svg>
      </div>


      <section className="relative bg-black text-white min-h-screen flex flex-col mt-12">

        {/* Content Wrapper */}
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 text-center flex flex-col justify-center flex-1 inventiveContent">
          {/* INVENTIVE Title */}

          <div className="relative mb-8 sm:mb-12">
            <h1 className="inventiveTitle 
              text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] 
              font-black tracking-wider 
              text-transparent bg-clip-text 
              bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400 
              drop-shadow-lg transition-transform duration-700 hover:scale-105">

              INVENTIVE
            </h1>
          </div>

          {/* Subtitle */}

          <div className="mb-12 px-4 sm:mb-16 space-y-6 sm:space-y-8">
            <p className="text-lg sm:text-xl text-gray-200 leading-relaxed max-w-3xl sm:max-w-4xl mx-auto font-light">

              Got an innovative idea bubbling in your mind? We’ll give you the
              stage, the spotlight, and the chance to shine like never before.
            </p>
          </div>

          {/* Main Description */}
          <div className="mb-12 px-4 sm:mb-16 space-y-6 sm:space-y-8">
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl sm:max-w-4xl mx-auto">
              <span className="text-yellow-400 font-semibold">INVENTIVE</span>{" "}
              is SCIEnT's groundbreaking initiative, designed to fuel the spark
              of innovation in aspiring minds. Whether you’re a dreamer,
              thinker, or builder, this is your chance to bring your ideas to
              life.
            </p>
            <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl sm:max-w-3xl mx-auto">
              This program offers you a unique opportunity to transform your raw
              concepts into impactful solutions, with the support of mentors,
              resources, and a platform to showcase your brilliance.
            </p>
          </div>

          {/* Bottom Line */}
          <div className="w-full h-px bg-yellow-400 mt-12 sm:mt-20"></div>
        </div>
      </section>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 sm:w-2 h-1 sm:h-2 bg-yellow-400 rounded-full opacity-60 animate-bounce"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Gradient overlays for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 pointer-events-none"></div>
    </div>
  );
};

export default InventiveHero;
