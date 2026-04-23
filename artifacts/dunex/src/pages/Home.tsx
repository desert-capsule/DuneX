import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowRight, Sun, Wifi, Thermometer, Shield, Star, ChevronDown, ChevronUp,
  Wind, Droplets, Eye, Zap, Users, MapPin, CheckCircle, Calendar, Send,
  Battery, Leaf, Award, Clock
} from "lucide-react";
import capsulePhotoPath from "@assets/67b685d41ee6ad3416ec720c_IMG_2705-s_1775877411797.jpg";
import { testimonialsData, faqData } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";
import { GlobalDust } from "@/components/DustParticles";

function AnimatedCounter({ target, suffix = "", duration = 1800 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
      }
    }, { threshold: 0.2 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function Stars({ count = 5 }: { count?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={`w-3.5 h-3.5 ${i < count ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
      ))}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button className="w-full flex justify-between items-start py-5 text-left gap-4 hover:text-primary transition-colors" onClick={() => setOpen(!open)}>
        <span className="font-semibold text-base">{question}</span>
        {open ? <ChevronUp className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary" /> : <ChevronDown className="w-5 h-5 flex-shrink-0 mt-0.5 text-muted-foreground" />}
      </button>
      {open && <p className="text-muted-foreground text-sm pb-5 leading-relaxed pr-8">{answer}</p>}
    </div>
  );
}

export default function Home() {
  const { t } = useLanguage();
  const h = t.home;
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTestimonialIdx((i) => (i + 1) % testimonialsData.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) { setSubscribed(true); setEmail(""); }
  };

  const featureCards = [
    { icon: Sun, title: h.feat1Title, sub: h.feat1Sub },
    { icon: Wifi, title: h.feat2Title, sub: h.feat2Sub },
    { icon: Thermometer, title: h.feat3Title, sub: h.feat3Sub },
    { icon: Shield, title: h.feat4Title, sub: h.feat4Sub },
  ];

  const numbersData = [
    { icon: Battery, value: 20, suffix: "", label: h.num1Label, sub: h.num1Sub },
    { icon: Zap, value: 1450, suffix: " kWh", label: h.num2Label, sub: h.num2Sub },
    { icon: Leaf, value: 412, suffix: "", label: h.num3Label, sub: h.num3Sub },
    { icon: Award, value: 98, suffix: "%", label: h.num4Label, sub: h.num4Sub },
  ];

  const steps = [
    { icon: MapPin, tag: h.step1Tag, title: h.step1Title, desc: h.step1Desc },
    { icon: Calendar, tag: h.step2Tag, title: h.step2Title, desc: h.step2Desc },
    { icon: CheckCircle, tag: h.step3Tag, title: h.step3Title, desc: h.step3Desc },
  ];

  const smartFeatures = [
    { icon: Sun, title: h.sf1Title, desc: h.sf1Desc },
    { icon: Thermometer, title: h.sf2Title, desc: h.sf2Desc },
    { icon: Eye, title: h.sf3Title, desc: h.sf3Desc },
    { icon: Wifi, title: h.sf4Title, desc: h.sf4Desc },
    { icon: Battery, title: h.sf5Title, desc: h.sf5Desc },
    { icon: Users, title: h.sf6Title, desc: h.sf6Desc },
  ];

  return (
    <div className="w-full">
      <GlobalDust />

      {/* ── HERO ── */}
      <section className="relative h-[100dvh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80 z-10" />
          <img src={capsulePhotoPath} alt="DuneX Smart Capsule" className="w-full h-full object-cover scale-105" />
        </div>
        <div className="container relative z-20 px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 text-primary text-xs font-mono tracking-widest mb-8 rounded-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {h.liveBadge}
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tighter drop-shadow-lg">
            {h.heroTitle1} <span className="text-primary">{h.heroTitle2}</span><br />{h.heroTitle3}
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 font-mono">{h.heroSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-primary text-black hover:bg-primary/90 text-base px-8 py-6 rounded-none tracking-widest font-bold">
              <Link href="/booking">{h.initBooking}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8 py-6 rounded-none tracking-widest text-white border-white/30 hover:bg-white/10">
              <Link href="/capsules">{h.explorePods}</Link>
            </Button>
          </div>
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: h.statCapsules, value: "20" },
              { label: h.statSolar, value: "1,450 kWh" },
              { label: h.statSensors, value: "412" },
              { label: h.statCo2, value: "0.87 t" },
            ].map((s) => (
              <div key={s.label} className="bg-black/50 border border-white/10 px-4 py-3 backdrop-blur-sm">
                <p className="text-primary font-bold text-lg font-mono">{s.value}</p>
                <p className="text-white/50 text-[10px] tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
          <div className="w-[1px] h-16 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* ── WEATHER STRIP ── */}
      <div className="bg-black border-y border-primary/20 py-3 overflow-hidden">
        <div className="container px-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 text-xs font-mono text-muted-foreground flex-wrap">
            <span className="text-primary font-bold">{h.weatherLabel}</span>
            <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5 text-yellow-400" /> {h.weatherTemp}</span>
            <span className="flex items-center gap-1.5"><Wind className="w-3.5 h-3.5" /> {h.weatherWind}</span>
            <span className="flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-blue-400" /> {h.weatherHumidity}</span>
            <span className="flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> {h.weatherVis}</span>
          </div>
          <span className="text-xs font-mono text-primary hidden md:block">{h.weatherInterior}</span>
        </div>
      </div>

      {/* ── INTRO ── */}
      <section
        className="py-24 relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/intro-bg.avif')" }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-[1px]" />
        <div className="relative z-10 container px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-sm font-mono text-primary mb-3 tracking-widest uppercase">{h.introTag}</p>
              <p className="text-base font-mono text-white/60 mb-4 tracking-wide">Smart Eco Desert Camp</p>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">{h.introTitle}</h2>
              <p className="text-white/70 text-lg mb-6 leading-relaxed">{h.introPara1}</p>
              <p className="text-white/60 mb-8 leading-relaxed">{h.introPara2}</p>
              <Button asChild variant="link" className="text-primary p-0 h-auto font-mono group">
                <Link href="/about" className="flex items-center gap-2">
                  {h.readManifesto} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {featureCards.map((item, i) => (
                <Card key={i} className={`bg-black/40 border-white/10 backdrop-blur-sm p-6 flex flex-col items-start gap-4 ${i % 2 === 1 ? "mt-8" : ""}`}>
                  <div className="p-3 bg-primary/20 rounded-sm"><item.icon className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h4 className="font-bold text-lg text-white">{item.title}</h4>
                    <p className="text-sm text-white/60 mt-1">{item.sub}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ANIMATED NUMBERS ── */}
      <section className="py-20 bg-black border-y border-white/5">
        <div className="container px-4">
          <p className="text-center text-xs font-mono text-primary tracking-widest mb-12">{h.numbersTag}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {numbersData.map((s) => (
              <div key={s.label} className="space-y-2">
                <s.icon className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="text-4xl md:text-5xl font-bold text-white font-mono">
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </p>
                <p className="font-semibold text-foreground">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-background">
        <div className="container px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-mono text-primary tracking-widest mb-3">{h.howTag}</p>
            <h2 className="text-4xl font-bold">{h.howTitle}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent" />
            {steps.map((s) => (
              <div key={s.tag} className="flex flex-col items-center text-center relative">
                <div className="w-24 h-24 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-6 relative z-10">
                  <s.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-xs font-mono text-primary tracking-widest mb-2">{s.tag}</p>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SMART FEATURES ── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container px-4">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-primary tracking-widest mb-3">{h.smartTag}</p>
            <h2 className="text-4xl font-bold">{h.smartTitle}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {smartFeatures.map((f) => (
              <div key={f.title} className="flex gap-4 p-6 rounded-sm bg-background border border-border hover:border-primary/30 transition-colors group">
                <div className="w-10 h-10 bg-primary/10 rounded-sm flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-background">
        <div className="container px-4 max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-primary tracking-widest mb-3">{h.testiTag}</p>
            <h2 className="text-4xl font-bold">{h.testiTitle}</h2>
          </div>
          <div className="text-center mb-10 min-h-[180px] flex flex-col items-center justify-center">
            <Stars count={testimonialsData[testimonialIdx].rating} />
            <p className="text-xl md:text-2xl text-foreground mt-6 mb-6 leading-relaxed max-w-2xl">
              "{testimonialsData[testimonialIdx].text}"
            </p>
            <p className="font-bold">{testimonialsData[testimonialIdx].name}</p>
            <p className="text-sm text-muted-foreground mt-1">{testimonialsData[testimonialIdx].role} — {testimonialsData[testimonialIdx].location}</p>
          </div>
          <div className="flex justify-center gap-2 mb-12">
            {testimonialsData.map((_, i) => (
              <button key={i} onClick={() => setTestimonialIdx(i)} className={`rounded-full transition-all ${i === testimonialIdx ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-border"}`} />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {testimonialsData.slice(0, 3).map((t, i) => (
              <div key={i} onClick={() => setTestimonialIdx(i)} className={`bg-card border rounded-sm p-4 cursor-pointer hover:border-primary/30 transition-all ${testimonialIdx === i ? "border-primary/50" : "border-card-border"}`}>
                <Stars count={t.rating} />
                <p className="text-sm text-muted-foreground mt-3 line-clamp-3">"{t.text}"</p>
                <p className="text-xs font-bold mt-3">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-24 bg-card border-y border-border">
        <div className="container px-4 max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-mono text-primary tracking-widest mb-3">{h.faqTag}</p>
            <h2 className="text-4xl font-bold">{h.faqTitle}</h2>
          </div>
          <div className="rounded-sm overflow-hidden border border-border bg-background">
            <div className="px-6">
              {faqData.map((item) => (
                <FaqItem key={item.question} {...item} />
              ))}
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-8">
            {h.faqContact}{" "}
            <Link href="/contact" className="text-primary hover:underline font-medium">{h.faqContactLink}</Link>
          </p>
        </div>
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="py-20 bg-background">
        <div className="container px-4 max-w-2xl mx-auto text-center">
          <p className="text-xs font-mono text-primary tracking-widest mb-3">{h.newsletterTag}</p>
          <h2 className="text-3xl font-bold mb-4">{h.newsletterTitle}</h2>
          <p className="text-muted-foreground mb-8">{h.newsletterSub}</p>
          {subscribed ? (
            <div className="flex items-center justify-center gap-3 py-4 text-green-400 font-mono">
              <CheckCircle className="w-5 h-5" />
              <span>{h.newsletterConfirm}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <Input type="email" required placeholder={h.newsletterPlaceholder} value={email} onChange={(e) => setEmail(e.target.value)} className="bg-card border-border flex-1 rounded-none h-12" />
              <Button type="submit" className="rounded-none h-12 px-6 font-bold tracking-widest">
                <Send className="w-4 h-4 mr-2" /> {h.newsletterBtn}
              </Button>
            </form>
          )}
          <p className="text-xs text-muted-foreground mt-4">{h.newsletterNote}</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="container px-4 text-center relative z-10">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Clock className="w-5 h-5 text-black/70" />
            <span className="text-black/70 font-mono text-sm">{h.ctaTag}</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-bold mb-6 text-black tracking-tight">{h.ctaTitle}</h2>
          <p className="text-xl max-w-2xl mx-auto mb-10 text-black/80 font-mono">{h.ctaSub}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-black text-white hover:bg-black/90 text-lg px-12 py-8 rounded-none tracking-widest font-bold">
              <Link href="/booking">{h.ctaBook}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-black/30 text-black hover:bg-black/10 text-lg px-8 py-8 rounded-none tracking-widest">
              <Link href="/capsules">{h.ctaView}</Link>
            </Button>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      </section>

    </div>
  );
}
