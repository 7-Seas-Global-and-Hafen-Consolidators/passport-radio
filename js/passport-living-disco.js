/* Dance header artwork only: a faceted 3D mirror sphere. No audio or catalogue access. */
(() => {
  'use strict';
  const canvas = document.querySelector('.living-disco-ball');
  if (!canvas || canvas.dataset.initialized) return;
  canvas.dataset.initialized = 'true';
  const context = canvas.getContext('2d', {alpha:true});
  if (!context) return;
  const size=260, radius=126, period=40000, tau=2*Math.PI;
  canvas.width=canvas.height=size; canvas.dataset.period=String(period);
  const frame=context.createImageData(size,size), surface=[];
  // Camera rays intersect a real sphere; each small mirror has its own surface normal.
  for(let y=0;y<size;y++) for(let x=0;x<size;x++){
    const nx=(x-size/2)/radius,ny=(size/2-y)/radius,r2=nx*nx+ny*ny;
    if(r2<1) surface.push([4*(y*size+x),nx,ny,Math.sqrt(1-r2)]);
  }
  let visible=false,previous=0,start=null,frames=0;
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  const paint=angle=>{
    for(const [offset,x,y,z] of surface){
      const latitude=Math.asin(y),row=(latitude/Math.PI+.5)*28;
      const band=Math.floor(row),phi=((band+.5)/28-.5)*Math.PI;
      const columns=Math.max(8,Math.round(56*Math.cos(phi)));
      const longitude=Math.atan2(x,z)+angle;
      const u=((longitude/tau+.5)%1+1)%1*columns;
      const column=Math.floor(u),theta=((column+.5)/columns-.5)*tau-angle;
      const nx=Math.sin(theta)*Math.cos(phi),ny=Math.sin(phi),nz=Math.cos(theta)*Math.cos(phi);
      // Reflected view vector samples a simple photographic studio environment:
      // white softboxes, dark window frames, a narrow Passport-red reflector.
      const rx=2*nz*nx,ry=2*nz*ny,rz=2*nz*nz-1;
      const softbox=Math.exp(-((rx+.38)**2/.12+(ry-.4)**2/.32));
      const strip=Math.exp(-((rx-.62)**2/.012+(ry+.12)**2/.8));
      const darkPanel=Math.exp(-((rx+.78)**2/.025+ry*ry/.65));
      const ceiling=.5+.5*Math.sin(ry*8+rz*4);
      const variation=Math.sin((band+1)*127.1+(column+1)*311.7)*.035;
      const border=Math.min(u-column,1-u+column,row-band,1-row+band);
      const edge=border<.035?.47:border<.07?.82:1;
      const diffuse=.7+.3*Math.max(0,-.3*nx+.35*ny+.87*nz);
      const silver=(118+ceiling*47+softbox*125+strip*110-darkPanel*80+variation*255)*diffuse*edge;
      const red=Math.exp(-((rx-.28)**2/.007+(ry+.6)**2/.025))*22;
      const glint=Math.pow(Math.max(0,nx*-.32+ny*.42+nz*.85),180)*70;
      frame.data[offset]=Math.min(255,silver+glint+red);
      frame.data[offset+1]=Math.min(255,silver+glint-red*.25);
      frame.data[offset+2]=Math.min(255,silver+glint-red*.2);
      frame.data[offset+3]=Math.min(255,z*2400);
    }
    context.putImageData(frame,0,0);
    canvas.dataset.rotation=String(Math.round(angle*180/Math.PI*100)/100);
    canvas.dataset.renderFrames=String(++frames);
  };
  const tick=time=>{
    if(!canvas.isConnected) return;
    if(visible&&!document.hidden&&time-previous>=50){
      if(start===null) start=time;
      if(!motion.matches || canvas.dataset.rotation!=='0') paint(motion.matches?0:(time-start)*tau/period);
      previous=time;
    }
    requestAnimationFrame(tick);
  };
  paint(0);
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(canvas);
  requestAnimationFrame(tick);
})();
