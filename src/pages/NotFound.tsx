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
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 font-display text-6xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Sidan hittades inte</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Tillbaka till startsidan
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
