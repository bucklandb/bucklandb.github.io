/* A small, dependency-free 3D projection of a conceptual information network.
   Motion is entirely user-driven: no autoplay, inertia, or animation loop. */
(() => {
  const stage = document.getElementById('graph-stage');
  const svg = document.getElementById('network-svg');
  if (!stage || !svg) return;
  const ns = 'http://www.w3.org/2000/svg';
  const nodes = [
    {x:-155,y:-78,z:25,r:9,label:'SOURCE'},
    {x:-55,y:-115,z:-55,r:13,label:'CONTEXT'},
    {x:45,y:-45,z:100,r:15,label:'STRUCTURE'},
    {x:160,y:-95,z:-25,r:10},
    {x:-130,y:95,z:-60,r:10},
    {x:0,y:65,z:55,r:22,label:'INSIGHT',gold:true},
    {x:130,y:115,z:10,r:13}
  ];
  const edges = [[0,1],[1,2],[2,3],[4,1],[1,5],[5,6],[6,3],[0,5],[5,2],[2,6],[4,5]];
  let yaw=0, pitch=0, pointer=null;
  const layer=document.createElementNS(ns,'g');
  const grid=svg.querySelector('rect');
  // Preserve the existing dotted-grid definition, replace only network geometry.
  [...svg.children].forEach(el=>{if(el.tagName.toLowerCase()!=='defs' && el!==grid)el.remove();});
  svg.append(layer);
  function element(tag,attrs,text){const el=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))el.setAttribute(k,String(v));if(text)el.textContent=text;return el;}
  function render(){
    const cy=Math.cos(yaw),sy=Math.sin(yaw),cx=Math.cos(pitch),sx=Math.sin(pitch);
    const points=nodes.map(n=>{const x=n.x*cy+n.z*sy,z=-n.x*sy+n.z*cy;const y=n.y*cx-z*sx,depth=n.y*sx+z*cx;const scale=620/(620-depth);return {...n,px:240+x*scale,py:195+y*scale,depth,scale};});
    const fragment=document.createDocumentFragment();
    edges.forEach(([a,b])=>fragment.append(element('line',{x1:points[a].px,y1:points[a].py,x2:points[b].px,y2:points[b].py,stroke:'#88a496','stroke-width':1.2,opacity:.5+(points[a].depth+points[b].depth+300)/1200})));
    [...points].sort((a,b)=>a.depth-b.depth).forEach(n=>{
      if(n.gold)fragment.append(element('circle',{cx:n.px,cy:n.py,r:65*n.scale,fill:'none',stroke:'#88a496','stroke-dasharray':'3 7',opacity:.4}));
      fragment.append(element('circle',{cx:n.px,cy:n.py,r:n.r*n.scale,fill:n.gold?'#e4c27b':'#c3dacb',stroke:'#182f2d','stroke-width':4,opacity:.7+(n.depth+200)/1300}));
      if(n.label)fragment.append(element('text',{x:n.px,y:n.py-n.r*n.scale-14,'text-anchor':'middle',fill:'#d4e0d5','font-size':10,'font-family':'monospace'},n.label));
    });
    layer.replaceChildren(fragment);
  }
  function rotate(dx,dy){yaw+=dx;pitch=Math.max(-1.2,Math.min(1.2,pitch+dy));render();}
  function direction(key){const moves={left:[-.22,0],right:[.22,0],up:[0,-.18],down:[0,.18]};if(moves[key])rotate(...moves[key]);}
  stage.addEventListener('pointerdown',e=>{if(e.button!==0||pointer)return;pointer={id:e.pointerId,x:e.clientX,y:e.clientY};stage.setPointerCapture(e.pointerId);stage.classList.add('dragging');});
  stage.addEventListener('pointermove',e=>{if(!pointer||pointer.id!==e.pointerId)return;const factor=3/stage.getBoundingClientRect().width;rotate((e.clientX-pointer.x)*factor,(e.clientY-pointer.y)*factor);pointer.x=e.clientX;pointer.y=e.clientY;});
  function release(e){if(pointer&&pointer.id===e.pointerId){pointer=null;stage.classList.remove('dragging');}}
  stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
  stage.addEventListener('keydown',e=>{const keys={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};if(keys[e.key]){e.preventDefault();direction(keys[e.key]);}else if(e.key==='Home'){e.preventDefault();yaw=pitch=0;render();}});
  document.querySelectorAll('[data-rotate]').forEach(button=>button.addEventListener('click',()=>direction(button.dataset.rotate)));
  document.getElementById('reset-network').addEventListener('click',()=>{yaw=pitch=0;render();});
  document.querySelector('.graph-controls').hidden=false;
  document.getElementById('graph-help').textContent='Drag to rotate · Arrow keys';
  render();
})();
