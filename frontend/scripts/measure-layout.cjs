/* global document, window, getComputedStyle */
// Pass this function to the browser's DOM evaluate API after navigation/hydration.
// It records geometry/selectors, not potentially sensitive rendered text.
module.exports=function measureLayout(){
 const width=document.documentElement.clientWidth;
 const selector=e=>{const parts=[];while(e&&e!==document.body){const siblings=[...e.parentElement.children].filter(n=>n.tagName===e.tagName);parts.unshift(e.tagName.toLowerCase()+':nth-of-type('+(siblings.indexOf(e)+1)+')');e=e.parentElement;}return 'body > '+parts.join(' > ');};
 const offenders=[],localScroll=[];
 for(const e of document.querySelectorAll('main *,header *,nav *')){
  if(e.namespaceURI!=='http://www.w3.org/1999/xhtml'||e.closest('svg,.react-flow,.sr-only,[hidden]'))continue;
  const r=e.getBoundingClientRect(),style=getComputedStyle(e);
  if(!r.height||!r.width||style.visibility==='hidden')continue;
  const outside=r.right>width+1||r.left< -1;
  const ownText=[...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim());
  const clipped=ownText&&e.scrollWidth>e.clientWidth+2&&style.display!=='inline';
  if(!outside&&!clipped)continue;
  let local=false;
  for(let p=e.parentElement;p&&p!==document.body;p=p.parentElement){if(/auto|scroll/.test(getComputedStyle(p).overflowX)&&p.scrollWidth>p.clientWidth&&e.closest('table,pre,code')){local=true;break;}}
  (local?localScroll:offenders).push({selector:selector(e),tag:e.tagName,right:Math.round(r.right),width:Math.round(r.width),scroll:e.scrollWidth});
 }
 return{innerWidth:window.innerWidth,width,scroll:document.documentElement.scrollWidth,offenders,localScroll};
};
