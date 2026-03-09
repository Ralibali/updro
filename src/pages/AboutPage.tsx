import { useEffect } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Building2, Target, Users, Heart } from 'lucide-react'
import { setSEOMeta } from '@/lib/seoHelpers'
const values = [
  { icon: Target, title: 'Transparens', desc: 'Inga dolda avgifter eller låsningar – du ser alltid vad du betalar för.' },
  { icon: Users, title: 'Kvalitet före kvantitet', desc: 'Vi granskar varje byrå och uppdrag för att säkerställa en hög standard.' },
  { icon: Heart, title: 'Lokal förankring', desc: 'Vi fokuserar på den svenska marknaden och förstår lokala behov.' },
  { icon: Building2, title: 'Partnerskap', desc: 'Vi lyckas bara när våra kunder och byråer lyckas – det driver allt vi gör.' },
]

const AboutPage = () => {
  useEffect(() => {
    setSEOMeta({
      title: 'Om Updro – Sveriges marknadsplats för digitala byråer',
      description: 'Updro kopplar samman företag med rätt digitala byråer – snabbt, tryggt och kostnadsfritt. Läs om vår vision och våra värderingar.',
      canonical: 'https://updro.se/om-oss',
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-muted/40 py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              Om Updro
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Vi kopplar samman företag med rätt digitala byråer – snabbt, tryggt och kostnadsfritt för beställaren.
            </p>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto space-y-6 text-foreground/80 leading-relaxed">
            <h2 className="font-display text-2xl font-semibold text-foreground">Vår historia</h2>
            <p>
              Updro startades med en enkel insikt: att hitta rätt digital byrå i Sverige är onödigt krångligt.
              Beställare lägger timmar på research, offerter och möten – ofta utan att veta om de pratar med
              rätt byrå för just deras projekt.
            </p>
            <p>
              Vi byggde Updro för att lösa det. Genom att låta beställare publicera sitt uppdrag och ta emot
              offerter från kvalitetsgranskade byråer, sparar vi tid för alla parter. Byråerna får relevanta
              leads utan kall-akvirering, och beställarna får jämförbara offerter utan att behöva googla i dagar.
            </p>
            <p>
              Updro drivs av <strong>Aurora Media AB</strong> (org.nr 559272-0220), baserat i Sverige.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="bg-muted/40 py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-display text-2xl font-semibold text-foreground text-center mb-10">Våra värderingar</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((v) => (
                <div key={v.title} className="bg-card rounded-xl border p-6 flex gap-4 items-start">
                  <div className="rounded-lg bg-primary/10 p-2.5 shrink-0">
                    <v.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{v.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{v.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 px-4">
          <div className="max-w-3xl mx-auto text-center space-y-3">
            <h2 className="font-display text-2xl font-semibold text-foreground">Kontakta oss</h2>
            <p className="text-muted-foreground">
              Har du frågor eller vill veta mer? Hör av dig till oss på{' '}
              <a href="mailto:hej@updro.se" className="text-primary hover:underline font-medium">hej@updro.se</a>
            </p>
            <p className="text-sm text-muted-foreground">
              Aurora Media AB · Org.nr 559272-0220
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

export default AboutPage
