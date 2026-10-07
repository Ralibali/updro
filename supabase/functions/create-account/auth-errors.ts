type SignupAuthError = {
  code?: string;
  name?: string;
  message?: string;
  status?: number;
  reasons?: string[];
};

export const existingAccountMessage =
  "Det finns redan ett konto med den e-postadressen. Logga in eller skicka bekräftelsen igen om e-postadressen inte är bekräftad.";

// Supabase's human-readable messages can change. Codes and password reasons are
// the API contract; a length number is only used to make the advice more precise.
export function signupAuthErrorMessage(error: SignupAuthError): string {
  if (error.code === "weak_password" || error.name === "AuthWeakPasswordError") {
    const reasons = error.reasons ?? [];
    const advice: string[] = [];
    if (reasons.includes("length")) {
      const length = error.message?.match(/at least (\d+) characters/i)?.[1];
      advice.push(length
        ? `Lösenordet måste vara minst ${length} tecken.`
        : "Lösenordet är för kort. Välj ett längre lösenord.");
    }
    if (reasons.includes("characters")) {
      advice.push("Lösenordet uppfyller inte teckenkraven. Prova en kombination av små och stora bokstäver, siffror och specialtecken.");
    }
    if (reasons.includes("pwned")) {
      advice.push("Lösenordet förekommer i kända dataläckor. Välj ett annat lösenord.");
    }
    return advice.join(" ") || "Lösenordet uppfyller inte säkerhetskraven. Välj ett längre och starkare lösenord.";
  }

  switch (error.code) {
    case "user_already_exists":
    case "email_exists":
      return existingAccountMessage;
    case "over_email_send_rate_limit":
      return "För många bekräftelsemejl har begärts. Vänta några minuter innan du försöker igen och kontrollera inkorgen och skräpposten.";
    case "over_request_rate_limit":
      return "För många registreringsförsök har gjorts. Vänta några minuter och försök igen.";
    case "email_address_invalid":
      return "E-postadressen godkänns inte. Kontrollera stavningen eller använd en annan e-postadress.";
    case "email_address_not_authorized":
      return "Updro kan inte skicka bekräftelsemejl till den här adressen just nu. Mejltjänsten behöver åtgärdas.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Registrering med e-post är tillfälligt avstängd. Försök igen senare.";
    case "captcha_failed":
      return "Säkerhetskontrollen kunde inte godkännas. Ladda om sidan och försök igen.";
    case "hook_timeout":
    case "hook_timeout_after_retry":
    case "request_timeout":
      return "Registreringen tog för lång tid. Vänta en stund och försök igen.";
    case "validation_failed":
      return "Kontouppgifterna kunde inte godkännas. Kontrollera e-postadressen och lösenordet.";
  }

  if (error.name === "AuthRetryableFetchError") {
    return "Registreringstjänsten kunde inte nås. Vänta en stund och försök igen.";
  }
  if (error.status === 429) {
    return "För många registreringsförsök har gjorts. Vänta några minuter och försök igen.";
  }
  // Unknown server errors should not imply that the user's valid details are wrong.
  return "Registreringstjänsten har ett tillfälligt fel. Försök igen om en stund.";
}
