// The business data Google reads (schema.org BeautySalon, printed in every page's <head>).
// Phone, email, address, hours, payments, social links and every price come from
// _data/site.json, the file Jillian edits, so the data Google reads always matches the page.
// Only facts that are not in her editor are typed here. See lib/facts.js for why.
"use strict";
const facts = require("../lib/facts.js");

module.exports = function () {
  const site = facts.loadSite();
  const c = site.contact, a = site.address, s = site.social || {};
  const base = "https://rosemaryestheticsidaho.com";

  // One offer per service. A service listed in two menu sections (an add-on shown under
  // Facials and under Add-ons) is listed once.
  const seen = new Set();
  const offers = [];
  for (const svc of facts.allServices(site)) {
    const price = facts.priceNumber(svc.price);
    if (price == null) continue;
    let name = String(svc.name).trim();
    if (svc.section === "waxing" && !/wax/i.test(name)) name += " Wax";
    const key = name.toLowerCase().replace(/\s*add-?on$/, "");
    if (seen.has(key)) continue;
    seen.add(key);
    offers.push({ "@type": "Offer", itemOffered: { "@type": "Service", name }, price: String(price), priceCurrency: "USD" });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "@id": base + "/#business",
    name: site.business.name,
    description: "Licensed esthetician studio in Idaho Falls, Idaho offering customized facials, dermaplaning, lash lifts and tints, brow lamination, waxing, back treatments, and LED light therapy.",
    image: base + "/img/hero-facial.webp",
    url: base + "/",
    telephone: String(c.phone_e164 || "").replace(/^\+1(\d{3})(\d{3})(\d{4})$/, "+1-$1-$2-$3"),
    email: c.email,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: site.payments,
    founder: { "@type": "Person", name: site.business.owner_name, jobTitle: site.business.owner_title },
    address: { "@type": "PostalAddress", streetAddress: a.street, addressLocality: a.city, addressRegion: a.region, postalCode: a.postal_code, addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: 43.4881474, longitude: -112.0338727 },
    hasMap: "https://www.google.com/maps/place/" + encodeURIComponent(`${a.street}, ${a.city}, ${a.region} ${a.postal_code}`).replace(/%20/g, "+").replace(/%2C/g, ","),
    areaServed: ["Idaho Falls", "Ammon", "Iona", "Ucon", "Rigby", "Shelley"].map((n) => ({ "@type": "City", name: n })),
    sameAs: [s.instagram, s.tiktok, s.facebook].filter(Boolean),
    openingHoursSpecification: facts.openingHoursSchema(site),
    hasOfferCatalog: { "@type": "OfferCatalog", name: "Services", itemListElement: offers },
  };
};
