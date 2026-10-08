import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from "../assets/logo_s.png";
import { ChevronDown, Menu, X } from "lucide-react";
import GooeyNav from './GooeyNav';

const FACULTY_CONNECT_URL = 'https://faculty-connect-1.onrender.com/';

// Top-level tabs. Dropdowns list their pages in `children`; `match` adds
// extra paths that count as being in that section.
const NAV_ITEMS = [
    { label: 'Home', href: '/' },
    { label: 'Inventory', href: '/inventory' },
    { label: 'OpenHouse', href: '/openhouse' },
    { label: 'Projects', href: '/clubs' },
    {
        label: 'Initiatives',
        key: 'initiatives',
        children: [
            { label: "Inventive '25", href: '/inventive', match: ['/inventiveForm'] },
            { label: "Contrive '25", href: '/contrive', match: ['/contriveForm'] },
        ],
    },
    { label: 'Faculty Connect', href: FACULTY_CONNECT_URL, external: true },
    {
        label: 'About Us',
        key: 'about',
        children: [
            { label: 'Timeline', href: '/timeline' },
            { label: 'Team', href: '/team' },
            { label: 'Gallery', href: '/gallery' },
        ],
    },
];

const matchesPath = (pathname, { href, match = [] }) => {
    const path = pathname.toLowerCase();
    return [href, ...match].some((p) => {
        const target = p.toLowerCase();
        return target === '/' ? path === '/' : path === target || path.startsWith(`${target}/`);
    });
};

const isItemActive = (pathname, item) =>
    item.children
        ? item.children.some((child) => matchesPath(pathname, child))
        : !item.external && matchesPath(pathname, item);

