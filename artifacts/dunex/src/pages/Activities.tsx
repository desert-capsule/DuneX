import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Tag, Users, ChevronRight, Star, Flame, Zap } from "lucide-react";
import { activitiesData } from "@/data/mockData";
import astronomyImg from "@/assets/images/astronomy.png";
import solarImg from "@/assets/images/solar.png";
import { useLanguage } from "@/contexts/LanguageContext";

const categoryColor: Record<string, string> = {
  Educational: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Workshop: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Adventure: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Culinary: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cultural: "bg-pink-500/10 text-pink-400 border-pink-500/20",
  Wellness: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};
const difficultyColor: Record<string, string> = {
  Easy: "bg-green-500/10 text-green-400 border-green-500/20",
  Moderate: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  Hard: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function Activities() {
  const { t, lang } = useLanguage();
  const a = t.activities;

  const categories = lang === "ar"
    ? ["الكل", "Educational", "Workshop", "Adventure", "Culinary", "Cultural", "Wellness"]
    : lang === "fr"
    ? ["Tous", "Éducatif", "Atelier", "Aventure", "Culinaire", "Culturel", "Bien-être"]
    : ["All", "Educational", "Workshop", "Adventure", "Culinary", "Cultural", "Wellness"];

  const catMap: Record<string, string> = lang === "fr"
    ? { "Tous": "All", "Éducatif": "Educational", "Atelier": "Workshop", "Aventure": "Adventure", "Culinaire": "Culinary", "Culturel": "Cultural", "Bien-être": "Wellness" }
    : lang === "ar"
    ? { "الكل": "All" }
    : {};

  const [category, setCategory] = useState(categories[0]);
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const engCat = catMap[category] || category;
    if (engCat === "All") return activitiesData;
    return activitiesData.filter((act) => act.category === engCat);
  }, [category, catMap]);

  const selectedActivity = activitiesData.find((act) => act.id === selected);

  const countForCat = (cat: string) => {
    const engCat = catMap[cat] || cat;
    if (engCat === "All") return activitiesData.length;
    return activitiesData.filter((act) => act.category === engCat).length;
  };

  return (
    <div className="pt-32 pb-24 w-full">
      <div className="container px-4">

        <div className="text-center max-w-3xl mx-auto mb-12">
          <p className="text-sm font-mono text-primary mb-3 tracking-widest uppercase">{a.tag}</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-5">{a.title}</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{a.sub}</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {[
            { label: a.statExp, value: activitiesData.length },
            { label: a.statCat, value: 6 },
            { label: a.statGroup, value: "20" },
            { label: a.statFrom, value: t.common.free },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-sm p-4 text-center">
              <p className="text-2xl font-bold text-primary font-mono">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-10 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-4 py-2 text-xs font-mono rounded-sm border whitespace-nowrap transition-all ${category === cat ? "bg-primary text-black border-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"}`}>
              {cat} <span className="opacity-60">({countForCat(cat)})</span>
            </button>
          ))}
        </div>

        {/* Detail Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setSelected(null)}>
            <div className="bg-background border border-border rounded-sm w-full max-w-2xl p-6 relative" onClick={(e) => e.stopPropagation()}>
              <button onClick={() => setSelected(null)} className="absolute top-4 end-4 text-muted-foreground hover:text-foreground text-xl">×</button>
              <div className="flex gap-2 mb-3">
                <Badge className={`text-[10px] border ${categoryColor[selectedActivity.category] ?? ""}`}>{selectedActivity.category}</Badge>
                <Badge className={`text-[10px] border ${difficultyColor[selectedActivity.difficulty] ?? ""}`}>{selectedActivity.difficulty}</Badge>
              </div>
              <h2 className="text-2xl font-bold mb-4">{selectedActivity.title}</h2>
              <p className="text-muted-foreground mb-5 leading-relaxed">{selectedActivity.description}</p>
              <div className="grid grid-cols-2 gap-4 mb-5">
                {[
                  { label: a.duration, value: selectedActivity.duration, icon: Clock },
                  { label: a.maxGroup, value: `${selectedActivity.maxGroup} ${a.people}`, icon: Users },
                  { label: a.schedule, value: selectedActivity.schedule, icon: Zap },
                  { label: a.price, value: selectedActivity.price === 0 ? t.common.complimentary : `$${selectedActivity.price}${t.common.perPerson}`, icon: Tag },
                ].map((d) => (
                  <div key={d.label} className="flex items-start gap-3 p-3 bg-card border border-border rounded-sm">
                    <d.icon className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-[10px] text-muted-foreground font-mono">{d.label.toUpperCase()}</p>
                      <p className="text-sm font-medium">{d.value}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mb-5">
                <p className="text-xs font-mono text-muted-foreground mb-2">{a.includes}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedActivity.includes.map((inc) => (
                    <span key={inc} className="text-xs px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded-sm">{inc}</span>
                  ))}
                </div>
              </div>
              <Button asChild className="w-full font-bold tracking-widest">
                <Link href="/booking">{a.addToBooking} <ChevronRight className="w-4 h-4 ms-2" /></Link>
              </Button>
            </div>
          </div>
        )}

        {/* Activity Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {filtered.map((activity, i) => (
            <Card key={activity.id} className="bg-card border-card-border overflow-hidden flex flex-col md:flex-row group hover-elevate cursor-pointer" onClick={() => setSelected(activity.id)}>
              <div className="w-full md:w-2/5 h-52 md:h-auto relative overflow-hidden flex-shrink-0">
                <img src={i % 2 === 0 ? astronomyImg : solarImg} alt={activity.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 start-3 flex flex-col gap-1">
                  <Badge className={`text-[10px] border ${categoryColor[activity.category] ?? "bg-card border-border text-foreground"}`}>{activity.category}</Badge>
                  <Badge className={`text-[10px] border ${difficultyColor[activity.difficulty] ?? ""}`}>
                    {activity.difficulty === "Hard" ? <Flame className="w-2.5 h-2.5 me-1" /> : null}
                    {activity.difficulty}
                  </Badge>
                </div>
                <div className="absolute bottom-3 start-3 flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className="w-2.5 h-2.5 text-primary fill-primary" />
                  ))}
                </div>
              </div>
              <CardContent className="w-full md:w-3/5 p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{activity.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">{activity.description}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {activity.includes.slice(0, 3).map((inc) => (
                      <span key={inc} className="text-[10px] px-2 py-0.5 bg-primary/5 border border-primary/10 text-muted-foreground rounded-sm">{inc}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-muted-foreground mb-4">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activity.duration}</span>
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {a.maxGroup} {activity.maxGroup}</span>
                    <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-primary" /> {activity.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-bold ${activity.price === 0 ? "text-green-400" : "text-primary"}`}>
                      {activity.price === 0 ? t.common.complimentary : `$${activity.price} ${t.common.perPerson}`}
                    </span>
                    <Button size="sm" variant="outline" className="text-xs gap-1 group/btn">
                      {a.details} <ChevronRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Full Schedule */}
        <div className="bg-card border border-border rounded-sm p-6 mb-16">
          <h3 className="font-bold text-lg mb-5 font-mono">{a.scheduleTitle}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activitiesData.map((act) => (
              <div key={act.id} onClick={() => setSelected(act.id)} className="flex items-center justify-between p-3 border border-border rounded-sm hover:border-primary/30 hover:bg-primary/5 cursor-pointer transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium group-hover:text-primary transition-colors">{act.title}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{act.schedule} — {act.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold ${act.price === 0 ? "text-green-400" : "text-primary"}`}>{act.price === 0 ? t.common.free : `$${act.price}`}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="p-12 bg-primary/5 border border-primary/20 rounded-sm text-center">
          <h3 className="text-2xl font-bold mb-4">{a.ctaTitle}</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{a.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary hover:text-black font-bold">
              <Link href="/contact">{a.ctaInquire}</Link>
            </Button>
            <Button asChild className="font-bold">
              <Link href="/booking">{a.ctaBook}</Link>
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
