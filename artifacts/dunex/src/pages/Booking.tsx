import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Check, ChevronRight, Users, Calendar, Sun, Thermometer, Shield, Star, Zap, AlertCircle, Loader2 } from "lucide-react";
import { capsulesData, activitiesData } from "@/data/mockData";
import { useLanguage } from "@/contexts/LanguageContext";

type Step = 1 | 2 | 3 | 4;

const API = "/api";
async function bookingApiFetch(path: string, opts?: RequestInit) {
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


function StepIndicator({ current, labels }: { current: Step; labels: string[] }) {
  return (
    <div className="flex items-center justify-center mb-12 gap-0">
      {labels.map((label, i) => {
        const n = i + 1;
        return (
          <div key={n} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold font-mono transition-all ${current > n ? "bg-primary border-primary text-black" : current === n ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
              {current > n ? <Check className="w-4 h-4" /> : n}
            </div>
            <p className={`hidden sm:block text-[10px] font-mono tracking-widest mx-2 ${current >= n ? "text-primary" : "text-muted-foreground"}`}>{label}</p>
            {i < labels.length - 1 && <div className={`w-8 sm:w-16 h-[2px] ${current > n ? "bg-primary" : "bg-border"}`} />}
          </div>
        );
      })}
    </div>
  );
}

export default function Booking() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const b = t.booking;

  const [step, setStep] = useState<Step>(1);
  const [selectedCapsule, setSelectedCapsule] = useState("");
  const [guests, setGuests] = useState("2");
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bookingRef] = useState(`DX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [nationality, setNationality] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitError, setSubmitError] = useState("");

  const capsule = capsulesData.find((c) => c.id === selectedCapsule);

  const nights = (() => {
    if (!checkin || !checkout) return 1;
    const d = (new Date(checkout).getTime() - new Date(checkin).getTime()) / 86400000;
    return Math.max(1, Math.round(d));
  })();

  const basePrice = (capsule?.price ?? 0) * nights;
  const activityTotal = selectedActivities.reduce((acc, id) => {
    const act = activitiesData.find((a) => a.id === id);
    return acc + (act?.price ?? 0) * Number(guests);
  }, 0);
  const taxes = (basePrice + activityTotal) * 0.15;
  const total = basePrice + activityTotal + taxes;

  const toggleActivity = (id: string) =>
    setSelectedActivities((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const canProceedStep1 = selectedCapsule && checkin && checkout && nights >= 1;

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");
    try {
      const activityNames = selectedActivities.map(id => activitiesData.find(a => a.id === id)?.title).filter(Boolean).join(", ");
      const notes = [
        `Email: ${email}`,
        `Phone: ${phone}`,
        nationality && `Nationality: ${nationality}`,
        activityNames && `Activities: ${activityNames}`,
        specialRequests && `Requests: ${specialRequests}`,
      ].filter(Boolean).join(" | ");

      await bookingApiFetch("/reservations", {
        method: "POST",
        body: JSON.stringify({
          reservationId: bookingRef,
          guest: `${firstName} ${lastName}`.trim(),
          capsule: capsule?.name ?? selectedCapsule,
          checkin,
          checkout,
          status: "Pending",
          amount: Math.round(total),
          notes,
        }),
      });
      setStep(4);
      toast({ title: b.successTag, description: b.successMsg });
    } catch (err: any) {
      setSubmitError(err.message || "Booking failed. Please try again.");
      toast({ title: "Booking failed", description: err.message || "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const stepLabels = [b.step1, b.step2, b.step3, b.step4];

  return (
    <div className="pt-28 pb-24 w-full">
      <div className="container max-w-6xl px-4">
        <div className="text-center mb-4">
          <p className="text-xs font-mono text-primary tracking-widest mb-2">{b.tag}</p>
          <h1 className="text-4xl md:text-5xl font-bold">{b.title}</h1>
        </div>
        <StepIndicator current={step} labels={stepLabels} />

        {/* SUCCESS */}
        {step === 4 && (
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-card border-primary/30 p-12">
              <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/40">
                <Check className="w-8 h-8 text-primary" />
              </div>
              <p className="text-xs font-mono text-primary tracking-widest mb-3">{b.successTag}</p>
              <h2 className="text-3xl font-bold mb-4">{b.successTitle}</h2>
              <p className="text-muted-foreground mb-3 font-mono text-sm">{b.successRef} <span className="text-primary">{bookingRef}</span></p>
              <p className="text-muted-foreground mb-8">{b.successMsg}</p>
              <div className="bg-primary/5 border border-primary/20 rounded-sm p-4 mb-8 text-left text-sm space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">{b.capsuleLabel}</span><span className="font-mono">{capsule?.name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{b.successNights}</span><span className="font-mono">{nights}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{b.successGuests}</span><span className="font-mono">{guests}</span></div>
                <div className="flex justify-between font-bold"><span>{b.total}</span><span className="text-primary">${total.toFixed(2)}</span></div>
              </div>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => { setStep(1); setSelectedCapsule(""); }} className="font-mono">{b.newBooking}</Button>
                <Button asChild className="font-bold"><Link href="/">{b.returnBase}</Link></Button>
              </div>
            </Card>
          </div>
        )}

        {step !== 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">

              {/* STEP 1 */}
              <Card className={`bg-card border-card-border transition-all ${step !== 1 && step !== 3 ? "opacity-60" : ""}`}>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold font-mono text-primary">{b.s1Title}</h2>
                    {step > 1 && <button onClick={() => setStep(1)} className="text-xs font-mono text-muted-foreground hover:text-primary">{b.s1Edit}</button>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2 md:col-span-2">
                      <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.selectPod}</Label>
                      <Select value={selectedCapsule} onValueChange={setSelectedCapsule} disabled={step > 1}>
                        <SelectTrigger className="bg-background border-border h-11">
                          <SelectValue placeholder={b.chooseCapsule} />
                        </SelectTrigger>
                        <SelectContent>
                          {capsulesData.filter((c) => c.status === "Available").map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name} — {c.type} (${c.price}{t.common.perNight})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {capsule && (
                      <div className="md:col-span-2 bg-primary/5 border border-primary/20 rounded-sm p-4 flex flex-wrap gap-4 items-center">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(capsule.rating) ? "text-primary fill-primary" : "text-muted-foreground/20"}`} />
                          ))}
                        </div>
                        <div className="flex gap-4 text-xs font-mono text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {capsule.occupancy}</span>
                          <span className="flex items-center gap-1"><Thermometer className="w-3.5 h-3.5" /> {capsule.temperature.toFixed(1)}°C</span>
                          <span className="flex items-center gap-1"><Sun className="w-3.5 h-3.5 text-primary" /> {capsule.solarEnergy.toFixed(0)}%</span>
                          <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5" /> {capsule.size}</span>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.arrivalDate}</Label>
                      <Input type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} className="bg-background border-border h-11 [color-scheme:dark]" disabled={step > 1} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.departureDate}</Label>
                      <Input type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} className="bg-background border-border h-11 [color-scheme:dark]" disabled={step > 1} />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.occupants}</Label>
                      <Select value={guests} onValueChange={setGuests} disabled={step > 1}>
                        <SelectTrigger className="bg-background border-border h-11"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((n) => (
                            <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? b.guest : b.guests}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {checkin && checkout && nights > 0 && (
                      <div className="flex items-center justify-center bg-background border border-border rounded-sm h-11 text-sm font-mono">
                        <Calendar className="w-4 h-4 text-primary me-2" />
                        <span className="text-primary font-bold">{nights}</span>
                        <span className="text-muted-foreground ms-1">{nights === 1 ? b.night : b.nights}</span>
                      </div>
                    )}
                  </div>
                  {step === 1 && (
                    <Button className="mt-6 w-full h-12 font-bold tracking-widest" disabled={!canProceedStep1} onClick={() => setStep(2)}>
                      {b.nextExperiences} <ChevronRight className="w-4 h-4 ms-2" />
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* STEP 2 */}
              {step >= 2 && (
                <Card className={`bg-card border-card-border transition-all ${step !== 2 ? "opacity-60" : ""}`}>
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold font-mono text-primary">{b.s2Title}</h2>
                      {step > 2 && <button onClick={() => setStep(2)} className="text-xs font-mono text-muted-foreground hover:text-primary">{b.s1Edit}</button>}
                    </div>
                    <div className="space-y-3">
                      {activitiesData.map((act) => {
                        const isSelected = selectedActivities.includes(act.id);
                        return (
                          <div key={act.id} onClick={() => step === 2 && toggleActivity(act.id)} className={`flex items-center gap-4 p-3 border rounded-sm cursor-pointer transition-all ${isSelected ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/20"} ${step !== 2 ? "pointer-events-none" : ""}`}>
                            <div className={`w-5 h-5 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all ${isSelected ? "bg-primary border-primary" : "border-border"}`}>
                              {isSelected && <Check className="w-3 h-3 text-black" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-sm font-medium">{act.title}</p>
                                <Badge variant="outline" className="text-[10px] font-mono">{act.category}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">{act.duration} · {t.activities.maxGroup} {act.maxGroup} · {act.schedule}</p>
                            </div>
                            <span className={`text-sm font-bold font-mono flex-shrink-0 ${act.price === 0 ? "text-green-400" : "text-primary"}`}>
                              {act.price === 0 ? t.common.free : `+$${act.price}${t.common.perPerson}`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    {step === 2 && (
                      <Button className="mt-6 w-full h-12 font-bold tracking-widest" onClick={() => setStep(3)}>
                        {b.s3Title} <ChevronRight className="w-4 h-4 ms-2" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* STEP 3 */}
              {step >= 3 && (
                <Card className="bg-card border-card-border">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-lg font-bold font-mono text-primary mb-6">{b.s3Title}</h2>
                    <form id="booking-form" onSubmit={handleFinalSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.firstName}</Label>
                          <Input required value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-background border-border h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.lastName}</Label>
                          <Input required value={lastName} onChange={e => setLastName(e.target.value)} className="bg-background border-border h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.email}</Label>
                          <Input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="bg-background border-border h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.phone}</Label>
                          <Input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="bg-background border-border h-11" />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.nationality}</Label>
                          <Input value={nationality} onChange={e => setNationality(e.target.value)} className="bg-background border-border h-11" placeholder={b.nationalityPlaceholder} />
                        </div>
                        <div className="space-y-2">
                          <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.promoCode}</Label>
                          <Input className="bg-background border-border h-11" placeholder={b.promoPlaceholder} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label className="font-mono text-xs tracking-widest text-muted-foreground">{b.specialRequests}</Label>
                          <Textarea value={specialRequests} onChange={e => setSpecialRequests(e.target.value)} className="bg-background border-border min-h-[80px]" placeholder={b.specialPlaceholder} />
                        </div>
                      </div>
                      <Separator className="bg-border" />
                      <div className="bg-amber-500/5 border border-amber-500/20 rounded-sm p-4 flex gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-muted-foreground">{b.cancelPolicy}</p>
                      </div>
                      {submitError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-sm p-3 flex gap-2 items-center">
                          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                          <p className="text-xs text-red-300">{submitError}</p>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <input type="checkbox" id="terms" required className="mt-1" />
                        <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                          {b.termsText} <Link href="#" className="text-primary hover:underline">{b.termsLink1}</Link>{", "}
                          <Link href="#" className="text-primary hover:underline">{b.termsLink2}</Link> {b.termsAnd} {b.termsCancel}
                        </label>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <Card className="bg-card border-primary/20 sticky top-28 shadow-lg">
                <CardContent className="p-6">
                  <h3 className="text-sm font-bold font-mono mb-5 border-b border-border pb-4 text-primary tracking-widest">{b.flightLog}</h3>
                  {!selectedCapsule ? (
                    <div className="text-center py-8 text-muted-foreground text-xs font-mono">{b.awaiting}</div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-muted-foreground font-mono mb-1">{b.capsuleLabel}</p>
                        <p className="font-bold">{capsule?.name}</p>
                        <p className="text-xs text-primary">{capsule?.type} · {capsule?.size}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-3 border-y border-border text-center">
                        <div><p className="text-[10px] text-muted-foreground font-mono">{b.nightsLabel}</p><p className="font-bold text-primary">{nights}</p></div>
                        <div><p className="text-[10px] text-muted-foreground font-mono">{b.guestsLabel}</p><p className="font-bold">{guests}</p></div>
                        <div><p className="text-[10px] text-muted-foreground font-mono">{b.typeLabel}</p><p className="font-bold text-xs">{capsule?.type?.split(" ")[0]}</p></div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{b.baseRate} ({nights}n × ${capsule?.price})</span>
                          <span className="font-mono">${basePrice.toFixed(2)}</span>
                        </div>
                        {selectedActivities.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">{b.expLabel}</p>
                            {selectedActivities.map((id) => {
                              const act = activitiesData.find((a) => a.id === id)!;
                              return (
                                <div key={id} className="flex justify-between text-xs text-muted-foreground ms-2">
                                  <span>· {act.title}</span>
                                  <span className="font-mono">{act.price === 0 ? t.common.free : `$${act.price * Number(guests)}`}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{b.taxLabel}</span>
                          <span className="font-mono">${taxes.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-end pt-3 border-t border-border">
                        <span className="font-bold">{b.total}</span>
                        <span className="text-2xl font-bold text-primary font-mono">${total.toFixed(2)}</span>
                      </div>
                      {step === 3 && (
                        <Button type="submit" form="booking-form" className="w-full font-bold tracking-widest h-12 mt-2" disabled={loading}>
                          {loading ? <><Loader2 className="w-4 h-4 me-2 animate-spin" />{b.processing}</> : <><Shield className="w-4 h-4 me-2" />{b.confirmPay}</>}
                        </Button>
                      )}
                      <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground mt-2">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span>{b.encrypted}</span>
                      </div>
                      {capsule && (
                        <div className="pt-3 border-t border-border space-y-1.5">
                          {capsule.features.slice(0, 4).map((f) => (
                            <div key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="w-3 h-3 text-primary flex-shrink-0" /> {f}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
