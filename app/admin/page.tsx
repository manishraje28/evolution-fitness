"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  UserCheck,
  Calendar,
  MessageSquare,
  Phone,
  Settings,
  Plus,
  Trash2,
  Check,
  Send,
  Loader2,
  ArrowLeft,
  X,
  FileText,
  MapPin,
  Clock,
  Star
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";

interface DashboardData {
  metrics: {
    totalLeads: number;
    contactedLeads: number;
    uncontactedLeads: number;
    totalMembers: number;
    totalBookings: number;
  };
  classOccupancy: Array<{
    id: string;
    name: string;
    trainer: string;
    maxCapacity: number;
    currentBookings: number;
    occupancyRate: number;
  }>;
  recentLeads: Array<{
    id: string;
    name: string;
    phone: string;
    fitnessGoal: string;
    createdAt: string;
    contacted: boolean;
  }>;
  recentBookings: Array<{
    id: string;
    user: { name: string; phone: string };
    class: { name: string };
    createdAt: string;
    status: string;
  }>;
  leadChartData: Array<{ date: string; Leads: number }>;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"stats" | "leads" | "timetable" | "whatsapp" | "settings">("stats");
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  // Timetable list & class creation states
  const [classes, setClasses] = useState<any[]>([]);
  const [newClassName, setNewClassName] = useState("");
  const [newTrainerName, setNewTrainerName] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("ALL_LEVELS");
  const [newMaxCapacity, setNewMaxCapacity] = useState("15");
  const [newClassDay, setNewClassDay] = useState("1"); // 1 = Monday
  const [newStartTime, setNewStartTime] = useState("07:00");
  const [newEndTime, setNewEndTime] = useState("08:00");

  // Settings states
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // WhatsApp Sandbox simulator states
  const [simPhone, setSimPhone] = useState("+919876543210");
  const [simName, setSimName] = useState("Rahul Sharma");
  const [simText, setSimText] = useState("");
  const [simLogs, setSimLogs] = useState<any[]>([]);
  const [simSending, setSimSending] = useState(false);

  // Load Dashboard Stats, timetable classes, and Settings
  useEffect(() => {
    fetchStats();
    fetchClasses();
    fetchSettings();
  }, []);

