import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Globe } from "lucide-react";
import logoPath from "@assets/e11b493c-2b8a-480b-b05e-415585d9ed79_1775877456770.png";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Lang } from "@/i18n/translations";

const LANGS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "ar", label: "ع", flag: "🇩🇿" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [location] = useLocation();
  const { t, lang, setLang } = useLanguage();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setLangOpen(false);
    if (langOpen) window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [langOpen]);

  const navLinks = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/capsules", label: t.nav.capsules },
    { href: "/activities", label: t.nav.activities },
    { href: "/partners", label: t.nav.partners },
    { href: "/contact", label: t.nav.contact },
  ];

  const currentLang = LANGS.find((l) => l.code === lang)!;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "glass-panel py-3" : "bg-transparent py-5"}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <img src={logoPath} alt="DuneX Logo" className="h-10 w-10 object-contain transition-transform group-hover:scale-105" />
          <span className={`text-xl font-bold tracking-widest ${scrolled ? "text-foreground" : "text-white"}`}>
            DUNE<span className="text-primary">X</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium tracking-wide hover:text-primary transition-colors ${
                location === link.href ? "text-primary" : scrolled ? "text-muted-foreground" : "text-white/80"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Language Switcher */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-sm text-xs font-mono transition-colors ${
                scrolled ? "border-border text-muted-foreground hover:border-primary hover:text-primary" : "border-white/20 text-white/80 hover:border-white hover:text-white"
              }`}
              data-testid="button-lang-toggle"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{currentLang.flag} {currentLang.label}</span>
            </button>
            {langOpen && (
              <div className="absolute top-full mt-2 right-0 bg-background border border-border rounded-sm overflow-hidden shadow-lg z-50 min-w-[120px]">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-mono hover:bg-card transition-colors text-left ${lang === l.code ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
                    data-testid={`button-lang-${l.code}`}
                  >
                    <span>{l.flag}</span>
                    <span>{l.label}</span>
                    {lang === l.code && <span className="ml-auto text-primary">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Link href="/booking" className="bg-primary text-black px-5 py-2 rounded-sm font-bold text-sm hover:bg-primary/90 transition-colors">
            {t.nav.bookNow}
          </Link>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)} data-testid="button-mobile-menu">
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass-panel flex flex-col py-4 border-t border-white/10">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-6 py-3 text-sm font-medium border-b border-white/5 hover:text-primary transition-colors text-foreground"
              onClick={() => setIsOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          {/* Mobile language switcher */}
          <div className="px-6 py-3 border-b border-white/5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground mr-2">{t.nav.language}:</span>
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-2 py-1 text-xs font-mono rounded-sm border transition-colors ${lang === l.code ? "bg-primary text-black border-primary" : "border-border text-muted-foreground"}`}
                data-testid={`button-mobile-lang-${l.code}`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>

          <div className="px-6 pt-4">
            <Link
              href="/booking"
              className="block w-full text-center bg-primary text-black px-6 py-3 rounded-sm font-bold text-sm"
              onClick={() => setIsOpen(false)}
            >
              {t.nav.bookNow}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
