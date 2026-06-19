"use client";

import { useEffect, useState } from "react";
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
  Award
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
  // Mobile Nav State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
  const [activeDayIndex, setActiveDayIndex] = useState<number>(new Date().getDay()); // 0 = Sun, 1 = Mon ...
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

  // Fetch Settings and Schedule
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
          // Let's get real-time bookings count per class
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

  // Timetable filter helper
  const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  const filteredClasses = classes.filter((c) => {
    const classDay = new Date(c.startTime).getDay();
    return classDay === activeDayIndex;
  });

  // Handle Book Class Submit
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
        loadSchedule(); // reload classes to update capacity counter
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

  // Handle Free Day Pass Submit
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

  // Handle AI Coach message send
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
          phone: "+919999999999", // Sandbox demo phone
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

  // Pricing values from db
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
    <div className="bg-black text-white min-h-screen selection:bg-[#FF3B30] selection:text-white">
      {/* Sticky Header */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="h-7 w-7 text-[#FF3B30] rotate-45" />
          <span className="font-anton text-2xl tracking-wider text-white">
            EVOLUTION<span className="text-[#FF3B30]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold tracking-wider uppercase text-zinc-400">
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
          <Link href="/admin" className="text-xs text-[#FF3B30] border border-[#FF3B30]/30 px-3 py-1 rounded">
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
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-0 w-full bg-black/95 border-b border-white/10 z-40 px-8 py-6 flex flex-col gap-6 md:hidden uppercase tracking-wider text-sm font-bold text-zinc-400"
          >
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">About</a>
            <a href="#offerings" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Offerings</a>
            <a href="#schedule" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Timetable</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Plans</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-white">Contact</a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-48 md:pb-36 flex flex-col justify-center items-center text-center px-6 overflow-hidden">
        {/* Background Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FF3B30]/10 rounded-full blur-[120px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="z-10"
        >
          <div className="inline-flex items-center gap-2 bg-[#FF3B30]/10 border border-[#FF3B30]/30 px-4 py-1.5 rounded-full text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Thane's Premier High-Performance Sanctuary
          </div>

          <h1 className="font-anton text-5xl md:text-8xl tracking-wider text-white leading-none mb-6">
            EVOLVE OR<br />
            <span className="text-outline-red">REMAIN THE SAME</span>
          </h1>

          <p className="max-w-xl text-zinc-400 text-sm md:text-lg mb-8 leading-relaxed mx-auto">
            No shortcuts. No excuses. Just aggressive progression, elite strength equipment, advanced recovery saunas, and custom AI coach tracking.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="#pass" className="bg-[#FF3B30] text-white hover:bg-red-600 px-8 py-4 rounded font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(255,59,48,0.4)]">
              Claim Free Day Pass
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#schedule" className="border border-white/20 hover:border-white px-8 py-4 rounded font-bold uppercase tracking-wider hover:bg-white/5 transition-all">
              View Timetable
            </a>
          </div>
        </motion.div>
      </section>

      {/* Atmospheric Scrolling Marquee Ticker */}
      <div className="border-y border-white/10 bg-zinc-950 py-4 overflow-hidden select-none">
        <div className="marquee-container flex items-center">
          <div className="marquee-track flex gap-12 font-anton text-2xl md:text-4xl text-zinc-600 uppercase tracking-widest">
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
      <section className="py-12 bg-black border-b border-white/5 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="p-4 border-r border-white/5 last:border-0">
            <div className="text-3xl md:text-5xl font-anton text-[#FF3B30] mb-2">{settings.years_active}</div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Years of Legacy</div>
          </div>
          <div className="p-4 border-r border-white/5 last:border-0">
            <div className="text-3xl md:text-5xl font-anton text-[#FF3B30] mb-2">{settings.members_count}</div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Thane Athletes</div>
          </div>
          <div className="p-4 border-r border-white/5 last:border-0">
            <div className="text-3xl md:text-5xl font-anton text-[#FF3B30] mb-2 flex justify-center items-center gap-1">
              {settings.google_rating} <Star className="h-6 w-6 fill-[#FF3B30] text-[#FF3B30]" />
            </div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Google Rating ({settings.google_reviews_count} Reviews)</div>
          </div>
          <div className="p-4">
            <div className="text-xl md:text-2xl font-anton text-white mb-2 flex justify-center items-center gap-2 uppercase">
              <Clock className="h-5 w-5 text-[#FF3B30] animate-pulse" />
              Open Now
            </div>
            <div className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{settings.operating_hours}</div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 px-6 max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        <div>
          <div className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Our Creed</div>
          <h2 className="font-anton text-4xl md:text-6xl uppercase tracking-wider mb-6">
            WHO WE ARE
          </h2>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            Established 8 years ago in Vartak Nagar, Thane West, Evolution Fitness was built for those who demand more from their training. We aren't a casual wellness center; we are a high-performance training ground.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] mt-1 shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-sm">Industrial Grade Strength Gear</h4>
                <p className="text-xs text-zinc-500">Elite platforms, calibrated plates, and customized biomechanical isolation lines.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 rounded bg-[#FF3B30]/10 flex items-center justify-center text-[#FF3B30] mt-1 shrink-0">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-sm">Elite Recovery Suite</h4>
                <p className="text-xs text-zinc-500">Infrared Saunas, compression therapy, and active sports tissue therapist access.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Graphic Box */}
        <div className="relative h-[350px] md:h-[450px] bg-zinc-950 border border-white/10 rounded flex flex-col justify-end p-8 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#FF3B30]/5 rounded-full blur-[80px]" />
          <div className="z-20">
            <Award className="h-10 w-10 text-[#FF3B30] mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="font-anton text-2xl tracking-widest mb-2 uppercase">NO BULLSHIT TRAINING</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              We provide the atmosphere, the environment, and the tools. The rest is on you. Evolve your limits.
            </p>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section id="offerings" className="py-24 bg-zinc-950 border-y border-white/5 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Our Architecture</div>
          <h2 className="font-anton text-4xl md:text-6xl uppercase tracking-wider">
            WHAT WE OFFER
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { title: "Strength & Hypertrophy", desc: "Heavy barbell plates, elite pin-selected resistance tracks, and dedicated deadlift platforms.", icon: Dumbbell },
            { title: "CrossFit & Conditioning", desc: "Functional endurance classes, assault bikes, rowers, and kettlebells to build core capacity.", icon: Flame },
            { title: "Personal 1:1 Coaching", desc: "Dedicated high-performance trainers designing biomechanics programs tailored to your build.", icon: User },
            { title: "Infrared Sauna Recovery", desc: "Advanced dry saunas to boost deep-tissue recovery, circulation, and joint mobility post-lift.", icon: Sparkles },
            { title: "AI Macro Strategy", desc: "Interactive fitness goals and nutrition profiles tracking your gains via our automated assistant.", icon: MessageSquare },
            { title: "Sports Bodywork Therapy", desc: "In-house mobility coaches providing muscle scraping, scraping, and recovery alignments.", icon: TrendingUp }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="p-8 bg-zinc-900/60 border border-white/10 rounded hover:border-[#FF3B30]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <item.icon className="h-8 w-8 text-[#FF3B30] mb-6 group-hover:rotate-12 transition-transform duration-300" />
                <h3 className="font-anton text-xl tracking-widest uppercase mb-4 text-white group-hover:text-[#FF3B30] transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Schedule Timetable Section */}
      <section id="schedule" className="py-24 px-6 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
          <div>
            <div className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Live Calendar</div>
            <h2 className="font-anton text-4xl md:text-6xl uppercase tracking-wider">
              WEEKLY TIMETABLE
            </h2>
          </div>
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2 mt-6 md:mt-0">
            {weekdayNames.map((name, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${
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
        <div className="grid gap-4">
          {filteredClasses.length === 0 ? (
            <div className="p-8 text-center bg-zinc-950 border border-white/5 text-zinc-500 rounded font-semibold uppercase tracking-wider">
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
                  className="p-6 bg-zinc-950 border border-white/10 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:border-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#FF3B30]/10 p-3 rounded text-[#FF3B30]">
                      <Calendar className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-anton text-lg md:text-xl tracking-wider uppercase text-white">{item.name}</h3>
                      <div className="flex items-center gap-4 text-xs text-zinc-500 font-bold uppercase mt-1">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" /> {item.trainerName}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {start} - {end}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-end">
                    <div className="text-xs uppercase font-bold tracking-widest text-zinc-400">
                      Capacity: <span className={isFull ? "text-[#FF3B30]" : "text-white"}>{occupied}</span> / {item.maxCapacity} Slots
                    </div>
                    <button
                      onClick={() => {
                        if (!isFull) {
                          setSelectedClass(item);
                        }
                      }}
                      disabled={isFull}
                      className={`w-full sm:w-auto px-6 py-2.5 rounded text-xs font-bold uppercase tracking-widest transition-all ${
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
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-zinc-950 border-y border-white/5 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <div className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Memberships</div>
          <h2 className="font-anton text-4xl md:text-6xl uppercase tracking-wider">
            CHOOSE YOUR LEVEL
          </h2>
        </div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan, idx) => {
            // Read price from setting if stored dynamically
            const settingVal = settings[plan.id];
            let details = { name: plan.defaultName, price: plan.defaultPrice, period: "month" };
            if (settingVal) {
              try {
                details = JSON.parse(settingVal);
              } catch (e) {}
            }

            const isPro = plan.id === "pricing_pro";

            return (
              <div
                key={plan.id}
                className={`p-8 bg-zinc-900 border rounded flex flex-col justify-between relative ${
                  isPro
                    ? "border-[#FF3B30] shadow-[0_0_30px_rgba(255,59,48,0.15)] md:scale-105 z-10"
                    : "border-white/10"
                }`}
              >
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#FF3B30] text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-anton text-xl tracking-widest uppercase mb-4 text-white">{details.name}</h3>
                  <div className="mb-6 flex items-baseline gap-1">
                    <span className="text-4xl md:text-5xl font-anton text-[#FF3B30]">{details.price}</span>
                    <span className="text-xs text-zinc-500 font-bold uppercase">/ {details.period}</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-xs text-zinc-300 font-medium">
                        <Check className="h-4 w-4 text-[#FF3B30] shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href="#pass" className={`w-full text-center py-3.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                  isPro
                    ? "bg-[#FF3B30] text-white hover:bg-red-600"
                    : "bg-white text-black hover:bg-zinc-200"
                }`}>
                  Select Level
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Day Pass Lead capture */}
      <section id="pass" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="bg-zinc-950 border border-white/10 rounded-xl p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#FF3B30]/5 rounded-full blur-[60px] pointer-events-none" />

          <div className="text-center mb-10">
            <h2 className="font-anton text-3xl md:text-5xl uppercase tracking-widest mb-4">CLAIM YOUR FREE TRIAL PASS</h2>
            <p className="text-xs md:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
              Enter your stats. Receive a 1-Day Trial Pass QR code instantly and sync with our AI Coach on WhatsApp.
            </p>
          </div>

          <form onSubmit={handleLeadSubmit} className="space-y-6 max-w-xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Athlete Name"
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  className="w-full bg-black border-b border-white/15 focus:border-[#FF3B30] outline-none text-sm text-white py-2.5 transition-all uppercase tracking-wider"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Phone</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  className="w-full bg-black border-b border-white/15 focus:border-[#FF3B30] outline-none text-sm text-white py-2.5 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase tracking-wider font-bold text-zinc-500 mb-2">Fitness Goal</label>
              <select
                value={leadGoal}
                onChange={(e) => setLeadGoal(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 focus:border-[#FF3B30] outline-none text-sm text-white px-3 py-2.5 rounded transition-all uppercase tracking-wider font-bold text-zinc-400"
              >
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Endurance">Cardio / Conditioning</option>
                <option value="Recovery">Active Mobility & Recovery</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full bg-[#FF3B30] hover:bg-red-600 text-white py-4 rounded font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(255,59,48,0.3)] transition-all flex items-center justify-center gap-2"
            >
              Get Free Pass QR
              <ArrowRight className="h-4 w-4" />
            </button>

            {leadSuccess && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider text-center rounded"
              >
                PASS ACTIVATED! We have logged your trial card. Show this page or check your WhatsApp for verification.
              </motion.div>
            )}

            {leadError && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider text-center rounded">
                {leadError}
              </div>
            )}
          </form>
        </div>
      </section>

      {/* Map and Contact Section */}
      <section id="contact" className="py-24 bg-zinc-950 border-t border-white/5 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="text-xs font-bold text-[#FF3B30] uppercase tracking-widest mb-2">Location Map</div>
            <h2 className="font-anton text-4xl md:text-5xl uppercase tracking-wider mb-6">
              THE TRAINING GROUND
            </h2>
            <div className="space-y-6 text-sm text-zinc-400 font-medium">
              <div className="flex gap-4">
                <MapPin className="h-5 w-5 text-[#FF3B30] shrink-0" />
                <p>{settings.gym_address}</p>
              </div>
              <div className="flex gap-4">
                <Clock className="h-5 w-5 text-[#FF3B30]" />
                <p>Monday - Saturday: 5:00 AM - 11:00 PM<br />Sunday: 6:00 AM - 10:00 PM</p>
              </div>
            </div>
          </div>

          {/* Map Frame */}
          <div className="h-[300px] border border-white/10 rounded overflow-hidden relative">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-white/15 p-8 rounded relative"
            >
              <button
                onClick={() => setSelectedClass(null)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>

              <h3 className="font-anton text-2xl tracking-widest uppercase mb-2">Book Class Slot</h3>
              <p className="text-xs text-zinc-400 uppercase font-bold mb-6">
                {selectedClass.name} • {selectedClass.trainerName}
              </p>

              <form onSubmit={handleBookingSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Athlete Name"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-sm outline-none focus:border-[#FF3B30]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-sm outline-none focus:border-[#FF3B30]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold uppercase tracking-wider py-3 rounded text-xs transition-all shadow-[0_0_15px_rgba(255,59,48,0.2)]"
                >
                  Confirm Booking
                </button>

                {bookingSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider text-center rounded">
                    SLOT RESERVED SUCCESSFULLY!
                  </div>
                )}

                {bookingError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider text-center rounded">
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
              className="w-[320px] md:w-[360px] h-[450px] bg-zinc-900 border border-white/15 rounded-lg shadow-2xl flex flex-col justify-between mb-4 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-[#FF3B30] p-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 animate-pulse text-white" />
                  <div>
                    <h4 className="font-anton text-sm tracking-wider uppercase text-white">AI Coach (Evolution AI)</h4>
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
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex gap-2">
                <input
                  type="text"
                  placeholder="Ask macro calories, workouts..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-white/15 rounded px-3 py-2 text-xs outline-none focus:border-[#FF3B30] text-white"
                />
                <button type="submit" className="bg-[#FF3B30] hover:bg-red-600 text-white p-2.5 rounded shrink-0 transition-colors">
                  <Send className="h-4 w-4" />
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