  // Poll simulator messages when active
  useEffect(() => {
    if (activeTab === "whatsapp") {
      fetchSimLogs();
      const interval = setInterval(fetchSimLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, simPhone]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    const res = await fetch("/api/schedule");
    const data = await res.json();
    if (Array.isArray(data)) setClasses(data);
  };

  const fetchSettings = async () => {
    const res = await fetch("/api/settings");
    const data = await res.json();
    setSettings(data);
  };

  const fetchSimLogs = async () => {
    const res = await fetch(`/api/whatsapp?phone=${encodeURIComponent(simPhone)}`);
    const data = await res.json();
    if (Array.isArray(data)) setSimLogs(data);
  };

  // Toggle contacted lead
  const toggleContacted = async (leadId: string, currentStatus: boolean) => {
    const res = await fetch("/api/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: leadId, contacted: !currentStatus })
    });
    if (res.ok) {
      fetchStats();
    }
  };

  // Create new class
  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Calculate actual dates based on the weekday offset from today
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sun, 1 = Mon ...
    const targetDayIndex = parseInt(newClassDay);
    
    let dayDiff = targetDayIndex - currentDay;
    if (dayDiff < 0) dayDiff += 7; // force next week

    const classDate = new Date();
    classDate.setDate(today.getDate() + dayDiff);

    const [startH, startM] = newStartTime.split(":");
    const [endH, endM] = newEndTime.split(":");

    const startDateTime = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), parseInt(startH), parseInt(startM));
    const endDateTime = new Date(classDate.getFullYear(), classDate.getMonth(), classDate.getDate(), parseInt(endH), parseInt(endM));

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newClassName,
        trainerName: newTrainerName,
        difficulty: newDifficulty,
        maxCapacity: newMaxCapacity,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString()
      })
    });

    if (res.ok) {
      setNewClassName("");
      setNewTrainerName("");
      fetchClasses();
      fetchStats(); // Update dashboard occupancy
    }
  };

  // Delete class
  const handleDeleteClass = async (classId: string) => {
    const res = await fetch(`/api/schedule?id=${classId}`, { method: "DELETE" });
    if (res.ok) {
      fetchClasses();
      fetchStats();
    }
  };

  // Save gym settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsSuccess(false);

    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings)
    });

    if (res.ok) {
      setSettingsSuccess(true);
      fetchSettings();
      setTimeout(() => setSettingsSuccess(false), 3000);
    }
  };

  const handleUpdateSettingField = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  // Send WhatsApp Sandbox Message
  const handleSendSimMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simText.trim()) return;

    setSimSending(true);
    const textMsg = simText;
    setSimText("");

    try {
      await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: simPhone,
          text: textMsg,
          userName: simName
        })
      });
      fetchSimLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setSimSending(false);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
        <Loader2 className="h-10 w-10 text-[#FF3B30] animate-spin mb-4" />
        <span className="text-xs uppercase tracking-widest font-bold text-zinc-500">Loading Evolution Dashboard...</span>
      </div>
    );
  }

  const { metrics, leadChartData, recentLeads, recentBookings, classOccupancy } = dashboardData;

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <header className="border-b border-white/10 bg-zinc-950 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 text-zinc-400 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest">
            <ArrowLeft className="h-4 w-4" /> Back to Gym Site
          </Link>
          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
          <h1 className="font-syncopate text-xl tracking-wider hidden sm:block">
            EVOLUTION <span className="text-[#FF3B30]">CONTROL HUB</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-glow-indicator" />
          <span className="text-xs uppercase tracking-wider font-bold text-zinc-400">Database Live</span>
        </div>
      </header>

      {/* Main Admin Grid */}
      <div className="flex flex-1 flex-col md:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-r border-white/10 bg-zinc-950 p-6 flex flex-col gap-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Core Management</div>
          <button
            onClick={() => setActiveTab("stats")}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${
              activeTab === "stats" ? "bg-[#FF3B30] text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Analytics & Stats
          </button>
          <button
            onClick={() => setActiveTab("leads")}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${
              activeTab === "leads" ? "bg-[#FF3B30] text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <UserCheck className="h-4 w-4" /> Leads Manager
          </button>
          <button
            onClick={() => setActiveTab("timetable")}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${
              activeTab === "timetable" ? "bg-[#FF3B30] text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Calendar className="h-4 w-4" /> Timetable Creator
          </button>
          <button
            onClick={() => setActiveTab("whatsapp")}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${
              activeTab === "whatsapp" ? "bg-[#FF3B30] text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <MessageSquare className="h-4 w-4" /> WhatsApp Sandbox
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full text-left px-4 py-3 rounded text-xs font-bold uppercase tracking-widest flex items-center gap-3 transition-all ${
              activeTab === "settings" ? "bg-[#FF3B30] text-white" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            <Settings className="h-4 w-4" /> System Settings
          </button>
        </aside>

        {/* Tab Contents */}
        <main className="flex-1 p-8 overflow-y-auto">
          {/* TAB 1: STATS & ANALYTICS */}
          {activeTab === "stats" && (
            <div className="space-y-8">
              {/* Metrics cards grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="p-6 bg-zinc-950 border border-white/10 rounded">
                  <div className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider mb-2">Total Website Leads</div>
                  <div className="text-3xl md:text-4xl font-syncopate text-white">{metrics.totalLeads}</div>
                </div>
                <div className="p-6 bg-zinc-950 border border-white/10 rounded">
                  <div className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider mb-2">Contacted Leads</div>
                  <div className="text-3xl md:text-4xl font-syncopate text-green-400">{metrics.contactedLeads}</div>
                </div>
                <div className="p-6 bg-zinc-950 border border-white/10 rounded">
                  <div className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider mb-2">Pending Leads</div>
                  <div className="text-3xl md:text-4xl font-syncopate text-[#FF3B30]">{metrics.uncontactedLeads}</div>
                </div>
                <div className="p-6 bg-zinc-950 border border-white/10 rounded">
                  <div className="text-zinc-500 font-bold uppercase text-[10px] tracking-wider mb-2">Confirmed Bookings</div>
                  <div className="text-3xl md:text-4xl font-syncopate text-blue-400">{metrics.totalBookings}</div>
                </div>
              </div>

              {/* Chart & Occupancy Row */}
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Signups Chart */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded lg:col-span-2">
                  <h3 className="font-syncopate text-lg tracking-widest uppercase mb-6">7-Day Leads Velocity</h3>
                  <div className="h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={leadChartData}>
                        <defs>
                          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#FF3B30" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="date" stroke="#52525b" fontSize={10} tickLine={false} />
                        <YAxis stroke="#52525b" fontSize={10} tickLine={false} />
                        <Tooltip contentStyle={{ backgroundColor: "#18181b", border: "1px solid #3f3f46" }} />
                        <Area type="monotone" dataKey="Leads" stroke="#FF3B30" strokeWidth={2} fillOpacity={1} fill="url(#colorLeads)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Class Occupancy list */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded flex flex-col justify-between">
                  <div>
                    <h3 className="font-syncopate text-lg tracking-widest uppercase mb-6">Group Class Occupancy</h3>
                    <div className="space-y-4">
                      {classOccupancy.slice(0, 4).map((c) => (
                        <div key={c.id} className="space-y-2">
                          <div className="flex justify-between text-xs font-bold uppercase">
                            <span className="text-white truncate max-w-[150px]">{c.name}</span>
                            <span className="text-zinc-400">{c.currentBookings} / {c.maxCapacity} slots</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${c.occupancyRate}%` }}
                              className={`h-full ${c.occupancyRate >= 90 ? "bg-red-500" : "bg-[#FF3B30]"}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button onClick={() => setActiveTab("timetable")} className="text-xs text-[#FF3B30] hover:underline font-bold uppercase tracking-wider text-left mt-4 block">
                    Manage Slots →
                  </button>
                </div>
              </div>

              {/* Recent activity feeds */}
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Recent leads */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded">
                  <h3 className="font-syncopate text-lg tracking-widest uppercase mb-4">Recent Leads</h3>
                  <div className="divide-y divide-white/5">
                    {recentLeads.length === 0 ? (
                      <p className="text-xs py-4 text-zinc-500">No leads captured yet.</p>
                    ) : (
                      recentLeads.map((l) => (
                        <div key={l.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-white uppercase">{l.name}</div>
                            <div className="text-zinc-500">{l.phone} • {l.fitnessGoal}</div>
                          </div>
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                            l.contacted ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {l.contacted ? "Contacted" : "Pending"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent bookings */}
                <div className="p-6 bg-zinc-950 border border-white/10 rounded">
                  <h3 className="font-syncopate text-lg tracking-widest uppercase mb-4">Recent Class Bookings</h3>
                  <div className="divide-y divide-white/5">
                    {recentBookings.length === 0 ? (
                      <p className="text-xs py-4 text-zinc-500">No bookings made yet.</p>
                    ) : (
                      recentBookings.map((b) => (
                        <div key={b.id} className="py-3 flex justify-between items-center text-xs">
                          <div>
                            <div className="font-bold text-white uppercase">{b.user.name}</div>
                            <div className="text-zinc-500">Booked {b.class.name}</div>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-bold">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LEADS LIST */}
          {activeTab === "leads" && (
            <div className="p-6 bg-zinc-950 border border-white/10 rounded">
              <h3 className="font-syncopate text-xl tracking-widest uppercase mb-6">Website Trial Pass Leads</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/15 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-4 px-4">Name</th>
                      <th className="py-4 px-4">Phone</th>
                      <th className="py-4 px-4">Fitness Goal</th>
                      <th className="py-4 px-4">Date Registered</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentLeads.map((l) => (
                      <tr key={l.id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-4 font-bold text-white uppercase">{l.name}</td>
                        <td className="py-4 px-4 font-semibold text-zinc-300">{l.phone}</td>
                        <td className="py-4 px-4 uppercase text-zinc-400 font-bold">{l.fitnessGoal}</td>
                        <td className="py-4 px-4 text-zinc-500">{new Date(l.createdAt).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                            l.contacted ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {l.contacted ? "Contacted" : "Pending"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => toggleContacted(l.id, l.contacted)}
                            className="bg-zinc-900 border border-white/10 hover:border-[#FF3B30] text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded transition-all"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TIMETABLE MANAGER */}
          {activeTab === "timetable" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Creator Form */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded h-fit">
                <h3 className="font-syncopate text-lg tracking-widest uppercase mb-6">Create Class Slot</h3>
                <form onSubmit={handleCreateClass} className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Class Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CrossFit WOD"
                      value={newClassName}
                      onChange={(e) => setNewClassName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-[#FF3B30]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Trainer Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Coach Rohan"
                      value={newTrainerName}
                      onChange={(e) => setNewTrainerName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-[#FF3B30]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Difficulty</label>
                      <select
                        value={newDifficulty}
                        onChange={(e) => setNewDifficulty(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-2 text-xs outline-none focus:border-[#FF3B30]"
                      >
                        <option value="ALL_LEVELS">ALL LEVELS</option>
                        <option value="INTERMEDIATE">INTERMEDIATE</option>
                        <option value="ADVANCED">ADVANCED</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Max Capacity</label>
                      <input
                        type="number"
                        required
                        value={newMaxCapacity}
                        onChange={(e) => setNewMaxCapacity(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-3 py-2 text-xs outline-none focus:border-[#FF3B30]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-3">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Weekly Day</label>
                      <select
                        value={newClassDay}
                        onChange={(e) => setNewClassDay(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-2 text-xs outline-none"
                      >
                        <option value="1">Monday</option>
                        <option value="2">Tuesday</option>
                        <option value="3">Wednesday</option>
                        <option value="4">Thursday</option>
                        <option value="5">Friday</option>
                        <option value="6">Saturday</option>
                        <option value="0">Sunday</option>
                      </select>
                    </div>
                    <div className="col-span-1.5">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Start Time</label>
                      <input
                        type="time"
                        required
                        value={newStartTime}
                        onChange={(e) => setNewStartTime(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-2 text-xs text-white"
                      />
                    </div>
                    <div className="col-span-1.5">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">End Time</label>
                      <input
                        type="time"
                        required
                        value={newEndTime}
                        onChange={(e) => setNewEndTime(e.target.value)}
                        className="w-full bg-black border border-white/10 rounded px-2 py-2 text-xs text-white"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-[#FF3B30] hover:bg-red-600 text-white font-bold uppercase tracking-wider py-3 rounded text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="h-4 w-4" /> Add Class Slot
                  </button>
                </form>
              </div>

              {/* Class Lists Table */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded lg:col-span-2">
                <h3 className="font-syncopate text-lg tracking-widest uppercase mb-6 font-bold">Scheduled Classes</h3>
                <div className="space-y-3">
                  {classes.map((c) => {
                    const startStr = new Date(c.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const endStr = new Date(c.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date(c.startTime).getDay()];

                    return (
                      <div key={c.id} className="p-4 bg-zinc-900 border border-white/5 rounded flex justify-between items-center">
                        <div>
                          <div className="font-bold text-white uppercase text-xs">{c.name}</div>
                          <div className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
                            {weekday} • {startStr} - {endStr} | {c.trainerName}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteClass(c.id)}
                          className="text-zinc-500 hover:text-[#FF3B30] p-2 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WHATSAPP SIMULATOR */}
          {activeTab === "whatsapp" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Simulator settings */}
              <div className="p-6 bg-zinc-950 border border-white/10 rounded h-fit">
                <h3 className="font-syncopate text-lg tracking-widest uppercase mb-6">WhatsApp Test Bench</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Sender Name (Simulated)</label>
                    <input
                      type="text"
                      value={simName}
                      onChange={(e) => setSimName(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-1">Phone Number (Simulated)</label>
                    <input
                      type="text"
                      value={simPhone}
                      onChange={(e) => setSimPhone(e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none"
                    />
                  </div>
                  <div className="p-4 bg-zinc-900 border border-white/5 rounded text-[10px] text-zinc-400 leading-relaxed uppercase">
                    <strong>Testing Guide:</strong> Type keywords in the chat screen on the right:
                    <ul className="list-disc pl-4 mt-2 space-y-1 font-bold">
                      <li>"hi" / "hello" to greet the bot.</li>
                      <li>"workout" to request userGoal workout recommendations.</li>
                      <li>"macro" / "diet" to calculate custom target metrics.</li>
                      <li>"sauna" / "recovery" to suggest sore treatments.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Chat screen */}
              <div className="lg:col-span-2 bg-zinc-950 border border-white/15 rounded flex flex-col h-[520px] justify-between overflow-hidden">
                <div className="bg-[#075E54] p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-zinc-800 rounded-full border border-white/10 flex items-center justify-center text-white font-anton text-sm">
                      EV
                    </div>
                    <div>
                      <h4 className="font-anton text-sm tracking-wider uppercase text-white">Evolution Fitness Bot</h4>
                      <p className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest">WhatsApp Sandbox Agent</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-100/75 tracking-wider bg-black/20 px-3 py-1 rounded-full">
                    Active Phone: {simPhone}
                  </span>
                </div>

                {/* Logs lists */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-zinc-950">
                  {simLogs.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`p-3 rounded text-xs leading-relaxed max-w-[75%] ${
                        msg.sender === "user"
                          ? "bg-[#056162] text-white rounded-tr-none"
                          : "bg-[#262d31] text-zinc-200 border border-white/5 rounded-tl-none font-medium"
                      }`}>
                        {msg.text}
                        <div className="text-[8px] text-zinc-400 text-right mt-1">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Sender form */}
                <form onSubmit={handleSendSimMessage} className="p-3 border-t border-white/10 bg-zinc-900/60 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Type message as ${simName}...`}
                    value={simText}
                    onChange={(e) => setSimText(e.target.value)}
                    className="flex-1 bg-black border border-white/10 rounded px-4 py-3 text-xs outline-none text-white focus:border-[#FF3B30]"
                  />
                  <button
                    type="submit"
                    disabled={simSending}
                    className="bg-[#075E54] hover:bg-emerald-700 text-white px-5 rounded flex items-center justify-center shrink-0 transition-colors"
                  >
                    {simSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM SETTINGS EDITOR */}
          {activeTab === "settings" && (
            <div className="p-6 bg-zinc-950 border border-white/10 rounded max-w-3xl">
              <h3 className="font-anton text-lg tracking-widest uppercase mb-6">Edit Gym Ecosystem Configs</h3>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Gym Name</label>
                    <input
                      type="text"
                      value={settings.gym_name || ""}
                      onChange={(e) => handleUpdateSettingField("gym_name", e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Gym Contact Number</label>
                    <input
                      type="text"
                      value={settings.gym_phone || ""}
                      onChange={(e) => handleUpdateSettingField("gym_phone", e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Gym Physical Address</label>
                  <input
                    type="text"
                    value={settings.gym_address || ""}
                    onChange={(e) => handleUpdateSettingField("gym_address", e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none text-white"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Google Star Rating</label>
                    <input
                      type="text"
                      value={settings.google_rating || ""}
                      onChange={(e) => handleUpdateSettingField("google_rating", e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Google Reviews Count</label>
                    <input
                      type="text"
                      value={settings.google_reviews_count || ""}
                      onChange={(e) => handleUpdateSettingField("google_reviews_count", e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Operating Hours</label>
                    <input
                      type="text"
                      value={settings.operating_hours || ""}
                      onChange={(e) => handleUpdateSettingField("operating_hours", e.target.value)}
                      className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-zinc-500 mb-2">Default WhatsApp Pre-filled Message</label>
                  <input
                    type="text"
                    value={settings.whatsapp_template_message || ""}
                    onChange={(e) => handleUpdateSettingField("whatsapp_template_message", e.target.value)}
                    className="w-full bg-black border border-white/10 rounded px-3 py-2.5 text-xs outline-none text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="bg-[#FF3B30] hover:bg-red-600 text-white font-bold uppercase tracking-wider px-8 py-3 rounded text-xs transition-all shadow-[0_0_15px_rgba(255,59,48,0.2)]"
                >
                  Save Configuration
                </button>

                {settingsSuccess && (
                  <div className="p-3 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-bold uppercase tracking-wider text-center rounded">
                    SETTINGS SAVED SUCCESSFULLY AND APPLIED IN REAL-TIME!
                  </div>
                )}
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
