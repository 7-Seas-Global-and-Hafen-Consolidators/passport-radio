/* World Dial artwork only. Ray-cast 3D sphere; no media, audio, controls or catalogue changes. */
(() => {
  'use strict';
  const canvas = document.querySelector('.living-earth');
  if (!canvas || canvas.dataset.initialized) return;
  canvas.dataset.initialized = 'true';
  const context = canvas.getContext('2d', {alpha:true});
  if (!context) return;
  const period = 40000, size = 196, radius = size / 2 - 2;
  canvas.width = canvas.height = size;
  canvas.dataset.period = String(period);
  const frame = context.createImageData(size,size), normals = [];
  // A camera ray meets the front hemisphere. Rotate its surface normal to sample longitude/latitude.
  for (let y=0;y<size;y++) for (let x=0;x<size;x++) {
    const nx=(x-size/2)/radius,ny=(size/2-y)/radius,r2=nx*nx+ny*ny;
    if (r2<=1) normals.push([4*(y*size+x),nx,ny,Math.sqrt(1-r2)]);
  }
  let texture, width, height, visible=true, previous=0, start=0, frames=0;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const paint = angle => {
    const cs=Math.cos(angle),sn=Math.sin(angle),tilt=.14,ct=Math.cos(tilt),st=Math.sin(tilt);
    for (const [offset,x,y,z] of normals) {
      const tx=x*ct-y*st,ty=x*st+y*ct;
      const rx=tx*cs+z*sn,rz=-tx*sn+z*cs;
      const u=((Math.atan2(rx,rz)/(2*Math.PI)+.5)%1+1)%1;
      const v=.5-Math.asin(Math.max(-1,Math.min(1,ty)))/Math.PI;
      const pixel=4*(Math.min(height-1,Math.floor(v*height))*width+Math.min(width-1,Math.floor(u*width)));
      const light=.62+.38*Math.max(0,-.3*x+.25*y+.91*z);
      for(let c=0;c<3;c++) frame.data[offset+c]=texture[pixel+c]*light;
      frame.data[offset+3]=Math.min(255,z*2200);
    }
    context.putImageData(frame,0,0);
    canvas.dataset.rotation=String(Math.round(angle*180/Math.PI*100)/100);
    canvas.dataset.renderFrames=String(++frames);
  };
  const tick = time => {
    if (!canvas.isConnected) return;
    if (visible && !document.hidden && time-previous>=40) {
      if (!start) start=time;
      paint(motion.matches?0:(time-start)*2*Math.PI/period);
      previous=time;
    }
    requestAnimationFrame(tick);
  };
  const image = new Image(); image.decoding='async';
  image.onload=()=>{
    const source=document.createElement('canvas');width=image.naturalWidth;height=image.naturalHeight;source.width=width;source.height=height;
    const pixels=source.getContext('2d');pixels.drawImage(image,0,0);texture=pixels.getImageData(0,0,width,height).data;
    paint(0);requestAnimationFrame(tick);
  };
  image.src=canvas.dataset.texture;
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;}).observe(canvas);
})();
