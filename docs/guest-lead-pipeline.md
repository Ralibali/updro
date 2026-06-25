# Gästlead-flödet

Besökare kan skicka in ett uppdrag utan att skapa konto.

1. Frontend sparar kontakt- och projektuppgifter i `guest_leads`.
2. Databastriggern `promote_guest_lead_to_project` skapar direkt ett aktivt projekt med `guest_lead_id`.
3. Projektet visas i byråernas vanliga uppdragslista och befintlig matchningsnotifiering körs.
4. Kontaktuppgifter i `guest_leads` skyddas av RLS och kan endast läsas av administratör, leadets ägare eller en byrå som har låst upp det kopplade projektet.
5. Byrån kan därefter kontakta beställaren och skicka offert via samma flöde som för registrerade beställare.

Migreringen återför även tidigare `unclaimed` och `pending` gästleads som saknar kopplat projekt till den aktiva marknadsplatsen.
