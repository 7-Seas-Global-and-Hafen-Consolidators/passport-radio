import json,hashlib,unittest
from pathlib import Path
R=Path(__file__).resolve().parents[1]
class Channels(unittest.TestCase):
 def test_exact_original_106_preserved(self):
  d=json.loads((R/'data/passport-videos.json').read_text());original=dict(d,collections=d['collections'][:4],videos=d['videos'][:106])
  self.assertEqual(hashlib.sha256(json.dumps(original,sort_keys=True,separators=(',',':'),ensure_ascii=False).encode()).hexdigest(),'5e8c34b356e97449bc2201b8a8267792fc1c17be65d3e86823b6475362d785cd')
 def test_acquisition_totals_and_dedup(self):
  d=json.loads((R/'data/passport-videos.json').read_text());a=json.loads((R/'data/passport-videos-channel-audit.json').read_text());ids=[v['id'] for v in d['videos']]
  self.assertEqual(len(ids),len(set(ids)));self.assertEqual(len(ids),a['summary']['finalCount'])
  for source,c in a['summary']['sources'].items():
   rows=[r for r in a['records'] if r['source']==source]
   self.assertEqual(len(rows),c['traversed']);self.assertEqual(c['eligible']+c['excluded'],len(rows));self.assertEqual(c['eligible'],c['added']+c['duplicatesAvoided'])
   for r in rows:
    if r['disposition']=='added':self.assertEqual(ids.count(r['id']),1)
  self.assertEqual(106+sum(c['added'] for c in a['summary']['sources'].values()),len(ids))
 def test_bbc_limit_is_explicit(self):
  d=json.loads((R/'docs/videos-three-channels/counts.json').read_text());self.assertEqual(d['bbcRecovery']['shortsListed'],479);self.assertFalse(d['bbcRecovery']['unsavedVideosTabRecovered'])
if __name__=='__main__':unittest.main()
