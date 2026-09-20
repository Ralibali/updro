import { initGa4 } from './ga4Runtime';
initGa4({
  "measurementId": "G-C0XMZG0KDQ",
  // Google’s manual installer identifies this shared Google tag as the loader.
  "loaderId": "AW-10941540384",
  "hosts": [
    "updro.se",
    "www.updro.se"
  ],
  "excluded": [
    "/admin",
    "/dashboard",
    "/kundportal"
  ],
  "consentKey": "updro_cookie_consent",
  "consentFormat": "updro"
});
