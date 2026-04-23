import { Link } from "wouter";
import logoPath from "@assets/e11b493c-2b8a-480b-b05e-415585d9ed79_1775877456770.png";
import { useLanguage } from "@/contexts/LanguageContext";

export function Footer() {
  const { t } = useLanguage();
  const f = t.footer;

  return (
    <footer className="bg-card border-t border-border pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <img src={logoPath} alt="DuneX Logo" className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold tracking-widest text-foreground">
                DUNE<span className="text-primary">X</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">{f.tagline}</p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{f.explore}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/capsules" className="hover:text-primary transition-colors">{f.ourCapsules}</Link></li>
              <li><Link href="/activities" className="hover:text-primary transition-colors">{f.experiences}</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors">{f.startupVision}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{f.legal}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="#" className="hover:text-primary transition-colors">{f.terms}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{f.privacy}</Link></li>
              <li><Link href="#" className="hover:text-primary transition-colors">{f.sustainability}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">{f.connect}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/contact" className="hover:text-primary transition-colors">{f.contactUs}</Link></li>
              <li><Link href="/dashboard" className="text-primary hover:text-primary/80 transition-colors">{f.missionControl}</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {f.rights}</p>
        </div>
      </div>
    </footer>
  );
}
