import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Zap, 
  Layers, 
  Grid, 
  Calendar, 
  MapPin, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  CheckCircle2, 
  Sparkles,
  Info,
  Images,
  Maximize2
} from 'lucide-react';
import Footer from '../components/footer';
import GridScan from '../components/GridScan';
import { timelineData, CATEGORIES, STATS } from '../data/timelineData';
import './Timeline.css';

const Timeline = () => {
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('stream'); // 'stream' | 'carousel' | 'grid'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  
  const [gridSettings, setGridSettings] = useState({
    linesColor: '#1f1a00',
    scanColor: '#FFC700',
  });

  // Modal State
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalActiveImgIndex, setModalActiveImgIndex] = useState(0);

  // Stage Slider (Carousel) active photo index state
  const [stageActiveImgIndex, setStageActiveImgIndex] = useState(0);

  // Fetch Admin Configured Settings on Mount
  useEffect(() => {
    const MODE = process.env.NODE_ENV || 'development';
    const API_BASE = MODE === 'development' ? 'http://localhost:5000' : '';
    fetch(`${API_BASE}/api/admin/settings/public`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data) {
          const s = resData.data;
          if (s.timelineDefaultView) {
            setViewMode(s.timelineDefaultView);
          }
          setGridSettings({
            linesColor: s.gridScanLinesColor || '#1f1a00',
            scanColor: s.gridScanColor || '#FFC700',
          });
        }
      })
      .catch((err) => console.log('Using default timeline settings:', err));
  }, []);

  // Unique list of sorted years (for the jump-to-year tab bar)
  const uniqueYears = useMemo(() => {
    return Array.from(new Set(timelineData.map(item => item.year))).sort();
  }, []);

  // All events filtered by category and search (no year filter — all years shown)
  const filteredData = useMemo(() => {
    return timelineData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category.id === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.date.toLowerCase().includes(query) ||
        item.category.label.toLowerCase().includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Keep Carousel Index bounded when filters change
  useEffect(() => {
    setCarouselIndex(0);
    setStageActiveImgIndex(0);
  }, [selectedCategory, searchQuery]);


  // Modal handlers
  const openModal = (item) => {
    setActiveModalItem(item);
    setModalActiveImgIndex(0);
  };

  // Lock body scroll when Lightbox Modal is open
  useEffect(() => {
    if (activeModalItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [activeModalItem]);

  const currentStageItem = filteredData[carouselIndex] || null;

  return (
    <div className="timeline-page-root timeline-archive-page">

      {/* GridScan 3D WebGL Background - Black & Yellow theme */}
      <div className="timeline-gridscan-bg-container">
        <GridScan
          sensitivity={0.55}
          lineThickness={1}
          linesColor={gridSettings.linesColor}
          gridScale={0.1}
          scanColor={gridSettings.scanColor}
          scanOpacity={0.4}
          enablePost
          bloomIntensity={0.6}
          chromaticAberration={0.002}
          noiseIntensity={0.01}
        />
      </div>

      {/* Background Ambient Yellow/Gold Glows */}
      <div className="timeline-bg-decor" />

      <main className="timeline-workspace">
        <aside className="timeline-sidebar">
          {/* Hero Section */}
          <section className="timeline-hero-section">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="timeline-badge-glow"
        >
          <Sparkles size={16} /> SCIEnT Grand Decadal Archive (2015 – 2026)
        </motion.div>

          <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="timeline-main-heading"
        >
          A Grand Odyssey of Technology &amp; Innovation
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="timeline-sub-heading"
        >
          Immerse yourself in the rich visual history of NIT Trichy&apos;s multi-disciplinary innovation lab. Select any year tab to open its dedicated timeline page.
        </motion.p>

        {/* Stats Row */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="timeline-stats-row"
        >
          {STATS.map((st, idx) => (
            <div key={idx} className="timeline-stat-card">
              <div className="timeline-stat-val">{st.value}</div>
              <div className="timeline-stat-lbl">{st.label}</div>
            </div>
          ))}
        </motion.div>
          </section>

        </aside>

        {/* Main Dynamic Content Display */}
        <section className="timeline-content-container">
          {/* Timeline filters and navigation */}
          <section className="timeline-controls-deck">
            <div className="timeline-top-controls">
              <div className="timeline-search-box">
                <Search className="timeline-search-icon" size={18} />
                <input
                  type="text"
                  placeholder="Search hackathons, CFI visit, workshops, showcases..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="timeline-search-input"
                />
              </div>

              <div className="timeline-view-switcher">
                <button className={`view-btn ${viewMode === 'stream' ? 'active' : ''}`} onClick={() => setViewMode('stream')} title="Circuit Node Stream">
                  <Zap size={16} /> Circuit Stream
                </button>
                <button className={`view-btn ${viewMode === 'carousel' ? 'active' : ''}`} onClick={() => setViewMode('carousel')} title="3D Stage Slider">
                  <Layers size={16} /> Stage Slider
                </button>
                <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Matrix Grid">
                  <Grid size={16} /> Matrix Grid
                </button>
              </div>
            </div>

            <div className="timeline-category-pills">
              {Object.values(CATEGORIES).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`cat-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                  style={{ '--cat-color': cat.color }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="timeline-year-jumper">
              <span className="year-jumper-label">JUMP TO YEAR:</span>
              <div className="year-jumper-buttons-wrap">
                {uniqueYears.map((yr) => (
                  <button key={yr} onClick={() => navigate(`/timeline/${yr}`)} className="year-tag-btn">
                    {yr}
                  </button>
                ))}
              </div>
            </div>
          </section>
        {filteredData.length === 0 ? (
          <div className="no-milestones-box">
            <Info size={40} className="no-milestones-icon" />
            <h3>No Milestones Match Your Filters</h3>
            <p>Try adjusting your search or switching categories.</p>
          </div>
        ) : (
          <>
            {/* VIEW 1: CIRCUIT STREAM */}
            {viewMode === 'stream' && (
              <div className="circuit-stream-wrapper">
                <div className="circuit-spine" />
                {filteredData.map((item, index) => {
                  const isRight = index % 2 !== 0;
                  const itemImages = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);
                  return (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`circuit-item-row ${isRight ? 'right-side' : ''}`}
                    >
                      {/* Node Dot */}
                      <div className="circuit-node-dot" />

                      {/* Event Card */}
                      <div 
                        className="circuit-card"
                        onClick={() => openModal(item)}
                      >
                        <div className="circuit-card-header">
                          <span 
                            className="circuit-cat-badge"
                            style={{ background: item.category.bg, color: item.category.color }}
                          >
                            {item.category.label}
                          </span>
                          <span className="circuit-date-lbl">{item.date}</span>
                        </div>

                        <h3 className="circuit-card-title">{item.title}</h3>
                        <p className="circuit-card-desc">{item.summary}</p>

                        {/* Image Gallery Cover */}
                        {itemImages.length > 0 && (
                          <div className="circuit-card-img-wrap">
                            <img 
                              src={itemImages[0]} 
                              alt={item.title} 
                              className="circuit-card-img"
                              loading="lazy"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                            {itemImages.length > 1 && (
                              <span className="gallery-count-badge">
                                <Images size={13} /> {itemImages.length} Photos
                              </span>
                            )}
                          </div>
                        )}

                        {/* Mini Gallery Strip Preview */}
                        {itemImages.length > 1 && (
                          <div className="card-mini-gallery-strip">
                            {itemImages.slice(0, 4).map((imgUrl, i) => (
                              <img 
                                key={i} 
                                src={imgUrl} 
                                alt="" 
                                className="mini-strip-thumb"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
                                }}
                              />
                            ))}
                          </div>
                        )}

                        <div className="circuit-card-footer">
                          <span className="circuit-location">
                            <MapPin size={14} style={{ color: 'var(--sci-gold)' }} /> {item.location}
                          </span>
                          <button className="circuit-inspect-btn">
                            Explore Gallery <Maximize2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: STAGE SLIDER (Carousel Mode) */}
            {viewMode === 'carousel' && currentStageItem && (
              <div className="slider-view-wrapper">
                <div className="slider-top-nav">
                  <span className="slider-count-lbl">
                    Milestone {carouselIndex + 1} of {filteredData.length}
                  </span>
                  <div className="slider-nav-btns">
                    <button 
                      className="slide-arrow-btn"
                      disabled={carouselIndex === 0}
                      onClick={() => {
                        setCarouselIndex(prev => prev - 1);
                        setStageActiveImgIndex(0);
                      }}
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button 
                      className="slide-arrow-btn"
                      disabled={carouselIndex === filteredData.length - 1}
                      onClick={() => {
                        setCarouselIndex(prev => prev + 1);
                        setStageActiveImgIndex(0);
                      }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div 
                    key={currentStageItem.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4 }}
                    className="stage-card-body"
                  >
                    <div className="stage-img-box">
                      {(() => {
                        const imgs = currentStageItem.images && currentStageItem.images.length > 0 ? currentStageItem.images : [currentStageItem.image || '/assets/timeline/tools_board.jpg'];
                        const activeImg = imgs[stageActiveImgIndex] || imgs[0];
                        return (
                          <>
                            <img 
                              src={activeImg} 
                              alt={currentStageItem.title} 
                              className="stage-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                            {imgs.length > 1 && (
                              <div className="stage-photo-picker">
                                {imgs.map((imgUrl, i) => (
                                  <img 
                                    key={i}
                                    src={imgUrl}
                                    alt=""
                                    className={`stage-picker-thumb ${stageActiveImgIndex === i ? 'active' : ''}`}
                                    onClick={() => setStageActiveImgIndex(i)}
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>

                    <div className="stage-info-box">
                      <div className="stage-year-pill">{currentStageItem.year}</div>
                      <span 
                        className="circuit-cat-badge"
                        style={{ 
                          background: currentStageItem.category.bg, 
                          color: currentStageItem.category.color,
                          alignSelf: 'flex-start'
                        }}
                      >
                        {currentStageItem.category.label} • {currentStageItem.date}
                      </span>
                      
                      <h2 className="stage-title">{currentStageItem.title}</h2>
                      <p className="stage-desc">{currentStageItem.description}</p>

                      {currentStageItem.highlights && (
                        <div className="stage-highlights-list">
                          {currentStageItem.highlights.map((hl, i) => (
                            <div key={i} className="stage-hl-item">
                              <CheckCircle2 size={16} className="stage-hl-icon" />
                              <span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <button 
                        className="circuit-inspect-btn" 
                        style={{ marginTop: '12px', fontSize: '1rem', color: 'var(--sci-gold)' }}
                        onClick={() => openModal(currentStageItem)}
                      >
                        View Full Photo Gallery ({currentStageItem.images ? currentStageItem.images.length : 1}) <Maximize2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            )}

            {/* VIEW 3: MATRIX GRID */}
            {viewMode === 'grid' && (
              <div className="matrix-grid-wrapper">
                {filteredData.map((item) => {
                  const itemImages = item.images && item.images.length > 0 ? item.images : (item.image ? [item.image] : []);
                  return (
                    <motion.div 
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="matrix-card"
                      onClick={() => openModal(item)}
                    >
                      <div>
                        {itemImages.length > 0 && (
                          <div className="matrix-card-img-wrap">
                            <img 
                              src={itemImages[0]} 
                              alt={item.title} 
                              className="matrix-card-img"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                            {itemImages.length > 1 && (
                              <span className="gallery-count-badge">
                                <Images size={12} /> {itemImages.length}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="matrix-card-top" style={{ marginTop: '12px' }}>
                          <span 
                            className="circuit-cat-badge"
                            style={{ background: item.category.bg, color: item.category.color }}
                          >
                            {item.category.label}
                          </span>
                          <span className="matrix-year-badge">{item.year}</span>
                        </div>

                        <h3 className="matrix-card-title">{item.title}</h3>
                        <p className="matrix-card-text">{item.summary}</p>
                      </div>

                      <div className="circuit-card-footer" style={{ borderTop: '1px solid rgba(255,199,0,0.15)', paddingTop: '10px' }}>
                        <span className="circuit-location">
                          <Calendar size={14} style={{ color: 'var(--sci-gold)' }} /> {item.date}
                        </span>
                        <span className="circuit-inspect-btn">
                          View Gallery <Maximize2 size={14} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
        </section>
      </main>

      {/* GRAND LIGHTBOX MODAL & MULTI-PHOTO GALLERY OVERLAY */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="modal-backdrop" onClick={() => setActiveModalItem(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3 }}
              className="modal-content-card"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="modal-close-btn"
                onClick={() => setActiveModalItem(null)}
              >
                <X size={20} />
              </button>

              <div className="modal-body">
                {/* Multi-Photo Grand Stage Showcase */}
                {(() => {
                  const modalImgs = activeModalItem.images && activeModalItem.images.length > 0 
                    ? activeModalItem.images 
                    : (activeModalItem.image ? [activeModalItem.image] : []);

                  if (modalImgs.length === 0) return null;

                  const activePhoto = modalImgs[modalActiveImgIndex] || modalImgs[0];

                  return (
                    <div className="modal-gallery-stage">
                      <div className="modal-main-photo-wrap">
                        <img 
                          src={activePhoto} 
                          alt={activeModalItem.title} 
                          className="modal-main-photo"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
                          }}
                        />
                        {modalImgs.length > 1 && (
                          <>
                            <button 
                              className="modal-photo-arrow left"
                              disabled={modalActiveImgIndex === 0}
                              onClick={() => setModalActiveImgIndex(prev => Math.max(0, prev - 1))}
                            >
                              <ChevronLeft size={24} />
                            </button>
                            <button 
                              className="modal-photo-arrow right"
                              disabled={modalActiveImgIndex === modalImgs.length - 1}
                              onClick={() => setModalActiveImgIndex(prev => Math.min(modalImgs.length - 1, prev + 1))}
                            >
                              <ChevronRight size={24} />
                            </button>
                            <span className="modal-photo-counter-badge">
                              Photo {modalActiveImgIndex + 1} of {modalImgs.length}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Thumbnail Grid Selector */}
                      {modalImgs.length > 1 && (
                        <div className="modal-thumbs-grid">
                          {modalImgs.map((imgUrl, i) => (
                            <img 
                              key={i}
                              src={imgUrl}
                              alt=""
                              className={`modal-thumb-item ${modalActiveImgIndex === i ? 'active' : ''}`}
                              onClick={() => setModalActiveImgIndex(i)}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div>
                  <span 
                    className="circuit-cat-badge"
                    style={{ background: activeModalItem.category.bg, color: activeModalItem.category.color }}
                  >
                    {activeModalItem.category.label} • {activeModalItem.date}
                  </span>
                  <h2 className="modal-title" style={{ marginTop: '10px' }}>
                    {activeModalItem.title}
                  </h2>
                </div>

                <p className="modal-full-desc">{activeModalItem.description}</p>

                {activeModalItem.highlights && (
                  <div>
                    <div className="modal-hl-title">Key Milestone Highlights</div>
                    <div className="stage-highlights-list">
                      {activeModalItem.highlights.map((hl, i) => (
                        <div key={i} className="stage-hl-item">
                          <CheckCircle2 size={16} className="stage-hl-icon" />
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="circuit-card-footer" style={{ marginTop: '10px', paddingTop: '16px' }}>
                  <span className="circuit-location">
                    <MapPin size={16} style={{ color: 'var(--sci-gold)' }} /> {activeModalItem.location}
                  </span>
                  <span className="circuit-location">
                    <Calendar size={16} style={{ color: 'var(--sci-gold)' }} /> {activeModalItem.year} SCIEnT Archive Entry
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Timeline;
