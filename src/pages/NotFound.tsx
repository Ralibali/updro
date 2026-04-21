import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { setSEOMeta } from '@/lib/seoHelpers'

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    setSEOMeta({
      title: 'Sidan hittades inte (404) | Updro',
      description: 'Sidan du söker finns inte. Gå tillbaka till startsidan för att hitta rätt.',
      noindex: true,
    })
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-alt px-6">
      <div className="max-w-xl text-left">
        <h1 className="font-display text-6xl md:text-8xl text-foreground leading-[1.05] tracking-tight [text-wrap:balance]">
          404 – sidan hittades inte
        </h1>
        <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
          Sidan du letar efter finns inte – kanske flyttad, kanske aldrig publicerad. Härifrån kan du hitta tillbaka.
        </p>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-base">
          <Link
            to="/"
            className="text-foreground font-semibold underline underline-offset-4 decoration-1 hover:decoration-2 transition-all"
          >
            Till startsidan
          </Link>
          <Link
            to="/byraer"
            className="text-foreground font-semibold underline underline-offset-4 decoration-1 hover:decoration-2 transition-all"
          >
            Hitta byrå
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
