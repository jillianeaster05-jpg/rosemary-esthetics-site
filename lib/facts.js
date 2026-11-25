// One source for every business fact on the site: _data/site.json, the file Jillian edits in
// Sveltia (/admin/). Everything else that states an hour, a price, the phone or the address is
// built from it at build time, so one save in the editor changes the whole site.
//
// Why (2026-11-24): Jillian changed her hours in the editor on 2026-11-07. The site then showed
// three different Friday hours, and Google's data still had last summer's prices, because those
// facts were also typed into files she cannot reach. Do not type a fact anywhere else again:
// read it from here, or use a token (below) in page text.
//
// TOKENS for page text in the editor (meta descriptions, FAQ answers, the quiz):
//   {phone}                       (208) 521-0938
//   {address}                     1096 S Boulevard, Idaho Falls, ID 83402
//   {hours}                       the one-line hours
//   {price:Eyelash Lift}          $45            (any service name on the menu)
//   {price:Signature Facial+Gua Sha Sculpting}   prices added together: $85
//   {pricetime:Eyelash Lift}      $45 &middot; 30 minutes
//   {from:facials}                the lowest price in that menu section, add-ons left out: $40
// An unknown name prints nothing and the build log says which token failed.
"use strict";
const fs = require("fs");
const path = require("path");

const SITE_FILE = path.join(__dirname, "..", "_data", "site.json");
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
const DAY_SHORT = { monday: "Mon", tuesday: "Tue", wednesday: "Wed", thursday: "Thu", friday: "Fri", saturday: "Sat", sunday: "Sun" };
const DAY_SCHEMA = { monday: "Monday", tuesday: "Tuesday", wednesday: "Wednesday", thursday: "Thursday", friday: "Friday", saturday: "Saturday", sunday: "Sunday" };

const problems = new Set();

function loadSite() {
  return JSON.parse(fs.readFileSync(SITE_FILE, "utf8"));
}

// "9:00–6:00", "9-6", "9am - 6pm", "3:00 to 8:00" -> { open: "09:00", close: "18:00" }.
// Hours written without am/pm follow how a salon talks: an opening hour before 7 is
// afternoon, and a closing hour at or before the opening hour is evening.
function parseDay(raw) {
  const s = String(raw || "").trim().toLowerCase();
  if (!s || /closed/.test(s)) return null;
  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|–|—|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) { problems.add(`hours: could not read "${raw}"`); return undefined; }
  let oh = +m[1], om = +(m[2] || 0), ch = +m[4], cm = +(m[5] || 0);
  const oap = m[3], cap = m[6];
  if (oap === "pm" && oh < 12) oh += 12;
  if (oap === "am" && oh === 12) oh = 0;
  if (cap === "pm" && ch < 12) ch += 12;
  if (cap === "am" && ch === 12) ch = 0;
  if (!oap && oh < 7) oh += 12;
  if (!cap && ch * 60 + cm <= oh * 60 + om) ch += 12;
  if (oh > 23 || ch > 24 || om > 59 || cm > 59) { problems.add(`hours: could not read "${raw}"`); return undefined; }
  const p = (h, mi) => String(h).padStart(2, "0") + ":" + String(mi).padStart(2, "0");
  return { open: p(oh, om), close: p(ch, cm) };
}

// "09:00" -> "9", "18:30" -> "6:30" (12-hour, no am/pm, the way the site writes hours).
function short(t) {
  let [h, mi] = t.split(":").map(Number);
  h = h % 12 || 12;
  return mi ? `${h}:${String(mi).padStart(2, "0")}` : String(h);
}

function joinNames(list) {
  return list.length < 2 ? list.join("") : list.slice(0, -1).join(", ") + " & " + list[list.length - 1];
}

// Days that share hours, in week order: [{ days: ["monday", ...], open, close }], plus closed days.
function groupedHours(site) {
  const groups = [], closed = [];
  for (const d of DAYS) {
    const h = parseDay(site.hours && site.hours[d]);
    if (h === null) { closed.push(d); continue; }
    if (h === undefined) continue;
    const g = groups.find((x) => x.open === h.open && x.close === h.close);
    if (g) g.days.push(d); else groups.push({ days: [d], open: h.open, close: h.close });
  }
  return { groups, closed };
}

