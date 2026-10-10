import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowUpRight,
  Calendar,
  Check,
  Clock,
  Compass,
  MapPin,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import {
  GALLERY_ITEMS,
  GalleryItem,
  IMAGES,
  MENU_CATEGORIES,
  MENU_GROUPS,
  MENU_ITEMS,
  MenuGroupId,
  MenuItem,
  SEATING_ZONES,
} from './data/rawaqData';
import { HeroBotanicalBackground, RawaqBrandLogo } from './components/BotanicalLineArt';

gsap.registerPlugin(ScrollTrigger);

/**
 * Resilient Image component with automatic fallback to local curated culinary/interior photography
 */
const ResilientImage: React.FC<{
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
}> = ({ src, fallbackSrc = IMAGES.galleryCoffeeCraft, alt, className = '' }) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const [usedFallback, setUsedFallback] = useState<boolean>(false);
  const [failedAll, setFailedAll] = useState<boolean>(false);

  useEffect(() => {
    setImgSrc(src);
    setUsedFallback(false);
    setFailedAll(false);
  }, [src]);

  if (failedAll) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-b from-[#EAE2D3] to-[#DCD0BC] text-[#5C5349] p-6 text-center ${className}`}
      >
        <span className="font-serif-display italic text-base">{alt}</span>
        <span className="text-[11px] tracking-widest uppercase mt-1 opacity-75">RAWAQ</span>
      </div>
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => {
        if (!usedFallback && fallbackSrc && imgSrc !== fallbackSrc) {
          setUsedFallback(true);
          setImgSrc(fallbackSrc);
        } else {
          setFailedAll(true);
        }
      }}
      className={className}
    />
  );
};

function formatDA(amount: number): string {
  return `${amount.toLocaleString('en-US')} DA`;
}

