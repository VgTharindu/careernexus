import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Briefcase,
  Sun,
  Moon,
  ArrowRight,
  CheckCircle,
  Users,
  Building2,
  Brain,
  Bell,
  BarChart3,
  Shield,
  Star,
  ChevronDown,
  Zap,
  Globe,
  Award,
} from "lucide-react";

// ── Animated counter ─────────────────────────────────────
function Counter({ end, duration = 2000, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else setCount(start);
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);

  return (
    <span>
      {count}
      {suffix}
    </span>
  );
}

// ── Typing effect ────────────────────────────────────────
function TypeWriter({ text, speed = 80, onDone }) {
  const [displayed, setDisplayed] = useState("");
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (idx < text.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => prev + text[idx]);
        setIdx((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    } else {
      onDone && onDone();
    }
  }, [idx, text, speed, onDone]);

  return (
    <span>
      {displayed}
      {idx < text.length && (
        <span
          className="inline-block w-0.5 h-8 ml-1 animate-pulse"
          style={{ background: "#00FFFF", verticalAlign: "middle" }}
        />
      )}
    </span>
  );
}

// ── Floating particle ────────────────────────────────────
function Particle({ style }) {
  return (
    <div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: Math.random() * 4 + 2 + "px",
        height: Math.random() * 4 + 2 + "px",
        background: Math.random() > 0.5 ? "#007BFF" : "#00FFFF",
        opacity: Math.random() * 0.5 + 0.2,
        animation: `particle-move ${Math.random() * 3 + 2}s ease-in-out infinite`,
        animationDelay: Math.random() * 2 + "s",
        ...style,
      }}
    />
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();

  // Animation states
  const [phase, setPhase] = useState("logo"); // logo → typing → slogan → page
  const [showSlogan, setShowSlogan] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const [logoReady, setLogoReady] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    top: Math.random() * 100 + "%",
    left: Math.random() * 100 + "%",
  }));

  useEffect(() => {
    // Logo spin-in
    const t1 = setTimeout(() => setLogoReady(true), 200);
    // Start typing after logo appears
    const t2 = setTimeout(() => setPhase("typing"), 1000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", () => setScrolled(window.scrollY > 50));
    return () => window.removeEventListener("scroll", () => {});
  }, []);

  const handleTypingDone = () => {
    setTimeout(() => setShowSlogan(true), 300);
    setTimeout(() => setShowPage(true), 1200);
  };

  const features = [
    {
      icon: Brain,
      title: "AI CV Scoring",
      desc: "Gemini AI automatically scores every application against job requirements — giving companies instant match scores and students actionable feedback.",
      color: "#007BFF",
    },
    {
      icon: Briefcase,
      title: "Smart Job Matching",
      desc: "Advanced search with filters by programming language, position, and job type. Find the right opportunity or the right candidate in seconds.",
      color: "#00CCCC",
    },
    {
      icon: Building2,
      title: "Verified Companies",
      desc: "Every company is reviewed and approved by SLIATE admin before posting. Students always see legitimate, trustworthy opportunities.",
      color: "#007BFF",
    },
    {
      icon: Bell,
      title: "Real-time Alerts",
      desc: "Instant email and in-app notifications on every status update. Students never miss a shortlist or hire notification from companies.",
      color: "#00CCCC",
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      desc: "Administrators get full platform analytics — charts, reports, placement rates, and CSV exports — to make data-driven institutional decisions.",
      color: "#007BFF",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      desc: "JWT authentication, bcrypt password hashing, role-based access control, and admin moderation keep the platform safe for all users.",
      color: "#00CCCC",
    },
  ];

  const steps = [
    {
      num: "01",
      role: "Student",
      title: "Create Your Profile",
      desc: "Register free, upload your CV, add your skills, LinkedIn and GitHub links, and set your desired job position.",
    },
    {
      num: "02",
      role: "Student",
      title: "Browse & Apply",
      desc: "Filter jobs by language, position, or type. Read full details and apply with a cover letter — AI scores your CV instantly.",
    },
    {
      num: "03",
      role: "Company",
      title: "Post & Review",
      desc: "Post verified internship or job listings. Review AI-scored applicants through a visual Kanban pipeline.",
    },
    {
      num: "04",
      role: "Both",
      title: "Connect & Hire",
      desc: "Companies shortlist and hire with one click. Students receive instant email notifications and see their status in real time.",
    },
  ];

  const testimonials = [
    {
      name: "Kavindu Perera",
      role: "IT Student, SLIATE",
      text: "I got shortlisted within 3 days of uploading my CV. The AI score showed me exactly what skills I was missing.",
      rating: 5,
    },
    {
      name: "TechNova HR",
      role: "Software Company, Colombo",
      text: "The AI matching saved us hours of CV screening. We found our intern in one day instead of two weeks.",
      rating: 5,
    },
    {
      name: "Nimasha Silva",
      role: "Final Year Student, SLIATE",
      text: "The profile completion bar motivated me to add my GitHub and LinkedIn. My AI scores went from 45 to 82!",
      rating: 5,
    },
    {
      name: "CodeCraft LK",
      role: "Tech Startup, Kandy",
      text: "Posting a job takes 5 minutes and the admin approval gives us credibility with students. Highly recommend.",
      rating: 5,
    },
  ];

  return (
    <div
      style={{
        background: "var(--color-bg-primary)",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      {/* ── Splash screen ───────────────────────────── */}
      {!showPage && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{
            background: 'var(--color-bg-primary)',
            zIndex:     9999,
          }}
        >
          {/* Particles */}
          {particles.map((p) => (
            <Particle key={p.id} style={{ top: p.top, left: p.left }} />
          ))}

          {/* Background glow */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div
              style={{
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,123,255,0.08) 0%, transparent 70%)",
              }}
            />
          </div>

          {/* Logo */}
          <div
            className={`relative mb-6 ${logoReady ? "animate-spin-in" : "opacity-0"}`}
          >
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center animate-glow-pulse"
              style={{
                background: "linear-gradient(135deg, #007BFF, #00FFFF)",
              }}
            >
              <Briefcase size={48} className="text-white" />
            </div>
            {/* Ring effect */}
            <div
              className="absolute inset-0 rounded-3xl animate-ping"
              style={{
                border: "2px solid rgba(0,255,255,0.3)",
                animationDuration: "2s",
              }}
            />
          </div>

          {/* Name with typing effect */}
          {phase === "typing" || phase === "done" ? (
            <div className="text-center">
              <h1
                className="text-5xl md:text-6xl font-black mb-4"
                style={{ minHeight: "72px", color: "transparent" }}
              >
                <span className="gradient-text">
                  {phase === "typing" ? (
                    <TypeWriter
                      text="CareerNexus"
                      speed={100}
                      onDone={handleTypingDone}
                    />
                  ) : (
                    "CareerNexus"
                  )}
                </span>
              </h1>

              {/* Slogan */}
              <div
                className="overflow-hidden transition-all duration-700"
                style={{
                  maxHeight: showSlogan ? "60px" : "0",
                  opacity: showSlogan ? 1 : 0,
                }}
              >
                <p
                  className="text-xl font-medium tracking-widest uppercase"
                  style={{ color: "#00FFFF", letterSpacing: "0.15em" }}
                >
                  Smarter Hiring. Better Futures.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ height: "72px" }} />
          )}

          {/* Loading bar */}
          {showSlogan && (
            <div className="mt-10 w-48">
              <div
                className="h-0.5 rounded-full overflow-hidden"
                style={{ background: "rgba(0,123,255,0.2)" }}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #007BFF, #00FFFF)",
                    animation: "typing 1s ease forwards",
                    width: "100%",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Main landing page ────────────────────────── */}
      <div
        className="transition-all duration-700"
        style={{
          opacity: showPage ? 1 : 0,
          transform: showPage ? "translateY(0)" : "translateY(20px)",
        }}
      >
        {/* ── Navbar ──────────────────────────────────── */}
        <nav
          className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 md:px-12 py-4 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(0,31,63,0.95)" : "transparent",
            backdropFilter: scrolled ? "blur(12px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(0,123,255,0.2)" : "none",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #007BFF, #00FFFF)",
              }}
            >
              <Briefcase size={18} className="text-white" />
            </div>
            <span className="text-xl font-black gradient-text">
              CareerNexus
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ color: "#B0D4FF", background: "rgba(0,123,255,0.1)" }}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: "rgba(0,123,255,0.15)",
                color: "#007BFF",
                border: "1px solid rgba(0,123,255,0.3)",
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
              style={{
                background: "linear-gradient(135deg, #007BFF, #00CCCC)",
                color: "white",
                boxShadow: "0 0 15px rgba(0,123,255,0.3)",
              }}
            >
              Get Started Free
            </button>
          </div>
        </nav>

        {/* ── Hero Section ────────────────────────────── */}
        <section
          className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20"
          style={{ background: "var(--color-bg-primary)" }}
        >
          {/* Background glow orbs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "10%",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,123,255,0.12) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "20%",
                right: "10%",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,255,255,0.08) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
          </div>
        
         {/* Badge */}
          {/* <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 slide-up"
            style={{
              background: "rgba(0,123,255,0.1)",
              border: "1px solid rgba(0,123,255,0.3)",
              color: "#00FFFF",
              animationDelay: "0.1s",
            }}
          >
            <Zap size={14} style={{ color: "#00FFFF" }} />
            <span className="text-sm font-medium">
              AI-Powered Campus Recruitment Platform
            </span>
          </div>  */}

          {/* Main headline */}
          <h1
            className="text-5xl md:text-7xl font-black mb-6 leading-tight slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <span className="gradient-text">Smarter Hiring.</span>
            <br />
            <span style={{ color: "var(--color-text-primary)" }}>
              Better Futures.
            </span>
          </h1>

          {/* Sub headline */}
          <p
            className="text-lg md:text-xl mb-10 max-w-2xl leading-relaxed slide-up"
            style={{
              color: "var(--color-text-secondary)",
              animationDelay: "0.3s",
            }}
          >
            CareerNexus connects University students with verified companies through
            an AI-powered recruitment platform. Upload your CV, get an instant
            match score, and land your dream internship.
          </p>

          {/* CTA buttons */}
          <div
            className="flex flex-col sm:flex-row gap-4 mb-16 slide-up"
            style={{ animationDelay: "0.4s" }}
          >
            <button
              onClick={() => navigate("/register")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105 hover:-translate-y-1"
              style={{
                background: "linear-gradient(135deg, #007BFF, #00CCCC)",
                color: "white",
                boxShadow: "0 8px 30px rgba(0,123,255,0.4)",
              }}
            >
              Start for Free <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105"
              style={{
                background: "transparent",
                color: "#007BFF",
                border: "2px solid #007BFF",
              }}
            >
              Sign In to Dashboard
            </button>
          </div>

          {/* Stats row */}
          <div
            className="flex flex-wrap justify-center gap-8 slide-up"
            style={{ animationDelay: "0.5s" }}
          >
            {[
              { value: 200, suffix: "+", label: "Students Registered" },
              { value: 50, suffix: "+", label: "Verified Companies" },
              { value: 300, suffix: "+", label: "Jobs Posted" },
              { value: 85, suffix: "%", label: "Placement Rate" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-black gradient-text">
                  <Counter end={stat.value} suffix={stat.suffix} />
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={24} style={{ color: "rgba(0,123,255,0.5)" }} />
          </div>
        </section>

        {/* ── Features Section ─────────────────────────── */}
        <section
          className="py-24 px-6"
          style={{ background: "var(--color-bg-secondary)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: "rgba(0,123,255,0.1)",
                  border: "1px solid rgba(0,123,255,0.3)",
                  color: "#00FFFF",
                }}
              >
                <Zap size={14} />
                <span className="text-sm font-medium">Platform Features</span>
              </div>
              <h2 className="text-4xl font-black mb-4">
                <span className="gradient-text">Everything you need</span>
              </h2>
              <p
                className="text-lg max-w-2xl mx-auto"
                style={{ color: "var(--color-text-secondary)" }}
              >
                CareerNexus is built with real-world features that make
                recruitment smarter for everyone.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <div
                    key={feature.title}
                    className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 group"
                    style={{
                      background: "var(--color-bg-card)",
                      border: "1px solid var(--color-border)",
                      animationDelay: `${i * 0.1}s`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = feature.color;
                      e.currentTarget.style.boxShadow = `0 8px 30px ${feature.color}22`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--color-border)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                      style={{ background: `${feature.color}20` }}
                    >
                      <Icon size={24} style={{ color: feature.color }} />
                    </div>
                    <h3
                      className="text-lg font-bold mb-2"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {feature.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── How it Works Section ─────────────────────── */}
        <section
          className="py-24 px-6"
          style={{ background: "var(--color-bg-primary)" }}
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: "rgba(0,204,204,0.1)",
                  border: "1px solid rgba(0,204,204,0.3)",
                  color: "#00FFFF",
                }}
              >
                <Globe size={14} />
                <span className="text-sm font-medium">How It Works</span>
              </div>
              <h2 className="text-4xl font-black mb-4">
                <span className="gradient-text">From signup to hired</span>
                <span style={{ color: "var(--color-text-primary)" }}>
                  {" "}
                  in 4 steps
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className="p-6 rounded-2xl flex gap-5"
                  style={{
                    background:
                      i % 2 === 0
                        ? "linear-gradient(135deg, rgba(0,123,255,0.08), rgba(0,204,204,0.04))"
                        : "var(--color-bg-card)",
                    border: `1px solid ${i % 2 === 0 ? "rgba(0,123,255,0.2)" : "var(--color-border)"}`,
                  }}
                >
                  <div className="flex-shrink-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg"
                      style={{
                        background: "linear-gradient(135deg, #007BFF, #00CCCC)",
                        color: "white",
                      }}
                    >
                      {step.num}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{
                          background:
                            step.role === "Student"
                              ? "rgba(0,123,255,0.15)"
                              : step.role === "Company"
                                ? "rgba(0,204,204,0.15)"
                                : "rgba(0,123,255,0.1)",
                          color:
                            step.role === "Student"
                              ? "#007BFF"
                              : step.role === "Company"
                                ? "#00CCCC"
                                : "#007BFF",
                        }}
                      >
                        {step.role}
                      </span>
                    </div>
                    <h3
                      className="text-base font-bold mb-1"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {step.title}
                    </h3>
                    <p
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Testimonials Section ─────────────────────── */}
        <section
          className="py-24 px-6"
          style={{ background: "var(--color-bg-secondary)" }}
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
                style={{
                  background: "rgba(0,123,255,0.1)",
                  border: "1px solid rgba(0,123,255,0.3)",
                  color: "#00FFFF",
                }}
              >
                <Award size={14} />
                <span className="text-sm font-medium">Testimonials</span>
              </div>
              <h2 className="text-4xl font-black">
                <span style={{ color: "var(--color-text-primary)" }}>
                  Trusted by{" "}
                </span>
                <span className="gradient-text">students & companies</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((t, i) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl"
                  style={{
                    background: "var(--color-bg-card)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <Star
                        key={s}
                        size={16}
                        fill="#FFD600"
                        style={{ color: "#FFD600" }}
                      />
                    ))}
                  </div>

                  <p
                    className="text-sm leading-relaxed mb-4 italic"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    "{t.text}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                      style={{
                        background: "linear-gradient(135deg, #007BFF, #00CCCC)",
                      }}
                    >
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {t.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Section ──────────────────────────────── */}
        <section
          className="py-24 px-6"
          style={{ background: "var(--color-bg-primary)" }}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div
              className="p-12 rounded-3xl relative overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, rgba(0,123,255,0.15), rgba(0,204,204,0.08))",
                border: "1px solid rgba(0,123,255,0.3)",
              }}
            >
              {/* Background glow */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  style={{
                    width: "400px",
                    height: "400px",
                    borderRadius: "50%",
                    background:
                      "radial-gradient(circle, rgba(0,123,255,0.1) 0%, transparent 70%)",
                  }}
                />
              </div>

              <div className="relative z-10">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-glow-pulse"
                  style={{
                    background: "linear-gradient(135deg, #007BFF, #00FFFF)",
                  }}
                >
                  <Briefcase size={32} className="text-white" />
                </div>

                <h2 className="text-4xl font-black mb-4">
                  <span className="gradient-text">Ready to start your</span>
                  <br />
                  <span style={{ color: "var(--color-text-primary)" }}>
                    career journey?
                  </span>
                </h2>

                <p
                  className="text-lg mb-8"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Join hundreds of University students already using CareerNexus to
                  find their dream internships and jobs.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate("/register")}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all hover:scale-105 hover:-translate-y-1"
                    style={{
                      background: "linear-gradient(135deg, #007BFF, #00CCCC)",
                      color: "white",
                      boxShadow: "0 8px 30px rgba(0,123,255,0.4)",
                    }}
                  >
                    Create Free Account <ArrowRight size={18} />
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-base font-bold transition-all"
                    style={{
                      background: "transparent",
                      color: "#007BFF",
                      border: "2px solid rgba(0,123,255,0.5)",
                    }}
                  >
                    Already have an account?
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────── */}
        <footer
          className="py-8 px-6 text-center"
          style={{
            background: "var(--color-bg-secondary)",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #007BFF, #00FFFF)",
              }}
            >
              <Briefcase size={14} className="text-white" />
            </div>
            <span className="font-bold gradient-text">CareerNexus</span>
          </div>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Smarter Hiring. Better Futures. 
          </p>
          <p
            className="text-xs mt-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            Developed by VgTharindu — Code with purpose, build with passion.
          </p>
        </footer>
      </div>
    </div>
  );
}
