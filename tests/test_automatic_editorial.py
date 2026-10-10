"""Presentation/preservation contracts, without collection or audio startup."""
from pathlib import Path
import hashlib
from html import unescape
import json
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class AutomaticEditorialTest(unittest.TestCase):
    def test_published_article_content_and_media(self):
        saved = json.loads((ROOT/'tests/fixtures/automatic-editorial-preservation.json').read_text())
        body = (ROOT/saved['article_path']).read_text()
        intro = re.search(r'<div class="intro" id="article-text">(.*?)</div>', body, re.S).group(1)
        values = [unescape(x) for x in re.findall(r'<(?:h2|p)>(.*?)</(?:h2|p)>', intro, re.S) if x]
        digest = hashlib.sha256(json.dumps(values, ensure_ascii=False).encode()).hexdigest()
        self.assertEqual(digest, saved['content_sha256'])
        for token in (saved['image'], saved['canonical'], saved['date'], 'Mr. Nomad'):
            self.assertIn(token, body)
        for token in ('autoplay','<audio','<video','<iframe'):
            self.assertNotIn(token, body)

    def test_existing_chrome_and_navigation_contract(self):
        bootstrap = (ROOT/'js/passport-automatic-editorial.js').read_text()
        nav = (ROOT/'js/passport-persist-nav.js').read_text()
        self.assertIn('PassportInitialEditorial = initial', bootstrap)
        self.assertIn('PassportInstitutionalHost = true', bootstrap)
        self.assertIn("home.querySelector('script[type=\"module\"][src^=\"/assets/index-\"]')", bootstrap)
        self.assertIn('/js/passport-audio-continuity.js', bootstrap)
        self.assertIn('/js/passport-legal-footer.js', bootstrap)
        self.assertIn("main.hasAttribute('data-passport-automatic-article')", nav)
        self.assertIn('document.importNode(main,true)', nav)
        for token in ('new Audio(', '.play(', 'engine.select', 'sessionStorage', 'localStorage'):
            self.assertNotIn(token, bootstrap)
        self.assertNotIn('sessionStorage', nav)
        self.assertNotIn('localStorage', nav)

    def test_reference_style_and_responsive_media(self):
        body = (ROOT/json.loads((ROOT/'tests/fixtures/automatic-editorial-preservation.json').read_text())['article_path']).read_text()
        self.assertIn('/css/passport-participe-paper.css', body)
        self.assertIn('passport-automatic-article', body)
        css = (ROOT/'css/passport-automatic-editorial.css').read_text()
        for token in ('max-width:760px','@media(max-width:560px)','height:auto','var(--pr-display)'):
            self.assertIn(token, css)


if __name__ == '__main__':
    unittest.main()
