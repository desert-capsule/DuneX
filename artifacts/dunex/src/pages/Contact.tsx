import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Contact() {
  const { toast } = useToast();
  const { t } = useLanguage();
  const c = t.contact;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: c.toastTitle, description: c.toastDesc });
  };

  const info = [
    { icon: MapPin, title: c.coordTitle, value: c.coordValue },
    { icon: Phone, title: c.phoneTitle, value: c.phoneValue },
    { icon: Mail, title: c.emailTitle, value: c.emailValue },
  ];

  return (
    <div className="pt-32 pb-24 w-full">
      <div className="container px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
          <div>
            <h1 className="text-sm font-mono text-primary mb-4 tracking-widest uppercase">{c.tag}</h1>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{c.title}</h2>
            <p className="text-lg text-muted-foreground mb-12">{c.sub}</p>

            <div className="space-y-8 mb-12">
              {info.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <div className="p-3 bg-card border border-border rounded-full text-primary">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                    <p className="text-muted-foreground font-mono text-sm whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Card className="bg-card border-card-border">
            <CardContent className="p-8 md:p-10">
              <h3 className="text-2xl font-bold mb-8">{c.formTitle}</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{c.firstName}</Label>
                    <Input id="firstName" required className="bg-background border-border" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{c.lastName}</Label>
                    <Input id="lastName" required className="bg-background border-border" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{c.emailLabel}</Label>
                  <Input id="email" type="email" required className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">{c.subjectLabel}</Label>
                  <Input id="subject" required className="bg-background border-border" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">{c.messageLabel}</Label>
                  <Textarea id="message" required className="bg-background border-border min-h-[150px]" />
                </div>
                <Button type="submit" size="lg" className="w-full tracking-widest font-bold">
                  {c.sendBtn}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