const dropdownLinkClasses = (index, count) => [
    'block px-4 py-3 lg:py-2 text-white hover:bg-gray-700 hover:text-[#f9c203] whitespace-nowrap no-underline',
    index === 0 ? 'rounded-t-lg' : '',
    index === count - 1 ? 'rounded-b-lg' : '',
].join(' ');

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const closeAll = () => {
        setMenuOpen(false);
        setOpenDropdown(null);
    };

    const toggleDropdown = (key) => setOpenDropdown((current) => (current === key ? null : key));

    // The Navbar persists across routes, so close menus on any navigation
    // (including browser back/forward)
    useEffect(() => {
        setMenuOpen(false);
        setOpenDropdown(null);
    }, [location.pathname]);

    // While the mobile overlay is open: lock page scroll and close on Escape
    useEffect(() => {
        if (!menuOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setMenuOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [menuOpen]);

    const isActive = (path) => location.pathname === path;

    const gooeyActiveIndex = NAV_ITEMS.findIndex((item) => isItemActive(location.pathname, item));

    const handleGooeyClick = (e, item) => {
        // Dropdown tabs only open their menu; the pill moves once a page is chosen
        if (item.hasMenu) {
            toggleDropdown(item.key);
            return false;
        }
        setOpenDropdown(null);
        // External link (new tab) and modifier-clicks: let the browser handle
        // it and keep the pill on the current page
        if (item.target || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return false;
        e.preventDefault();
        if (item.href !== location.pathname) navigate(item.href);
    };

    const renderDropdownLinks = (children) =>
        children.map((child, i) => (
            <Link key={child.href} to={child.href} onClick={closeAll} className={dropdownLinkClasses(i, children.length)}>
                {child.label}
            </Link>
        ));

    const chevron = (key) => (
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === key ? 'rotate-180' : ''}`} />
    );

    const gooeyItems = NAV_ITEMS.map((item) => {
        if (item.children) {
            return {
                label: item.label,
                key: item.key,
                hasMenu: true,
                icon: chevron(item.key),
                expanded: openDropdown === item.key,
                menu: openDropdown === item.key && (
                    <div className="absolute left-0 top-full mt-1 bg-black rounded-lg shadow-lg border border-gray-700 min-w-[160px] z-50 text-center [text-shadow:none]">
                        {renderDropdownLinks(item.children)}
                    </div>
                ),
            };
        }
        return item.external
            ? { label: item.label, href: item.href, target: '_blank', rel: 'noopener noreferrer' }
            : { label: item.label, href: item.href };
    });

    // Tailwind-only nav link with animated underline
    const linkClasses = (path) => {
        const active = isActive(path);
        return [
            'relative inline-flex items-center min-h-[44px] py-2 px-3 font-semibold no-underline transition-colors duration-200',
            "after:content-[''] after:block after:absolute after:bottom-0",
            'after:h-[2px] after:bg-[#f9c203] after:transition-all after:duration-300 after:ease-in-out',
            'hover:after:left-0 hover:after:w-full hover:text-[#91ff00]',
            active
                ? 'text-[#f9c203] font-bold after:left-0 after:w-full'
                : 'text-white after:left-1/2 after:w-0',
        ].join(' ');
    };

    return (
        <nav className="flex items-center justify-between lg:justify-center bg-black w-full py-2 px-4 lg:px-6 relative z-[1000]">
            {/* Logo */}
            <Link to="/" className="mr-4 lg:mr-10 shrink-0 z-[201]" onClick={closeAll}>
                <img className="h-[50px] lg:h-[65px]" src={logo} alt="SCIEnT Logo" />
            </Link>

            {/* Nav links container
                Desktop (>=1024px): always visible, flex-row, static
                Mobile (<1024px), closed: hidden (display:none — no ghost element)
                Mobile (<1024px), open: fixed full-screen overlay */}
            <div
                className={[
                    // Desktop overrides (always visible, inline)
                    'lg:flex lg:flex-row lg:items-center lg:gap-6',
                    'lg:static lg:bg-transparent lg:h-auto lg:w-auto lg:p-0 lg:text-base lg:overflow-visible',
                    // Mobile states
                    menuOpen
                        ? 'flex fixed inset-0 z-40 flex-col items-center justify-start pt-24 gap-6 bg-gradient-to-b from-[#1b1b1b] via-[rgba(27,27,27,0.9)] to-[rgba(27,27,27,0.3)] text-xl overflow-y-auto'
                        : 'hidden',
                ].join(' ')}
            >
                {/* Desktop: every tab uses the gooey effect */}
                <div className="hidden lg:block">
                    <GooeyNav
                        items={gooeyItems}
                        activeIndex={gooeyActiveIndex}
                        onItemClick={handleGooeyClick}
                        particleCount={18}
                        particleDistances={[90, 10]}
                        particleR={300}
                        animationTime={600}
                        timeVariance={500}
                        colors={[1, 2, 3, 1, 2, 3, 1, 4]}
                    />
                </div>

                {/* Mobile overlay menu: plain links and inline dropdowns */}
                <div className="contents lg:hidden">
                    {NAV_ITEMS.map((item) => {
                        if (item.children) {
                            return (
                                <div key={item.key} className="relative">
                                    <button
                                        className="flex items-center gap-1 min-h-[44px] text-white hover:text-[#91ff00] font-semibold px-3 py-2 cursor-pointer bg-transparent border-none"
                                        onClick={() => toggleDropdown(item.key)}
                                        aria-expanded={openDropdown === item.key}
                                    >
                                        {item.label}
                                        {chevron(item.key)}
                                    </button>
                                    {openDropdown === item.key && (
                                        <div className="mt-1 bg-black rounded-lg shadow-lg border border-gray-700 min-w-[160px] z-50 text-center">
                                            {renderDropdownLinks(item.children)}
                                        </div>
                                    )}
                                </div>
                            );
                        }
                        if (item.external) {
                            return (
                                <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer"
                                    onClick={closeAll} className={linkClasses(item.href)}>
                                    {item.label}
                                </a>
                            );
                        }
                        return (
                            <Link key={item.href} to={item.href} onClick={closeAll} className={linkClasses(item.href)}>
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Mobile hamburger — hidden on desktop, visible on mobile */}
            <button
                className="flex lg:hidden items-center justify-center w-11 h-11 shrink-0 z-[201] bg-transparent border-none cursor-pointer"
                onClick={() => setMenuOpen(v => !v)}
                aria-label="Toggle navigation menu"
                aria-expanded={menuOpen}
            >
                {menuOpen
                    ? <X className="text-white w-7 h-7" />
                    : <Menu className="text-white w-7 h-7" />
                }
            </button>
        </nav>
    );
};

export default Navbar;