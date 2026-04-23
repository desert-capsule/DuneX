import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Sun, Thermometer, Users, ArrowRight, Search, Heart, Star,
  SlidersHorizontal, Grid3x3, List, Maximize, Zap, Check
} from "lucide-react";
import { capsulesData } from "@/data/mockData";
import interiorImg from "@/assets/images/capsule-interior.png";
import capsulePhotoPath from "@assets/67b685d41ee6ad3416ec720c_IMG_2705-s_1775877411797.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3 h-3 ${i < Math.floor(rating) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
      ))}
      <span className="text-xs text-muted-foreground ml-1">{rating.toFixed(1)}</span>
    </div>
  );
}

type SortKey = "default" | "price-asc" | "price-desc" | "solar" | "rating";

export default function Capsules() {
  const { t, lang } = useLanguage();
  const c = t.capsules;

  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("default");
  const [availableOnly, setAvailableOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compare, setCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const allLabel = lang === "ar" ? "الكل" : lang === "fr" ? "Tous" : "All";
  const types = [allLabel, ...Array.from(new Set(capsulesData.map((c) => c.type)))];

  const filtered = useMemo(() => {
    let list = [...capsulesData];
    if (filter !== allLabel) list = list.filter((cap) => cap.type === filter);
    if (availableOnly) list = list.filter((cap) => cap.status === "Available");
    if (search.trim()) list = list.filter((cap) => cap.name.toLowerCase().includes(search.toLowerCase()) || cap.type.toLowerCase().includes(search.toLowerCase()));
    switch (sort) {
      case "price-asc": list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "solar": list.sort((a, b) => b.solarEnergy - a.solarEnergy); break;
      case "rating": list.sort((a, b) => b.rating - a.rating); break;
    }
    return list;
  }, [filter, search, sort, availableOnly, allLabel]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  };
  const toggleCompare = (id: string) => {
    setCompare((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };
  const compareCapsules = capsulesData.filter((cap) => compare.includes(cap.id));

  return (
    <div className="pt-32 pb-24 w-full">
      <div className="container px-4">

        <div className="mb-10">
          <p className="text-sm font-mono text-primary mb-3 tracking-widest uppercase">{c.tag}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{c.title}</h1>
          <p className="text-muted-foreground max-w-xl">{c.sub}</p>
        </div>

        {/* Sticky Filters */}
        <div className="sticky top-20 z-30 bg-background/95 backdrop-blur-md border border-border rounded-sm p-4 mb-8 shadow-lg">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder={c.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} className="ps-9 bg-card border-border h-9" />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {types.map((tp) => (
                <button key={tp} onClick={() => setFilter(tp)} className={`px-3 py-1.5 text-xs font-mono rounded-sm border transition-colors ${filter === tp ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"}`}>
                  {tp}
                </button>
              ))}
            </div>
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="w-44 h-9 bg-card border-border text-xs">
                <SlidersHorizontal className="w-3 h-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">{c.sortDefault}</SelectItem>
                <SelectItem value="price-asc">{c.sortPriceAsc}</SelectItem>
                <SelectItem value="price-desc">{c.sortPriceDesc}</SelectItem>
                <SelectItem value="solar">{c.sortSolar}</SelectItem>
                <SelectItem value="rating">{c.sortRating}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2">
              <Switch id="avail-only" checked={availableOnly} onCheckedChange={setAvailableOnly} />
              <Label htmlFor="avail-only" className="text-xs cursor-pointer">{c.availableOnly}</Label>
            </div>
            <div className="flex border border-border rounded-sm overflow-hidden ms-auto">
              <button onClick={() => setView("grid")} className={`p-2 ${view === "grid" ? "bg-primary text-black" : "hover:bg-card text-muted-foreground"}`}><Grid3x3 className="w-4 h-4" /></button>
              <button onClick={() => setView("list")} className={`p-2 ${view === "list" ? "bg-primary text-black" : "hover:bg-card text-muted-foreground"}`}><List className="w-4 h-4" /></button>
            </div>
          </div>

          {compare.length > 0 && (
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border flex-wrap">
              <span className="text-xs font-mono text-muted-foreground">{c.compareLabel}</span>
              {compare.map((id) => {
                const cap = capsulesData.find((cap) => cap.id === id)!;
                return (
                  <span key={id} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-sm flex items-center gap-1">
                    {cap.name}
                    <button onClick={() => toggleCompare(id)} className="hover:text-red-400 ml-1">×</button>
                  </span>
                );
              })}
              {compare.length === 2 && (
                <Button size="sm" className="h-7 text-xs" onClick={() => setShowCompare(true)}>{c.compareNow}</Button>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground font-mono">
            {filtered.length} {filtered.length !== 1 ? c.foundPlural : c.found}
            {favorites.size > 0 && <span className="ms-3 text-primary">♥ {favorites.size} {c.saved}</span>}
          </p>
        </div>

        {/* Compare Modal */}
        {showCompare && compareCapsules.length === 2 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
            <div className="bg-background border border-border rounded-sm w-full max-w-3xl p-6 relative">
              <button onClick={() => setShowCompare(false)} className="absolute top-4 end-4 text-muted-foreground hover:text-foreground text-xl">×</button>
              <h3 className="font-bold text-lg mb-6 font-mono text-primary">{c.compareTitle}</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="font-mono text-muted-foreground space-y-3">
                  {c.compareFields.map((l) => (<div key={l} className="py-2 border-b border-border text-xs">{l}</div>))}
                </div>
                {compareCapsules.map((cap) => (
                  <div key={cap.id} className="space-y-3">
                    {[cap.name, cap.type, `$${cap.price}`, `${cap.occupancy} ${c.guests}`, cap.size, `${cap.solarEnergy.toFixed(0)}%`, `${cap.temperature.toFixed(1)}°C`, cap.status === "Available" ? t.common.available : t.common.booked, `${cap.rating.toFixed(1)} / 5`].map((v, i) => (
                      <div key={i} className={`py-2 border-b border-border text-xs font-mono ${i === 7 && cap.status === "Available" ? "text-green-400" : i === 7 ? "text-red-400" : ""}`}>{v}</div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-6">
                {compareCapsules.map((cap) => (
                  <Button key={cap.id} asChild className="flex-1 font-bold" disabled={cap.status !== "Available"}>
                    <Link href={`/capsules/${cap.id}`}>{c.bookNow} {cap.name}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="font-mono">{c.noResults}</p>
            <Button variant="link" onClick={() => { setSearch(""); setFilter(allLabel); setAvailableOnly(false); }}>{c.clearFilters}</Button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((capsule, i) => (
              <Card key={capsule.id} className="bg-card border-card-border overflow-hidden group hover-elevate relative flex flex-col">
                <div className="relative h-48 overflow-hidden">
                  <img src={i % 2 === 0 ? interiorImg : capsulePhotoPath} alt={capsule.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <button onClick={() => toggleFavorite(capsule.id)} className="absolute top-3 start-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur flex items-center justify-center hover:scale-110 transition-transform">
                    <Heart className={`w-4 h-4 ${favorites.has(capsule.id) ? "text-red-400 fill-red-400" : "text-white"}`} />
                  </button>
                  <button onClick={() => toggleCompare(capsule.id)} className={`absolute top-3 end-3 w-8 h-8 rounded-full backdrop-blur flex items-center justify-center transition-all ${compare.includes(capsule.id) ? "bg-primary text-black" : "bg-black/50 text-white hover:bg-primary/80 hover:text-black"}`} title={c.comparing}>
                    {compare.includes(capsule.id) ? <Check className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
                  </button>
                  <div className="absolute bottom-3 start-3">
                    <Badge className={`font-mono text-[10px] ${capsule.status === "Available" ? "bg-green-500/80 text-white border-none" : "bg-red-500/80 text-white border-none"}`}>
                      {capsule.status === "Available" ? t.common.available : t.common.booked}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 end-3">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur border-white/20 text-white font-mono text-[10px]">{capsule.type}</Badge>
                  </div>
                </div>
                <CardContent className="p-5 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold">{capsule.name}</h3>
                    <div className="text-end">
                      <span className="text-lg font-bold text-primary">${capsule.price}</span>
                      <span className="text-[10px] text-muted-foreground block">{t.common.perNight}</span>
                    </div>
                  </div>
                  <StarRating rating={capsule.rating} />
                  <p className="text-[10px] text-muted-foreground mt-0.5 mb-4">{capsule.reviewCount} {c.reviews}</p>
                  <div className="grid grid-cols-3 gap-2 mb-5">
                    <div className="flex flex-col items-center p-2 bg-background rounded-sm border border-border">
                      <Users className="w-4 h-4 text-muted-foreground mb-1" />
                      <span className="text-xs font-mono">{capsule.occupancy} {c.guests}</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-background rounded-sm border border-border">
                      <Thermometer className="w-4 h-4 text-muted-foreground mb-1" />
                      <span className="text-xs font-mono">{capsule.temperature.toFixed(1)}°C</span>
                    </div>
                    <div className="flex flex-col items-center p-2 bg-background rounded-sm border border-border">
                      <Sun className="w-4 h-4 text-primary mb-1" />
                      <span className="text-xs font-mono">{capsule.solarEnergy.toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {capsule.features.slice(0, 2).map((f) => (
                      <span key={f} className="text-[10px] px-2 py-0.5 bg-primary/5 border border-primary/10 text-muted-foreground rounded-sm">{f}</span>
                    ))}
                    {capsule.features.length > 2 && (
                      <span className="text-[10px] px-2 py-0.5 bg-card border border-border text-muted-foreground rounded-sm">+{capsule.features.length - 2}</span>
                    )}
                  </div>
                  <div className="flex gap-2 mt-auto">
                    <Button asChild variant="outline" className="flex-1 h-9 text-xs">
                      <Link href={`/capsules/${capsule.id}`} className="flex items-center justify-center gap-1">{c.viewSpecs} <ArrowRight className="w-3 h-3" /></Link>
                    </Button>
                    {capsule.status === "Available" && (
                      <Button asChild className="h-9 px-3 text-xs font-bold">
                        <Link href={`/booking?capsule=${capsule.id}`}>{c.bookNow}</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((capsule, i) => (
              <Card key={capsule.id} className="bg-card border-card-border overflow-hidden hover-elevate">
                <div className="flex items-center gap-4 p-4">
                  <div className="relative w-24 h-20 flex-shrink-0 overflow-hidden rounded-sm">
                    <img src={i % 2 === 0 ? interiorImg : capsulePhotoPath} alt={capsule.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{capsule.name}</h3>
                      <Badge variant="outline" className="text-[10px] font-mono">{capsule.type}</Badge>
                      <Badge className={`text-[10px] ${capsule.status === "Available" ? "bg-green-500/20 text-green-400 border-none" : "bg-red-500/20 text-red-400 border-none"}`}>
                        {capsule.status === "Available" ? t.common.available : t.common.booked}
                      </Badge>
                    </div>
                    <StarRating rating={capsule.rating} />
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground font-mono">
                      <span><Users className="w-3 h-3 inline me-1" />{capsule.occupancy} {c.guests}</span>
                      <span><Thermometer className="w-3 h-3 inline me-1" />{capsule.temperature.toFixed(1)}°C</span>
                      <span><Sun className="w-3 h-3 inline me-1 text-primary" />{capsule.solarEnergy.toFixed(0)}%</span>
                      <span><Zap className="w-3 h-3 inline me-1" />{capsule.size}</span>
                    </div>
                  </div>
                  <div className="text-end flex-shrink-0">
                    <p className="text-xl font-bold text-primary">${capsule.price}</p>
                    <p className="text-xs text-muted-foreground">{t.common.perNight}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => toggleFavorite(capsule.id)} className="p-1.5 hover:text-red-400 text-muted-foreground transition-colors">
                        <Heart className={`w-4 h-4 ${favorites.has(capsule.id) ? "text-red-400 fill-red-400" : ""}`} />
                      </button>
                      <Button asChild variant="outline" size="sm" className="text-xs h-8">
                        <Link href={`/capsules/${capsule.id}`}>{c.viewSpecs}</Link>
                      </Button>
                      {capsule.status === "Available" && (
                        <Button asChild size="sm" className="text-xs h-8 font-bold">
                          <Link href={`/booking?capsule=${capsule.id}`}>{c.bookNow}</Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
