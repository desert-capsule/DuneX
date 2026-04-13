import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Activity, Battery, Droplets, LayoutDashboard,
  Settings, Sun, Users, Video, Cpu, CalendarCheck,
  GraduationCap, Wrench, ChevronRight, AlertTriangle,
  CheckCircle, Clock, Wifi, Thermometer, Zap,
  BarChart2, Shield, Camera, Menu, X, Home, Globe,
  BookOpen, UserCircle, Trash2, Plus, Eye, EyeOff, Lock, Pencil,
  Star, MessageSquare, Loader2
} from "lucide-react";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, Legend, LineChart, Line
} from "recharts";
import { capsulesData, dashboardStats } from "@/data/mockData";
import logoPath from "@assets/e11b493c-2b8a-480b-b05e-415585d9ed79_1775877456770.png";
import capsulePhotoPath from "@assets/67b685d41ee6ad3416ec720c_IMG_2705-s_1775877411797.jpg";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/i18n/translations";

/* ─── API ─── */
const API = "/api";

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${API}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(opts?.headers || {}) },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || "Request failed");
  }
  return res.json();
}

/* ─── STATIC MOCK DATA ─── */

const energyData = Array.from({ length: 24 }).map((_, i) => ({
  time: `${String(i).padStart(2, "0")}:00`,
  solar: +(Math.max(0, Math.sin((i - 6) * Math.PI / 12) * 100) + (Math.random() * 8)).toFixed(1),
  consumption: +(30 + (Math.random() * 18) + (i > 18 || i < 8 ? 22 : 0)).toFixed(1),
  battery: +(40 + Math.sin(i * 0.4) * 30 + (Math.random() * 5)).toFixed(1),
}));

const weeklyOccupancy = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => ({
  day,
  occupied: [12, 15, 14, 18, 19, 20, 17][i],
  available: [8, 5, 6, 2, 1, 0, 3][i],
}));

const capsuleTypePie = [
  { name: "Royal Dome", value: 4 },
  { name: "Family Suite", value: 6 },
  { name: "Standard Pod", value: 10 },
];
const PIE_COLORS = ["#C9961A", "#F9D423", "#6B4F12"];

const reservationsData = [
  { id: "RES-001", guest: "Amira Talbi", capsule: "Capsule 01", checkin: "2026-04-12", checkout: "2026-04-15", status: "Confirmed", amount: 1500 },
  { id: "RES-002", guest: "James Okafor", capsule: "Capsule 07", checkin: "2026-04-13", checkout: "2026-04-14", status: "Pending", amount: 150 },
  { id: "RES-003", guest: "Sophie Durand", capsule: "Capsule 12", checkin: "2026-04-11", checkout: "2026-04-13", status: "Active", amount: 700 },
  { id: "RES-004", guest: "Khalid Al-Rashid", capsule: "Capsule 04", checkin: "2026-04-15", checkout: "2026-04-18", status: "Confirmed", amount: 1050 },
  { id: "RES-005", guest: "Lena Müller", capsule: "Capsule 18", checkin: "2026-04-10", checkout: "2026-04-12", status: "Completed", amount: 300 },
  { id: "RES-006", guest: "Carlos Reyes", capsule: "Capsule 09", checkin: "2026-04-16", checkout: "2026-04-20", status: "Confirmed", amount: 600 },
  { id: "RES-007", guest: "Nadia Bensalem", capsule: "Capsule 03", checkin: "2026-04-11", checkout: "2026-04-14", status: "Active", amount: 450 },
];

const sensorsData = capsulesData.map((cap, i) => ({
  id: `SEN-${String(i + 1).padStart(3, "0")}`,
  capsule: cap.name,
  temperature: cap.temperature.toFixed(1),
  humidity: (35 + Math.random() * 20).toFixed(0),
  solar: cap.solarEnergy,
  battery: (60 + Math.random() * 40).toFixed(0),
  wifi: Math.random() > 0.05 ? "Online" : "Offline",
  lastPing: `${Math.floor(Math.random() * 60)}s ago`,
}));

const maintenanceAlerts = [
  { id: "MNT-001", type: "Critical", capsule: "Capsule 14", issue: "Sensor array sync failure — temperature readings unavailable", tech: "Bilal Haddad", reported: "10 min ago", status: "Open" },
  { id: "MNT-002", type: "Warning", capsule: "Sector Beta (Caps 11-15)", issue: "Solar panel efficiency drop — dust accumulation detected", tech: "Mariam Zahra", reported: "1 hr ago", status: "In Progress" },
  { id: "MNT-003", type: "Info", capsule: "Capsule 03", issue: "Check-in completed, routine inspection scheduled", tech: "Youssef Hamdi", reported: "2 hr ago", status: "Resolved" },
  { id: "MNT-004", type: "Warning", capsule: "Capsule 08", issue: "Water recycling pump pressure below threshold", tech: "Amine Cherif", reported: "3 hr ago", status: "In Progress" },
  { id: "MNT-005", type: "Critical", capsule: "Capsule 19", issue: "Climate control unresponsive — manual override required", tech: "Bilal Haddad", reported: "5 hr ago", status: "Open" },
  { id: "MNT-006", type: "Info", capsule: "Capsule 06", issue: "Battery bank swapped successfully, full charge in 2h", tech: "Mariam Zahra", reported: "6 hr ago", status: "Resolved" },
  { id: "MNT-007", type: "Warning", capsule: "Capsule 12", issue: "Skylight actuator making noise during open cycle", tech: "Youssef Hamdi", reported: "8 hr ago", status: "Open" },
];

const securityCameras = [
  { id: "CAM-01", label: "North Perimeter", zone: "Perimeter", status: "Online", motion: false },
  { id: "CAM-02", label: "Main Entrance", zone: "Entrance", status: "Online", motion: true },
  { id: "CAM-03", label: "East Walkway", zone: "Pathway", status: "Online", motion: false },
  { id: "CAM-04", label: "Capsule Cluster A", zone: "Residential", status: "Online", motion: false },
  { id: "CAM-05", label: "Solar Array Zone", zone: "Energy", status: "Online", motion: false },
  { id: "CAM-06", label: "West Perimeter", zone: "Perimeter", status: "Offline", motion: false },
  { id: "CAM-07", label: "Reception Hub", zone: "Operations", status: "Online", motion: true },
  { id: "CAM-08", label: "Capsule Cluster B", zone: "Residential", status: "Online", motion: false },
];

const solarPanels = Array.from({ length: 8 }).map((_, i) => ({
  id: `SP-${String(i + 1).padStart(2, "0")}`,
  label: `Array ${String.fromCharCode(65 + i)}`,
  output: +(85 + Math.random() * 15).toFixed(1),
  efficiency: +(78 + Math.random() * 20).toFixed(1),
  temp: +(55 + Math.random() * 10).toFixed(1),
  status: Math.random() > 0.1 ? "Optimal" : "Degraded",
}));

/* ─── NAV CONFIG ─── */
type NavSection = "overview" | "energy" | "occupancy" | "sensors" | "reservations" | "students" | "maintenance" | "security" | "accounts" | "reviews" | "settings";

/* ─── HELPERS ─── */
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Online: "bg-green-500/10 text-green-400 border-green-500/30",
    Offline: "bg-red-500/10 text-red-400 border-red-500/30",
    Optimal: "bg-green-500/10 text-green-400 border-green-500/30",
    Degraded: "bg-red-500/10 text-red-400 border-red-500/30",
    Confirmed: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Active: "bg-green-500/10 text-green-400 border-green-500/30",
    Completed: "bg-muted/30 text-muted-foreground border-white/10",
    Available: "bg-green-500/10 text-green-400 border-green-500/30",
    Borrowed: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    "On Duty": "bg-green-500/10 text-green-400 border-green-500/30",
    "Off Duty": "bg-muted/30 text-muted-foreground border-white/10",
    "On Leave": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Open: "bg-red-500/10 text-red-400 border-red-500/30",
    "In Progress": "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Resolved: "bg-green-500/10 text-green-400 border-green-500/30",
    Critical: "bg-red-500/10 text-red-400 border-red-500/30",
    Warning: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    Info: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Admin: "bg-primary/10 text-primary border-primary/30",
    Operator: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    Viewer: "bg-muted/30 text-muted-foreground border-white/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] border font-mono ${map[status] ?? "bg-white/5 text-white border-white/10"}`}>
      {status.toUpperCase()}
    </span>
  );
}

type D = ReturnType<typeof useLanguage>["t"]["dashboard"];

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold text-white tracking-widest">{title}</h2>
      {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
    </div>
  );
}

/* ─── FIELD COMPONENT ─── */
function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[10px] tracking-widest text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* ─── SECTION COMPONENTS ─── */