export default function App() {
  // Menu Filtering State
  const [activeGroup, setActiveGroup] = useState<MenuGroupId>('brunch');
  const [activeSubCategoryId, setActiveSubCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Table Selection / Cart State
  const [tastingSelection, setTastingSelection] = useState<{ item: MenuItem; qty: number }[]>([
    { item: MENU_ITEMS[0], qty: 1 }, // Nest Eggs Benedict (2,400 DA)
    { item: MENU_ITEMS.find((i) => i.id === '6409') || MENU_ITEMS[20], qty: 1 }, // Cappuccino brûlée (600 DA)
  ]);

  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);

  // Gallery Lightbox State
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null);

  // Reservation Modal & Form State
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [reservationDate, setReservationDate] = useState('2026-10-12');
  const [reservationTime, setReservationTime] = useState('10:30');
  const [reservationGuests, setReservationGuests] = useState('2 Guests');
  const [reservationZone, setReservationZone] = useState(SEATING_ZONES[0].id);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [reservationConfirmed, setReservationConfirmed] = useState<{
    code: string;
    name: string;
    date: string;
    time: string;
    guests: string;
    zoneName: string;
  } | null>(null);
  const [formError, setFormError] = useState('');

  // Refs for Snappy GSAP Hero Arch Zoom Transition (Zero scroll-blocking pin!)
  const heroSectionRef = useRef<HTMLDivElement | null>(null);
  const heroLeftColRef = useRef<HTMLDivElement | null>(null);
  const backArchRef = useRef<HTMLDivElement | null>(null);
  const frontArchRef = useRef<HTMLDivElement | null>(null);
  const zoomVeilRef = useRef<HTMLDivElement | null>(null);
  const menuSectionRef = useRef<HTMLElement | null>(null);
  const isAnimatingPortalRef = useRef<boolean>(false);

  // Fast, Non-Blocking GSAP ScrollTrigger on Hero (No pin: true so 1 scroll goes straight to Menu!)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      if (
        !heroSectionRef.current ||
        !frontArchRef.current ||
        !backArchRef.current ||
        !heroLeftColRef.current
      ) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: heroSectionRef.current,
          start: 'top top',
          end: 'bottom 35%',
          scrub: 0.15, // ultra-responsive, zero lag
        },
      });

      tl.to(
        heroLeftColRef.current,
        {
          y: -35,
          opacity: 0.15,
          ease: 'power1.out',
        },
        0
      )
        .to(
          backArchRef.current,
          {
            scale: 0.94,
            opacity: 0.25,
            ease: 'power1.out',
          },
          0
        )
        .to(
          frontArchRef.current,
          {
            xPercent: -22,
            yPercent: 8,
            scale: 1.85,
            ease: 'power1.out',
          },
          0
        );
    }, heroSectionRef);

    return () => ctx.revert();
  }, []);

  // Fast 0.6s Portal Zoom when clicking "Explore the menu", clicking the Arch, or pressing Enter
  const triggerExploreMenuZoom = () => {
    if (isAnimatingPortalRef.current) return;
    isAnimatingPortalRef.current = true;

    const menuEl = menuSectionRef.current;
    if (!menuEl) {
      isAnimatingPortalRef.current = false;
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetY = menuEl.getBoundingClientRect().top + window.scrollY - 68;

    if (prefersReducedMotion || !frontArchRef.current || !zoomVeilRef.current) {
      window.scrollTo({ top: targetY, behavior: 'smooth' });
      isAnimatingPortalRef.current = false;
      return;
    }

    const startY = window.scrollY;
    const scrollProxy = { y: startY };

    // Simultaneous 0.6s arch expansion + smooth direct scroll to Menu
    const portalTl = gsap.timeline({
      onComplete: () => {
        gsap.set(zoomVeilRef.current, { opacity: 0 });
        gsap.set(frontArchRef.current, { clearProps: 'transform' });
        isAnimatingPortalRef.current = false;
      },
    });

    portalTl
      .to(
        frontArchRef.current,
        {
          scale: 2.4,
          xPercent: -28,
          duration: 0.55,
          ease: 'power2.inOut',
        },
        0
      )
      .to(
        zoomVeilRef.current,
        {
          opacity: 0.85,
          duration: 0.35,
          ease: 'power1.in',
        },
        0.2
      )
      .to(
        scrollProxy,
        {
          y: targetY,
          duration: 0.6,
          ease: 'power2.inOut',
          onUpdate: () => {
            window.scrollTo(0, scrollProxy.y);
          },
        },
        0.05
      );
  };

  // Single mouse-wheel flick from top of Hero smoothly glides straight into Menu without double-scrolling
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (
        window.scrollY < 25 &&
        e.deltaY > 18 &&
        !isAnimatingPortalRef.current &&
        !isReserveModalOpen &&
        !selectedProduct &&
        !selectedGalleryItem
      ) {
        e.preventDefault();
        triggerExploreMenuZoom();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, [isReserveModalOpen, selectedProduct, selectedGalleryItem]);

  // Keyboard listener: pressing Enter in Hero triggers fast zoom to Menu; Escape closes modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName.toLowerCase();
      const isInputFocused =
        activeTag === 'input' ||
        activeTag === 'textarea' ||
        activeTag === 'select' ||
        activeTag === 'button';

      if (
        e.key === 'Enter' &&
        !isInputFocused &&
        !isReserveModalOpen &&
        !selectedGalleryItem &&
        !selectedProduct
      ) {
        if (window.scrollY < window.innerHeight * 0.4) {
          e.preventDefault();
          triggerExploreMenuZoom();
        }
      }
      if (e.key === 'Escape') {
        setIsReserveModalOpen(false);
        setSelectedGalleryItem(null);
        setSelectedProduct(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isReserveModalOpen, selectedGalleryItem, selectedProduct]);

  // Subcategories for active group
  const visibleSubCategories =
    activeGroup === 'all'
      ? MENU_CATEGORIES
      : MENU_CATEGORIES.filter((cat) => cat.group === activeGroup);

  const currentGroupMeta = MENU_GROUPS.find((g) => g.id === activeGroup) || MENU_GROUPS[0];

  // Filtered Menu Items
  const filteredMenuItems = MENU_ITEMS.filter((item) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(searchQuery.toLowerCase());

    if (searchQuery.trim() !== '') {
      return matchesSearch;
    }

    const matchesGroup = activeGroup === 'all' || item.group === activeGroup;
    const matchesSubCat =
      activeSubCategoryId === 'ALL' || item.categoryId === activeSubCategoryId;

    return matchesGroup && matchesSubCat;
  });

  // Cart / Table Selection helpers
  const getItemQty = (itemId: string): number => {
    return tastingSelection.find((entry) => entry.item.id === itemId)?.qty || 0;
  };

  const addOrIncrementItem = (item: MenuItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setTastingSelection((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id ? { ...entry, qty: entry.qty + 1 } : entry
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const removeItemFromSelection = (itemId: string) => {
    setTastingSelection((prev) => prev.filter((entry) => entry.item.id !== itemId));
  };

  const totalSelectionCount = tastingSelection.reduce((sum, entry) => sum + entry.qty, 0);
  const totalSelectionDA = tastingSelection.reduce(
    (sum, entry) => sum + entry.item.priceValue * entry.qty,
    0
  );

  const handleReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestContact.trim()) {
      setFormError('Veuillez renseigner votre nom et votre numéro de téléphone ou e-mail.');
      return;
    }
    setFormError('');
    const zoneObj = SEATING_ZONES.find((z) => z.id === reservationZone) || SEATING_ZONES[0];
    const randomCode = `RWQ-${Math.floor(1000 + Math.random() * 9000)}`;
    setReservationConfirmed({
      code: randomCode,
      name: guestName.trim(),
      date: reservationDate,
      time: reservationTime,
      guests: reservationGuests,
      zoneName: zoneObj.name,
    });
  };

  return (
    <div className="min-h-screen bg-[#F7F3EB] text-[#26221E] relative overflow-x-hidden">
      {/* =====================================================================
          TOP NAVIGATION BAR (Strict 3-Zone Top Bar Contract)
      ===================================================================== */}
      <header className="sticky top-0 z-40 bg-[#F7F3EB]/90 backdrop-blur-md border-b border-[#26221E]/[0.06]">
        <div className="max-w-[1360px] mx-auto px-6 md:px-12 py-2 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand Wordmark Lockup */}
          <a
            href="#top"
            aria-label="RAWAQ Home"
            className="whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#B86343]"
          >
            <RawaqBrandLogo size="header" />
          </a>

          {/* Zone 2: 4 Clean Single-Line Navigation Links */}
          <nav className="hidden md:flex items-center gap-10 text-[15px] font-normal text-[#26221E]">
            <a
              href="#menu"
              onClick={(e) => {
                if (window.scrollY < 60) {
                  e.preventDefault();
                  triggerExploreMenuZoom();
                }
              }}
              className="hover:text-[#B86343] transition-colors whitespace-nowrap shrink-0 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1px] after:bg-[#B86343] hover:after:w-full after:transition-all"
            >
              Menu
            </a>
            <a
              href="#about"
              className="hover:text-[#B86343] transition-colors whitespace-nowrap shrink-0 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1px] after:bg-[#B86343] hover:after:w-full after:transition-all"
            >
              About
            </a>
            <a
              href="#gallery"
              className="hover:text-[#B86343] transition-colors whitespace-nowrap shrink-0 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1px] after:bg-[#B86343] hover:after:w-full after:transition-all"
            >
              Gallery
            </a>
            <a
              href="#contact"
              className="hover:text-[#B86343] transition-colors whitespace-nowrap shrink-0 relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-[1px] after:bg-[#B86343] hover:after:w-full after:transition-all"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: 1 Primary Action Button (Outline CTA "Reserve" matching reference) */}
          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(true)}
              className="px-6 py-2 rounded-full border border-[#B86343] text-[#B86343] text-[14px] font-medium hover:bg-[#B86343] hover:text-[#F9F6F0] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Reserve
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          1. HERO LANDING PAGE (Fast Single-Scroll / Click Arch Zoom Transition)
      ===================================================================== */}
      <div id="top" ref={heroSectionRef} className="relative w-full overflow-hidden">
        {/* Subtle Botanical & Double-Arch Line Art Background */}
        <HeroBotanicalBackground />

        {/* Warm Cream Dissolve Veil for Seamless Portal Transition into Menu */}
        <div
          ref={zoomVeilRef}
          className="pointer-events-none absolute inset-0 z-30 bg-[#F7F3EB] opacity-0"
          aria-hidden="true"
        />

        <section className="relative z-10 max-w-[1360px] mx-auto px-6 md:px-12 pt-6 pb-10 lg:py-10 min-h-[calc(100vh-76px)] flex flex-col justify-between">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-6 items-center my-auto">
            {/* Left Column Content */}
            <div
              ref={heroLeftColRef}
              className="lg:col-span-5 flex flex-col items-start justify-center pt-4 lg:pt-0 z-20"
            >
              <h1
                className="font-serif-display text-[#231F1C] font-normal tracking-[-0.015em] leading-[1.08] mb-6"
                style={{
                  fontSize: 'clamp(2.65rem, 4.6vw, 4.35rem)',
                  textWrap: 'balance',
                }}
              >
                Where every cup feels like home
              </h1>

              <p className="text-[#4A433C] text-[16px] md:text-[17px] leading-[1.62] max-w-[430px] mb-9 font-normal">
                Discover the art of slow living, exquisite coffee, and soulful gatherings at RAWAQ.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={triggerExploreMenuZoom}
                  className="px-8 py-3.5 rounded-full bg-[#B86343] hover:bg-[#A15133] text-[#F9F6F0] text-[15px] font-medium shadow-[0_10px_24px_-8px_rgba(184,99,67,0.45)] transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0"
                >
                  Explore the menu
                </button>
              </div>
            </div>

            {/* Right Column Content: Two Overlapping Arch-Framed Interior Images */}
            <div className="lg:col-span-7 relative flex items-end justify-center lg:justify-end min-h-[450px] sm:min-h-[530px] lg:min-h-[590px]">
              {/* Back / Left Larger Arch Image (Coffee Bar & Stone Pendant Lamp) */}
              <div
                ref={backArchRef}
                className="relative w-[62%] sm:w-[55%] lg:w-[400px] h-[380px] sm:h-[460px] lg:h-[515px] arch-frame overflow-hidden shadow-[0_24px_48px_-12px_rgba(38,34,30,0.18)] mr-auto lg:mr-[195px] mb-6 z-10 bg-[#EAE2D3]"
              >
                <ResilientImage
                  src={IMAGES.heroBarArch}
                  alt="RAWAQ curved travertine coffee bar and artisanal ceramic shelves"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Front / Right Overlapping Arch Image (Sunlit Dining Nook — Fast Portal Zoom Target) */}
              <div
                ref={frontArchRef}
                onClick={triggerExploreMenuZoom}
                title="Click to enter the RAWAQ Menu"
                className="absolute right-0 sm:right-4 lg:right-2 bottom-0 w-[50%] sm:w-[44%] lg:w-[300px] h-[290px] sm:h-[350px] lg:h-[395px] arch-frame overflow-hidden shadow-[0_28px_56px_-12px_rgba(38,34,30,0.26)] z-20 cursor-pointer group bg-[#E3D9C6] will-change-transform origin-center"
              >
                <ResilientImage
                  src={IMAGES.heroDiningArch}
                  alt="RAWAQ sunlit dining alcove with recessed illuminated arches and bouclé chairs"
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-end justify-center p-4">
                  <span className="text-xs tracking-wider text-[#F9F6F0] font-medium">
                    Enter Menu →
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom-Left Subtle Scroll Indicator matching reference ("Scroll" + vertical line) */}
          <div className="hidden sm:flex flex-col items-start gap-2 pt-2">
            <button
              type="button"
              onClick={triggerExploreMenuZoom}
              className="text-left group cursor-pointer focus-visible:outline-none"
            >
              <span className="block text-[14px] text-[#4A433C] group-hover:text-[#B86343] transition-colors">
                Scroll
              </span>
              <span className="block w-[1px] h-14 bg-[#8C8275] ml-3.5 mt-2 group-hover:bg-[#B86343] transition-colors" />
            </button>
          </div>
        </section>
      </div>

      {/* =====================================================================
          2. INTERACTIVE MENU SECTION (Authentic RAWAQ Menu with Product Photos & DA Prices)
      ===================================================================== */}
      <section
        id="menu"
        ref={menuSectionRef}
        className="relative z-20 py-16 lg:py-24 px-6 md:px-12 max-w-[1360px] mx-auto border-t border-[#26221E]/[0.08]"
      >
        {/* Section Header + Search Input */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8C7A6B] mb-2.5">
              01. La Carte RAWAQ · Oran
            </p>
            <h2
              className="font-serif-display text-[#231F1C] font-normal tracking-tight"
              style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)', textWrap: 'balance' }}
            >
              Brunch, Specialty Coffee, Pâtisseries & Plats
            </h2>
          </div>

          {/* Instant Search Input */}
          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un plat, café, brunch..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#EFE9DD] border border-[#26221E]/[0.08] text-sm text-[#231F1C] placeholder:text-[#7E7367] focus:outline-none focus:border-[#B86343] transition-colors"
            />
          </div>
        </div>

        {/* Primary Menu Group Tabs (No "Dinner" — Authentic RAWAQ Categories) */}
        <div
          role="tablist"
          aria-label="Catégories principales du menu"
          className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-[#26221E]/[0.08]"
        >
          {MENU_GROUPS.map((group) => {
            const isSelected = activeGroup === group.id && searchQuery.trim() === '';
            return (
              <button
                key={group.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveGroup(group.id);
                  setActiveSubCategoryId('ALL');
                }}
                className={`px-5 py-2.5 rounded-full text-[13.5px] font-medium transition-all duration-150 whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-[#B86343] text-[#F9F6F0] shadow-sm'
                    : 'bg-[#EFE9DD]/80 text-[#5A524A] hover:bg-[#E5DEC9] hover:text-[#231F1C]'
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        {/* Visual Sub-Category Filter Strip (with official category thumbnails from RAWAQ TableBeep) */}
        {searchQuery.trim() === '' && (
          <div className="mb-10">
            <div className="flex items-center justify-between gap-4 mb-4">
              <p className="text-sm text-[#4A433C]">{currentGroupMeta.subtitle}</p>
              <span className="text-xs text-[#7E7367] tabular-nums shrink-0">
                {filteredMenuItems.length} spécialités
              </span>
            </div>

            <div className="flex items-center gap-2.5 overflow-x-auto pb-2">
              <button
                type="button"
                onClick={() => setActiveSubCategoryId('ALL')}
                className={`px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                  activeSubCategoryId === 'ALL'
                    ? 'bg-[#26221E] text-[#F7F3EB] border-[#26221E]'
                    : 'bg-[#FAF7F2] text-[#5A524A] border-[#26221E]/[0.08] hover:border-[#B86343]/50'
                }`}
              >
                Tout voir ({activeGroup === 'all' ? MENU_ITEMS.length : filteredMenuItems.length})
              </button>

              {visibleSubCategories.map((subCat) => {
                const isSubActive = activeSubCategoryId === subCat.id;
                return (
                  <button
                    key={subCat.id}
                    type="button"
                    onClick={() => setActiveSubCategoryId(subCat.id)}
                    className={`inline-flex items-center gap-2.5 pr-4 pl-1.5 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap shrink-0 cursor-pointer border ${
                      isSubActive
                        ? 'bg-[#26221E] text-[#F7F3EB] border-[#26221E]'
                        : 'bg-[#FAF7F2] text-[#231F1C] border-[#26221E]/[0.08] hover:border-[#B86343]/50'
                    }`}
                  >
                    <span className="w-7 h-7 rounded-lg overflow-hidden bg-[#E5DEC9] shrink-0">
                      <ResilientImage
                        src={subCat.categoryImage}
                        fallbackSrc={IMAGES.galleryCoffeeCraft}
                        alt={subCat.name}
                        className="w-full h-full object-cover"
                      />
                    </span>
                    <span>{subCat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Menu Layout: 9-Col Product Card Grid (with Images & DA Prices) + 3-Col Sticky Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left 8 Columns: Product Cards Grid with Photographs */}
          <div className="lg:col-span-8">
            {filteredMenuItems.length === 0 ? (
              <div className="bg-[#FAF7F2] rounded-2xl p-12 text-center border border-[#26221E]/[0.08]">
                <p className="font-serif-display text-xl text-[#231F1C] mb-2">
                  Aucun article trouvé pour « {searchQuery} »
                </p>
                <p className="text-xs text-[#7E7367] mb-5">
                  Essayez un autre mot-clé ou parcourez nos catégories ci-dessus.
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2 rounded-full bg-[#B86343] text-[#F9F6F0] text-xs font-medium cursor-pointer"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredMenuItems.map((item) => {
                  const qty = getItemQty(item.id);
                  return (
                    <article
                      key={item.id}
                      onClick={() => setSelectedProduct(item)}
                      className="group bg-[#FAF7F2] rounded-2xl overflow-hidden border border-[#26221E]/[0.07] hover:border-[#B86343]/40 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_8px_24px_-12px_rgba(38,34,30,0.08)] flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        {/* Product Image Container (65-70% visual lead) */}
                        <div className="relative w-full aspect-[4/3] bg-[#EAE2D3] overflow-hidden">
                          <ResilientImage
                            src={item.image}
                            fallbackSrc={item.fallbackImage}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />

                          {/* Quick Add Button on Image Corner */}
                          <button
                            type="button"
                            onClick={(e) => addOrIncrementItem(item, e)}
                            aria-label={`Ajouter ${item.name}`}
                            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                              qty > 0
                                ? 'bg-[#B86343] text-[#F9F6F0]'
                                : 'bg-[#FAF7F2]/95 text-[#231F1C] hover:bg-[#B86343] hover:text-[#F9F6F0]'
                            }`}
                          >
                            {qty > 0 ? (
                              <span className="text-xs font-semibold tabular-nums">{qty}</span>
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Card Details */}
                        <div className="p-4">
                          {/* Unboxed Metadata Kicker (Zero-Pill Discipline) */}
                          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#8C7A6B] mb-1">
                            <span>{item.categoryName}</span>
                            {item.tag && (
                              <>
                                <span aria-hidden="true">·</span>
                                <span className="text-[#B86343] font-medium">{item.tag}</span>
                              </>
                            )}
                          </div>

                          <h3 className="font-serif-display text-[18px] text-[#231F1C] group-hover:text-[#B86343] transition-colors leading-snug mb-1.5">
                            {item.name}
                          </h3>

                          <p className="text-xs text-[#5A524A] line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      {/* Price Baseline in DA & Action */}
                      <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-[#26221E]/[0.05]">
                        <span className="text-[15px] font-semibold text-[#231F1C] tabular-nums">
                          {item.price}
                        </span>
                        <span className="text-xs font-medium text-[#B86343] group-hover:underline">
                          {qty > 0 ? 'Ajouter +1' : 'Détails & Ajouter'}
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right 4 Columns: Interactive Table Selection / Order Tray in DA */}
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-[#FAF7F2] rounded-2xl p-6 border border-[#26221E]/[0.08] shadow-[0_12px_32px_-12px_rgba(38,34,30,0.08)]">
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#26221E]/[0.08]">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-4 h-4 text-[#B86343]" />
                  <div>
                    <h3 className="font-serif-display text-lg text-[#231F1C]">
                      Votre Sélection RAWAQ
                    </h3>
                    <p className="text-xs text-[#7E7367]">
                      Préparez votre commande sur place ou réservation
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#B86343] tabular-nums">
                  {totalSelectionCount} {totalSelectionCount > 1 ? 'articles' : 'article'}
                </span>
              </div>

              {tastingSelection.length === 0 ? (
                <p className="text-xs text-[#7E7367] py-6 text-center">
                  Cliquez sur le bouton <strong>+</strong> d’un plat ou d’un café pour composer
                  votre table.
                </p>
              ) : (
                <ul className="divide-y divide-[#26221E]/[0.06] max-h-72 overflow-y-auto mb-4 pr-1">
                  {tastingSelection.map(({ item, qty }) => (
                    <li
                      key={item.id}
                      className="py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#EAE2D3] shrink-0">
                          <ResilientImage
                            src={item.image}
                            fallbackSrc={item.fallbackImage}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[#231F1C] font-medium truncate">{item.name}</p>
                          <p className="text-[#7E7367] tabular-nums">
                            {qty} × {item.price}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-semibold text-[#231F1C] tabular-nums">
                          {formatDA(item.priceValue * qty)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItemFromSelection(item.id)}
                          aria-label={`Retirer ${item.name}`}
                          className="text-[#8C7A6B] hover:text-[#B86343] transition-colors p-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-4 border-t border-[#26221E]/[0.08] flex items-center justify-between text-base font-semibold text-[#231F1C] mb-5">
                <span>Total estimé</span>
                <span className="tabular-nums text-[#B86343]">{formatDA(totalSelectionDA)}</span>
              </div>

              <button
                type="button"
                onClick={() => setIsReserveModalOpen(true)}
                className="w-full py-3.5 px-5 rounded-full bg-[#B86343] hover:bg-[#A15133] text-[#F9F6F0] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                Réserver une Table avec cette Sélection
              </button>
            </div>

            {/* Arched Ambiance Note */}
            <div className="bg-[#EFE9DD]/75 rounded-2xl p-5 border border-[#26221E]/[0.06] flex items-center gap-4">
              <div className="w-16 h-20 arch-frame overflow-hidden shrink-0 bg-[#E3D9C6]">
                <ResilientImage
                  src={IMAGES.heroBarArch}
                  alt="RAWAQ Barista"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="text-xs font-medium text-[#231F1C] mb-1">
                  Gâteaux entiers & Commandes
                </p>
                <p className="text-[11px] text-[#5A524A] leading-relaxed">
                  Nos pâtisseries (Gâteau Russe, Opéra, Red Velvet) sont disponibles sur place, à la
                  part à emporter ou en gâteau entier sur commande.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* =====================================================================
          3. OUR STORY / ABOUT US SECTION (Editorial Architecture & Slow Living)
      ===================================================================== */}
      <section
        id="about"
        className="py-20 lg:py-28 bg-[#EFE9DD]/55 border-y border-[#26221E]/[0.06]"
      >
        <div className="max-w-[1360px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            {/* Left 5 Columns: Arched Sanctuary Photograph */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-[420px] h-[510px] arch-frame overflow-hidden shadow-[0_24px_48px_-12px_rgba(38,34,30,0.16)] bg-[#E3D9C6]">
                <ResilientImage
                  src={IMAGES.storyRoastingAmbiance}
                  alt="Sun-drenched limewash archway with terracotta olive vessel inside RAWAQ"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Right 7 Columns: Editorial Narrative */}
            <div className="lg:col-span-7">
              <p className="text-xs uppercase tracking-[0.2em] text-[#8C7A6B] mb-3">
                02. Our Story · رواق
              </p>
              <h2
                className="font-serif-display text-[#231F1C] font-normal leading-[1.14] mb-6"
                style={{ fontSize: 'clamp(2rem, 3.3vw, 3.1rem)', textWrap: 'balance' }}
              >
                Named after the timeless arched colonnade where light, shelter, and conversation converge
              </h2>

              <div className="space-y-5 text-[#4A433C] text-[16px] leading-[1.7] max-w-[64ch]">
                <p>
                  In classical Arabic architecture, a <em className="font-serif-display">Rawaq</em>{' '}
                  (رواق) is the serene arched portico that bridges the open courtyard and the inner
                  sanctuary—a threshold shaded from the midday sun where friends, families, and
                  travelers pause to share specialty coffee and unhurried dialogue.
                </p>
                <p>
                  At RAWAQ, every curve of our hand-troweled limewash walls, travertine counters,
                  and recessed ceramic arches is crafted to quiet the rush of the city outside.
                  From morning Eggs Benedict, French Toast Tiramisu, and V60 pour-overs to savoury
                  burrata pastas and signature mocktails, our table is an invitation to linger.
                </p>
              </div>

              {/* 3 Editorial Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-10 mt-10 border-t border-[#26221E]/[0.1]">
                <div>
                  <span className="font-serif-display text-2xl text-[#B86343] tabular-nums block mb-1">
                    01. Specialty Coffee
                  </span>
                  <p className="text-xs text-[#5A524A] leading-relaxed">
                    Precision V60 extractions, Cappuccino Brûlée, Pistachio Dalgona, and ceremonial
                    Iced Matcha prepared by our baristas.
                  </p>
                </div>
                <div>
                  <span className="font-serif-display text-2xl text-[#B86343] tabular-nums block mb-1">
                    02. Brunch & Plats
                  </span>
                  <p className="text-xs text-[#5A524A] leading-relaxed">
                    Generous savory and sweet brunches, smoked salmon & burrata toasts, creamy
                    risottos, and fresh artisanal pastas.
                  </p>
                </div>
                <div>
                  <span className="font-serif-display text-2xl text-[#B86343] tabular-nums block mb-1">
                    03. Warm Sanctuary
                  </span>
                  <p className="text-xs text-[#5A524A] leading-relaxed">
                    Custom stoneware, raw travertine tables, and warm acoustic plaster designed for
                    soulful gatherings in Oran.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          4. AESTHETIC GALLERY SECTION (Arched & Rounded Photo Cards)
      ===================================================================== */}
      <section id="gallery" className="py-20 lg:py-28 px-6 md:px-12 max-w-[1360px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[#8C7A6B] mb-3">
              03. Visual Journal & Spaces
            </p>
            <h2
              className="font-serif-display text-[#231F1C] font-normal"
              style={{ fontSize: 'clamp(2rem, 3.2vw, 3rem)', textWrap: 'balance' }}
            >
              Light, texture, and the ritual of gathering
            </h2>
          </div>
          <p className="text-sm text-[#5A524A] max-w-md">
            Explore our architectural arches, morning espresso pours, and sunlit tables. Select any
            frame to inspect the space in detail.
          </p>
        </div>

        {/* Curated 3-Column Architectural & Culinary Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {GALLERY_ITEMS.map((card, index) => {
            const isArch = card.archShape === 'arch';
            return (
              <div
                key={card.id}
                onClick={() => setSelectedGalleryItem(card)}
                className={`group cursor-pointer flex flex-col ${
                  index === 1 ? 'lg:mt-10' : index === 3 ? 'lg:-mt-6' : ''
                }`}
              >
                <div
                  className={`w-full overflow-hidden bg-[#E5DEC9] shadow-[0_18px_38px_-14px_rgba(38,34,30,0.15)] mb-4 ${
                    isArch ? 'arch-frame h-[400px]' : 'rounded-2xl h-[320px]'
                  }`}
                >
                  <ResilientImage
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-[#8C7A6B] mb-1">
                  <span>{card.category}</span>
                  <span className="inline-flex items-center gap-1 text-[#B86343] opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Inspect</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
                <h3 className="font-serif-display text-xl text-[#231F1C] group-hover:text-[#B86343] transition-colors mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-[#5A524A] leading-relaxed">{card.caption}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* =====================================================================
          5. CONTACT, HOURS & ARCHITECTURAL LOCATION SECTION
      ===================================================================== */}
      <footer
        id="contact"
        className="bg-[#EFE9DD] border-t border-[#26221E]/[0.08] pt-20 pb-14 px-6 md:px-12"
      >
        <div className="max-w-[1360px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-16 border-b border-[#26221E]/[0.08]">
            {/* Brand & Philosophy Column */}
            <div className="lg:col-span-4 flex flex-col items-start justify-between">
              <div>
                <RawaqBrandLogo size="footer" />
                <p className="text-sm text-[#4A433C] leading-relaxed mt-3 max-w-sm">
                  Where every cup feels like home. Specialty coffee, generous brunch, artisanal
                  pâtisseries, and savoury dishes beneath warm limestone arches in Oran.
                </p>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setIsReserveModalOpen(true)}
                  className="px-7 py-3 rounded-full bg-[#B86343] hover:bg-[#A15133] text-[#F9F6F0] text-sm font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Reserve a Table
                </button>
              </div>
            </div>

            {/* Opening Hours & Address Column */}
            <div className="lg:col-span-4 space-y-6">
              <div>
                <h3 className="font-serif-display text-xl text-[#231F1C] mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#B86343]" />
                  <span>Horaires d’Ouverture</span>
                </h3>
                <dl className="space-y-2 text-sm text-[#4A433C] tabular-nums">
                  <div className="flex justify-between py-1 border-b border-[#26221E]/[0.06]">
                    <dt>Samedi – Jeudi</dt>
                    <dd className="font-medium text-[#231F1C]">08:00 – 23:00</dd>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[#26221E]/[0.06]">
                    <dt>Vendredi</dt>
                    <dd className="font-medium text-[#231F1C]">08:30 – 23:30</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt>Service Brunch & Café</dt>
                    <dd className="font-medium text-[#231F1C]">Continu toute la journée</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h3 className="font-serif-display text-xl text-[#231F1C] mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#B86343]" />
                  <span>Adresse & Localisation</span>
                </h3>
                <p className="text-sm text-[#4A433C] leading-relaxed">
                  RAWAQ (رواق) · Oran (31), Algérie
                </p>
                <a
                  href="https://maps.app.goo.gl/ECUHKh6PCyy46ouE7?g_st=ac"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#B86343] hover:underline mt-1.5"
                >
                  <span>Ouvrir dans Google Maps</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Interactive Architectural Courtyard Map & Social Links */}
            <div className="lg:col-span-4">
              <div className="bg-[#F7F3EB] rounded-2xl p-5 border border-[#26221E]/[0.08] h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#7E7367] mb-3">
                    <span className="inline-flex items-center gap-1.5 font-medium text-[#231F1C]">
                      <Compass className="w-3.5 h-3.5 text-[#B86343]" />
                      Plan des Espaces RAWAQ
                    </span>
                    <span className="tabular-nums">Oran · 31</span>
                  </div>

                  {/* Stylized Architectural Blueprint SVG Map */}
                  <div className="relative w-full h-44 rounded-xl bg-[#EAE2D3]/70 border border-[#26221E]/[0.07] overflow-hidden p-3 flex flex-col justify-between">
                    <svg
                      viewBox="0 0 320 140"
                      className="absolute inset-0 w-full h-full opacity-60"
                      fill="none"
                    >
                      <rect
                        x="14"
                        y="14"
                        width="292"
                        height="112"
                        rx="8"
                        stroke="#8C7A6B"
                        strokeWidth="1"
                        strokeDasharray="3 3"
                      />
                      <path
                        d="M 110 14 L 110 126 M 215 14 L 215 126"
                        stroke="#8C7A6B"
                        strokeWidth="0.8"
                      />
                      <circle cx="62" cy="70" r="24" stroke="#B86343" strokeWidth="1.2" />
                      <circle cx="162" cy="70" r="28" stroke="#B86343" strokeWidth="1.5" />
                      <circle cx="162" cy="70" r="4" fill="#B86343" />
                      <rect
                        x="238"
                        y="42"
                        width="46"
                        height="56"
                        rx="23"
                        stroke="#8C7A6B"
                        strokeWidth="1.2"
                      />
                    </svg>
                    <div className="relative z-10 flex justify-between text-[11px] text-[#5A524A]">
                      <span>Sunlit Alcove</span>
                      <span className="font-medium text-[#B86343]">● RAWAQ Arch Hall</span>
                      <span>Espresso Bar</span>
                    </div>
                    <div className="relative z-10 flex items-center justify-between pt-2 border-t border-[#26221E]/[0.06] text-[11px] text-[#5A524A]">
                      <a
                        href="https://maps.app.goo.gl/ECUHKh6PCyy46ouE7?g_st=ac"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-[#231F1C] underline"
                      >
                        Itinéraire Google Maps
                      </a>
                      <button
                        type="button"
                        onClick={() => setIsReserveModalOpen(true)}
                        className="text-[#B86343] font-medium hover:underline cursor-pointer"
                      >
                        Choisir une table →
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#5A524A] pt-4 mt-4 border-t border-[#26221E]/[0.06]">
                  <span>Réseaux Officiels</span>
                  <div className="flex items-center gap-3 font-medium text-[#231F1C]">
                    <a
                      href="https://www.instagram.com/rawaq.31"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#B86343] transition-colors"
                    >
                      Instagram (@rawaq.31)
                    </a>
                    <span>·</span>
                    <a
                      href="https://www.tiktok.com/@rawaq31"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#B86343] transition-colors"
                    >
                      TikTok
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quiet Footer Copyright */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7E7367]">
            <p>© {new Date().getFullYear()} RAWAQ (رواق) Specialty Coffee & Brunch. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#top" className="hover:text-[#231F1C] transition-colors">
                Haut de page ↑
              </a>
              <span>·</span>
              <a href="#menu" className="hover:text-[#231F1C] transition-colors">
                La Carte (DA)
              </a>
              <span>·</span>
              <button
                type="button"
                onClick={() => setIsReserveModalOpen(true)}
                className="hover:text-[#231F1C] transition-colors cursor-pointer"
              >
                Réserver une Table
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* =====================================================================
          PRODUCT DETAIL MODAL (Inspect Dish/Drink Photo, Description & Add to Selection)
      ===================================================================== */}
      {selectedProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedProduct.name}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="bg-[#F7F3EB] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-[#26221E]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-72 sm:h-80 w-full bg-[#E5DEC9]">
              <ResilientImage
                src={selectedProduct.image}
                fallbackSrc={selectedProduct.fallbackImage}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                aria-label="Fermer"
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#231F1C]/80 text-[#F7F3EB] flex items-center justify-center hover:bg-[#B86343] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#8C7A6B] mb-1">
                <span>{selectedProduct.categoryName}</span>
                {selectedProduct.tag && (
                  <>
                    <span>·</span>
                    <span className="text-[#B86343] font-medium">{selectedProduct.tag}</span>
                  </>
                )}
              </div>

              <div className="flex items-baseline justify-between gap-4 mb-3">
                <h3 className="font-serif-display text-2xl text-[#231F1C]">
                  {selectedProduct.name}
                </h3>
                <span className="text-lg font-semibold text-[#B86343] tabular-nums shrink-0">
                  {selectedProduct.price}
                </span>
              </div>

              <p className="text-sm text-[#5A524A] leading-relaxed mb-6">
                {selectedProduct.description}
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#26221E]/[0.08]">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="px-5 py-2.5 rounded-full text-xs font-medium text-[#5A524A] hover:text-[#231F1C] cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addOrIncrementItem(selectedProduct);
                    setSelectedProduct(null);
                  }}
                  className="px-6 py-2.5 rounded-full bg-[#B86343] hover:bg-[#A15133] text-[#F9F6F0] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  Ajouter à ma sélection ({selectedProduct.price})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          GALLERY LIGHTBOX MODAL
      ===================================================================== */}
      {selectedGalleryItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedGalleryItem.title}
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedGalleryItem(null)}
        >
          <div
            className="bg-[#F7F3EB] rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-[#26221E]/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-[360px] sm:h-[460px] w-full bg-[#E5DEC9]">
              <ResilientImage
                src={selectedGalleryItem.image}
                alt={selectedGalleryItem.title}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setSelectedGalleryItem(null)}
                aria-label="Close gallery preview"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-[#231F1C]/80 text-[#F7F3EB] flex items-center justify-center hover:bg-[#B86343] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-[#8C7A6B] mb-1">{selectedGalleryItem.category}</p>
                <h3 className="font-serif-display text-2xl text-[#231F1C] mb-1">
                  {selectedGalleryItem.title}
                </h3>
                <p className="text-sm text-[#5A524A]">{selectedGalleryItem.caption}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedGalleryItem(null);
                  setIsReserveModalOpen(true);
                }}
                className="px-5 py-2.5 rounded-full bg-[#B86343] text-[#F9F6F0] text-xs font-medium hover:bg-[#A15133] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Reserve This Space
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          INTERACTIVE TABLE RESERVATION MODAL
      ===================================================================== */}
      {isReserveModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reserve a table at RAWAQ"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          onClick={() => setIsReserveModalOpen(false)}
        >
          <div
            className="bg-[#F7F3EB] rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#26221E]/10 my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-5 mb-6 border-b border-[#26221E]/[0.08]">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#8C7A6B] mb-1">
                  Table Concierge · رواق
                </p>
                <h3 className="font-serif-display text-2xl text-[#231F1C]">
                  Réserver votre table chez RAWAQ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReserveModalOpen(false)}
                aria-label="Close reservation modal"
                className="w-9 h-9 rounded-full bg-[#EFE9DD] text-[#231F1C] flex items-center justify-center hover:bg-[#E2D9C8] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reservationConfirmed ? (
              <div className="py-4 space-y-6">
                <div className="p-5 rounded-xl bg-[#EFE9DD] border border-[#B86343]/30">
                  <div className="flex items-center justify-between text-xs text-[#8C7A6B] mb-2">
                    <span className="inline-flex items-center gap-1 text-[#231F1C] font-medium">
                      <Check className="w-3.5 h-3.5 text-[#B86343]" />
                      Réservation Confirmée
                    </span>
                    <span className="font-mono font-medium text-[#B86343]">
                      #{reservationConfirmed.code}
                    </span>
                  </div>
                  <h4 className="font-serif-display text-xl text-[#231F1C] mb-1">
                    Au plaisir de vous accueillir, {reservationConfirmed.name}
                  </h4>
                  <p className="text-xs text-[#5A524A]">
                    {reservationConfirmed.date} à {reservationConfirmed.time} ·{' '}
                    {reservationConfirmed.guests} · {reservationConfirmed.zoneName}
                  </p>
                </div>

                {tastingSelection.length > 0 && (
                  <div className="text-xs text-[#5A524A] space-y-1.5">
                    <p className="font-medium text-[#231F1C]">
                      Sélection associée ({formatDA(totalSelectionDA)}) :
                    </p>
                    <p>
                      {tastingSelection
                        .map((entry) => `${entry.qty}× ${entry.item.name}`)
                        .join(' · ')}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReservationConfirmed(null);
                      setIsReserveModalOpen(false);
                    }}
                    className="px-6 py-2.5 rounded-full bg-[#231F1C] text-[#F7F3EB] text-xs font-medium hover:bg-[#3A342E] transition-colors cursor-pointer"
                  >
                    Terminer
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleReservationSubmit} className="space-y-5">
                {/* Date, Time, Guests Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5A524A] mb-1.5">
                      <Calendar className="w-3.5 h-3.5 inline mr-1 text-[#B86343]" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={reservationDate}
                      onChange={(e) => setReservationDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#26221E]/15 text-sm text-[#231F1C] focus:outline-none focus:border-[#B86343]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5A524A] mb-1.5">
                      <Clock className="w-3.5 h-3.5 inline mr-1 text-[#B86343]" />
                      Heure
                    </label>
                    <select
                      value={reservationTime}
                      onChange={(e) => setReservationTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#26221E]/15 text-sm text-[#231F1C] focus:outline-none focus:border-[#B86343]"
                    >
                      <option value="08:30">08:30 Morning Coffee</option>
                      <option value="10:30">10:30 Brunch</option>
                      <option value="12:30">12:30 Déjeuner & Plats</option>
                      <option value="16:00">16:00 Pause Café & Cakes</option>
                      <option value="19:00">19:00 Soirée</option>
                      <option value="21:00">21:00 Late Lounge</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5A524A] mb-1.5">
                      <Users className="w-3.5 h-3.5 inline mr-1 text-[#B86343]" />
                      Convives
                    </label>
                    <select
                      value={reservationGuests}
                      onChange={(e) => setReservationGuests(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#26221E]/15 text-sm text-[#231F1C] focus:outline-none focus:border-[#B86343]"
                    >
                      <option value="1 Personne">1 Personne</option>
                      <option value="2 Personnes">2 Personnes</option>
                      <option value="4 Personnes">4 Personnes</option>
                      <option value="6 Personnes">6 Personnes</option>
                      <option value="8 Personnes">8 Personnes</option>
                    </select>
                  </div>
                </div>

                {/* Architectural Seating Zone Selector */}
                <div>
                  <label className="block text-xs font-medium text-[#5A524A] mb-2">
                    Espace souhaité
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {SEATING_ZONES.map((zone) => {
                      const active = reservationZone === zone.id;
                      return (
                        <button
                          key={zone.id}
                          type="button"
                          onClick={() => setReservationZone(zone.id)}
                          className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                            active
                              ? 'bg-[#B86343]/10 border-[#B86343] text-[#231F1C]'
                              : 'bg-[#FAF7F2] border-[#26221E]/10 text-[#5A524A] hover:border-[#26221E]/25'
                          }`}
                        >
                          <div className="text-xs font-semibold text-[#231F1C] mb-0.5">
                            {zone.name}
                          </div>
                          <div className="text-[11px] text-[#7E7367]">{zone.capacity}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Guest Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-[#5A524A] mb-1.5">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      placeholder="Votre nom"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#26221E]/15 text-sm text-[#231F1C] focus:outline-none focus:border-[#B86343]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#5A524A] mb-1.5">
                      Téléphone ou E-mail *
                    </label>
                    <input
                      type="text"
                      placeholder="0550 00 00 00"
                      value={guestContact}
                      onChange={(e) => setGuestContact(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#26221E]/15 text-sm text-[#231F1C] focus:outline-none focus:border-[#B86343]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#5A524A] mb-1.5">
                    Notes ou demandes particulières (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Table calme, gâteau d'anniversaire..."
                    value={guestNotes}
                    onChange={(e) => setGuestNotes(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg bg-[#FAF7F2] border border-[#26221E]/15 text-sm text-[#231F1C] focus:outline-none focus:border-[#B86343]"
                  />
                </div>

                {formError && <p className="text-xs text-[#B8433E] font-medium">{formError}</p>}

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReserveModalOpen(false)}
                    className="px-5 py-2.5 rounded-full text-xs font-medium text-[#5A524A] hover:text-[#231F1C] cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-7 py-2.5 rounded-full bg-[#B86343] hover:bg-[#A15133] text-[#F9F6F0] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Confirmer la Réservation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
