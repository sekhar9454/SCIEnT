import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  Maximize2,
  ArrowLeft,
  Home as HomeIcon,
  Clock,
} from 'lucide-react';
import Footer from '../components/footer';
import GridScan from '../components/GridScan';
import { timelineData, CATEGORIES } from '../data/timelineData';
import './Timeline.css';

const TimelineYear = () => {
  const { year } = useParams();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState('stream');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [stageActiveImgIndex, setStageActiveImgIndex] = useState(0);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [modalActiveImgIndex, setModalActiveImgIndex] = useState(0);
  const [gridSettings, setGridSettings] = useState({ linesColor: '#1f1a00', scanColor: '#FFC700' });

  useEffect(() => {
    const MODE = process.env.NODE_ENV || 'development';
    const API_BASE = MODE === 'development' ? 'http://localhost:5000' : '';
    fetch(`${API_BASE}/api/admin/settings/public`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData?.data) {
          const s = resData.data;
          if (s.timelineDefaultView) setViewMode(s.timelineDefaultView);
          setGridSettings({ linesColor: s.gridScanLinesColor || '#1f1a00', scanColor: s.gridScanColor || '#FFC700' });
        }
      })
      .catch(() => {});
  }, []);

  const allYears = useMemo(() =>
    Array.from(new Set(timelineData.map((item) => item.year))).sort(), []);

  const currentYearIndex = useMemo(() => allYears.indexOf(year), [allYears, year]);
  const prevYear = currentYearIndex > 0 ? allYears[currentYearIndex - 1] : null;
  const nextYear = currentYearIndex < allYears.length - 1 ? allYears[currentYearIndex + 1] : null;
  const yearHasData = timelineData.some((item) => item.year === year);

  const filteredData = useMemo(() => {
    return timelineData.filter((item) => {
      const matchesYear = item.year === year;
      const matchesCat = selectedCategory === 'all' || item.category.id === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.date.toLowerCase().includes(query) ||
        item.category.label.toLowerCase().includes(query);
      return matchesYear && matchesCat && matchesSearch;
    });
  }, [year, selectedCategory, searchQuery]);

  useEffect(() => { setCarouselIndex(0); setStageActiveImgIndex(0); }, [selectedCategory, searchQuery]);

  useEffect(() => {
    document.body.style.overflow = activeModalItem ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [activeModalItem]);

  const openModal = (item) => { setActiveModalItem(item); setModalActiveImgIndex(0); };
  const currentStageItem = filteredData[carouselIndex] || null;

  return (
    <div className="timeline-page-root timeline-year-page">

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
      <div className="timeline-bg-decor" />

      {/* Breadcrumbs */}
      <nav className="timeline-breadcrumbs-wrapper" aria-label="Breadcrumb">
        <div className="timeline-breadcrumbs-container">
          <Link to="/" className="breadcrumb-item-link"><HomeIcon size={14} /> Home</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <Link to="/timeline" className="breadcrumb-item-link"><Clock size={14} /> Timeline Archive</Link>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-item-active">Year {year}</span>
        </div>
      </nav>

      {/* Hero */}
      <section className="timeline-hero-section">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="timeline-badge-glow">
          <Sparkles size={16} /> SCIEnT — Year {year} Archive
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="timeline-main-heading">
          Year {year} — Innovation Timeline
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="timeline-sub-heading">
          {yearHasData
            ? `Explore every milestone, hackathon, showcase, and workshop recorded by SCIEnT during ${year}.`
            : `No recorded milestones found for ${year}.`}
        </motion.p>

        {/* Prev / Back / Next */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="year-page-nav-row">
          <button className="year-nav-step-btn" disabled={!prevYear} onClick={() => prevYear && navigate(`/timeline/${prevYear}`)}>
            <ChevronLeft size={16} /> {prevYear || 'First Year'}
          </button>
          <button className="year-nav-step-btn back-btn" onClick={() => navigate('/timeline')}>
            <ArrowLeft size={16} /> All Years
          </button>
          <button className="year-nav-step-btn" disabled={!nextYear} onClick={() => nextYear && navigate(`/timeline/${nextYear}`)}>
            {nextYear || 'Latest Year'} <ChevronRight size={16} />
          </button>
        </motion.div>
      </section>

      {/* Controls */}
      <section className="timeline-controls-deck">
        <div className="timeline-top-controls">
          <div className="timeline-search-box">
            <Search className="timeline-search-icon" size={18} />
            <input
              type="text"
              placeholder={`Search ${year} milestones...`}
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
            <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
              className={`cat-pill-btn ${selectedCategory === cat.id ? 'active' : ''}`}
              style={{ '--cat-color': cat.color }}>
              {cat.label}
            </button>
          ))}
        </div>

        <div className="year-milestone-count-bar">
          <span className="year-jumper-label">SHOWING:</span>
          <span className="year-count-chip">{filteredData.length} Milestone{filteredData.length !== 1 ? 's' : ''} in {year}</span>
        </div>
      </section>

      {/* Main Content */}
      <section className="timeline-content-container">
        {!yearHasData ? (
          <div className="no-milestones-box">
            <Info size={40} className="no-milestones-icon" />
            <h3>No data recorded for {year}</h3>
            <p>This year has no milestone entries in the SCIEnT archive.</p>
            <button className="reset-year-btn" onClick={() => navigate('/timeline')}>
              <ArrowLeft size={16} /> Return to Timeline Archive
            </button>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="no-milestones-box">
            <Info size={40} className="no-milestones-icon" />
            <h3>No results match your filters</h3>
            <p>Try clearing your search or selecting a different category.</p>
            <button className="reset-year-btn" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {/* VIEW 1: CIRCUIT STREAM */}
            {viewMode === 'stream' && (
              <div className="circuit-stream-wrapper">
                <div className="circuit-spine" />
                {filteredData.map((item, index) => {
                  const isRight = index % 2 !== 0;
                  const itemImages = item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
                  return (
                    <motion.div key={item.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: index * 0.05 }}
                      className={`circuit-item-row ${isRight ? 'right-side' : ''}`}>
                      <div className="circuit-node-dot" />
                      <div className="circuit-card" onClick={() => openModal(item)}>
                        <div className="circuit-card-header">
                          <span className="circuit-cat-badge" style={{ background: item.category.bg, color: item.category.color }}>{item.category.label}</span>
                          <span className="circuit-date-lbl">{item.date}</span>
                        </div>
                        <h3 className="circuit-card-title">{item.title}</h3>
                        <p className="circuit-card-desc">{item.summary}</p>
                        {itemImages.length > 0 && (
                          <div className="circuit-card-img-wrap">
                            <img src={itemImages[0]} alt={item.title} className="circuit-card-img" loading="lazy"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'; }} />
                            {itemImages.length > 1 && <span className="gallery-count-badge"><Images size={13} /> {itemImages.length} Photos</span>}
                          </div>
                        )}
                        {itemImages.length > 1 && (
                          <div className="card-mini-gallery-strip">
                            {itemImages.slice(0, 4).map((imgUrl, i) => (
                              <img key={i} src={imgUrl} alt="" className="mini-strip-thumb"
                                onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'; }} />
                            ))}
                          </div>
                        )}
                        <div className="circuit-card-footer">
                          <span className="circuit-location"><MapPin size={14} style={{ color: 'var(--sci-gold)' }} /> {item.location}</span>
                          <button className="circuit-inspect-btn">Explore Gallery <Maximize2 size={14} /></button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* VIEW 2: STAGE SLIDER */}
            {viewMode === 'carousel' && currentStageItem && (
              <div className="slider-view-wrapper">
                <div className="slider-top-nav">
                  <span className="slider-count-lbl">Milestone {carouselIndex + 1} of {filteredData.length}</span>
                  <div className="slider-nav-btns">
                    <button className="slide-arrow-btn" disabled={carouselIndex === 0}
                      onClick={() => { setCarouselIndex((p) => p - 1); setStageActiveImgIndex(0); }}>
                      <ChevronLeft size={20} />
                    </button>
                    <button className="slide-arrow-btn" disabled={carouselIndex === filteredData.length - 1}
                      onClick={() => { setCarouselIndex((p) => p + 1); setStageActiveImgIndex(0); }}>
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={currentStageItem.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.4 }} className="stage-card-body">
                    <div className="stage-img-box">
                      {(() => {
                        const imgs = currentStageItem.images && currentStageItem.images.length > 0 ? currentStageItem.images : [currentStageItem.image || '/assets/timeline/tools_board.jpg'];
                        const activeImg = imgs[stageActiveImgIndex] || imgs[0];
                        return (
                          <>
                            <img src={activeImg} alt={currentStageItem.title} className="stage-img"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'; }} />
                            {imgs.length > 1 && (
                              <div className="stage-photo-picker">
                                {imgs.map((imgUrl, i) => (
                                  <img key={i} src={imgUrl} alt="" className={`stage-picker-thumb ${stageActiveImgIndex === i ? 'active' : ''}`}
                                    onClick={() => setStageActiveImgIndex(i)}
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'; }} />
                                ))}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                    <div className="stage-info-box">
                      <div className="stage-year-pill">{currentStageItem.year}</div>
                      <span className="circuit-cat-badge" style={{ background: currentStageItem.category.bg, color: currentStageItem.category.color, alignSelf: 'flex-start' }}>
                        {currentStageItem.category.label} • {currentStageItem.date}
                      </span>
                      <h2 className="stage-title">{currentStageItem.title}</h2>
                      <p className="stage-desc">{currentStageItem.description}</p>
                      {currentStageItem.highlights && (
                        <div className="stage-highlights-list">
                          {currentStageItem.highlights.map((hl, i) => (
                            <div key={i} className="stage-hl-item">
                              <CheckCircle2 size={16} className="stage-hl-icon" /><span>{hl}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button className="circuit-inspect-btn" style={{ marginTop: '12px', fontSize: '1rem', color: 'var(--sci-gold)' }} onClick={() => openModal(currentStageItem)}>
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
                  const itemImages = item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : [];
                  return (
                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }} className="matrix-card" onClick={() => openModal(item)}>
                      <div>
                        {itemImages.length > 0 && (
                          <div className="matrix-card-img-wrap">
                            <img src={itemImages[0]} alt={item.title} className="matrix-card-img"
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'; }} />
                            {itemImages.length > 1 && <span className="gallery-count-badge"><Images size={12} /> {itemImages.length}</span>}
                          </div>
                        )}
                        <div className="matrix-card-top" style={{ marginTop: '12px' }}>
                          <span className="circuit-cat-badge" style={{ background: item.category.bg, color: item.category.color }}>{item.category.label}</span>
                          <span className="matrix-year-badge">{item.year}</span>
                        </div>
                        <h3 className="matrix-card-title">{item.title}</h3>
                        <p className="matrix-card-text">{item.summary}</p>
                      </div>
                      <div className="circuit-card-footer" style={{ borderTop: '1px solid rgba(255,199,0,0.15)', paddingTop: '10px' }}>
                        <span className="circuit-location"><Calendar size={14} style={{ color: 'var(--sci-gold)' }} /> {item.date}</span>
                        <span className="circuit-inspect-btn">View Gallery <Maximize2 size={14} /></span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {activeModalItem && (
          <div className="modal-backdrop" onClick={() => setActiveModalItem(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.3 }}
              className="modal-content-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setActiveModalItem(null)}><X size={20} /></button>
              <div className="modal-body">
                {(() => {
                  const modalImgs = activeModalItem.images && activeModalItem.images.length > 0 ? activeModalItem.images : activeModalItem.image ? [activeModalItem.image] : [];
                  if (modalImgs.length === 0) return null;
                  const activePhoto = modalImgs[modalActiveImgIndex] || modalImgs[0];
                  return (
                    <div className="modal-gallery-stage">
                      <div className="modal-main-photo-wrap">
                        <img src={activePhoto} alt={activeModalItem.title} className="modal-main-photo"
                          onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'; }} />
                        {modalImgs.length > 1 && (
                          <>
                            <button className="modal-photo-arrow left" disabled={modalActiveImgIndex === 0}
                              onClick={() => setModalActiveImgIndex((p) => Math.max(0, p - 1))}><ChevronLeft size={24} /></button>
                            <button className="modal-photo-arrow right" disabled={modalActiveImgIndex === modalImgs.length - 1}
                              onClick={() => setModalActiveImgIndex((p) => Math.min(modalImgs.length - 1, p + 1))}><ChevronRight size={24} /></button>
                            <span className="modal-photo-counter-badge">Photo {modalActiveImgIndex + 1} of {modalImgs.length}</span>
                          </>
                        )}
                      </div>
                      {modalImgs.length > 1 && (
                        <div className="modal-thumbs-grid">
                          {modalImgs.map((imgUrl, i) => (
                            <img key={i} src={imgUrl} alt="" className={`modal-thumb-item ${modalActiveImgIndex === i ? 'active' : ''}`}
                              onClick={() => setModalActiveImgIndex(i)}
                              onError={(e) => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop'; }} />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div>
                  <span className="circuit-cat-badge" style={{ background: activeModalItem.category.bg, color: activeModalItem.category.color }}>
                    {activeModalItem.category.label} • {activeModalItem.date}
                  </span>
                  <h2 className="modal-title" style={{ marginTop: '10px' }}>{activeModalItem.title}</h2>
                </div>
                <p className="modal-full-desc">{activeModalItem.description}</p>
                {activeModalItem.highlights && (
                  <div>
                    <div className="modal-hl-title">Key Milestone Highlights</div>
                    <div className="stage-highlights-list">
                      {activeModalItem.highlights.map((hl, i) => (
                        <div key={i} className="stage-hl-item"><CheckCircle2 size={16} className="stage-hl-icon" /><span>{hl}</span></div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="circuit-card-footer" style={{ marginTop: '10px', paddingTop: '16px' }}>
                  <span className="circuit-location"><MapPin size={16} style={{ color: 'var(--sci-gold)' }} /> {activeModalItem.location}</span>
                  <span className="circuit-location"><Calendar size={16} style={{ color: 'var(--sci-gold)' }} /> {activeModalItem.year} SCIEnT Archive Entry</span>
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

export default TimelineYear;
