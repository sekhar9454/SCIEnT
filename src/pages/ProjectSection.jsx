import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ProjectSection.css';
import Footer from '../components/footer';
import { spider, delta, ecell, max, sigma, oedc, dc, naksh, psi, rmi, graphique, td, prof, fh, db, ever } from "../assets";
import ProjectCard from '../components/ProjectCard';

const projects = [
    {
        name: 'SPIDER',
        years: [
            { year: 2024, link: '/spider2024' },
            { year: 2023, link: '/spider2023' },
            { year: 2022, link: '/spider2022' }
        ],
        image: spider,
    },
    {
        name: 'E-CELL',
        years: [
            { year: 2023, link: '/Ecell2023' }
        ],
        image: ecell,
    },
    {
        name: 'GRAPHIQUE',
        years: [
            { year: 2023, link: '/GRAPHIQUE/2023' },
            { year: 2022, link: '/GRAPHIQUE/2022' },
            { year: 2021, link: '/GRAPHIQUE/2021' },
            { year: 2020, link: '/GRAPHIQUE/2020' },
        ],
        image: graphique,
    },
    {
        name: 'EVER',
        years: [
            { year: 2023, link: '/EVER2023' }
        ],
        image: ever,
    },
    {
        name: 'DELTA',
        years: [
            { year: 2024, link: '/Delta2024' },
            { year: 2023, link: '/Delta2023' },
            { year: 2022, link: '/Delta2022' },
            { year: 2021, link: '/Delta2021' }
        ],
        image: delta,
    },
    {
        name: '3D AERODYNAMICS',
        years: [
            { year: 2023, link: '/3D2023' }
        ],
        image: td,
    },
    {
        name: 'FORCE HYPERLOOP',
        years: [
            { year: 2024, link: '/Fhl2023' }
        ],
        image: fh,
    },
    {
        name: 'RMI',
        years: [
            { year: 2023, link: '/RMI2023' },
            { year: 2022, link: '/RMI2022' },
            { year: 2021, link: '/RMI2021' },
            { year: 2020, link: '/RMI2020' },
        ],
        image: rmi,
    },
    {
        name: 'PSI',
        years: [
            { year: 2023, link: '/Psi2023' }
        ],
        image: psi,
    },
    {
        name: 'DESIGNERS CONSORTIUM',
        years: [
            { year: 2024, link: '/DC2024' },
            { year: 2023, link: '/DC2023' },
            { year: 2022, link: '/DC2022' }
        ],
        image: dc,
    },
    {
        name: 'NAKSHATRA',
        years: [
            { year: 2023, link: '/NAKSHA/2023' },
            { year: 2022, link: '/NAKSHA/2022' },
            { year: 2021, link: '/NAKSHA/2021' },
            { year: 2020, link: '/NAKSHA/2020' },
        ],
        image: naksh,
    },
    {
        name: 'DATABYTE',
        years: [
            { year: 2023, link: '/DB2023' }
        ],
        image: db,
    }
];

const ProjectSection = () => {
    const navigate = useNavigate();

    // Function to navigate to the latest project link
    const handleClick = (latestLink) => {
        navigate(latestLink);
    };

    return (
        <>
            <div className="project-section">
                <h2>PROJECTS</h2>
                <div className="projects-grid">
                    {projects.map((project, index) => {
                        return (
                            <ProjectCard p = {project} i = {index} />
                    
                        );
                    })}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ProjectSection;