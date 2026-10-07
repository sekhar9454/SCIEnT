/**
 * seedBpclTools.js
 * ─────────────────────────────────────────────────────────────────────────────
 * One-time idempotent script to:
 *   1. Upload BPCL tool images to Cloudinary (folder: Inventory_BPCL)
 *   2. Insert Tool documents into MongoDB with poweredBy: "BPCL"
 *
 * Usage (from repo root):
 *   cd server && node scripts/seedBpclTools.js
 *
 * Re-run safe: skips any tool whose name already exists in the DB.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Tool = require('../models/Tool');

// ── Cloudinary config ────────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key:    process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// ── BPCL Tool definitions ────────────────────────────────────────────────────
// Each entry: name, category, description, quantity, imageUrl (source to upload)
const BPCL_TOOLS = [
  // ── i. Machines - CAPEX ──────────────────────────────────────────────────
  {
    name: 'CNC Lathe',
    category: 'BPCL Sponsored',
    description: 'Precision computer-controlled lathe for turning, facing, and threading metal workpieces with high accuracy. Cost: Rs.8,85,000.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1565043589221-1a6fd9ae45c7?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'CNC Laser Cutter',
    category: 'BPCL Sponsored',
    description: 'High-power CNC laser cutter for precision cutting and engraving of metals, acrylic, wood, and composites. Cost: Rs.7,67,000.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1616401784845-180882ba9ba8?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Vertical Drilling Machine',
    category: 'BPCL Sponsored',
    description: 'Industrial vertical drill press for accurate hole drilling in metal, wood, and plastic with variable speed control. Cost: Rs.59,157.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Spot Welding Machine',
    category: 'BPCL Sponsored',
    description: 'Resistance spot welder for joining sheet metal components quickly and cleanly without filler material. Cost: Rs.44,999.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581093806997-124204d9fa9d?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Sheet Metal Bender',
    category: 'BPCL Sponsored',
    description: 'Precision sheet metal bending machine (press brake) for forming accurate angles and channels in metal sheets. Cost: Rs.35,999.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Bambu Lab X1 Carbon Combo 3D Printer',
    category: 'BPCL Sponsored',
    description: 'Professional multi-material 3D printer with carbon-fibre reinforced frame, 16-colour support, and 20,000 mm/s2 acceleration for ultra-fast prototyping. Cost: Rs.1,82,000.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: '3D Scanner',
    category: 'BPCL Sponsored',
    description: 'High-resolution 3D scanner for reverse engineering, quality inspection, and digitising physical objects into CAD models. Cost: Rs.1,88,800.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Pipe Bending Machine',
    category: 'BPCL Sponsored',
    description: 'Hydraulic pipe bending machine for forming precise bends in metal tubing for structural and fluid-system applications. Cost: Rs.75,000.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Chop Saw - Boschcut Off Machine 14 inch',
    category: 'BPCL Sponsored',
    description: '14-inch abrasive chop saw for rapid, clean cross-cuts through steel bars, pipes, and profiles. Cost: Rs.14,804 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
  },

  // ── ii. High-Speed Processors - CAPEX ───────────────────────────────────
  {
    name: 'Jetson Nano Orin',
    category: 'BPCL Sponsored',
    description: 'NVIDIA Jetson Orin Nano - edge AI module with 1024-core Ampere GPU for real-time vision, robotics, and autonomous systems. Cost: Rs.53,231.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Intel RealSense Depth Camera',
    category: 'BPCL Sponsored',
    description: 'Intel RealSense D-series depth camera for 3D perception, obstacle avoidance, and SLAM in robotics applications. Cost: Rs.31,999 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'NVIDIA GeForce RTX 3090',
    category: 'BPCL Sponsored',
    description: '24 GB VRAM flagship GPU for deep learning model training, simulation rendering, and GPU-accelerated compute. Cost: Rs.2,07,999 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'AMD Ryzen 5600x Processor',
    category: 'BPCL Sponsored',
    description: '6-core, 12-thread Zen 3 desktop processor for high-performance simulation workstations and embedded compute nodes. Cost: Rs.14,890 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'BeagleBone Black Development Board',
    category: 'BPCL Sponsored',
    description: 'Open-source single-board computer with dual-core PRU subsystem for real-time I/O control in robotics and automation projects. Cost: Rs.5,899 each.',
    quantity: 4,
    imageUrl: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Artix FPGA BASYS3 for Vivado',
    category: 'BPCL Sponsored',
    description: 'Xilinx Artix-7 FPGA development board for digital design, HDL prototyping, and custom hardware acceleration experiments. Cost: Rs.17,999.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1597852074816-d933c7d2b988?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Precision 3260 Compact Workstation',
    category: 'BPCL Sponsored',
    description: 'Dell Precision 3260 mini-workstation for CAD, simulation, and engineering compute tasks in a compact form factor. Cost: Rs.99,370 each.',
    quantity: 5,
    imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80',
  },

  // ── iii. Equipment - CAPEX ───────────────────────────────────────────────
  {
    name: 'DJI Mini 3 Pro Drone',
    category: 'BPCL Sponsored',
    description: 'DJI Mini 3 Pro with Fly More Kit - sub-250g drone featuring 4K/60fps camera, obstacle sensing, and extended-range controller for aerial surveys. Cost: Rs.1,06,374 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1506947411487-a56738267384?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Hot Air Blower Gun',
    category: 'BPCL Sponsored',
    description: 'Industrial hot air blower (heat gun) for SMD rework, heat-shrink tubing, and plastic forming in electronics assembly. Cost: Rs.21,500 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Vacuum Pump',
    category: 'BPCL Sponsored',
    description: 'High-vacuum rotary vane pump for laboratory vacuum systems, composite layup bagging, and vacuum-assisted resin infusion. Cost: Rs.3,400 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1581093450021-4a7360e9a6b5?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Oscilloscope - RIGOL DS1054Z',
    category: 'BPCL Sponsored',
    description: 'RIGOL DS1054Z 4-channel, 50 MHz digital oscilloscope with 1 GSa/s sample rate for electronics debugging and signal analysis. Cost: Rs.39,990 each.',
    quantity: 2,
    imageUrl: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Swarm Robotics System',
    category: 'BPCL Sponsored',
    description: 'Complete swarm robotics platform including multiple drones, ground control station, and flight controller software for autonomous multi-agent research. Cost: Rs.6,50,000.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Adjustable Power Supply',
    category: 'BPCL Sponsored',
    description: 'Bench DC power supply with adjustable voltage and dual current ranges (>5A and <5A) for powering and testing electronic circuits. Cost: Rs.34,987.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
  },

  // ── Sub-Project 2: TechClubs - Select Lab Instruments ───────────────────
  {
    name: 'Homogenizer',
    category: 'BPCL Sponsored',
    description: 'Laboratory homogenizer for mixing, emulsifying, and dispersing biological and chemical samples in biodegradable films and coatings research. Cost: Rs.1,94,051.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Refractometer',
    category: 'BPCL Sponsored',
    description: 'Precision optical refractometer for measuring the refractive index of liquids and thin films in materials characterisation experiments. Cost: Rs.11,42,040.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=800&q=80',
  },
  {
    name: 'Humidity Chamber',
    category: 'BPCL Sponsored',
    description: 'Programmable environmental test chamber for controlled humidity and temperature testing of materials and electronic assemblies. Cost: Rs.3,19,780.',
    quantity: 1,
    imageUrl: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=800&q=80',
  },
];

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected.\n');

  let uploaded = 0;
  let skipped  = 0;
  let failed   = 0;

  for (const tool of BPCL_TOOLS) {
    // Idempotency check
    const existing = await Tool.findOne({ name: tool.name });
    if (existing) {
      console.log(`SKIP (already in DB): ${tool.name}`);
      skipped++;
      continue;
    }

    try {
      console.log(`Uploading image for: ${tool.name}`);
      const result = await cloudinary.uploader.upload(tool.imageUrl, {
        folder: 'Inventory_BPCL',
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
        resource_type: 'image',
      });

      const doc = await Tool.create({
        name:        tool.name,
        category:    tool.category,
        description: tool.description,
        quantity:    tool.quantity,
        image: {
          url:      result.secure_url,
          filename: result.public_id,
        },
        poweredBy: 'BPCL',
      });

      console.log(`  OK: ${doc.name}`);
      console.log(`      Cloudinary: ${result.secure_url}\n`);
      uploaded++;
    } catch (err) {
      console.error(`  FAILED for "${tool.name}": ${err.message}\n`);
      failed++;
    }
  }

  console.log('-----------------------------------------');
  console.log(`Uploaded & inserted : ${uploaded}`);
  console.log(`Skipped (duplicate) : ${skipped}`);
  console.log(`Failed              : ${failed}`);
  console.log('-----------------------------------------');

  await mongoose.disconnect();
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
