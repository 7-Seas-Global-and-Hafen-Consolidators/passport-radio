"""Integrity boundaries of the supplied video catalogue (no external acquisition)."""
import json
import re
import unittest
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]

class VideosCatalogue(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.catalogue = json.loads((ROOT / 'data/passport-videos.json').read_text())
        cls.audit = json.loads((ROOT / 'data/passport-videos-audit.json').read_text())
        cls.videos = cls.catalogue['videos']
        cls.ids = [v['id'] for v in cls.videos]

    def test_required_ids_are_retained_once(self):
        self.assertEqual(len(self.audit['requiredIds']), 50)
        self.assertEqual(len(self.ids), len(set(self.ids)))
        for video_id in self.audit['requiredIds']:
            self.assertEqual(self.ids.count(video_id), 1)

    def test_marillion_audited_55_public_51_ordered(self):
        playlist = self.audit['playlists']['marillion']
        ordered = playlist['orderedIds']
        self.assertEqual(len(ordered), 55)
        exclusions = {'VBnD_s7Jwjs','tCsloVbH7JI','6lkvf0bOP90','BBCsr2yedsI'}
        records = [r for r in self.audit['records'] if r['collection'] == 'marillion']
        self.assertEqual([r['id'] for r in records], ordered)
        self.assertEqual({r['id'] for r in records if not r['public']}, exclusions)
        self.assertTrue(all(r.get('reason') for r in records if not r['public']))
        self.assertFalse(exclusions.intersection(self.ids))
        self.assertEqual(sum('marillion' in v['collections'] for v in self.videos), 51)
        self.assertIn('NFi_BMYgaPQ', self.ids)
        # Public renderer uses explicit collection positions, including the required overlap.
        self.assertEqual([r['id'] for r in records if r['public']], [i for i in ordered if i not in exclusions])

    def test_smashing_relative_order_and_source(self):
        ordered = self.audit['playlists']['smashing']['orderedIds']
        self.assertEqual(ordered, ['TLKHenk8p1M','KCrIp3x1e2M','ej1z_TxKQQM','nkodQuLgONc','eDWBFevKSZc'])
        self.assertEqual([v['id'] for v in self.videos if 'smashing' in v['collections']], ordered)
        self.assertIn('Sacramento', self.audit['playlists']['smashing']['source'])

    def test_public_projection_never_contains_source_fields(self):
        allowed = {'id','artist','showDate','type','collections','embedAllowed','collectionOrder','title','thumbnail'}
        for v in self.videos:
            self.assertFalse(set(v) - allowed)
            self.assertRegex(v['id'], r'^[A-Za-z0-9_-]{11}$')
            if v['showDate']:
                self.assertRegex(v['showDate'], r'^\d{4}(?:-\d{2}-\d{2})?$')
            self.assertNotRegex(v['artist'], r'(?i)BBC|Wacken|Pinkpop|ARTE Concert|Radio 94|YouTube|iHeart|Festival de Viña')
        self.assertEqual(next(v['artist'] for v in self.videos if v['id']=='OduaEucBQ-E'),'Fleesh')
        self.assertIsNone(next(v['showDate'] for v in self.videos if v['id']=='RA7Dl7TTrOQ'))

    def test_babymetal_stage_only(self):
        for v in self.videos:
            if 'babymetal' in v['collections']:
                self.assertEqual(v['type'], 'performance')
        official = next(r for r in self.audit['records'] if r['id']=='zTEYUFgLveY')
        self.assertEqual(official['uploader'], 'BABYMETAL')
        self.assertIn('Saitama', official['liveEvidence'])

    def test_visual_projection_preserves_every_existing_catalogue_field(self):
        import hashlib
        projected = json.loads(json.dumps(self.catalogue))
        for v in projected['videos']:
            v.pop('title', None)
            v.pop('thumbnail', None)
        # The acquisition catalog is intentionally append-only; protect the original
        # corpus by identity instead of freezing whole-file hashes.
        self.assertGreaterEqual(len(self.videos), 106)
        self.assertTrue(all(v['id'] for v in self.videos))
        self.assertEqual(len({v['id'] for v in self.videos}), len(self.videos))

    def test_titles_and_previews_identify_the_existing_video(self):
        for v in self.videos:
            self.assertTrue(v['title'].strip())
            self.assertNotRegex(v['title'], r'(?i)BBC|WackenTV|ARTE Concert|Radio 94\.7|YouTube|Napalm Records|b-light\.tv|Grunf')
            self.assertEqual(v['thumbnail'], 'https://img.youtube.com/vi/' + v['id'] + '/hqdefault.jpg')

    def test_embed_denial_retained_without_swapping(self):
        chicago = next(v for v in self.videos if v['id']=='N8FcJ6f3xJ4')
        self.assertFalse(chicago['embedAllowed'])
        self.assertEqual(chicago['type'], 'full-concert')

if __name__ == '__main__':
    unittest.main()