// The one-line hours. Jillian's own line wins when she fills it in; left blank, it is built
// from the day-by-day hours, so the two can never disagree.
function hoursLine(site) {
  const typed = site.hours && String(site.hours.display || "").trim();
  if (typed) return typed;
  const { groups, closed } = groupedHours(site);
  const parts = groups.map((g) => `${joinNames(g.days.map((d) => DAY_SHORT[d]))} ${short(g.open)}–${short(g.close)}`);
  if (closed.length) parts.push(`Closed ${joinNames(closed.map((d) => DAY_SHORT[d]))}`);
  return parts.join(" · ");
}

function openingHoursSchema(site) {
  return groupedHours(site).groups.map((g) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: g.days.length === 1 ? DAY_SCHEMA[g.days[0]] : g.days.map((d) => DAY_SCHEMA[d]),
    opens: g.open,
    closes: g.close,
  }));
}

function allServices(site) {
  const out = [];
  for (const [section, list] of Object.entries(site.services || {})) {
    for (const s of list || []) out.push(Object.assign({ section }, s));
  }
  return out;
}

function norm(s) { return String(s || "").toLowerCase().replace(/\s+/g, " ").trim(); }

function findService(site, name) {
  const n = norm(name);
  return allServices(site).find((s) => norm(s.name) === n);
}

function priceNumber(p) {
  const m = String(p || "").replace(/,/g, "").match(/\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

function money(n) { return "$" + (Number.isInteger(n) ? n : n.toFixed(2)); }

// "30m" -> "30 minutes", "1h" -> "1 hour", "1h15" stays "1h15" (how the site already writes them).
function durationWords(d) {
  const s = String(d || "").trim();
  if (/^\d+m$/i.test(s)) return parseInt(s, 10) + " minutes";
  if (/^1h$/i.test(s)) return "1 hour";
  if (/^\d+h$/i.test(s)) return parseInt(s, 10) + " hours";
  return s;
}

function priceOf(site, names, token) {
  let total = 0;
  const found = [];
  // A whole name wins first, so a service with "+" in its own name ("Smooth + Glow Facial")
  // is never split into two.
  const parts = findService(site, names) ? [names] : names.split("+");
  for (const nm of parts) {
    const s = findService(site, nm);
    const n = s && priceNumber(s.price);
    if (n == null) { problems.add(`token ${token}: no service named "${nm.trim()}" with a price`); return null; }
    total += n;
    found.push(s);
  }
  return { total, found };
}

function fromPrice(site, section, token) {
  const list = ((site.services || {})[section] || []).filter((s) => !/add-?on/i.test(s.name));
  const nums = list.map((s) => priceNumber(s.price)).filter((n) => n != null);
  if (!nums.length) { problems.add(`token ${token}: no prices in menu section "${section}"`); return null; }
  return money(Math.min(...nums));
}

function fill(text, site) {
  if (!text || text.indexOf("{") < 0) return text;
  return text.replace(/\{(phone|address|hours|price|pricetime|from)(?::([^{}]+))?\}/g, (tok, kind, arg) => {
    if (kind === "phone") return site.contact.phone_display;
    if (kind === "address") { const a = site.address; return `${a.street}, ${a.city}, ${a.region} ${a.postal_code}`; }
    if (kind === "hours") return hoursLine(site);
    if (!arg) { problems.add(`token ${tok}: needs a name after the colon`); return ""; }
    if (kind === "from") return fromPrice(site, arg.trim(), tok) || "";
    const r = priceOf(site, arg, tok);
    if (!r) return "";
    if (kind === "price") return money(r.total);
    const dur = durationWords(r.found[0].duration);
    return dur ? `${money(r.total)} &middot; ${dur}${r.found.length > 1 ? "+" : ""}` : money(r.total);
  });
}

function reportProblems() {
  if (!problems.size) return;
  console.warn("\n[facts] Some business facts could not be filled in. The site still built:");
  for (const p of problems) console.warn("  - " + p);
  problems.clear();
}

module.exports = { loadSite, parseDay, hoursLine, openingHoursSchema, allServices, findService, priceNumber, money, durationWords, fill, reportProblems };
