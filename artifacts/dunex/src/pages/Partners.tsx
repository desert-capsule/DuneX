import { Card, CardContent } from "@/components/ui/card";
import { partnersData } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Partners() {
  const { t } = useLanguage();
  const p = t.partners;

  return (
    <div className="pt-32 pb-24 w-full">
      <div className="container max-w-5xl px-4">

        <div className="text-center mb-20">
          <h1 className="text-sm font-mono text-primary mb-4 tracking-widest uppercase">{p.tag}</h1>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">{p.title}</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{p.sub}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
          {partnersData.map((partner, i) => (
            <Card key={i} className="bg-card border-card-border hover:border-primary/50 transition-colors">
              <CardContent className="p-8 flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                  <div className="w-8 h-8 bg-primary/20 rounded-sm" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{partner.name}</h3>
                  <p className="text-primary font-mono text-sm">{partner.role}</p>
                  <p className="text-muted-foreground text-sm mt-2">{partner.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="p-12 glass-panel border border-border text-center rounded-xl">
          <h3 className="text-2xl font-bold mb-4">{p.ctaTitle}</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">{p.ctaSub}</p>
          <a href="/contact" className="inline-block bg-primary text-black font-bold tracking-widest px-8 py-4 text-sm rounded-sm hover:bg-primary/90 transition-colors">
            {p.ctaBtn}
          </a>
        </div>

      </div>
    </div>
  );
}
