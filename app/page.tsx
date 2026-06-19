"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Calendar,
  MapPin,
  Star,
  MessageSquare,
  Flame,
  User,
  Clock,
  Send,
  Check,
  Menu,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  Volume2,
  VolumeX
} from "lucide-react";
import Link from "next/link";

interface GymClass {
  id: string;
  name: string;
  trainerName: string;
  difficulty: string;
  maxCapacity: number;
  startTime: string;
  endTime: string;
  _count?: {
    bookings: number;
  };
}

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Video Audio Reference & Toggle State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMuted, setVideoMuted] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setVideoMuted(videoRef.current.muted);
    }
  };

  // Settings State
  const [settings, setSettings] = useState<Record<string, string>>({
    gym_name: "Evolution Fitness Thane",
    gym_phone: "+919769763350",
    gym_address: "Vartak Nagar, Thane, Maharashtra",
    google_rating: "4.7",
    google_reviews_count: "110",
    operating_hours: "Open · Closes 11pm",
    members_count: "1,200+",
    years_active: "8+"
  });

  // Schedule States
  const [classes, setClasses] = useState<GymClass[]>([]);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(new Date().getDay());
  const [selectedClass, setSelectedClass] = useState<GymClass | null>(null);
  const [bookingName, setBookingName] = useState("");
  const [bookingPhone, setBookingPhone] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Lead Form States
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadGoal, setLeadGoal] = useState("Muscle Gain");
  const [leadSuccess, setLeadSuccess] = useState(false);
  const [leadError, setLeadError] = useState("");

  // AI Coach Chat States
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "coach"; text: string }>>([
    { sender: "coach", text: "Welcome to the evolution. What's the goal? Muscle gain, fat loss, or recovery? Let me map your targets. EVOLVE OR REMAIN THE SAME!" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) setSettings(data);
      });

    loadSchedule();
  }, []);

  const loadSchedule = () => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          fetch("/api/bookings")
            .then((res) => res.json())
            .then((bookings) => {
              const classesWithCounts = data.map((c: any) => {
                const count = bookings.filter((b: any) => b.classId === c.id && b.status === "CONFIRMED").length;
                return {
                  ...c,
                  bookingsCount: count
                };
              });
              setClasses(classesWithCounts);
            });
        }
      });
  };

  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const filteredClasses = classes.filter((c) => {
    const classDay = new Date(c.startTime).getDay();
    return classDay === activeDayIndex;
  });

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass) return;
    setBookingError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: bookingName,
          phone: bookingPhone,
          classId: selectedClass.id
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBookingSuccess(true);
        loadSchedule();
        setTimeout(() => {
          setSelectedClass(null);
          setBookingSuccess(false);
          setBookingName("");
          setBookingPhone("");
        }, 2000);
      } else {
        setBookingError(data.error || "Booking failed");
      }
    } catch (err) {
      setBookingError("Connection error. Try again.");
    }
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          fitnessGoal: leadGoal
        })
      });
      if (res.ok) {
        setLeadSuccess(true);
        setLeadName("");
        setLeadPhone("");
      } else {
        const data = await res.json();
        setLeadError(data.error || "Submission failed");
      }
    } catch (err) {
      setLeadError("Connection error.");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "+919999999999",
          message: userMsg,
          name: "Website Athlete"
        })
      });
      const data = await res.json();
      setChatMessages((prev) => [...prev, { sender: "coach", text: data.reply || "Connection timed out." }]);
    } catch (err) {
      setChatMessages((prev) => [...prev, { sender: "coach", text: "Error connecting to AI Coach." }]);
    } finally {
      setChatLoading(false);
    }
  };

  const pricingPlans = [
    {
      id: "pricing_basic",
      defaultName: "Basic Plan",
      defaultPrice: "₹1,999",
      features: ["Standard Gym Floor Access", "Standard Lockers & Showers", "1 Trainer Assistance Session", "Free Parking & Wi-Fi", "Floor Access: 6am - 10pm"]
    },
    {
      id: "pricing_pro",
      defaultName: "Pro Plan",
      defaultPrice: "₹3,499",
      features: ["Unlimited Gym Floor Access", "Access to HIIT & CrossFit Classes", "2 Personal Training Sessions / Month", "Infrared Sauna Access (2 / Month)", "Customized Macro Strategy", "Floor Access: 5am - 11pm"]
    },
    {
      id: "pricing_elite",
      defaultName: "Elite Plan",
      defaultPrice: "₹5,999",
      features: ["Full Sanctuary & Floor Access", "Unlimited Group & CrossFit Classes", "Dedicated Personal Trainer (8 sessions/month)", "Unlimited Sauna & Sports Therapy", "VO2 Max & Macro Tracking", "Private Locker & VIP Showers"]
    }
  ];

  return (
    <div className="bg-black text-white min-h-screen selection:bg-[#FF3B30] selection:text-white font-sans">
      {/* Sticky Header */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/75 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-[#FF3B30] rotate-45" />
          <span className="font-syncopate text-lg tracking-tight font-bold text-white">
            EVOLUTION<span className="text-[#FF3B30]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-widest uppercase text-zinc-400">
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#offerings" className="hover:text-white transition-colors">Offerings</a>
          <a href="#schedule" className="hover:text-white transition-colors">Timetable</a>
          <a href="#pricing" className="hover:text-white transition-colors">Plans</a>
          <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          <Link href="/admin" className="text-[#FF3B30] border border-[#FF3B30]/30 hover:border-[#FF3B30] px-4 py-1.5 rounded transition-all bg-[#FF3B30]/5 hover:bg-[#FF3B30]/15">
            Admin Panel
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-4">
          <Link href="/admin" className="text-[10px] font-bold text-[#FF3B30] border border-[#FF3B30]/30 px-3 py-1 rounded">
            Admin
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400 hover:text-white">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 w-full bg-black/95 border-b border-white/10 z-40 px-8 py-6 flex flex-col gap-6 md:hidden uppercase tracking-widest text-[10px] font-bold text-zinc-400"
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">About</a>
            <a href="#offerings" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Offerings</a>
            <a href="#schedule" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Timetable</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Plans</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Contact</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section with Cinematic Video Background */}
      <section className="relative pt-36 pb-28 md:pt-56 md:pb-44 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted={videoMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none z-0"
        >
          <source src="/video" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay for Legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black pointer-events-none z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FF3B30]/5 rounded-full blur-[130px] pointer-events-none z-0" />

        {/* Video Audio Control */}
        <div className="absolute bottom-6 right-6 z-20">
          <button
            onClick={toggleMute}
            className="bg-black/75 hover:bg-black/90 text-white border border-white/10 px-4 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,0,0,0.5)]"
          >
            {videoMuted ? (
              <>
                <VolumeX className="h-4.5 w-4.5 text-[#FF3B30] animate-pulse" />
                Unmute Audio
              </>
            ) : (
              <>
                <Volume2 className="h-4.5 w-4.5 text-green-400" />
                Mute Audio
              </>
            )}
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-5 py-2 rounded-full text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest mb-8">
            <Sparkles className="h-3 w-3 animate-pulse" />
            Thane's Premier High-Performance Sanctuary
          </div>

          <h1 className="font-syncopate text-3xl sm:text-5xl md:text-7xl tracking-tighter text-white leading-none mb-8 font-bold">
            EVOLVE OR<br />
            <span className="text-outline-red">REMAIN THE SAME</span>
          </h1>

          <p className="max-w-2xl text-zinc-400 text-xs sm:text-base mb-12 leading-relaxed mx-auto">
            No shortcuts. No excuses. Just aggressive progression, elite strength equipment, advanced recovery saunas, and custom AI coach tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pass" className="bg-[#FF3B30] text-white hover:bg-red-600 px-8 py-4 rounded text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(255,59,48,0.35)]">
              Claim Free Day Pass
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#schedule" className="border border-white/20 hover:border-white px-8 py-4 rounded text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
              View Timetable
            </a>
          </div>
        </motion.div>
      </section>

      {/* Atmospheric Scrolling Marquee Ticker */}
      <div className="border-y border-white/5 bg-zinc-950/60 py-5 overflow-hidden select-none">
        <div className="marquee-container flex items-center">
          <div className="marquee-track flex gap-16 font-syncopate text-xs md:text-sm text-zinc-600 uppercase tracking-widest font-bold">
            <span>Lift Heavy</span> <span className="text-[#FF3B30]">•</span>
            <span>No Excuses</span> <span className="text-[#FF3B30]">•</span>
            <span>Evolve Or Remain The Same</span> <span className="text-[#FF3B30]">•</span>
            <span>Beast Mode</span> <span className="text-[#FF3B30]">•</span>
            <span>Infrared Recovery</span> <span className="text-[#FF3B30]">•</span>
            
            <span>Lift Heavy</span> <span className="text-[#FF3B30]">•</span>
            <span>No Excuses</span> <span className="text-[#FF3B30]">•</span>
            <span>Evolve Or Remain The Same</span> <span className="text-[#FF3B30]">•</span>
            <span>Beast Mode</span> <span className="text-[#FF3B30]">•</span>
            <span>Infrared Recovery</span> <span className="text-[#FF3B30]">•</span>
          </div>
        </div>
      </div>

      {/* Live Metrics Grid */}
      <section className="py-16 bg-black border-b border-white/5 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-4 border-r border-white/5 last:border-0">
            <div className="text-3xl md:text-4xl font-syncopate text-[#FF3B30] mb-3 font-bold">{settings.years_active}</div>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Years of Legacy</div>
          </div>
          <div className="p-4 border-r border-white/5 last:border-0">
            <div className="text-3xl md:text-4xl font-syncopate text-[#FF3B30] mb-3 font-bold">{settings.members_count}</div>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Thane Athletes</div>
          </div>
          <div className="p-4 border-r border-white/5 last:border-0">
            <div className="text-3xl md:text-4xl font-syncopate text-[#FF3B30] mb-3 font-bold flex justify-center items-center gap-1">
              {settings.google_rating} <Star className="h-5 w-5 fill-[#FF3B30] text-[#FF3B30]" />
            </div>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">Google Rating ({settings.google_reviews_count} Reviews)</div>
          </div>
          <div className="p-4">
            <div className="text-lg md:text-xl font-syncopate text-white mb-3 flex justify-center items-center gap-2 uppercase font-bold">
              <Clock className="h-4 w-4 text-[#FF3B30] animate-pulse" />
              Open Now
            </div>
            <div className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold">{settings.operating_hours}</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-28 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest mb-3">Our Creed</div>
          <h2 className="font-syncopate text-2xl md:text-4xl font-bold uppercase tracking-tight mb-8">
            WHO WE ARE
          </h2>
          <p className="text-zinc-400 mb-8 leading-relaxed text-sm">
            Established 8 years ago in Vartak Nagar, Thane West, Evolution Fitness was built for those who demand more from their training. We aren't a casual wellness center; we are a high-performance training ground.
          </p>
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="h-7 w-7 rounded bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">Industrial Grade Strength Gear</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Elite platforms, calibrated plates, and customized biomechanical isolation lines.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="h-7 w-7 rounded bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs tracking-wider">Elite Recovery Suite</h4>
                <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Infrared Saunas, compression therapy, and active sports tissue therapist access.</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Graphic Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="relative h-[380px] md:h-[480px] bg-zinc-950 border border-white/10 rounded-lg flex flex-col justify-end p-8 overflow-hidden group hover:border-[#FF3B30]/30 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#FF3B30]/5 rounded-full blur-[90px]" />
          <div className="z-20">
            <Award className="h-10 w-10 text-[#FF3B30] mb-5 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-syncopate text-lg tracking-wider mb-3 uppercase font-bold">NO BULLSHIT TRAINING</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We provide the atmosphere, the environment, and the tools. The rest is on you. Evolve your limits.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Offerings Section */}
      <section id="offerings" className="py-28 bg-zinc-950 border-y border-white/5 px-6">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <div className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest mb-3">Our Architecture</div>
          <h2 className="font-syncopate text-2xl md:text-4xl font-bold uppercase tracking-tight">
            WHAT WE OFFER
          </h2>
        </div>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            show: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8"
        >
          {[
            { title: "Strength & Hypertrophy", desc: "Heavy barbell plates, elite pin-selected resistance tracks, and dedicated deadlift platforms.", icon: Dumbbell },
            { title: "CrossFit & Conditioning", desc: "Endurance-focused workouts incorporating Rowers, Air Bikes, and structural barbell conditioning.", icon: Flame },
            { title: "Personal 1:1 Coaching", desc: "Custom training splits designed for your biomechanics by certified trainers.", icon: User },
            { title: "Infrared Sauna Recovery", desc: "Boost blood circulation, detoxify muscle tissue, and relieve joint tension in our sauna rooms.", icon: Sparkles },
            { title: "AI Macro Strategy", desc: "Dynamic nutrition targets customized to your daily physical logs via our AI Coach.", icon: MessageSquare },
            { title: "Sports Bodywork Therapy", desc: "Active soft tissue release, scraping therapies, and joint mobility drills.", icon: TrendingUp }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              whileHover={{ y: -5 }}
              className="p-8 bg-zinc-900/40 border border-white/10 rounded-lg hover:border-[#FF3B30]/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <item.icon className="h-7 w-7 text-[#FF3B30] mb-6 group-hover:rotate-12 transition-transform duration-300" />
                <h3 className="font-syncopate text-xs tracking-wider uppercase mb-4 text-white group-hover:text-[#FF3B30] transition-colors font-bold">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Schedule Timetable Section */}
      <section id="schedule" className="py-28 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20">
          <div>
            <div className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest mb-3">Live Calendar</div>
            <h2 className="font-syncopate text-2xl md:text-4xl font-bold uppercase tracking-tight">
              WEEKLY TIMETABLE
            </h2>
          </div>
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
            {weekdayNames.map((name, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest rounded transition-all ${
                  activeDayIndex === idx
                    ? "bg-[#FF3B30] text-white shadow-[0_0_15px_rgba(255,59,48,0.3)]"
                    : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                }`}
              >
                {name.substring(0, 3)}
              </button>
            ))}
          </div>
        </div>

        {/* Classes Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid gap-4"
        >
          {filteredClasses.length === 0 ? (
            <div className="p-10 text-center bg-zinc-950 border border-white/5 text-zinc-500 rounded-lg font-bold uppercase tracking-widest text-xs">
              No Group Classes Scheduled For This Day.
            </div>
          ) : (
            filteredClasses.map((item) => {
              const start = new Date(item.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const end = new Date(item.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const occupied = (item as any).bookingsCount || 0;
              const isFull = occupied >= item.maxCapacity;

              return (
                <div
                  key={item.id}
                  className="p-6 bg-zinc-950 border border-white/10 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="bg-[#FF3B30]/10 p-3.5 rounded text-[#FF3B30]">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-syncopate text-xs sm:text-sm tracking-wider uppercase text-white font-bold">{item.name}</h3>
                      <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold uppercase mt-2">
                        <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {item.trainerName}</span>
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {start} - {end}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-end">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">
                      Capacity: <span className={isFull ? "text-[#FF3B30]" : "text-white"}>{occupied}</span> / {item.maxCapacity} Slots
                    </div>
                    <button
                      onClick={() => {
                        if (!isFull) {
                          setSelectedClass(item);
                        }
                      }}
                      disabled={isFull}
                      className={`w-full sm:w-auto px-6 py-3 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
                        isFull
                          ? "bg-zinc-800 text-zinc-600 cursor-not-allowed"
                          : "bg-white text-black hover:bg-[#FF3B30] hover:text-white"
                      }`}
                    >
                      {isFull ? "Fully Booked" : "Book Slot"}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-28 bg-zinc-950 border-y border-white/5 px-6">
        <div className="max-w-6xl mx-auto text-center mb-20">
          <div className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest mb-3">Memberships</div>
          <h2 className="font-syncopate text-2xl md:text-4xl font-bold uppercase tracking-tight">
            CHOOSE YOUR LEVEL
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, idx) => {
            const settingVal = settings[plan.id];
            let details = { name: plan.defaultName, price: plan.defaultPrice, period: "month" };
            if (settingVal) {
              try {
                details = JSON.parse(settingVal);
              } catch (e) {}
            }

            const isPro = plan.id === "pricing_pro";

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className={`p-8 bg-zinc-900 border rounded-lg flex flex-col justify-between relative ${
                  isPro
                    ? "border-[#FF3B30] shadow-[0_0_35px_rgba(255,59,48,0.15)] md:scale-105 z-10"
                    : "border-white/10"
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF3B30] text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-syncopate text-xs tracking-wider uppercase mb-5 text-white font-bold">{details.name}</h3>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-3xl md:text-4xl font-syncopate text-[#FF3B30] font-bold">{details.price}</span>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">/ {details.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                        <Check className="h-3.5 w-3.5 text-[#FF3B30] shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="#pass" className={`w-full text-center py-4 rounded text-[9px] font-bold uppercase tracking-widest transition-all ${
                  isPro
                    ? "bg-[#FF3B30] text-white hover:bg-red-600"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}>
                  Select Level
                </a>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Day Pass Lead capture */}
      <section id="pass" className="py-28 px-6 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-zinc-950 border border-white/10 rounded-xl p-8 md:p-14 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FF3B30]/5 rounded-full blur-[70px] pointer-events-none" />

          <div className="text-center mb-12">
            <h2 className="font-syncopate text-xl md:text-3xl font-bold uppercase tracking-wide mb-4">CLAIM YOUR FREE TRIAL PASS</h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Enter your stats. Receive a 1-Day Trial Pass QR code instantly and sync with our AI Coach on WhatsApp.
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="space-y-6 max-w-lg mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Athlete Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-black border-b border-white/15 focus:border-[#FF3B30] outline-none text-xs text-white py-2.5 transition-all uppercase tracking-wider"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full bg-black border-b border-white/15 focus:border-[#FF3B30] outline-none text-xs text-white py-2.5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[9px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Fitness Goal</label>
              <select
                value={leadGoal}
                onChange={(e) => setLeadGoal(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 focus:border-[#FF3B30] outline-none text-xs text-white px-3 py-3 rounded transition-all uppercase tracking-wider font-bold text-zinc-400"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Endurance">Cardio / Conditioning</option>
                <option value="Recovery">Active Mobility & Recovery</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF3B30] hover:bg-red-600 text-white py-4 rounded text-[9px] font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(255,59,48,0.3)] transition-all flex items-center justify-center gap-2"
            >
              Get Free Pass QR
              <ArrowRight className="h-4 w-4" />
            </button>

            {leadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider text-center rounded-lg"
              >
                PASS ACTIVATED! We have logged your trial card. Show this page or check your WhatsApp for verification.
              </motion.div>
            )}

            {leadError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider text-center rounded-lg">
                {leadError}
              </div>
            )}
          </form>
        </motion.div>
      </section>

      {/* Map and Contact Section */}
      <section id="contact" className="py-28 bg-zinc-950 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="text-[10px] font-bold text-[#FF3B30] uppercase tracking-widest mb-3">Location Map</div>
            <h2 className="font-syncopate text-2xl md:text-4xl font-bold uppercase tracking-tight mb-8">
              THE TRAINING GROUND
            </h2>
            <div className="space-y-6 text-xs text-zinc-400 font-medium">
              <div className="flex gap-4">
                <MapPin className="h-5 w-5 text-[#FF3B30] shrink-0" />
                <p className="leading-relaxed">{settings.gym_address}</p>
              </div>
              <div className="flex gap-4">
                <Clock className="h-5 w-5 text-[#FF3B30] shrink-0" />
                <p className="leading-relaxed">Monday - Saturday: 5:00 AM - 11:00 PM<br />Sunday: 6:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* Map Frame */}
          <div className="h-[320px] border border-white/10 rounded-lg overflow-hidden relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3767.893673523588!2d72.9620719!3d19.2107779!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7b931e505a41d%3A0xe5a3bf73307567cb!2sEvolution%20Fitness!5e0!3m2!1sen!2sin!4v1781870992729!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0, filter: "grayscale(1) invert(0.9) contrast(1.2)" }}
              allowFullScreen
              loading="lazy"
            />
          </div>
        </div>
      </section>

      {/* Booking Dialog Modal */}
      <AnimatePresence>
        {selectedClass && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-white/15 p-8 rounded-lg relative"
            >
              <button
                onClick={() => setSelectedClass(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-syncopate text-xs tracking-wider uppercase mb-2 font-bold">Book Class Slot</h3>
              <p className="text-[10px] text-zinc-400 uppercase font-bold mb-6">
                {selectedClass.name} • {selectedClass.trainerName}
              </p>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Athlete Name"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none focus:border-[#FF3B30]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-zinc-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none focus:border-[#FF3B30]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold uppercase tracking-wider py-3 rounded text-[9px] transition-all shadow-[0_0_15px_rgba(255,59,48,0.2)]"
                >
                  Confirm Booking
                </button>

                {bookingSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-bold uppercase tracking-wider text-center rounded-lg">
                    SLOT RESERVED SUCCESSFULLY!
                  </div>
                )}

                {bookingError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider text-center rounded-lg">
                    {bookingError}
                  </div>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating AI Coach Button & Drawer */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              className="w-[320px] md:w-[360px] h-[460px] bg-zinc-900 border border-white/15 rounded-lg shadow-2xl flex flex-col justify-between mb-4 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#FF3B30] p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 animate-pulse text-white" />
                  <div>
                    <h4 className="font-syncopate text-[10px] font-bold tracking-wider uppercase text-white">AI Coach (Evolution AI)</h4>
                    <p className="text-[9px] uppercase tracking-widest text-red-100 font-bold">Online & Aggressive</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="text-white/70 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Message History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] p-3 rounded leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-zinc-800 text-white rounded-br-none"
                          : "bg-black/60 border border-white/15 text-zinc-300 rounded-bl-none font-medium"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-black/60 border border-white/15 rounded text-zinc-500 italic animate-pulse">
                      Coach is writing...
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex gap-2 font-sans">
                <input
                  type="text"
                  placeholder="Ask calories, routines..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-white/15 rounded px-3 py-2.5 text-xs outline-none focus:border-[#FF3B30] text-white"
                />
                <button type="submit" className="bg-[#FF3B30] hover:bg-red-600 text-white p-3 rounded shrink-0 transition-colors">
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons Row */}
        <div className="flex gap-3">
          {/* Floating WhatsApp Action Button */}
          <a
            href={`https://wa.me/919769763350?text=${encodeURIComponent(settings.whatsapp_template_message)}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="bg-[#25D366] text-white p-4 rounded-full shadow-[0_0_20px_rgba(37,211,102,0.3)] hover:scale-110 transition-all flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 16 16">
              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.949h.004c4.368 0 7.926-3.558 7.93-7.93a7.896 7.896 0 0 0-2.327-5.592zM7.994 14.52a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.69-1.703c-.2-.1-.1.185-.584-.329-.328-.348-.554-.654-.554-.654s-.022-.028-.002-.048c.15-.17.307-.383.457-.593.12-.17.13-.25.04-.36-.08-.11-.58-1.4-.79-1.91-.2-.5-.41-.42-.58-.42h-.42s-.36.02-.69.36c-.33.34-1.27 1.24-1.27 3.02 0 1.78 1.3 3.5 1.48 3.74.19.24 2.55 3.9 6.18 5.47.86.37 1.53.59 2.06.77.87.27 1.66.23 2.28.14.69-.1 2.11-.86 2.4-1.65.29-.79.29-1.47.2-1.61-.09-.13-.33-.2-.53-.3z"/>
            </svg>
          </a>

          {/* Floating AI Coach Toggle Button */}
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="bg-[#FF3B30] text-white p-4 rounded-full shadow-[0_0_20px_rgba(255,59,48,0.3)] hover:scale-110 transition-all flex items-center justify-center"
          >
            {chatOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
          </button>
        </div>
      </div>
    </div>
  );
}
