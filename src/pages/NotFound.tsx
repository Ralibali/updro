import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { setSEOMeta } from '@/lib/seoHelpers'
import { useNoindex } from '@/hooks/useNoindex'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  useNoindex();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setSEOMeta({
      title: 'Sidan hittades inte (404) | Updro',
      description: 'Sidan du söker finns inte. Gå tillbaka till startsidan för att hitta rätt.',
      canonical: `https://updro.se${location.pathname}`,
      noindex: true,
    })
    let prerenderStatus = document.querySelector('meta[name="prerender-status-code"]') as HTMLMetaElement | null
    if (!prerenderStatus) {
      prerenderStatus = document.createElement('meta')
      prerenderStatus.name = 'prerender-status-code'
      document.head.appendChild(prerenderStatus)
    }
    prerenderStatus.content = '404'
  }, [location.pathname]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const term = q.trim()
    if (!term) return
    navigate(`/byraer?q=${encodeURIComponent(term)}`)
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-surface-alt px-6 py-16">
      <div className="max-w-xl w-full text-left">
        <h1 className="font-display text-5xl md:text-7xl text-foreground leading-[1.05] tracking-tight [text-wrap:balance]">
          404 – sidan hittades inte
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
          Sidan du letar efter finns inte – kanske flyttad, kanske aldrig publicerad. Härifrån kan du hitta tillbaka.
        </p>

        <form onSubmit={onSearch} className="mt-8 flex gap-2 max-w-md" role="search" aria-label="Sök på Updro">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Sök efter byråer eller tjänster"
              aria-label="Sök efter byråer eller tjänster"
              className="pl-9 h-12 rounded-xl"
            />
          </div>
          <Button type="submit" className="h-12 rounded-xl px-5">Sök</Button>
        </form>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-base">
          <Link to="/" className="text-foreground font-semibold underline underline-offset-4 hover:decoration-2">Till startsidan</Link>
          <Link to="/byraer" className="text-foreground font-semibold underline underline-offset-4 hover:decoration-2">Hitta byrå</Link>
          <Link to="/publicera" className="text-foreground font-semibold underline underline-offset-4 hover:decoration-2">Publicera uppdrag</Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
