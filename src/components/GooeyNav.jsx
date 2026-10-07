// GooeyNav from React Bits (https://reactbits.dev), JS + CSS variant.
// Local change: optional `onItemClick(event, item, index)` so callers can
// route client-side instead of following the raw href; returning `false`
// skips the animation (e.g. for a modifier-click that opens a new tab).
// Optional controlled `activeIndex` keeps the highlight in sync with the route;
// -1 means no item is active; when it changes the pill animates to the new item.
// Items may also carry `target`/`rel`, a trailing `icon`, and a `menu` node
// (e.g. a dropdown) rendered inside the <li>; items without `href` render as
// buttons (`hasMenu`/`expanded` set their ARIA popup state).
// The gooey blob uses an SVG alpha-threshold filter instead of the original
// black backdrop + mix-blend-mode, which showed as a black box below the
// navbar (the navbar's own stacking context gives the blend no backdrop).
import { useRef, useEffect, useState, useId } from 'react';
import './GooeyNav.css';

const GooeyNav = ({
  items,
  animationTime = 600,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
  initialActiveIndex = 0,
  activeIndex: controlledActiveIndex,
  onItemClick
}) => {
  const gooFilterId = `gooey-nav-goo-${useId().replace(/:/g, '')}`;
  const containerRef = useRef(null);
  const navRef = useRef(null);
  const filterRef = useRef(null);
  const textRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(controlledActiveIndex ?? initialActiveIndex);

  // Follow external changes (route changes from dropdown links, back/forward)
  useEffect(() => {
    if (controlledActiveIndex === undefined || controlledActiveIndex === activeIndex) return;
    const li = navRef.current?.querySelectorAll(':scope > li')[controlledActiveIndex];
    if (li) animateTo(li, controlledActiveIndex);
    else setActiveIndex(controlledActiveIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledActiveIndex]);

  const noise = (n = 1) => n / 2 - Math.random() * n;

  const getXY = (distance, pointIndex, totalPoints) => {
    const angle = ((360 + noise(8)) / totalPoints) * pointIndex * (Math.PI / 180);
    return [distance * Math.cos(angle), distance * Math.sin(angle)];
  };

  const createParticle = (i, t, d, r) => {
    let rotate = noise(r / 10);
    return {
      start: getXY(d[0], particleCount - i, particleCount),
      end: getXY(d[1] + noise(7), particleCount - i, particleCount),
      time: t,
      scale: 1 + noise(0.2),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotate: rotate > 0 ? (rotate + r / 20) * 10 : (rotate - r / 20) * 10
    };
  };

  const makeParticles = element => {
    const d = particleDistances;
    const r = particleR;
    const bubbleTime = animationTime * 2 + timeVariance;
    element.style.setProperty('--time', `${bubbleTime}ms`);

    for (let i = 0; i < particleCount; i++) {
      const t = animationTime * 2 + noise(timeVariance * 2);
      const p = createParticle(i, t, d, r);
      element.classList.remove('active');

      setTimeout(() => {
        const particle = document.createElement('span');
        const point = document.createElement('span');
        particle.classList.add('particle');
        particle.style.setProperty('--start-x', `${p.start[0]}px`);
        particle.style.setProperty('--start-y', `${p.start[1]}px`);
        particle.style.setProperty('--end-x', `${p.end[0]}px`);
        particle.style.setProperty('--end-y', `${p.end[1]}px`);
        particle.style.setProperty('--time', `${p.time}ms`);
        particle.style.setProperty('--scale', `${p.scale}`);
        particle.style.setProperty('--color', `var(--color-${p.color}, white)`);
        particle.style.setProperty('--rotate', `${p.rotate}deg`);

        point.classList.add('point');
        particle.appendChild(point);
        element.appendChild(particle);
        requestAnimationFrame(() => {
          element.classList.add('active');
        });
        setTimeout(() => {
          try {
            element.removeChild(particle);
          } catch {
            // Do nothing
          }
        }, t);
      }, 30);
    }
  };

  const updateEffectPosition = element => {
    if (!containerRef.current || !filterRef.current || !textRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const pos = element.getBoundingClientRect();

    const styles = {
      left: `${pos.x - containerRect.x}px`,
      top: `${pos.y - containerRect.y}px`,
      width: `${pos.width}px`,
      height: `${pos.height}px`
    };
    Object.assign(filterRef.current.style, styles);
    Object.assign(textRef.current.style, styles);
    // Mirror the trigger itself (label + icon) so the overlay text lines up
    // exactly and ignores any dropdown menu inside the <li>
    const trigger = element.querySelector('.gooey-nav-link');
    if (trigger) {
      const clone = trigger.cloneNode(true);
      clone.setAttribute('tabindex', '-1');
      textRef.current.replaceChildren(clone);
    } else {
      textRef.current.innerText = element.innerText;
    }
  };

  const handleClick = (e, index) => {
    if (onItemClick?.(e, items[index], index) === false) return;
    if (activeIndex === index) return;
    animateTo(e.currentTarget.closest('li'), index);
  };

  const animateTo = (liEl, index) => {
    setActiveIndex(index);
    updateEffectPosition(liEl);

    if (filterRef.current) {
      const particles = filterRef.current.querySelectorAll('.particle');
      particles.forEach(p => filterRef.current.removeChild(p));
    }

    if (textRef.current) {
      textRef.current.classList.remove('active');

      void textRef.current.offsetWidth;
      textRef.current.classList.add('active');
    }

    if (filterRef.current) {
      makeParticles(filterRef.current);
    }
  };

  // Enter already fires click on links and buttons; make Space work on links too
  const handleKeyDown = e => {
    if (e.key === ' ' && e.currentTarget.tagName === 'A') {
      e.preventDefault();
      e.currentTarget.click();
    }
  };

  useEffect(() => {
    if (!navRef.current || !containerRef.current) return;
    const activeLi = navRef.current.querySelectorAll(':scope > li')[activeIndex];
    if (activeLi) {
      updateEffectPosition(activeLi);
      textRef.current?.classList.add('active');
    } else {
      // No active item: hide the pill left over from the previous selection
      textRef.current?.classList.remove('active');
      filterRef.current?.classList.remove('active');
      if (textRef.current) textRef.current.innerText = '';
    }

    const resizeObserver = new ResizeObserver(() => {
      const currentActiveLi = navRef.current?.querySelectorAll(':scope > li')[activeIndex];
      if (currentActiveLi) {
        updateEffectPosition(currentActiveLi);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  return (
    <div className="gooey-nav-container" ref={containerRef}>
      <nav>
        <ul ref={navRef}>
          {items.map((item, index) => (
            <li key={index} className={activeIndex === index ? 'active' : ''}>
              {item.href ? (
                <a
                  className="gooey-nav-link"
                  href={item.href}
                  target={item.target}
                  rel={item.rel}
                  onClick={e => handleClick(e, index)}
                  onKeyDown={handleKeyDown}
                >
                  {item.label}
                  {item.icon}
                </a>
              ) : (
                <button
                  type="button"
                  className="gooey-nav-link"
                  aria-haspopup={item.hasMenu ? 'true' : undefined}
                  aria-expanded={item.hasMenu ? Boolean(item.expanded) : undefined}
                  onClick={e => handleClick(e, index)}
                >
                  {item.label}
                  {item.icon}
                </button>
              )}
              {item.menu}
            </li>
          ))}
        </ul>
      </nav>
      <svg className="gooey-nav-defs" aria-hidden="true" focusable="false">
        <defs>
          <filter id={gooFilterId} x="-100%" y="-300%" width="300%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" />
            <feColorMatrix values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -9" />
          </filter>
        </defs>
      </svg>
      <span className="effect filter" ref={filterRef} style={{ filter: `url(#${gooFilterId})` }} />
      <span className="effect text" ref={textRef} aria-hidden="true" />
    </div>
  );
};

export default GooeyNav;
