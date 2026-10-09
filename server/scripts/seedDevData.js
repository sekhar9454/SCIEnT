/**
 * seedDevData.js
 *
 * Fills an empty local MongoDB with preview data so the site is usable in
 * development when Atlas is unreachable. Runs automatically from app.js when
 * the server ends up on the local database outside production.
 *
 * Each collection is seeded only when it is empty, so local edits survive
 * restarts. Drop a collection to reseed it.
 *
 * Run manually from server/ directory:
 *   node scripts/seedDevData.js
 */
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Club = require('../models/Club');
const Project = require('../models/Project');
const Tool = require('../models/Tool');
const TeamMember = require('../models/TeamMember');
const { realTeamMembers } = require('./seedTeamMembers');
const { BPCL_TOOLS } = require('./seedBpclTools');
const clubsData = require('../data/devSeed/clubs.json');
const projectsByClub = require('../data/devSeed/projects');
const tools = require('../data/devSeed/tools');

// Photos served by the React app from public/Team, used for members without a photo link
const TEAM_PHOTO_DIR = path.join(__dirname, '../../public/Team');

// Club each project list in data/devSeed/projects.js belongs to
const PROJECT_CLUBS = {
  ecellProjects: 'E-CELL',
  spiderProjects: 'SPIDER',
  forceHyperloopProject: 'FORCE HYPERLOOP',
  dcProjects: 'DESIGNERS CONSORTIUM',
  rmiProjects: 'RMI',
  psiProjects: 'PSI',
  everProjects: 'EVER',
  threeDProjects: '3D AERODYNAMICS',
  dataByteProjects: 'DATABYTE',
  orbitProjects: 'ORBIT',
};

// Members whose photo file isn't named after their full name
const PHOTO_ALIASES = {
  'Srinath Nagarajan': 'Srinath_N',
  'Kamalakannan Ravichandran': 'Kamalakannan_R',
  'S. Nayan Vamsi': 'Nayan_Vamsi',
  'Vishal Durai': 'Vishal',
  'Muhesh Alagappan Thiyagarajan': 'Muhesh',
  'Lakshana S': 'Lakshana',
  'Jatin Suresh Subramani': 'Jatin_S_S',
  'Poluru Saketh Koundinya': 'Saketh',
  'Samarth Pattewar': 'Samarth',
  'Pattewar Samarth Balaji': 'Samarth',
  'Meeduri Rithwik Sundar': 'M_Rithwik_Sundar',
  'Rithwik sundar': 'M_Rithwik_Sundar',
  'Krishvinraam Mohan': 'Krishvin',
  'Hem Sai': 'Hem',
  'A M Yafea Nazz': 'am_yafea',
  'Ragipalyam Ananda Swaroop': 'ananda_swaroop',
  'E Shakthi Ganesh': 'shakthi_ganesh_elavarasan',
};

const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

// Maps normalized file stem -> "/Team/<file>", skipping formats browsers can't show
const loadTeamPhotos = () => {
  if (!fs.existsSync(TEAM_PHOTO_DIR)) return {};
  const photos = {};
  for (const file of fs.readdirSync(TEAM_PHOTO_DIR).sort()) {
    const { name, ext } = path.parse(file);
    if (!/^\.(jpe?g|png|webp)$/i.test(ext)) continue;
    const key = normalize(name);
    if (!photos[key]) photos[key] = `/Team/${file}`;
  }
  return photos;
};

const withLocalPhoto = (member, photos) => {
  const key = normalize(PHOTO_ALIASES[member.name] || member.name);
  return { ...member, photoUrl: member.photoUrl || photos[key] || null };
};

const seedIfEmpty = async (Model, label, insert) => {
  if (await Model.estimatedDocumentCount() > 0) return;
  const count = await insert();
  console.log(`[dev seed] ${label}: inserted ${count}`);
};

async function seedDevData() {
  await seedIfEmpty(TeamMember, 'team members', async () => {
    const photos = loadTeamPhotos();
    const docs = await TeamMember.insertMany(realTeamMembers.map((m) => withLocalPhoto(m, photos)));
    return docs.length;
  });

  await seedIfEmpty(Club, 'clubs', async () => {
    const docs = await Club.insertMany(clubsData.map(({ name, logo, description }) => ({
      name: name.trim(),
      logo: logo || '',
      description: description || '',
    })));
    return docs.length;
  });

  await seedIfEmpty(Project, 'projects', async () => {
    let total = 0;
    for (const [listName, clubName] of Object.entries(PROJECT_CLUBS)) {
      const club = await Club.findOne({ name: clubName });
      if (!club) {
        console.warn(`[dev seed] club "${clubName}" not found, skipping its projects`);
        continue;
      }
      const docs = await Project.insertMany(projectsByClub[listName].map((p) => ({
        name: p.name,
        description: p.description,
        year: p.year,
        image: p.image,
        club: club._id,
      })));
      club.projects = docs.map((d) => d._id);
      await club.save();
      total += docs.length;
    }
    return total;
  });

  await seedIfEmpty(Tool, 'tools', async () => {
    const bpclTools = BPCL_TOOLS.map(({ imageUrl, ...tool }) => ({
      ...tool,
      image: { url: imageUrl, filename: '' },
      poweredBy: 'BPCL',
    }));
    const docs = await Tool.insertMany([...tools, ...bpclTools]);
    return docs.length;
  });
}

if (require.main === module) {
  const connectDB = require('../config/db');
  connectDB()
    .then(({ isLocal }) => {
      if (!isLocal) throw new Error('refusing to seed a non-local database');
      return seedDevData();
    })
    .catch((err) => {
      console.error('❌ Dev seed failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = { seedDevData };
