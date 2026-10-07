import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Footer from "../components/footer";
import ClubCard from "../components/ClubCard";
import "./ClubsPage.css";


export default function ClubsPage() {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const MODE = process.env.NODE_ENV || 'development';
        const API_BASE = MODE==="development"? 'http://localhost:5000/api/clubs' : "/api/clubs";
        const res = await axios.get(API_BASE);
        setClubs(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchClubs();
  }, []);

  return (
    <>
      <div className="clubs-page">
        <h1 className="clubs-title">CLUBS</h1>

        <div className="clubs-grid">
          {clubs.map((club) => (
            <ClubCard
              key={club._id}
              club={club}
              onClick={() => navigate(`/clubs/${club.name}/projects`)}
            />
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
}
