const fs=require('fs');
const root=__dirname;
const inventory=JSON.parse(fs.readFileSync(root+'/artists-9911-inventory.json','utf8'));
const queues={certified:[],photo:[],video:[],biography:[],editorial_links:[],specific:[]};
const records=inventory.records.map(r=>{
  const pending=[];
  if(!r.photo)pending.push('photo');
  if(!r.validated_official_video?.browser_playback_certified)pending.push('video');
  if(!r.original_editorial_profile)pending.push('biography');
  // An existing URL proves a destination, not a complete biography or factual links.
  pending.push('editorial_links');
  if(r.existing_url||r.evidence)pending.push('specific');
  if(r.completed===true)queues.certified.push(r.position);
  else for(const key of pending)queues[key].push(r.position);
  return {position:r.position,name:r.name,destination:r.existing_url,reference:r.reference_url,evidence:r.evidence||null,pending,existing_content_review:r.existing_url?'UNASSESSED':'NO_EXISTING_DESTINATION'};
});
const groups=[];
for(let i=0;i<records.length;i+=50)groups.push({batch:groups.length+1,positions:records.slice(i,i+50).map(r=>r.position)});
const out={source:'artists-9911-inventory.json',reconciliation_repeated:false,certification_changed:false,queue_semantics:'Missing recorded evidence or awaiting validation; existing destinations are not certified. Queue overlap intentional.',presentation_hooks:{recorded:26184,meaning:'script mounting hooks, not resolved editorial relationships'},next_batch:1,batch_size:50,queues,batches:groups,records};
fs.writeFileSync(root+'/work-queues.json',JSON.stringify(out)+'\n');
console.log(JSON.stringify({batches:groups.length,first_batch:groups[0],certified:queues.certified.length}));
