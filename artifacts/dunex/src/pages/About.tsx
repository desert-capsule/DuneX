import { Card, CardContent } from "@/components/ui/card";
import blueprintPath from "@assets/665230351_940335428611214_6539201574132103206_n_1775877407361.png";
import { useLanguage } from "@/contexts/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  const a = t.about;

  const pillars = [
    { title: a.p1Title, desc: a.p1Desc },
    { title: a.p2Title, desc: a.p2Desc },
    { title: a.p3Title, desc: a.p3Desc },
  ];

  const phases = [
    { year: a.phase1, title: a.phase1Title, text: a.phase1Text },
    { year: a.phase2, title: a.phase2Title, text: a.phase2Text },
    { year: a.phase3, title: a.phase3Title, text: a.phase3Text },
    { year: a.phase4, title: a.phase4Title, text: a.phase4Text },
  ];

  return (
    <div className="pt-32 pb-24 w-full">
      <div className="container px-4">

        <div className="text-center max-w-3xl mx-auto mb-20 animate-in slide-in-from-bottom-10 fade-in duration-1000">
          <h1 className="text-sm font-mono text-primary mb-4 tracking-widest uppercase">{a.tag}</h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">{a.title}</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">{a.sub}</p>
        </div>

        <div className="mb-24 relative rounded-xl overflow-hidden glass-panel border-white/10 group animate-in slide-in-from-bottom-10 fade-in duration-1000 delay-200">
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
          <img src={blueprintPath} alt="Capsule Blueprint" className="w-full object-cover max-h-[600px] opacity-80 mix-blend-screen" />
          <div className="absolute bottom-6 left-6 z-20 glass-panel p-4 max-w-md">
            <h3 className="font-bold text-xl mb-2 text-white">{a.archTitle}</h3>
            <p className="text-sm text-white/80 font-mono">{a.archSub}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {pillars.map((pillar, i) => (
            <Card key={i} className="bg-card border-card-border hover-elevate">
              <CardContent className="p-8">
                <div className="text-primary font-mono text-4xl font-bold mb-4 opacity-50">0{i + 1}</div>
                <h4 className="text-xl font-bold mb-3">{pillar.title}</h4>
                <p className="text-muted-foreground">{pillar.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold mb-12 text-center">{a.roadmapTitle}</h3>
          <div className="space-y-12 border-s border-primary/20 ps-8 ms-4">
            {phases.map((phase, i) => (
              <div key={i} className="relative">
                <div className="absolute -start-[41px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-background" />
                <h4 className="text-sm font-mono text-primary mb-1">{phase.year}</h4>
                <h5 className="text-xl font-bold mb-2">{phase.title}</h5>
                <p className="text-muted-foreground">{phase.text}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
