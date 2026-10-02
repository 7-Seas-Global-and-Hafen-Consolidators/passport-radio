"""Agenda integrity checks; no remote requests or radio initialization."""
import datetime
import html
import json
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
EVENTS = json.loads((ROOT / "data/passport-agenda.json").read_text())
BASE = "https://www.passportradio.online"

class AgendaIntegrity(unittest.TestCase):
    def test_core_and_identity(self):
        self.assertGreater(len(EVENTS), 0)
        for field in ("id", "slug"):
            self.assertEqual(len(EVENTS), len({e[field] for e in EVENTS}))
        keys = [(e["artist"].casefold(), e["date"], e["city"].casefold(), e["venue"].casefold()) for e in EVENTS]
        self.assertEqual(len(keys), len(set(keys)))
        for e in EVENTS:
            datetime.date.fromisoformat(e["date"])
            self.assertIn(e["state"], "AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO".split())
            self.assertTrue(all(e[k] for k in ("artist", "event_name", "city", "venue", "ticket_url", "source_urls")))
            self.assertTrue(e["ticket_url"].startswith(("http://", "https://")))
    def test_agenda_is_not_a_redirect(self):
        page = (ROOT / "agenda.html").read_text()
        self.assertNotRegex(page, r'(?i)http-equiv=["\']refresh')
        self.assertNotIn("window.location", page)
        self.assertIn('href="' + BASE + '/agenda.html"', page)
        payload = json.loads(re.search(r'<script type="application/json" id="agenda-data">(.*?)</script>', page, re.S)[1])
        self.assertEqual(payload, EVENTS)
    def test_permanent_pages_and_exact_ticket_links(self):
        for e in EVENTS:
            page = (ROOT / "agenda" / (e["slug"] + ".html")).read_text()
            url = BASE + "/agenda/" + e["slug"] + ".html"
            self.assertIn('rel="canonical" href="' + url + '"', page)
            self.assertIn('href="' + html.escape(e["ticket_url"], quote=True) + '"', page)
            self.assertIn(html.escape(e["event_name"], quote=True), page)
            for source in e["source_urls"]:
                self.assertIn('href="' + html.escape(source, quote=True) + '"', page)
    def test_schema_matches_confirmed_data(self):
        for e in EVENTS:
            page = (ROOT / "agenda" / (e["slug"] + ".html")).read_text()
            schema = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', page, re.S)[1])
            self.assertEqual(schema["@type"], "MusicEvent")
            self.assertEqual(schema["name"], e["event_name"])
            self.assertEqual(schema["startDate"], e["date"] + ("T" + e["time"] if e["time"] else ""))
            self.assertEqual(schema["offers"]["url"], e["ticket_url"])
            self.assertNotIn("price", schema["offers"])
            self.assertNotIn("organizer", schema)
            self.assertEqual(schema["location"]["address"]["addressLocality"], e["city"])
    def test_images_and_provenance(self):
        for e in EVENTS:
            if e["image"]:
                self.assertTrue(e["image"].startswith("/assets/agenda/"))
                self.assertTrue((ROOT / e["image"].lstrip("/")).is_file())
                self.assertTrue(e["image_source"])
                self.assertTrue(e["image_alt"])
    def test_sitemap_contains_every_event_once(self):
        ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
        urls = [el.text for el in ET.parse(ROOT / "sitemap-agenda.xml").findall(".//s:loc", ns)]
        expected = [BASE + "/agenda.html"] + [BASE + "/agenda/" + e["slug"] + ".html" for e in EVENTS]
        self.assertEqual(sorted(urls), sorted(expected))
        self.assertEqual(len(urls), len(set(urls)))
        self.assertTrue(all("?" not in u for u in urls))
    def test_existing_continuity_only(self):
        for page in [ROOT / "agenda.html"] + list((ROOT / "agenda").glob("*.html")):
            markup = page.read_text()
            self.assertIn('/js/passport-audio-continuity.js', markup)
            self.assertNotIn("<audio", markup)
            self.assertNotIn("autoplay", markup)
    def test_pagination_stays_on_agenda(self):
        code = (ROOT / "js/passport-agenda.js").read_text()
        self.assertIn("SIZE=24", code)
        self.assertNotIn("window.open", code)
        self.assertNotIn("location.href=", code)
        self.assertIn("history.pushState", code)

if __name__ == "__main__":
    unittest.main()
