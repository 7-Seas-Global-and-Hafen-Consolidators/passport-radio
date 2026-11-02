/* Rasterize the existing official masthead, without changing its design. */
const fs=require('fs'),path=require('path'),dep=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES;
const sharp=require(dep?dep+'/sharp':'sharp'),root=path.resolve(__dirname,'..');
(async()=>{const svg=fs.readFileSync(path.join(root,'images/brand/passport-radio-masthead-2026.svg'));
for(const size of [192,512]){const mark=await sharp(svg).resize({width:Math.round(size*.92)}).png().toBuffer();await sharp({create:{width:size,height:size,channels:3,background:'#FFFFFF'}}).composite([{input:mark,gravity:'centre'}]).png().toFile(path.join(root,`images/brand/passport-radio-media-${size}-20261102.png`));}})().catch(e=>{console.error(e);process.exitCode=1});
