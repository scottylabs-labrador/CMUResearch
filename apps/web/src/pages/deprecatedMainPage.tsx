// This page is currently not being used, but was the old home page; Now replaced by the search page

import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink } from "react-router-dom";
import { ResearchType, ProfessorType } from "../DataTypes";
import Tag from "../components/Tag";
import { v4 as uuidv4 } from "uuid";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import BookmarkIconUnfilled from "@mui/icons-material/BookmarkBorderOutlined";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { parseContact, toArray } from "../utils";

function professorPublicProfilePath(p: ProfessorType): string {
  const rawId = p._id != null ? String(p._id).trim() : "";
  if (rawId) return `/professor/${encodeURIComponent(rawId)}`;
  const email = (p.email ?? "").trim();
  if (!email) return "/";
  const at = email.indexOf("@");
  const local = at > 0 ? email.slice(0, at).trim() : email;
  return `/professor/${encodeURIComponent(local || email)}`;
}

const MainPage = () => {
  const [researches, setResearches] = useState<ResearchType[]>([]);
  const [savedStates, setSavedStates] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchResearches = async () => {
      try {
        const res = await fetch("http://localhost:5050/opportunities/");
        if (!res.ok) return;
        const data: any[] = await res.json();

        const transformed = data
          .filter((item) => item["Project Title"])
          .map((item) => ({
            _id: item._id,
            projectTitle: item["Project Title"],
            contact: parseContact(item.Contact),
            department: toArray(item.Department),
            description: item.Description || "No description provided.",
            desiredSkillLevel: item["Desired Skill Level"],
            paidUnpaid: item["Paid/Unpaid"],
            position: item.Position,
            prereqs: item.Prereqs,
            relevantLinks: toArray(item["Relevant Links"]),
            source: item.Source,
            timeAdded: item["Time Added"],
            timeCommitment: item["Time Commitment"],
            anticipatedEndDate: item["Anticipated End Date"],
            keywords: toArray(item.Keywords),
            college: toArray(item.College),
          })) as ResearchType[];

        setResearches(transformed);
      } catch {
        console.log("Error fetching data");
      }
    };

    fetchResearches();
  }, []);

  useEffect(() => {
    const savedResearch = JSON.parse(localStorage.getItem("savedResearch") || "[]");
    const initial = researches.reduce((acc, research) => {
      acc[research._id] = savedResearch.some((saved: ResearchType) => saved._id === research._id);
      return acc;
    }, {} as { [key: string]: boolean });
    setSavedStates(initial);
  }, [researches]);

  const handleSave = (research: ResearchType) => {
    const savedResearch = JSON.parse(localStorage.getItem("savedResearch") || "[]");
    const isAlreadySaved = savedResearch.some((saved: ResearchType) => saved._id === research._id);

    if (!isAlreadySaved) {
      savedResearch.push(research);
      localStorage.setItem("savedResearch", JSON.stringify(savedResearch));
      setSavedStates(prev => ({ ...prev, [research._id]: true }));
    } else {
      const filtered = savedResearch.filter((saved: ResearchType) => saved._id !== research._id);
      localStorage.setItem("savedResearch", JSON.stringify(filtered));
      setSavedStates(prev => ({ ...prev, [research._id]: false }));
    }
  };

  const [professors, setProfessors] = useState<ProfessorType[]>([]);

  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const res = await fetch("http://localhost:5050/professors/");
        if (!res.ok) return;
        const data: any[] = await res.json();

        const transformed = data
          .filter((item) => item.Name)
          .map((item) => ({
            _id: item._id,
            name: item.Name ?? "",
            department: item.Department ?? [],
            college: item.College ?? [],
            email: item.Email ?? "",
            phoneNumber: item["Phone Number"] ?? "",
            bio: item.Bio ?? {},
            media: item.Media ?? [],
            positions: item.Positions ?? [],
            tags: item.Tags ?? [],
            profilePicture: item["Profile Picture"] ?? "",
          })) as ProfessorType[];

        setProfessors(transformed);
      } catch {
        console.log("Error fetching professors");
      }
    };

    fetchProfessors();
  }, []);

  const BATCH_SIZE = 5;
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const opportunitiesScrollRef = useRef<HTMLDivElement>(null);
  const professorsScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollOpportunitiesLeft, setCanScrollOpportunitiesLeft] = useState(false);
  const [canScrollOpportunitiesRight, setCanScrollOpportunitiesRight] = useState(false);
  const [canScrollProfessorsLeft, setCanScrollProfessorsLeft] = useState(false);
  const [canScrollProfessorsRight, setCanScrollProfessorsRight] = useState(false);

  const maybeExpandOpportunities = (el: HTMLDivElement) => {
    const { scrollLeft, clientWidth, scrollWidth } = el;
    if (scrollWidth - scrollLeft <= clientWidth + 100) {
      setVisibleCount((prev) => Math.min(prev + BATCH_SIZE, researches.length));
    }
  };

  const updateOpportunityScrollButtons = (el: HTMLDivElement) => {
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanScrollOpportunitiesLeft(el.scrollLeft > 4);
    setCanScrollOpportunitiesRight(el.scrollLeft < maxScrollLeft - 4);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    maybeExpandOpportunities(e.currentTarget);
    updateOpportunityScrollButtons(e.currentTarget);
  };

  const handleOpportunityScrollButton = (direction: "left" | "right") => {
    const container = opportunitiesScrollRef.current;
    if (!container) return;
    const scrollStep = Math.round(container.clientWidth * 0.85);
    container.scrollBy({
      left: direction === "right" ? scrollStep : -scrollStep,
      behavior: "smooth",
    });
    requestAnimationFrame(() => {
      const updatedContainer = opportunitiesScrollRef.current;
      if (!updatedContainer) return;
      maybeExpandOpportunities(updatedContainer);
      updateOpportunityScrollButtons(updatedContainer);
    });
  };

  const selectedOpportunities = researches.slice(0, visibleCount);

  useEffect(() => {
    const refreshButtons = () => {
      const container = opportunitiesScrollRef.current;
      if (!container) return;
      updateOpportunityScrollButtons(container);
    };

    refreshButtons();
    window.addEventListener("resize", refreshButtons);
    return () => window.removeEventListener("resize", refreshButtons);
  }, [selectedOpportunities.length]);

  const [profVisibleCount, setProfVisibleCount] = useState(BATCH_SIZE);

  const maybeExpandProfessors = (el: HTMLDivElement) => {
    const { scrollLeft, clientWidth, scrollWidth } = el;
    if (scrollWidth - scrollLeft <= clientWidth + 100) {
      setProfVisibleCount((prev) => Math.min(prev + BATCH_SIZE, professors.length));
    }
  };

  const updateProfessorScrollButtons = (el: HTMLDivElement) => {
    const maxScrollLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    setCanScrollProfessorsLeft(el.scrollLeft > 4);
    setCanScrollProfessorsRight(el.scrollLeft < maxScrollLeft - 4);
  };

  const handleProfScroll = (e: React.UIEvent<HTMLDivElement>) => {
    maybeExpandProfessors(e.currentTarget);
    updateProfessorScrollButtons(e.currentTarget);
  };

  const selectedProfessors = professors.slice(0, profVisibleCount);

  const handleProfessorScrollButton = (direction: "left" | "right") => {
    const container = professorsScrollRef.current;
    if (!container) return;
    const scrollStep = Math.round(container.clientWidth * 0.85);
    container.scrollBy({
      left: direction === "right" ? scrollStep : -scrollStep,
      behavior: "smooth",
    });
    requestAnimationFrame(() => {
      const updatedContainer = professorsScrollRef.current;
      if (!updatedContainer) return;
      maybeExpandProfessors(updatedContainer);
      updateProfessorScrollButtons(updatedContainer);
    });
  };

  useEffect(() => {
    const refreshButtons = () => {
      const container = professorsScrollRef.current;
      if (!container) return;
      updateProfessorScrollButtons(container);
    };

    refreshButtons();
    window.addEventListener("resize", refreshButtons);
    return () => window.removeEventListener("resize", refreshButtons);
  }, [selectedProfessors.length]);

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      {/* Single full-width container. Gradient transitions from deep purple at
          ~65% to the lavender light-color — same two-tone concept but as a
          smooth blend, no hard panel seam. */}
      <div
        className="w-[100vw] min-h-[72vh] relative overflow-hidden flex items-center"
        style={{ background: "linear-gradient(to right, #7E55B2 0%, #7E55B2 50%, #9E7FCC 75%, #B99EE0 100%)" }}
      >

        {/* Content — px-20 gives noticeably more breathing room from the edge */}
        <div className="relative z-10 px-20 py-20 max-w-2xl">

          {/* Eyebrow */}
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-300 mb-6">
            Carnegie Mellon University
          </p>

          {/* Headline */}
          <h1
            className="font-jersey font-bold tracking-tight leading-[0.88] text-white mb-7"
            style={{ fontSize: "clamp(64px, 8vw, 112px)" }}
          >
            CMU<br />Research
          </h1>

          {/* Descriptor */}
          <p className="text-base text-white/70 leading-relaxed max-w-sm mb-10">
            Discover faculty-led research opportunities across every CMU college and department.
          </p>

          {/* CTAs */}
          <div className="flex items-center gap-6">
            {/* Primary: lifts on hover with shadow, scales on press */}
            <NavLink
              to="/"
              className="px-7 py-3 bg-white text-card-highlight font-semibold text-sm rounded-xl transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] active:translate-y-0 active:shadow-none active:scale-[0.97]"
            >
              Start Applying
            </NavLink>
            {/* Secondary: underline grows in from left on hover */}
            <NavLink
              to="/"
              className="text-sm font-semibold text-white/80 hover:text-white transition-colors duration-200 underline-offset-4 decoration-white/40 hover:decoration-white hover:underline"
            >
              Start Posting &rarr;
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── Research Opportunities carousel ──────────────────────────────── */}
      <div className="w-[100vw] px-14 py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          {/* Section heading: Inter bold — navigational label, not a display moment.
              Jersey lives only in the hero. */}
          <h2 className="font-bold text-2xl text-gray-900">Selected Research Opportunities</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpportunityScrollButton("left")}
              disabled={!canScrollOpportunitiesLeft}
              aria-label="Scroll selected opportunities left"
              className="rounded-lg border border-tag-dark-color px-3 py-2 text-tag-dark-color transition-[background-color] duration-150 ease-out hover:bg-brand-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => handleOpportunityScrollButton("right")}
              disabled={!canScrollOpportunitiesRight}
              aria-label="Scroll selected opportunities right"
              className="rounded-lg bg-tag-dark-color px-3 py-2 text-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowForwardIcon fontSize="small" />
            </button>
          </div>
        </div>
        <div
          ref={opportunitiesScrollRef}
          className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide"
          onScroll={handleScroll}
        >
          {selectedOpportunities.length === 0 ? (
            <p className="text-gray-500 text-sm py-8">No research opportunities to show yet.</p>
          ) : selectedOpportunities.map((research) => (
            <div key={research._id} className="flex-none w-[400px]">
              <div className="w-full h-[300px] bg-light-color rounded-xl p-6 flex flex-col">
                {/* Card title: Inter semibold instead of Jersey display — display
                    fonts are for headings, not 5-10 word content strings */}
                <h3 className="font-semibold text-lg leading-snug mb-2 shrink-0">{research.projectTitle}</h3>
                <div className="flex gap-2 flex-wrap mb-3 shrink-0">
                  {(Array.isArray(research.college) ? research.college : []).map((word) => (
                    <Tag key={uuidv4().concat("col")} keyword={word} />
                  ))}
                  {(Array.isArray(research.department) ? research.department : []).map((word) => (
                    <Tag key={uuidv4().concat("dep")} keyword={word} />
                  ))}
                  {(Array.isArray(research.keywords) ? research.keywords : []).map((word) => (
                    <Tag key={uuidv4().concat("key")} keyword={word} />
                  ))}
                </div>
                <div className="mb-4 flex-1 min-h-0 overflow-y-auto pr-1">
                  <p className="text-sm leading-relaxed text-gray-700">{research.description}</p>
                </div>
                <div className="mt-auto shrink-0 flex justify-between items-center">
                  {/* Learn More: brand color instead of the grey learn-more-color token */}
                  <NavLink
                    to={`/info/${research._id}`}
                    className="inline-block px-3 py-1.5 bg-tag-dark-color text-white text-sm rounded-lg transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97]"
                  >
                    Learn More
                  </NavLink>
                  <button
                    onClick={() => handleSave(research)}
                    className="text-bookmark-color hover:opacity-80"
                  >
                    {savedStates[research._id] ? <BookmarkIcon /> : <BookmarkIconUnfilled />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Info Banner ──────────────────────────────────────────────────── */}
      <div className="w-[100vw] bg-gradient-to-r from-dark-color to-light-color px-14 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left - feature list replacing the unfinished placeholder wireframe */}
          <div className="bg-white bg-opacity-60 rounded-2xl p-8 space-y-6">
            {[
              { label: "Filter by college, department & compensation", detail: "Narrow down to exactly what fits your schedule and goals." },
              { label: "Browse professor profiles", detail: "See research focus areas, open positions, and contact info in one place." },
              { label: "Save opportunities for later", detail: "Bookmark anything that catches your eye and revisit it anytime." },
            ].map(({ label, detail }) => (
              <div key={label} className="flex gap-4 items-start">
                <div className="w-2 h-2 rounded-full bg-tag-dark-color mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Right - Text Content */}
          <div>
            {/* Inter bold — a second Jersey headline would compete with the hero
                and devalue the display font. Inter at this size is authoritative
                without stealing the hero's identity. */}
            <h2 className="font-bold text-4xl leading-tight tracking-tight text-gray-900 mb-4">
              Find your next research opportunity at CMU
            </h2>
            <p className="text-base text-gray-700 mb-8 leading-relaxed max-w-prose">
              Browse a curated collection of research opportunities across every CMU college and
              department. Filter by your interests, save for later, and connect directly with
              professors&#8202;&mdash;&#8202;whether you&rsquo;re an undergraduate looking for your first
              lab or a graduate student seeking new collaborations.
            </p>
            <NavLink
              to="/"
              className="inline-block px-6 py-3 bg-tag-dark-color text-white font-bold rounded-xl transition-[opacity,transform] duration-200 ease-out hover:opacity-90 active:scale-[0.97]"
            >
              Start Searching
            </NavLink>
          </div>
        </div>
      </div>

      {/* ── Featured Professors carousel ─────────────────────────────────── */}
      <div className="w-[100vw] px-14 py-16">
        <div className="mb-8 flex items-center justify-between gap-4">
          <h2 className="font-bold text-2xl text-gray-900">Featured Professors</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleProfessorScrollButton("left")}
              disabled={!canScrollProfessorsLeft}
              aria-label="Scroll featured professors left"
              className="rounded-lg border border-tag-dark-color px-3 py-2 text-tag-dark-color transition-[background-color] duration-150 ease-out hover:bg-brand-50 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowBackIcon fontSize="small" />
            </button>
            <button
              type="button"
              onClick={() => handleProfessorScrollButton("right")}
              disabled={!canScrollProfessorsRight}
              aria-label="Scroll featured professors right"
              className="rounded-lg bg-tag-dark-color px-3 py-2 text-white transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowForwardIcon fontSize="small" />
            </button>
          </div>
        </div>
        <div
          ref={professorsScrollRef}
          className="flex overflow-x-auto gap-6 pb-4 scrollbar-hide"
          onScroll={handleProfScroll}
        >
          {selectedProfessors.length === 0 ? (
            <p className="text-gray-500 text-sm py-8">No featured professors to show yet.</p>
          ) : selectedProfessors.map((professor) => (
            <div key={professor._id} className="flex-none w-[300px]">
              <div className="w-full h-[350px] bg-light-color rounded-xl p-6 flex flex-col items-center text-center justify-between">
                <Link
                  to={professorPublicProfilePath(professor)}
                  className="flex flex-col items-center text-center w-full min-h-0 flex-1 overflow-y-auto text-inherit no-underline rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                >
                  <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-4 overflow-hidden">
                    {professor.profilePicture ? (
                      <img
                        src={professor.profilePicture}
                        alt={professor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PersonIcon className="text-gray-400" style={{ fontSize: '3rem' }} />
                    )}
                  </div>
                  <h3 className="font-bold text-xl mb-1 hover:text-tag-dark-color transition-colors">
                    {professor.name}
                  </h3>
                  {professor.department.length > 0 && (
                    <p className="text-sm text-gray-600 mb-2">
                      {professor.department.join(", ")}
                    </p>
                  )}
                  <div className="w-full flex gap-2 flex-wrap justify-center mb-3 max-h-24 overflow-y-auto pr-1">
                    {professor.tags?.slice(0, 3).map((tag) => (
                      <Tag
                        key={uuidv4().concat("tag")}
                        keyword={tag}
                      />
                    ))}
                  </div>
                </Link>
                <div className="space-y-1 w-full shrink-0 pt-2">
                  {professor.positions && professor.positions.length > 0 && (
                    <p className="text-xs text-gray-500">
                      {professor.positions[0]?.position}
                    </p>
                  )}
                  {professor.email && (
                    <a
                      href={`mailto:${professor.email}`}
                      className="text-sm text-tag-dark-color hover:opacity-80 transition-opacity"
                    >
                      {professor.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default MainPage;
