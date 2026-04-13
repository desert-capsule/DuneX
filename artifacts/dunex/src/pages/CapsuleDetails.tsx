import { useParams, Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { capsulesData } from "@/data/mockData";
import { ArrowLeft, Check, Sun, Thermometer, Users, Maximize, Zap, Wifi, Star, Loader2, MessageSquare } from "lucide-react";
import interiorImg from "@/assets/images/capsule-interior.png";
import capsulePhotoPath from "@assets/67b685d41ee6ad3416ec720c_IMG_2705-s_1775877411797.jpg";
import { useLanguage } from "@/contexts/LanguageContext";

const API = "/api";

type Review = {
  id: number;
  capsuleId: string;
  capsuleName: string;
  guestName: string;
  rating: number;
  comment: string;
  status: string;
  createdAt: string;
};

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

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="focus:outline-none"
        >
          <Star className={`w-6 h-6 transition-colors ${n <= (hover || value) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
        </button>
      ))}
    </div>
  );
}

export default function CapsuleDetails() {
  const params = useParams();
  const { t, lang } = useLanguage();
  const { toast } = useToast();
  const capsule = capsulesData.find((c) => c.id === params.id);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!params.id) return;
    setReviewsLoading(true);
    apiFetch(`/reviews/capsule/${params.id}`)
      .then((data) => setReviews(data.filter((r: Review) => r.status === "Published")))
      .catch(() => setReviews([]))
      .finally(() => setReviewsLoading(false));
  }, [params.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capsule) return;
    setSubmitting(true);
    try {
      const created = await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({
          capsuleId: capsule.id,
          capsuleName: capsule.name,
          guestName: guestName.trim(),
          rating,
          comment: comment.trim(),
          status: "Published",
        }),
      });
      setReviews((prev) => [created, ...prev]);
      setGuestName("");
      setRating(5);
      setComment("");
      toast({ title: lang === "ar" ? "شكراً على تقييمك!" : lang === "fr" ? "Merci pour votre avis !" : "Thank you for your review!" });
    } catch {
      toast({ title: lang === "ar" ? "فشل الإرسال" : lang === "fr" ? "Échec de l'envoi" : "Submission failed", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (!capsule) {
    return <div className="pt-32 text-center"><h1 className="text-2xl">Capsule not found.</h1></div>;
  }

  const isAvailable = capsule.status === "Available";
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : capsule.rating;
  const reviewCount = reviews.length || capsule.reviewCount;

  return (
    <div className="pt-24 pb-24 w-full">
      <div className="container px-4">
        <Link href="/capsules" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 font-mono">
          <ArrowLeft className="w-4 h-4" />
          {t.capsules.tag.toUpperCase()}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-card-border">
              <img src={interiorImg} alt="Interior" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-card-border">
                <img src={capsulePhotoPath} alt="Exterior" className="w-full h-full object-cover" />
              </div>
              <div className="aspect-[4/3] rounded-xl overflow-hidden border border-card-border bg-card flex items-center justify-center">
                <p className="font-mono text-muted-foreground text-sm">Gallery Preview</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-col">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="outline" className="font-mono text-primary border-primary/50">{capsule.type}</Badge>
                <Badge
                  className={`font-mono ${isAvailable ? "bg-green-500/20 text-green-400 border-none" : "bg-red-500/20 text-red-400 border-none"}`}
                >
                  {isAvailable ? t.common.available : t.common.booked}
                </Badge>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-3">{capsule.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(avgRating) ? "text-primary fill-primary" : "text-muted-foreground/30"}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground font-mono">{avgRating.toFixed(1)} ({reviewCount} {t.capsules.reviews})</span>
              </div>

              <p className="text-muted-foreground text-lg mb-6">
                {lang === "ar"
                  ? "تحفة من الهندسة الذكية. تتميز هذه القبة الجيوديسية باستقلالية مناخية كاملة، ومناظر بانورامية لمشاهدة النجوم، وتكامل كامل مع إنترنت الأشياء."
                  : lang === "fr"
                  ? "Un chef-d'œuvre d'ingénierie intelligente. Ce dôme géodésique offre une autonomie climatique totale, des panoramas pour observer les étoiles et une intégration IoT complète."
                  : "A masterpiece of smart engineering. This geodesic dome features absolute climate autonomy, star-gazing panoramas, and full IoT integration for the ultimate eco-luxury experience."}
              </p>

              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">${capsule.price}</span>
                <span className="text-muted-foreground">{t.common.perNight}</span>
              </div>
            </div>

            <Separator className="my-6 bg-card-border" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { icon: Users, label: lang === "ar" ? "السعة" : lang === "fr" ? "Capacité" : "Capacity", value: `Up to ${capsule.occupancy}` },
                { icon: Maximize, label: lang === "ar" ? "المساحة" : lang === "fr" ? "Espace" : "Space", value: capsule.size },
                { icon: Thermometer, label: lang === "ar" ? "المناخ" : lang === "fr" ? "Climat" : "Climate", value: "Smart AC" },
                { icon: Zap, label: lang === "ar" ? "الطاقة" : lang === "fr" ? "Énergie" : "Power", value: "100% Solar" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-2">
                  <s.icon className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium">{s.label}</span>
                  <span className="text-sm text-muted-foreground font-mono">{s.value}</span>
                </div>
              ))}
            </div>

            <div className="mb-10">
              <h3 className="font-bold text-lg mb-4">
                {lang === "ar" ? "المزايا الذكية" : lang === "fr" ? "Fonctionnalités Intelligentes" : "Smart Features"}
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {capsule.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-6 border-t border-card-border">
              <Button
                asChild
                size="lg"
                className="w-full text-lg h-14 tracking-widest font-bold"
                disabled={!isAvailable}
              >
                <Link href={`/booking?capsule=${capsule.id}`}>
                  {isAvailable
                    ? (lang === "ar" ? "ابدأ الحجز" : lang === "fr" ? "INITIER LA RÉSERVATION" : "INITIATE BOOKING")
                    : (lang === "ar" ? "غير متاح حالياً" : lang === "fr" ? "INDISPONIBLE" : "CURRENTLY UNAVAILABLE")}
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* ── REVIEWS SECTION ── */}
        <div className="mt-20">
          <div className="flex items-center gap-3 mb-10">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-2xl font-bold">
              {lang === "ar" ? "تقييمات الضيوف" : lang === "fr" ? "Avis des Clients" : "Guest Reviews"}
            </h2>
            <span className="font-mono text-sm text-muted-foreground">({reviewCount})</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Reviews list */}
            <div className="lg:col-span-2 space-y-5">
              {reviewsLoading ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-mono py-8">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {lang === "ar" ? "جار التحميل..." : lang === "fr" ? "Chargement..." : "Loading reviews..."}
                </div>
              ) : reviews.length === 0 ? (
                <div className="py-12 text-center border border-dashed border-card-border rounded-xl">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground font-mono">
                    {lang === "ar" ? "لا توجد تقييمات بعد. كن أول من يقيّم!" : lang === "fr" ? "Aucun avis pour l'instant. Soyez le premier !" : "No reviews yet. Be the first to leave one!"}
                  </p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="border border-card-border rounded-xl p-5 bg-card space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{r.guestName}</p>
                        <p className="text-xs text-muted-foreground font-mono">{new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex gap-0.5 flex-shrink-0">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
                  </div>
                ))
              )}
            </div>

            {/* Submit review */}
            <div className="lg:col-span-1">
              <div className="border border-primary/20 rounded-xl p-6 bg-card sticky top-28">
                <h3 className="font-bold font-mono text-sm text-primary tracking-widest mb-5 pb-4 border-b border-card-border">
                  {lang === "ar" ? "أضف تقييمك" : lang === "fr" ? "LAISSER UN AVIS" : "LEAVE A REVIEW"}
                </h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono tracking-widest text-muted-foreground">
                      {lang === "ar" ? "اسمك" : lang === "fr" ? "VOTRE NOM" : "YOUR NAME"}
                    </Label>
                    <Input
                      required
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="bg-background border-border h-10"
                      placeholder={lang === "ar" ? "الاسم الكامل" : lang === "fr" ? "Prénom Nom" : "Full name"}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono tracking-widest text-muted-foreground">
                      {lang === "ar" ? "تقييمك" : lang === "fr" ? "NOTE" : "RATING"}
                    </Label>
                    <StarPicker value={rating} onChange={setRating} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-mono tracking-widest text-muted-foreground">
                      {lang === "ar" ? "تعليقك" : lang === "fr" ? "COMMENTAIRE" : "COMMENT"}
                    </Label>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="bg-background border-border min-h-[90px] resize-none"
                      placeholder={lang === "ar" ? "شاركنا تجربتك..." : lang === "fr" ? "Partagez votre expérience..." : "Share your experience..."}
                    />
                  </div>
                  <Button type="submit" className="w-full font-bold tracking-widest" disabled={submitting}>
                    {submitting
                      ? <><Loader2 className="w-4 h-4 me-2 animate-spin" />{lang === "ar" ? "جاري الإرسال..." : lang === "fr" ? "Envoi..." : "Submitting..."}</>
                      : (lang === "ar" ? "إرسال التقييم" : lang === "fr" ? "Envoyer l'avis" : "Submit Review")}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