function OverviewSection({ mounted, d }: { mounted: boolean; d: D }) {
  const ov = d.overview;
  return (
    <div>
      <SectionHeader title={ov.title} subtitle={ov.sub} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: ov.gridLoad, value: "42.5 kW", sub: "+2.4% vs yesterday", icon: Activity, color: "text-primary", subColor: "text-green-400" },
          { label: ov.solarOut, value: `${dashboardStats.totalEnergyGenerated} kWh`, sub: ov.peakEff, icon: Sun, color: "text-yellow-400", subColor: "text-muted-foreground" },
          { label: ov.waterRec, value: `${dashboardStats.waterRecycled} L`, sub: ov.recoveryRate, icon: Droplets, color: "text-blue-400", subColor: "text-green-400" },
          { label: ov.activeSensors, value: String(dashboardStats.activeSensors), sub: ov.errorsReport, icon: Battery, color: "text-primary", subColor: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-muted-foreground tracking-widest">{s.label}</span>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div className="text-2xl font-mono text-white">{s.value}</div>
              <div className={`text-[10px] mt-1 ${s.subColor}`}>{s.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs font-normal text-muted-foreground tracking-widest flex justify-between">
                <span>{ov.energyChart}</span>
                <span className="text-green-400 animate-pulse">● {ov.live}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 h-[260px]">
              {mounted && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={energyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gSolar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F9D423" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#F9D423" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gCons" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                    <XAxis dataKey="time" stroke="#555" fontSize={9} interval={3} />
                    <YAxis stroke="#555" fontSize={9} tickFormatter={(v) => `${v}kW`} />
                    <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", fontSize: 11 }} itemStyle={{ color: "#fff" }} />
                    <Area type="monotone" dataKey="solar" name="Solar" stroke="#F9D423" fill="url(#gSolar)" />
                    <Area type="monotone" dataKey="consumption" name="Load" stroke="#ef4444" fill="url(#gCons)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs font-normal text-muted-foreground tracking-widest">{ov.capStatus}</CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[300px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 text-muted-foreground">
                  <tr>
                    <th className="text-left font-normal p-3">{ov.unit}</th>
                    <th className="text-left font-normal p-3">{ov.type}</th>
                    <th className="text-left font-normal p-3">{ov.status}</th>
                    <th className="text-right font-normal p-3">{ov.temp}</th>
                    <th className="text-right font-normal p-3">{ov.solar}</th>
                  </tr>
                </thead>
                <tbody>
                  {capsulesData.map((cap) => (
                    <tr key={cap.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-3 text-white font-mono">{cap.name}</td>
                      <td className="p-3 text-muted-foreground">{cap.type}</td>
                      <td className="p-3"><StatusBadge status={cap.status} /></td>
                      <td className="p-3 text-right text-white font-mono">{cap.temperature.toFixed(1)}°C</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-white font-mono">{cap.solarEnergy}%</span>
                          <div className="w-14 h-1 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-yellow-400" style={{ width: `${cap.solarEnergy}%` }} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs font-normal text-muted-foreground tracking-widest">{ov.capDist}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {capsuleTypePie.map((item, i) => (
                <div key={item.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{item.name}</span>
                    <span className="text-white font-mono">{item.value} units</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(item.value / 20) * 100}%`, backgroundColor: PIE_COLORS[i] }} />
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t border-white/5 flex justify-between text-[10px]">
                <span className="text-muted-foreground">{ov.total}</span>
                <span className="text-white font-mono">{ov.totalCaps}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs font-normal text-muted-foreground tracking-widest">{ov.alerts}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {maintenanceAlerts.filter(a => a.status !== "Resolved").slice(0, 4).map((a) => (
                <div key={a.id} className="flex gap-3 text-xs">
                  <div className={`mt-0.5 ${a.type === "Critical" ? "text-red-400" : a.type === "Warning" ? "text-yellow-400" : "text-blue-400"}`}>
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white">{a.issue.split("—")[0].trim()}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{a.capsule} • {a.reported}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none h-[180px] relative overflow-hidden">
            <div className="absolute inset-0 bg-black/60 z-10 flex items-end p-3">
              <p className="text-[10px] text-white/70 font-mono tracking-widest">CAM-02 — MAIN ENTRANCE</p>
            </div>
            <img src={capsulePhotoPath} alt="Security feed" className="w-full h-full object-cover opacity-30 grayscale" />
            <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] text-white font-mono">REC</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function EnergySection({ mounted, d }: { mounted: boolean; d: D }) {
  const en = d.energy;
  return (
    <div>
      <SectionHeader title={en.title} subtitle={en.sub} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL GENERATED", value: "1,450 kWh", sub: "Today", color: "text-yellow-400" },
          { label: en.battery, value: "78%", sub: "1,248 / 1,600 kWh", color: "text-green-400" },
          { label: en.export, value: "320 kWh", sub: "Sold to local grid", color: "text-blue-400" },
          { label: en.co2, value: "0.87 t", sub: "Equivalent avoided", color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card className="bg-[#111] border-white/10 rounded-none">
          <CardHeader className="p-4 border-b border-white/5">
            <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">24H GENERATION vs CONSUMPTION</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[260px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={energyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gS2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F9D423" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#F9D423" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gC2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="time" stroke="#555" fontSize={9} interval={3} />
                  <YAxis stroke="#555" fontSize={9} tickFormatter={(v) => `${v}kW`} />
                  <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", fontSize: 11 }} itemStyle={{ color: "#fff" }} />
                  <Area type="monotone" dataKey="solar" name="Solar Gen" stroke="#F9D423" fill="url(#gS2)" />
                  <Area type="monotone" dataKey="consumption" name="Consumption" stroke="#ef4444" fill="url(#gC2)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#111] border-white/10 rounded-none">
          <CardHeader className="p-4 border-b border-white/5">
            <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">{en.battery} — 24H</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[260px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={energyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="time" stroke="#555" fontSize={9} interval={3} />
                  <YAxis stroke="#555" fontSize={9} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", fontSize: 11 }} itemStyle={{ color: "#fff" }} />
                  <Line type="monotone" dataKey="battery" name="Battery %" stroke="#22c55e" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="bg-[#111] border-white/10 rounded-none">
        <CardHeader className="p-4 border-b border-white/5">
          <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">{en.panelArray} — 8 PANELS</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-xs">
            <thead className="border-b border-white/10 text-muted-foreground bg-[#0d0d0d]">
              <tr>
                <th className="text-left font-normal p-3">{en.panelId}</th>
                <th className="text-left font-normal p-3">ARRAY</th>
                <th className="text-right font-normal p-3">{en.output}</th>
                <th className="text-right font-normal p-3">{en.efficiency}</th>
                <th className="text-right font-normal p-3">{en.voltage}</th>
                <th className="text-right font-normal p-3">{en.status}</th>
              </tr>
            </thead>
            <tbody>
              {solarPanels.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-3 text-muted-foreground font-mono">{p.id}</td>
                  <td className="p-3 text-white">{p.label}</td>
                  <td className="p-3 text-right text-yellow-400 font-mono">{p.output} kW</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-white font-mono">{p.efficiency}%</span>
                      <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{ width: `${p.efficiency}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right text-red-300 font-mono">{p.temp}°C</td>
                  <td className="p-3 text-right"><StatusBadge status={p.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function OccupancySection({ mounted, d }: { mounted: boolean; d: D }) {
  const oc = d.occupancy;
  const booked = capsulesData.filter(c => c.status === "Booked").length;
  const available = 20 - booked;
  return (
    <div>
      <SectionHeader title={oc.title} subtitle={oc.sub} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL CAPSULES", value: "20", sub: "Operational units", color: "text-white" },
          { label: oc.rate, value: String(booked), sub: `${Math.round((booked / 20) * 100)}% ${oc.rate.toLowerCase()}`, color: "text-yellow-400" },
          { label: oc.available, value: String(available), sub: "Ready for booking", color: "text-green-400" },
          { label: "WEEKLY REVENUE", value: "$18,450", sub: "+12% vs last week", color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card className="bg-[#111] border-white/10 rounded-none">
          <CardHeader className="p-4 border-b border-white/5">
            <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">{oc.weeklyTitle}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[260px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyOccupancy} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="day" stroke="#555" fontSize={10} />
                  <YAxis stroke="#555" fontSize={10} domain={[0, 20]} />
                  <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", fontSize: 11 }} itemStyle={{ color: "#fff" }} />
                  <Bar dataKey="occupied" name={oc.occupied} stackId="a" fill="#C9961A" />
                  <Bar dataKey="available" name={oc.available} stackId="a" fill="#2a2a2a" radius={[2, 2, 0, 0]} />
                  <Legend iconSize={8} iconType="square" wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card className="bg-[#111] border-white/10 rounded-none">
          <CardHeader className="p-4 border-b border-white/5">
            <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">{oc.capType}</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[260px]">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={capsuleTypePie} cx="50%" cy="50%" outerRadius={90} dataKey="value" paddingAngle={3}>
                    {capsuleTypePie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0a0a0a", border: "1px solid #333", fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="bg-[#111] border-white/10 rounded-none">
        <CardHeader className="p-4 border-b border-white/5">
          <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">{oc.mapTitle}</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {capsulesData.map((cap, i) => (
              <div key={cap.id} title={`${cap.name}: ${cap.status}`} className={`aspect-square rounded-sm flex items-center justify-center text-[9px] font-mono cursor-pointer transition-all hover:scale-110 ${cap.status === "Booked" ? "bg-yellow-400/20 border border-yellow-400/40 text-yellow-400" : "bg-green-500/10 border border-green-500/30 text-green-400"}`}>
                {String(i + 1).padStart(2, "0")}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/20 border border-green-500/30 inline-block" /> {oc.available}</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-400/20 border border-yellow-400/40 inline-block" /> {oc.occupied}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function SensorsSection({ d }: { d: D }) {
  const se = d.sensors;
  return (
    <div>
      <SectionHeader title={se.title} subtitle={se.sub} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL SENSORS", value: "412", sub: "Active across camp", icon: Cpu, color: "text-primary" },
          { label: "ONLINE", value: "410", sub: "99.5% uptime", icon: Wifi, color: "text-green-400" },
          { label: "AVG TEMPERATURE", value: "22.3°C", sub: "Inside capsules", icon: Thermometer, color: "text-yellow-400" },
          { label: "ALERTS", value: "2", sub: "Require attention", icon: AlertTriangle, color: "text-red-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <p className="text-[10px] text-muted-foreground tracking-widest">{s.label}</p>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="bg-[#111] border-white/10 rounded-none">
        <CardHeader className="p-4 border-b border-white/5">
          <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">CAPSULE SENSOR READINGS — ALL UNITS</CardTitle>
        </CardHeader>
        <CardContent className="p-0 max-h-[500px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#0d0d0d] border-b border-white/10 text-muted-foreground">
              <tr>
                <th className="text-left font-normal p-3">ID</th>
                <th className="text-left font-normal p-3">{se.capsule}</th>
                <th className="text-right font-normal p-3">{se.temp}</th>
                <th className="text-right font-normal p-3">{se.humidity}</th>
                <th className="text-right font-normal p-3">{se.solar}</th>
                <th className="text-right font-normal p-3">{se.battery}</th>
                <th className="text-right font-normal p-3">{se.wifi}</th>
                <th className="text-right font-normal p-3">{se.lastPing}</th>
              </tr>
            </thead>
            <tbody>
              {sensorsData.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-3 text-muted-foreground font-mono">{s.id}</td>
                  <td className="p-3 text-white">{s.capsule}</td>
                  <td className="p-3 text-right font-mono text-orange-300">{s.temperature}°C</td>
                  <td className="p-3 text-right font-mono text-blue-300">{s.humidity}%</td>
                  <td className="p-3 text-right font-mono text-yellow-400">{s.solar}%</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-white font-mono">{s.battery}%</span>
                      <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-green-400" style={{ width: `${s.battery}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="p-3 text-right"><StatusBadge status={s.wifi} /></td>
                  <td className="p-3 text-right text-muted-foreground font-mono">{s.lastPing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── RESERVATIONS SECTION (REAL CRUD) ─── */
interface Reservation {
  id: number;
  reservationId: string;
  guest: string;
  capsule: string;
  checkin: string;
  checkout: string;
  status: string;
  amount: number;
  notes: string;
  createdAt: string;
}

const EMPTY_RES_FORM = {
  reservationId: "", guest: "", capsule: "", checkin: "", checkout: "",
  status: "Pending", amount: "", notes: ""
};

function ReservationsSection({ d }: { d: D }) {
  const re = d.reservations;
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ ...EMPTY_RES_FORM });
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/reservations");
      setReservations(data);
      setError("");
    } catch {
      setError("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd = () => {
    setEditing(null);
    const nextId = `RES-${String(reservations.length + 1).padStart(3, "0")}`;
    setForm({ ...EMPTY_RES_FORM, reservationId: nextId });
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (r: Reservation) => {
    setEditing(r);
    setForm({
      reservationId: r.reservationId, guest: r.guest, capsule: r.capsule,
      checkin: r.checkin, checkout: r.checkout, status: r.status,
      amount: String(r.amount), notes: r.notes
    });
    setFormError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    setFormError("");
    if (!form.reservationId || !form.guest || !form.capsule || !form.checkin || !form.checkout) {
      setFormError("Please fill in all required fields.");
      return;
    }
    const amount = parseInt(form.amount) || 0;
    setSaving(true);
    try {
      const body = { ...form, amount };
      if (editing) {
        await apiFetch(`/reservations/${editing.id}`, { method: "PUT", body: JSON.stringify(body) });
      } else {
        await apiFetch("/reservations", { method: "POST", body: JSON.stringify(body) });
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (e: any) {
      setFormError(e.message || "Failed to save reservation");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await apiFetch(`/reservations/${id}`, { method: "DELETE" });
      await load();
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  const total = reservations.length;
  const active = reservations.filter(r => r.status === "Active").length;
  const pending = reservations.filter(r => r.status === "Pending").length;
  const revenue = reservations.reduce((s, r) => s + r.amount, 0);

  return (
    <div>
      <SectionHeader title={re.title} subtitle={re.sub} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL BOOKINGS", value: String(total), sub: "This period", color: "text-white" },
          { label: "ACTIVE STAYS", value: String(active), sub: "Currently checked in", color: "text-green-400" },
          { label: "PENDING", value: String(pending), sub: "Awaiting confirmation", color: "text-yellow-400" },
          { label: "TOTAL REVENUE", value: `$${revenue.toLocaleString()}`, sub: "This period", color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111] border-white/10 rounded-none">
        <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">RESERVATION LIST</CardTitle>
          <Button size="sm" onClick={openAdd} className="text-[10px] h-7 bg-primary hover:bg-primary/80 text-black font-bold tracking-widest flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> {re.newBooking}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-xs">{error}</div>
          ) : reservations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">No reservations yet. Add one to get started.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-white/10 text-muted-foreground bg-[#0d0d0d]">
                  <tr>
                    <th className="text-left font-normal p-3">ID</th>
                    <th className="text-left font-normal p-3">{re.guestId}</th>
                    <th className="text-left font-normal p-3">{re.capsule}</th>
                    <th className="text-left font-normal p-3">{re.checkin}</th>
                    <th className="text-left font-normal p-3">{re.checkout}</th>
                    <th className="text-left font-normal p-3">{re.status}</th>
                    <th className="text-right font-normal p-3">{re.amount}</th>
                    <th className="text-left font-normal p-3">NOTES</th>
                    <th className="text-right font-normal p-3">—</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.slice().reverse().map((r) => (
                    <tr key={r.id} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${r.status === "Pending" ? "bg-yellow-500/3" : ""}`}>
                      <td className={`p-3 font-mono ${r.status === "Pending" ? "border-l-2 border-l-yellow-500 text-yellow-300" : "text-muted-foreground"}`}>{r.reservationId}</td>
                      <td className="p-3 text-white font-medium">{r.guest}</td>
                      <td className="p-3 text-muted-foreground">{r.capsule}</td>
                      <td className="p-3 font-mono text-white">{r.checkin}</td>
                      <td className="p-3 font-mono text-white">{r.checkout}</td>
                      <td className="p-3"><StatusBadge status={r.status} /></td>
                      <td className="p-3 text-right text-white font-mono">${r.amount.toLocaleString()}</td>
                      <td className="p-3 text-muted-foreground max-w-[180px]">
                        <span title={r.notes || ""} className="block truncate cursor-help">{r.notes || "—"}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {r.status === "Pending" && (
                            <Button
                              variant="ghost" size="sm"
                              onClick={async () => {
                                await apiFetch(`/reservations/${r.id}`, { method: "PUT", body: JSON.stringify({ status: "Confirmed" }) });
                                load();
                              }}
                              className="h-6 px-2 text-[10px] text-yellow-400 hover:text-yellow-300 font-mono"
                              title="Confirm this booking"
                            >
                              CONFIRM
                            </Button>
                          )}
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => openEdit(r)}
                            className="h-6 px-2 text-[10px] text-blue-400/60 hover:text-blue-400 hover:bg-blue-400/10"
                            title="Edit"
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost" size="sm"
                            onClick={() => handleDelete(r.id)}
                            disabled={deleting === r.id}
                            className="h-6 px-2 text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                            title="Delete"
                          >
                            {deleting === r.id ? "..." : <Trash2 className="w-3 h-3" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditing(null); } }}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-widest">
              {editing ? "EDIT RESERVATION" : "NEW RESERVATION"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="RESERVATION ID *">
                <Input
                  value={form.reservationId}
                  onChange={e => setForm(f => ({ ...f, reservationId: e.target.value }))}
                  placeholder="RES-001"
                  disabled={!!editing}
                  className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8 disabled:opacity-50"
                />
              </FormField>
              <FormField label="GUEST NAME *">
                <Input value={form.guest} onChange={e => setForm(f => ({ ...f, guest: e.target.value }))} placeholder="Full Name" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CAPSULE *">
                <select value={form.capsule} onChange={e => setForm(f => ({ ...f, capsule: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md">
                  <option value="">Select capsule…</option>
                  {Array.from({ length: 20 }, (_, i) => (
                    <option key={i} value={`Capsule ${String(i + 1).padStart(2, "0")}`}>
                      Capsule {String(i + 1).padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label="STATUS">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md">
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Active</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="CHECK-IN DATE *">
                <Input type="date" value={form.checkin} onChange={e => setForm(f => ({ ...f, checkin: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
              <FormField label="CHECK-OUT DATE *">
                <Input type="date" value={form.checkout} onChange={e => setForm(f => ({ ...f, checkout: e.target.value }))} className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
            </div>
            <FormField label="AMOUNT ($)">
              <Input type="number" min="0" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
            </FormField>
            <FormField label="NOTES">
              <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Any additional notes (optional)" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
            </FormField>
            {formError && <p className="text-red-400 text-[10px]">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditing(null); }} className="text-xs border border-white/10">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-primary hover:bg-primary/80 text-black text-xs font-bold">
              {saving ? "Saving..." : editing ? "Save Changes" : "Add Reservation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── STUDENTS SECTION (REAL CRUD) ─── */
interface Student {
  id: number;
  studentId: string;
  name: string;
  role: string;
  department: string;
  shift: string;
  status: string;
  capsules: number[];
  createdAt: string;
}

function StudentsSection({ d }: { d: D }) {
  const st = d.students;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    studentId: "", name: "", role: "", department: "", shift: "Morning", status: "On Duty", capsules: ""
  });
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/students");
      setStudents(data);
      setError("");
    } catch {
      setError("Failed to load students");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setFormError("");
    if (!form.studentId || !form.name || !form.role || !form.department) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setSaving(true);
    try {
      const capsules = form.capsules
        ? form.capsules.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n))
        : [];
      await apiFetch("/students", {
        method: "POST",
        body: JSON.stringify({ ...form, capsules }),
      });
      setShowAdd(false);
      setForm({ studentId: "", name: "", role: "", department: "", shift: "Morning", status: "On Duty", capsules: "" });
      await load();
    } catch (e: any) {
      setFormError(e.message || "Failed to add student");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await apiFetch(`/students/${id}`, { method: "DELETE" });
      await load();
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  const onDuty = students.filter(s => s.status === "On Duty").length;
  const onLeave = students.filter(s => s.status === "On Leave").length;
  const depts = new Set(students.map(s => s.department)).size;

  return (
    <div>
      <SectionHeader title={st.title} subtitle={st.sub} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL STUDENTS", value: String(students.length), sub: "Registered team members", color: "text-white" },
          { label: "ON DUTY NOW", value: String(onDuty), sub: "Active shifts", color: "text-green-400" },
          { label: "ON LEAVE", value: String(onLeave), sub: "Scheduled absence", color: "text-yellow-400" },
          { label: "DEPARTMENTS", value: String(depts || 0), sub: "Academic disciplines", color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111] border-white/10 rounded-none">
        <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">STUDENT ROSTER</CardTitle>
          <Button size="sm" onClick={() => setShowAdd(true)} className="text-[10px] h-7 bg-primary hover:bg-primary/80 text-black font-bold tracking-widest flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> ADD STUDENT
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-xs">{error}</div>
          ) : students.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">No students yet. Add one to get started.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="border-b border-white/10 text-muted-foreground bg-[#0d0d0d]">
                <tr>
                  <th className="text-left font-normal p-3">{st.id}</th>
                  <th className="text-left font-normal p-3">{st.name}</th>
                  <th className="text-left font-normal p-3">{st.role}</th>
                  <th className="text-left font-normal p-3">{st.dept}</th>
                  <th className="text-left font-normal p-3">{st.shift}</th>
                  <th className="text-left font-normal p-3">{st.status}</th>
                  <th className="text-left font-normal p-3">{st.capsule}</th>
                  <th className="text-right font-normal p-3">—</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-muted-foreground font-mono">{s.studentId}</td>
                    <td className="p-3 text-white font-medium">{s.name}</td>
                    <td className="p-3 text-primary">{s.role}</td>
                    <td className="p-3 text-muted-foreground">{s.department}</td>
                    <td className="p-3">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-white">{s.shift}</span>
                      </span>
                    </td>
                    <td className="p-3"><StatusBadge status={s.status} /></td>
                    <td className="p-3 text-muted-foreground">
                      <div className="flex gap-1 flex-wrap">
                        {s.capsules.slice(0, 4).map((c) => (
                          <span key={c} className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white">
                            {String(c).padStart(2, "0")}
                          </span>
                        ))}
                        {s.capsules.length > 4 && <span className="text-[9px] text-muted-foreground">+{s.capsules.length - 4}</span>}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(s.id)}
                        disabled={deleting === s.id}
                        className="h-6 px-2 text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                      >
                        {deleting === s.id ? "..." : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-widest">ADD STUDENT</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="STUDENT ID *">
                <Input value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} placeholder="STU-007" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
              <FormField label="NAME *">
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full Name" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="ROLE *">
                <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="IoT Technician" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
              <FormField label="DEPARTMENT *">
                <Input value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} placeholder="Computer Sci." className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="SHIFT">
                <select value={form.shift} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md">
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Night</option>
                </select>
              </FormField>
              <FormField label="STATUS">
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md">
                  <option>On Duty</option>
                  <option>Off Duty</option>
                  <option>On Leave</option>
                </select>
              </FormField>
            </div>
            <FormField label="ASSIGNED CAPSULES (comma-separated numbers)">
              <Input value={form.capsules} onChange={e => setForm(f => ({ ...f, capsules: e.target.value }))} placeholder="1, 2, 3, 4, 5" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
            </FormField>
            {formError && <p className="text-red-400 text-[10px]">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-xs border border-white/10">Cancel</Button>
            <Button onClick={handleAdd} disabled={saving} className="bg-primary hover:bg-primary/80 text-black text-xs font-bold">
              {saving ? "Saving..." : "Add Student"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── BOOKS SECTION (REAL CRUD) ─── */
interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  status: string;
  description: string;
  coverUrl: string;
  createdAt: string;
}

function BooksSection() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", author: "", category: "", status: "Available", description: "", coverUrl: ""
  });
  const [formError, setFormError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/books");
      setBooks(data);
      setError("");
    } catch {
      setError("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setFormError("");
    if (!form.title || !form.author || !form.category) {
      setFormError("Title, author, and category are required.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/books", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowAdd(false);
      setForm({ title: "", author: "", category: "", status: "Available", description: "", coverUrl: "" });
      await load();
    } catch (e: any) {
      setFormError(e.message || "Failed to add book");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await apiFetch(`/books/${id}`, { method: "DELETE" });
      await load();
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  const available = books.filter(b => b.status === "Available").length;
  const borrowed = books.filter(b => b.status === "Borrowed").length;
  const categories = new Set(books.map(b => b.category)).size;

  return (
    <div>
      <SectionHeader title="LIBRARY / BOOKS" subtitle="Manage the resource library — add, view, and remove books" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL BOOKS", value: String(books.length), sub: "In collection", color: "text-white" },
          { label: "AVAILABLE", value: String(available), sub: "Ready to borrow", color: "text-green-400" },
          { label: "BORROWED", value: String(borrowed), sub: "Currently checked out", color: "text-yellow-400" },
          { label: "CATEGORIES", value: String(categories || 0), sub: "Subject areas", color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111] border-white/10 rounded-none">
        <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">BOOK COLLECTION</CardTitle>
          <Button size="sm" onClick={() => setShowAdd(true)} className="text-[10px] h-7 bg-primary hover:bg-primary/80 text-black font-bold tracking-widest flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> ADD BOOK
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-xs">{error}</div>
          ) : books.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">No books yet. Add one to get started.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="border-b border-white/10 text-muted-foreground bg-[#0d0d0d]">
                <tr>
                  <th className="text-left font-normal p-3">#</th>
                  <th className="text-left font-normal p-3">TITLE</th>
                  <th className="text-left font-normal p-3">AUTHOR</th>
                  <th className="text-left font-normal p-3">CATEGORY</th>
                  <th className="text-left font-normal p-3">STATUS</th>
                  <th className="text-left font-normal p-3">DESCRIPTION</th>
                  <th className="text-right font-normal p-3">—</th>
                </tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <tr key={b.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-muted-foreground font-mono">{b.id}</td>
                    <td className="p-3 text-white font-medium">{b.title}</td>
                    <td className="p-3 text-primary">{b.author}</td>
                    <td className="p-3 text-muted-foreground">{b.category}</td>
                    <td className="p-3"><StatusBadge status={b.status} /></td>
                    <td className="p-3 text-muted-foreground max-w-[200px] truncate">{b.description || "—"}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(b.id)}
                        disabled={deleting === b.id}
                        className="h-6 px-2 text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                      >
                        {deleting === b.id ? "..." : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-widest">ADD BOOK</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <FormField label="TITLE *">
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Book title" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
            </FormField>
            <div className="grid grid-cols-2 gap-3">
              <FormField label="AUTHOR *">
                <Input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} placeholder="Author name" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
              <FormField label="CATEGORY *">
                <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="Engineering, Science…" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
            </div>
            <FormField label="STATUS">
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md">
                <option>Available</option>
                <option>Borrowed</option>
              </select>
            </FormField>
            <FormField label="DESCRIPTION">
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description (optional)" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
            </FormField>
            {formError && <p className="text-red-400 text-[10px]">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-xs border border-white/10">Cancel</Button>
            <Button onClick={handleAdd} disabled={saving} className="bg-primary hover:bg-primary/80 text-black text-xs font-bold">
              {saving ? "Saving..." : "Add Book"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type MAlert = {
  id: number;
  alertId: string;
  type: string;
  capsule: string;
  issue: string;
  tech: string;
  status: string;
  notes: string;
  reportedAt: string;
  createdAt: string;
};

const EMPTY_ALERT = { type: "Warning", capsule: "", issue: "", tech: "", status: "Open", notes: "", reportedAt: new Date().toISOString().slice(0, 16) };

function MaintAlertForm({ initial, onSave, onCancel, saving }: { initial: typeof EMPTY_ALERT & Partial<MAlert>; onSave: (v: typeof EMPTY_ALERT) => void; onCancel: () => void; saving: boolean }) {
  const [v, setV] = useState(initial);
  const set = (k: keyof typeof EMPTY_ALERT, val: string) => setV(p => ({ ...p, [k]: val }));
  const CAPSULES = ["Capsule 01","Capsule 02","Capsule 03","Capsule 04","Capsule 05","Capsule 06","Capsule 07","Capsule 08","Capsule 09","Capsule 10","Capsule 11","Capsule 12","Capsule 13","Capsule 14","Capsule 15","Capsule 16","Capsule 17","Capsule 18","Capsule 19","Capsule 20","Sector Alpha","Sector Beta","Common Area","Solar Array","Water System"];
  const inp = (label: string, key: keyof typeof EMPTY_ALERT, type = "text") => (
    <div className="space-y-1.5">
      <p className="text-[10px] tracking-widest text-muted-foreground">{label}</p>
      <Input type={type} value={v[key]} onChange={e => set(key, e.target.value)} className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
    </div>
  );
  const sel = (label: string, key: keyof typeof EMPTY_ALERT, opts: string[]) => (
    <div className="space-y-1.5">
      <p className="text-[10px] tracking-widest text-muted-foreground">{label}</p>
      <select value={v[key]} onChange={e => set(key, e.target.value)} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md">
        {opts.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {sel("TYPE", "type", ["Warning", "Critical", "Info"])}
      {sel("STATUS", "status", ["Open", "In Progress", "Resolved"])}
      {sel("CAPSULE / ZONE", "capsule", CAPSULES)}
      {inp("TECHNICIAN", "tech")}
      <div className="sm:col-span-2 space-y-1.5">
        <p className="text-[10px] tracking-widest text-muted-foreground">ISSUE DESCRIPTION</p>
        <textarea value={v.issue} onChange={e => set("issue", e.target.value)} rows={2} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs p-2 rounded-md resize-none" />
      </div>
      <div className="sm:col-span-2 space-y-1.5">
        <p className="text-[10px] tracking-widest text-muted-foreground">NOTES (OPTIONAL)</p>
        <textarea value={v.notes} onChange={e => set("notes", e.target.value)} rows={2} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs p-2 rounded-md resize-none" />
      </div>
      {inp("REPORTED AT", "reportedAt", "datetime-local")}
      <div className="sm:col-span-2 flex gap-2 pt-2 border-t border-white/5">
        <Button onClick={() => onSave(v)} disabled={saving || !v.capsule || !v.issue || !v.tech} className="bg-primary hover:bg-primary/80 text-black text-[10px] font-bold tracking-widest h-8">
          {saving ? "SAVING…" : "SAVE ALERT"}
        </Button>
        <Button variant="ghost" onClick={onCancel} className="h-8 text-[10px] text-muted-foreground hover:text-white">CANCEL</Button>
      </div>
    </div>
  );
}

function MaintenanceSection({ d }: { d: D }) {
  const ma = d.maintenance;
  const [alerts, setAlerts] = useState<MAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<MAlert | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("All");

  const load = () => {
    apiFetch("/maintenance").then((data: MAlert[]) => { setAlerts(data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (v: typeof EMPTY_ALERT) => {
    setSaving(true);
    try {
      await apiFetch("/maintenance", { method: "POST", body: JSON.stringify(v) });
      setShowAdd(false);
      load();
    } finally { setSaving(false); }
  };

  const handleEdit = async (v: typeof EMPTY_ALERT) => {
    if (!editing) return;
    setSaving(true);
    try {
      await apiFetch(`/maintenance/${editing.id}`, { method: "PUT", body: JSON.stringify(v) });
      setEditing(null);
      load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this maintenance alert?")) return;
    await apiFetch(`/maintenance/${id}`, { method: "DELETE" });
    load();
  };

  const handleStatusChange = async (a: MAlert, newStatus: string) => {
    await apiFetch(`/maintenance/${a.id}`, { method: "PUT", body: JSON.stringify({ status: newStatus }) });
    load();
  };

  const filtered = filterStatus === "All" ? alerts : alerts.filter(a => a.status === filterStatus);
  const open = alerts.filter(a => a.status === "Open").length;
  const inProgress = alerts.filter(a => a.status === "In Progress").length;
  const resolved = alerts.filter(a => a.status === "Resolved").length;

  const typeIcon = (t: string) => {
    if (t === "Critical") return <AlertTriangle className="w-5 h-5 text-red-400" />;
    if (t === "Warning") return <Wrench className="w-5 h-5 text-yellow-400" />;
    return <CheckCircle className="w-5 h-5 text-blue-400" />;
  };

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    return `${Math.floor(h / 24)} day ago`;
  };

  return (
    <div>
      <div className="flex items-start justify-between gap-4 mb-6">
        <SectionHeader title={ma.title} subtitle="Real-time maintenance alerts — add, update status, resolve, or delete" />
        <Button onClick={() => { setShowAdd(true); setEditing(null); }} className="bg-primary hover:bg-primary/80 text-black text-[10px] font-bold tracking-widest h-8 flex-shrink-0 flex items-center gap-1.5">
          <Plus className="w-3 h-3" /> NEW ALERT
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "OPEN", value: open, sub: "Require attention", color: "text-red-400" },
          { label: "IN PROGRESS", value: inProgress, sub: "Being resolved", color: "text-yellow-400" },
          { label: "RESOLVED", value: resolved, sub: "Completed", color: "text-green-400" },
          { label: "TOTAL ALERTS", value: alerts.length, sub: "All time", color: "text-primary" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(showAdd || editing) && (
        <Card className="bg-[#111] border-primary/30 rounded-none mb-5">
          <CardHeader className="p-4 border-b border-white/5">
            <CardTitle className="text-xs text-primary tracking-widest font-normal">{editing ? "EDIT ALERT — " + editing.alertId : "NEW MAINTENANCE ALERT"}</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <MaintAlertForm
              initial={editing ? { type: editing.type, capsule: editing.capsule, issue: editing.issue, tech: editing.tech, status: editing.status, notes: editing.notes, reportedAt: editing.reportedAt.slice(0, 16) } : EMPTY_ALERT}
              onSave={editing ? handleEdit : handleAdd}
              onCancel={() => { setShowAdd(false); setEditing(null); }}
              saving={saving}
            />
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {["All", "Open", "In Progress", "Resolved"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1 text-[10px] font-mono border transition-colors ${filterStatus === s ? "border-primary text-primary bg-primary/5" : "border-white/10 text-muted-foreground hover:text-white"}`}>
            {s.toUpperCase()}{s === "All" ? ` (${alerts.length})` : s === "Open" ? ` (${open})` : s === "In Progress" ? ` (${inProgress})` : ` (${resolved})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-muted-foreground text-xs py-8 text-center">Loading alerts…</div>
      ) : filtered.length === 0 ? (
        <div className="text-muted-foreground text-xs py-8 text-center border border-dashed border-white/10">
          {alerts.length === 0 ? "No maintenance alerts — click NEW ALERT to add one." : "No alerts match this filter."}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.slice().reverse().map((a) => (
            <Card key={a.id} className={`bg-[#111] border-white/10 rounded-none hover:border-white/20 transition-colors ${a.type === "Critical" && a.status === "Open" ? "border-l-2 border-l-red-500" : ""}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5 flex-shrink-0">{typeIcon(a.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-mono text-[10px] text-muted-foreground">{a.alertId}</span>
                        <StatusBadge status={a.type} />
                        <StatusBadge status={a.status} />
                      </div>
                      <p className="text-sm text-white mb-1 leading-snug">{a.issue}</p>
                      <p className="text-[10px] text-muted-foreground">
                        <span className="text-primary">{a.capsule}</span> — {ma.assigned}: {a.tech} — {timeAgo(a.reportedAt)}
                      </p>
                      {a.notes && <p className="text-[10px] text-muted-foreground mt-1 italic">"{a.notes}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {a.status === "Open" && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(a, "In Progress")} className="h-7 px-2 text-[10px] text-yellow-400 hover:text-yellow-300 font-mono">START</Button>
                    )}
                    {a.status === "In Progress" && (
                      <Button variant="ghost" size="sm" onClick={() => handleStatusChange(a, "Resolved")} className="h-7 px-2 text-[10px] text-green-400 hover:text-green-300 font-mono">RESOLVE</Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => { setEditing(a); setShowAdd(false); }} className="h-7 px-2 text-[10px] text-muted-foreground hover:text-white">
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)} className="h-7 px-2 text-[10px] text-muted-foreground hover:text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function SecuritySection({ d }: { d: D }) {
  const sc = d.security;
  const [selected, setSelected] = useState("CAM-02");
  const selectedCam = securityCameras.find(c => c.id === selected)!;
  return (
    <div>
      <SectionHeader title={sc.title} subtitle={sc.sub} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL CAMERAS", value: "8", sub: "Deployed across camp", color: "text-white" },
          { label: sc.onlineCams, value: "7", sub: "87.5% uptime", color: "text-green-400" },
          { label: "OFFLINE", value: "1", sub: "CAM-06 West Perimeter", color: "text-red-400" },
          { label: sc.motionDetected, value: "2", sub: "CAM-02, CAM-07", color: "text-yellow-400" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="bg-[#111] border-white/10 rounded-none h-[400px] relative overflow-hidden">
            <div className="absolute inset-0 bg-black/50 z-10 flex flex-col justify-between p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white font-mono tracking-widest">{selectedCam.id} — {selectedCam.label.toUpperCase()}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Zone: {selectedCam.zone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCam.motion && <span className="text-[10px] text-yellow-400 font-mono animate-pulse">{sc.motion.toUpperCase()}</span>}
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-white font-mono">REC</span>
                </div>
              </div>
              {selectedCam.status === "Offline" && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 text-white/20 mx-auto mb-2" />
                    <p className="text-sm text-white/40 font-mono">{sc.offline}</p>
                    <p className="text-xs text-white/20 font-mono mt-1">{sc.offlineSub}</p>
                  </div>
                </div>
              )}
              <div className="text-[10px] font-mono text-white/50">
                {new Date().toLocaleDateString()} &nbsp; {new Date().toLocaleTimeString("en-US", { hour12: false })}
              </div>
            </div>
            <img src={capsulePhotoPath} alt="Security feed" className={`w-full h-full object-cover ${selectedCam.status === "Offline" ? "opacity-5 grayscale" : "opacity-40 grayscale"}`} />
          </Card>
        </div>
        <div className="space-y-2">
          {securityCameras.map((cam) => (
            <button key={cam.id} onClick={() => setSelected(cam.id)} className={`w-full text-left p-3 border transition-all rounded-none ${selected === cam.id ? "border-primary/50 bg-primary/5" : "border-white/5 bg-[#111] hover:border-white/20"}`}>
              <div className="relative h-16 mb-2 overflow-hidden rounded-sm">
                <img src={capsulePhotoPath} alt={cam.label} className={`w-full h-full object-cover ${cam.status === "Offline" ? "opacity-10 grayscale" : "opacity-30 grayscale"}`} />
                {cam.status === "Offline" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[9px] text-red-400 font-mono">OFFLINE</span>
                  </div>
                )}
                {cam.motion && cam.status === "Online" && (
                  <span className="absolute top-1 left-1 text-[8px] text-yellow-400 font-mono animate-pulse">{sc.motion.toUpperCase()}</span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-mono text-white">{cam.id}</p>
                  <p className="text-[9px] text-muted-foreground">{cam.label}</p>
                </div>
                <StatusBadge status={cam.status} />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── ACCOUNTS SECTION (REAL CRUD) ─── */
interface Account {
  id: number;
  username: string;
  email: string;
  role: string;
  createdAt: string;
}

function AccountsSection() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showPw, setShowPw] = useState<Account | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", role: "Operator", password: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [formError, setFormError] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/accounts");
      setAccounts(data);
      setError("");
    } catch {
      setError("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    setFormError("");
    if (!form.username || !form.email || !form.password) {
      setFormError("Username, email, and password are required.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch("/accounts", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setShowAdd(false);
      setForm({ username: "", email: "", role: "Operator", password: "" });
      await load();
    } catch (e: any) {
      setFormError(e.message || "Failed to create account");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeleting(id);
    try {
      await apiFetch(`/accounts/${id}`, { method: "DELETE" });
      await load();
    } catch {
    } finally {
      setDeleting(null);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwError("All fields are required.");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }
    setSaving(true);
    try {
      await apiFetch(`/accounts/${showPw!.id}/password`, {
        method: "PUT",
        body: JSON.stringify({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword }),
      });
      setPwSuccess("Password changed successfully.");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e: any) {
      setPwError(e.message || "Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader title="ACCOUNTS" subtitle="Manage user accounts, roles, and credentials" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: "TOTAL ACCOUNTS", value: String(accounts.length), sub: "Registered users", color: "text-white" },
          { label: "ADMINS", value: String(accounts.filter(a => a.role === "Admin").length), sub: "Full access", color: "text-primary" },
          { label: "OPERATORS", value: String(accounts.filter(a => a.role === "Operator").length), sub: "Standard access", color: "text-blue-400" },
          { label: "VIEWERS", value: String(accounts.filter(a => a.role === "Viewer").length), sub: "Read-only access", color: "text-muted-foreground" },
        ].map((s) => (
          <Card key={s.label} className="bg-[#111] border-white/10 rounded-none">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest mb-2">{s.label}</p>
              <p className={`text-2xl font-mono ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{s.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-[#111] border-white/10 rounded-none">
        <CardHeader className="p-4 border-b border-white/5 flex flex-row items-center justify-between">
          <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">USER ACCOUNTS</CardTitle>
          <Button size="sm" onClick={() => setShowAdd(true)} className="text-[10px] h-7 bg-primary hover:bg-primary/80 text-black font-bold tracking-widest flex items-center gap-1.5">
            <Plus className="w-3 h-3" /> ADD ACCOUNT
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-xs">Loading...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-400 text-xs">{error}</div>
          ) : accounts.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">No accounts yet. Add one to get started.</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="border-b border-white/10 text-muted-foreground bg-[#0d0d0d]">
                <tr>
                  <th className="text-left font-normal p-3">#</th>
                  <th className="text-left font-normal p-3">USERNAME</th>
                  <th className="text-left font-normal p-3">EMAIL</th>
                  <th className="text-left font-normal p-3">ROLE</th>
                  <th className="text-left font-normal p-3">CREATED</th>
                  <th className="text-right font-normal p-3">—</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((a) => (
                  <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3 text-muted-foreground font-mono">{a.id}</td>
                    <td className="p-3 text-white font-medium flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary text-[9px] border border-primary/30 flex-shrink-0">
                        {a.username.charAt(0).toUpperCase()}
                      </div>
                      {a.username}
                    </td>
                    <td className="p-3 text-muted-foreground">{a.email}</td>
                    <td className="p-3"><StatusBadge status={a.role} /></td>
                    <td className="p-3 text-muted-foreground font-mono">{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setShowPw(a); setPwError(""); setPwSuccess(""); setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                        className="h-6 px-2 text-[10px] text-blue-400/60 hover:text-blue-400 hover:bg-blue-400/10"
                        title="Change Password"
                      >
                        <Lock className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(a.id)}
                        disabled={deleting === a.id}
                        className="h-6 px-2 text-[10px] text-red-400/60 hover:text-red-400 hover:bg-red-400/10"
                        title="Delete Account"
                      >
                        {deleting === a.id ? "..." : <Trash2 className="w-3 h-3" />}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-widest">ADD ACCOUNT</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <FormField label="USERNAME *">
              <Input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="john_doe" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
            </FormField>
            <FormField label="EMAIL *">
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@dunex.sa" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
            </FormField>
            <FormField label="ROLE">
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md">
                <option>Admin</option>
                <option>Operator</option>
                <option>Viewer</option>
              </select>
            </FormField>
            <FormField label="PASSWORD *">
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                  className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8 pr-8"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                  {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </button>
              </div>
            </FormField>
            {formError && <p className="text-red-400 text-[10px]">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAdd(false)} className="text-xs border border-white/10">Cancel</Button>
            <Button onClick={handleAdd} disabled={saving} className="bg-primary hover:bg-primary/80 text-black text-xs font-bold">
              {saving ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={!!showPw} onOpenChange={(o) => { if (!o) setShowPw(null); }}>
        <DialogContent className="bg-[#111] border-white/10 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold tracking-widest">CHANGE PASSWORD</DialogTitle>
          </DialogHeader>
          {showPw && (
            <div className="space-y-3 py-2">
              <p className="text-[10px] text-muted-foreground">Account: <span className="text-white font-mono">{showPw.username}</span></p>
              <FormField label="CURRENT PASSWORD">
                <Input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} placeholder="Enter current password" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
              <FormField label="NEW PASSWORD">
                <Input type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} placeholder="Min. 6 characters" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
              <FormField label="CONFIRM NEW PASSWORD">
                <Input type="password" value={pwForm.confirmPassword} onChange={e => setPwForm(f => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat new password" className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8" />
              </FormField>
              {pwError && <p className="text-red-400 text-[10px]">{pwError}</p>}
              {pwSuccess && <p className="text-green-400 text-[10px]">{pwSuccess}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowPw(null)} className="text-xs border border-white/10">Close</Button>
            <Button onClick={handleChangePassword} disabled={saving} className="bg-primary hover:bg-primary/80 text-black text-xs font-bold">
              {saving ? "Saving..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─── SETTINGS SECTION ─── */
type SettingsTab = "camp" | "contact" | "pricing" | "notifications" | "thresholds" | "security";

function SaveBar({ saving, saved, error, onSave }: { saving: boolean; saved: boolean; error: string; onSave: () => void }) {
  return (
    <div className="flex items-center gap-3 pt-2 border-t border-white/5 mt-2">
      <Button onClick={onSave} disabled={saving} className="bg-primary hover:bg-primary/80 text-black text-[10px] font-bold tracking-widest h-8">
        {saving ? "SAVING..." : "SAVE CHANGES"}
      </Button>
      {saved && !saving && <span className="text-[10px] text-green-400 font-mono">✓ SAVED</span>}
      {error && <span className="text-[10px] text-red-400 font-mono">{error}</span>}
    </div>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full transition-colors flex items-center flex-shrink-0 ${value ? "bg-primary justify-end" : "bg-white/10 justify-start"}`}
    >
      <div className="w-4 h-4 rounded-full bg-white mx-0.5 shadow" />
    </button>
  );
}

function SettingsSection({ d }: { d: D }) {
  const [tab, setTab] = useState<SettingsTab>("camp");
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    apiFetch("/settings").then(data => {
      setSettings(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const set = (key: string, value: string) => {
    setSaved(false);
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggle = (key: string) => {
    setSaved(false);
    setSettings(prev => ({ ...prev, [key]: prev[key] === "true" ? "false" : "true" }));
  };

  const saveGroup = async (keys: string[]) => {
    setSaving(true);
    setSaved(false);
    setSaveError("");
    try {
      const subset: Record<string, string> = {};
      for (const k of keys) subset[k] = settings[k] ?? "";
      await apiFetch("/settings", { method: "PUT", body: JSON.stringify(subset) });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setSaveError(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: "camp", label: "CAMP INFO" },
    { key: "contact", label: "CONTACT" },
    { key: "pricing", label: "PRICING" },
    { key: "notifications", label: "NOTIFICATIONS" },
    { key: "thresholds", label: "THRESHOLDS" },
    { key: "security", label: "SECURITY" },
  ];

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div key={key} className="space-y-1.5">
      <p className="text-[10px] tracking-widest text-muted-foreground">{label}</p>
      <Input
        type={type}
        value={settings[key] ?? ""}
        onChange={e => set(key, e.target.value)}
        placeholder={placeholder}
        className="bg-[#0a0a0a] border-white/10 text-white text-xs h-8"
      />
    </div>
  );

  const selectField = (label: string, key: string, options: string[]) => (
    <div key={key} className="space-y-1.5">
      <p className="text-[10px] tracking-widest text-muted-foreground">{label}</p>
      <select
        value={settings[key] ?? ""}
        onChange={e => set(key, e.target.value)}
        className="w-full bg-[#0a0a0a] border border-white/10 text-white text-xs h-8 px-2 rounded-md"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const toggleField = (label: string, sublabel: string, key: string) => (
    <div key={key} className="flex items-center justify-between py-1">
      <div>
        <p className="text-xs text-white">{label}</p>
        {sublabel && <p className="text-[10px] text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <Toggle value={settings[key] === "true"} onChange={() => toggle(key)} />
    </div>
  );

  if (loading) {
    return (
      <div>
        <SectionHeader title="SYSTEM SETTINGS" subtitle="Loading configuration…" />
        <div className="text-muted-foreground text-xs">Loading…</div>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader title="SYSTEM SETTINGS" subtitle="Full camp configuration — all changes are saved to the database" />

      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setSaved(false); setSaveError(""); }}
            className={`px-4 py-1.5 text-[10px] font-mono border transition-colors ${tab === t.key ? "border-primary text-primary bg-primary/5" : "border-white/10 text-muted-foreground hover:text-white"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── CAMP INFO ── */}
      {tab === "camp" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">CAMP IDENTITY</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("CAMP NAME", "campName", "text", "DuneX Alpha Camp")}
              {field("LOCATION / REGION", "campLocation", "text", "Sahara Desert, Algeria")}
              {field("GPS COORDINATES", "campCoordinates", "text", "28.9784° N, 3.7242° E")}
              {field("CAMP WEBSITE", "campWebsite", "text", "https://dunex.sa")}
              {field("TOTAL CAPSULE CAPACITY", "campCapacity", "number", "20")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["campName", "campLocation", "campCoordinates", "campWebsite", "campCapacity"])} />
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">OPERATIONS SCHEDULE</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("DEFAULT CHECK-IN TIME", "checkinTime", "time")}
              {field("DEFAULT CHECK-OUT TIME", "checkoutTime", "time")}
              {selectField("TIMEZONE", "timezone", [
                "Africa/Algiers", "Africa/Cairo", "Africa/Tunis", "Africa/Casablanca",
                "Africa/Johannesburg", "Europe/Paris", "UTC", "Asia/Riyadh", "Asia/Dubai"
              ])}
              {selectField("DATE FORMAT", "dateFormat", ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"])}
              {selectField("DEFAULT LANGUAGE", "defaultLanguage", ["en", "ar", "fr"])}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["checkinTime", "checkoutTime", "timezone", "dateFormat", "defaultLanguage"])} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── CONTACT ── */}
      {tab === "contact" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">OPERATIONS CONTACT</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("ADMIN EMAIL", "contactEmail", "email", "ops@dunex.sa")}
              {field("PHONE NUMBER", "contactPhone", "tel", "+213 555 000 100")}
              {field("PHYSICAL ADDRESS", "contactAddress", "text", "BP 01, Timimoun, Algeria")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["contactEmail", "contactPhone", "contactAddress"])} />
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">EMERGENCY CONTACT</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("EMERGENCY PHONE", "emergencyPhone", "tel", "+213 555 999 999")}
              {field("NEAREST HOSPITAL", "nearestHospital", "text", "CHU Adrar")}
              {field("NEAREST CITY (KM)", "nearestCityKm", "number", "45")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["emergencyPhone", "nearestHospital", "nearestCityKm"])} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PRICING ── */}
      {tab === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">NIGHTLY RATES (PER CAPSULE)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {selectField("CURRENCY", "currency", ["USD", "EUR", "DZD", "SAR", "AED", "GBP"])}
              {field("TAX RATE (%)", "taxRate", "number", "10")}
              {field("ROYAL DOME ($/NIGHT)", "priceRoyalDome", "number", "500")}
              {field("FAMILY SUITE ($/NIGHT)", "priceFamilySuite", "number", "350")}
              {field("STANDARD POD ($/NIGHT)", "priceStandardPod", "number", "150")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["currency", "taxRate", "priceRoyalDome", "priceFamilySuite", "priceStandardPod"])} />
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">BOOKING POLICY</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("FREE CANCELLATION WINDOW (HOURS)", "cancellationPolicy", "number", "48")}
              {field("MIN STAY (NIGHTS)", "minStayNights", "number", "1")}
              {field("MAX STAY (NIGHTS)", "maxStayNights", "number", "14")}
              {field("MAX GUESTS PER BOOKING", "maxGuests", "number", "6")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["cancellationPolicy", "minStayNights", "maxStayNights", "maxGuests"])} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── NOTIFICATIONS ── */}
      {tab === "notifications" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">ALERT CHANNELS</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 divide-y divide-white/5">
              {toggleField("Email Alerts", "Send notifications via email", "notifyEmail")}
              {toggleField("SMS Alerts", "Send critical alerts via SMS", "notifySMS")}
              {toggleField("Critical Alerts Only", "Suppress non-critical notifications", "notifyCriticalOnly")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["notifyEmail", "notifySMS", "notifyCriticalOnly"])} />
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">ALERT TRIGGERS</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 divide-y divide-white/5">
              {toggleField("Daily Report", "Receive daily operational summary", "notifyDailyReport")}
              {toggleField("Guest Check-in", "Alert when guest checks in or out", "notifyGuestCheckin")}
              {toggleField("Energy Alerts", "Notify on battery or solar anomalies", "notifyEnergyAlert")}
              {toggleField("Maintenance Alerts", "Notify on new maintenance issues", "notifyMaintenance")}
              {toggleField("Temperature Alerts", "Notify when thresholds are breached", "notifyTempAlert")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["notifyDailyReport", "notifyGuestCheckin", "notifyEnergyAlert", "notifyMaintenance", "notifyTempAlert"])} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── THRESHOLDS ── */}
      {tab === "thresholds" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">TEMPERATURE (°C)</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("MIN SAFE TEMP (°C)", "minTempC", "number")}
              {field("MAX SAFE TEMP (°C)", "maxTempC", "number")}
              {field("ALERT THRESHOLD (°C)", "alertTempC", "number")}
              {field("CRITICAL THRESHOLD (°C)", "criticalTempC", "number")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["minTempC", "maxTempC", "alertTempC", "criticalTempC"])} />
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">ENERGY SYSTEM</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("MIN BATTERY (%)", "minBattery", "number")}
              {field("MIN SOLAR OUTPUT (kW)", "minSolarKW", "number")}
              {field("PEAK LOAD LIMIT (kW)", "peakLoadKW", "number")}
              {field("GRID EXPORT THRESHOLD (kWh)", "exportThresholdKWh", "number")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["minBattery", "minSolarKW", "peakLoadKW", "exportThresholdKWh"])} />
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">WATER SYSTEM</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("DAILY WATER LIMIT (L)", "waterDailyLimitL", "number")}
              {field("LOW RESERVE ALERT (L)", "waterAlertL", "number")}
              {field("RECYCLING TARGET (%)", "waterRecyclingTarget", "number")}
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["waterDailyLimitL", "waterAlertL", "waterRecyclingTarget"])} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">ACCESS CONTROL</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 divide-y divide-white/5">
              {toggleField("Admin PIN Required", "Require PIN for critical operations", "adminPinEnabled")}
              {toggleField("Guest App Access", "Allow guests to use the mobile app", "guestAppAccess")}
              {toggleField("Two-Factor Auth", "Require 2FA for admin accounts", "twoFactorEnabled")}
              <div className="pt-3 space-y-3">
                {field("SESSION TIMEOUT (MINUTES)", "sessionTimeoutMin", "number", "60")}
                {field("MAX LOGIN ATTEMPTS", "maxLoginAttempts", "number", "5")}
              </div>
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["adminPinEnabled", "guestAppAccess", "twoFactorEnabled", "sessionTimeoutMin", "maxLoginAttempts"])} />
            </CardContent>
          </Card>

          <Card className="bg-[#111] border-white/10 rounded-none">
            <CardHeader className="p-4 border-b border-white/5">
              <CardTitle className="text-xs text-muted-foreground tracking-widest font-normal">CAMERA & MAINTENANCE</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {field("CAMERA RETENTION (DAYS)", "cameraRetentionDays", "number", "7")}
              {toggleField("Motion Recording", "Record on motion detection only", "motionRecordingOnly")}
              <div className="pt-2 space-y-3">
                {field("MAINTENANCE WINDOW START", "maintenanceWindowStart", "time")}
                {field("MAINTENANCE WINDOW END", "maintenanceWindowEnd", "time")}
                {field("AUTO-ASSIGN TECHNICIAN", "autoAssignTech", "text", "Bilal Haddad")}
              </div>
              <SaveBar saving={saving} saved={saved} error={saveError} onSave={() => saveGroup(["cameraRetentionDays", "motionRecordingOnly", "maintenanceWindowStart", "maintenanceWindowEnd", "autoAssignTech"])} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ─── REVIEWS SECTION ─── */
type ReviewRow = {
  id: number;
  capsuleId: string;
  capsuleName: string;
  guestName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
};

function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Published" | "Hidden">("All");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch("/reviews");
      setReviews(data);
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (r: ReviewRow) => {
    const next = r.status === "Published" ? "Hidden" : "Published";
    await apiFetch(`/reviews/${r.id}/status`, { method: "PATCH", body: JSON.stringify({ status: next }) });
    setReviews((prev) => prev.map((x) => x.id === r.id ? { ...x, status: next } : x));
  };

  const remove = async (id: number) => {
    if (!confirm("Delete this review?")) return;
    await apiFetch(`/reviews/${id}`, { method: "DELETE" });
    setReviews((prev) => prev.filter((x) => x.id !== id));
  };

  const visible = filter === "All" ? reviews : reviews.filter((r) => r.status === filter);
  const avgAll = reviews.length ? (reviews.filter(r => r.status === "Published").reduce((s, r) => s + r.rating, 0) / (reviews.filter(r => r.status === "Published").length || 1)) : 0;

  return (
    <div className="space-y-6">
      {/* Summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length },
          { label: "Published", value: reviews.filter(r => r.status === "Published").length },
          { label: "Hidden", value: reviews.filter(r => r.status === "Hidden").length },
          { label: "Avg Rating", value: avgAll ? avgAll.toFixed(1) + " ★" : "—" },
        ].map((s) => (
          <Card key={s.label} className="bg-card border-white/10">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground tracking-widest font-mono mb-1">{s.label.toUpperCase()}</p>
              <p className="text-2xl font-bold text-primary font-mono">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        {(["All", "Published", "Hidden"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[10px] font-mono tracking-widest border transition-colors ${filter === f ? "bg-primary text-black border-primary" : "border-white/10 text-muted-foreground hover:text-white"}`}
          >
            {f.toUpperCase()}
          </button>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground font-mono">{visible.length} review{visible.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <Card className="bg-card border-white/10">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground text-sm font-mono">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          ) : visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mb-3 opacity-20" />
              <p className="text-sm font-mono">No reviews yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-muted-foreground tracking-widest">
                    <th className="px-4 py-3 text-left">GUEST</th>
                    <th className="px-4 py-3 text-left">CAPSULE</th>
                    <th className="px-4 py-3 text-left">RATING</th>
                    <th className="px-4 py-3 text-left">COMMENT</th>
                    <th className="px-4 py-3 text-left">DATE</th>
                    <th className="px-4 py-3 text-left">STATUS</th>
                    <th className="px-4 py-3 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map((r, i) => (
                    <tr key={r.id} className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${i % 2 === 0 ? "" : "bg-white/[0.01]"}`}>
                      <td className="px-4 py-3 font-semibold text-white">{r.guestName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.capsuleName}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <Star key={idx} className={`w-3 h-3 ${idx < r.rating ? "text-primary fill-primary" : "text-white/10"}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground max-w-[220px] truncate">{r.comment || "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 text-[9px] tracking-widest border ${r.status === "Published" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {r.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => toggle(r)}
                            className="text-[10px] text-muted-foreground hover:text-primary transition-colors tracking-widest"
                            title={r.status === "Published" ? "Hide" : "Publish"}
                          >
                            {r.status === "Published" ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => remove(r.id)}
                            className="text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── MAIN DASHBOARD ─── */
const DASH_LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "ar", label: "AR" },
  { code: "fr", label: "FR" },
];

export default function Dashboard() {
  const [section, setSection] = useState<NavSection>("overview");
  const [mounted, setMounted] = useState(false);
  const [clock, setClock] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { lang, setLang, t } = useLanguage();

  async function handleLogout() {
    await logout();
    navigate("/login");
  }
  const d = t.dashboard;

  useEffect(() => {
    setMounted(true);
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const navItems: { key: NavSection; icon: React.ElementType; label: string }[] = [
    { key: "overview", icon: LayoutDashboard, label: d.sections.overview },
    { key: "energy", icon: Zap, label: d.sections.energy },
    { key: "occupancy", icon: CalendarCheck, label: d.sections.occupancy },
    { key: "sensors", icon: Cpu, label: d.sections.sensors },
    { key: "reservations", icon: CalendarCheck, label: d.sections.reservations },
    { key: "students", icon: GraduationCap, label: d.sections.students },
    { key: "maintenance", icon: Wrench, label: d.sections.maintenance },
    { key: "security", icon: Shield, label: d.sections.security },
    { key: "accounts", icon: UserCircle, label: "Accounts" },
    { key: "reviews", icon: MessageSquare, label: "Reviews" },
    { key: "settings", icon: Settings, label: d.sections.settings },
  ];

  const activeNav = navItems.find(n => n.key === section) ?? navItems[0];

  return (
    <div className="flex min-h-[100dvh] bg-[#040404] text-white font-mono">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 md:z-auto w-64 flex-shrink-0 h-full md:h-auto flex flex-col bg-[#060606] border-r border-white/10 transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <img src={logoPath} alt="DuneX" className="h-8 w-auto" />
          <button className="md:hidden text-muted-foreground hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.key}
              onClick={() => { setSection(item.key); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-[11px] transition-all rounded-none ${section === item.key ? "bg-primary/10 text-primary border-l-2 border-primary pl-2.5" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <span className="tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-1 mb-3">
            <Globe className="w-3 h-3 text-muted-foreground mr-1" />
            {DASH_LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-0.5 text-[10px] font-mono rounded-sm border transition-colors ${lang === l.code ? "bg-primary text-black border-primary" : "border-white/10 text-muted-foreground hover:text-white"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs border border-primary/30">
              {user?.username?.slice(0, 2).toUpperCase() ?? "AD"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.username ?? "admin"}</p>
              <p className="text-[10px] text-muted-foreground truncate">{user?.role ?? "Admin"}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <Link href="/" className="flex-1 flex items-center gap-2 text-[10px] text-muted-foreground hover:text-white transition-colors">
              <Home className="w-3 h-3" /> {d.returnSite}
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[10px] text-red-400/70 hover:text-red-400 transition-colors px-2 py-1 border border-red-500/20 hover:border-red-500/40"
            >
              <Lock className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <main className="flex-1 flex flex-col min-h-[100dvh] md:overflow-hidden">
        <header className="h-14 flex items-center justify-between px-4 border-b border-white/10 bg-[#040404]/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="md:hidden text-muted-foreground hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <activeNav.icon className="w-4 h-4 text-primary" />
            <h1 className="text-sm font-bold text-white tracking-widest">{activeNav.label.toUpperCase()}</h1>
            <span className="hidden sm:inline-flex px-2 py-0.5 text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 tracking-widest">{d.nominal}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="hidden sm:block">{d.campusTime} <span className="text-white">{clock}</span></span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          {section === "overview" && <OverviewSection mounted={mounted} d={d} />}
          {section === "energy" && <EnergySection mounted={mounted} d={d} />}
          {section === "occupancy" && <OccupancySection mounted={mounted} d={d} />}
          {section === "sensors" && <SensorsSection d={d} />}
          {section === "reservations" && <ReservationsSection d={d} />}
          {section === "students" && <StudentsSection d={d} />}
          {section === "maintenance" && <MaintenanceSection d={d} />}
          {section === "security" && <SecuritySection d={d} />}
          {section === "accounts" && <AccountsSection />}
          {section === "reviews" && <ReviewsSection />}
          {section === "settings" && <SettingsSection d={d} />}
        </div>
      </main>
    </div>
  );
}
