(function(){
"use strict";
/* ================= Constants ================= */
const CATS=[
  {key:'top',label:'Top',hint:'Shirts & layers'},
  {key:'middle',label:'Middle',hint:'Pants & skirts'},
  {key:'shoe',label:'Bottom',hint:'Shoes'}
];
const TYPES={
  top:[['tee','T-shirt'],['tank','Tank or cami'],['sweater','Sweater or long sleeve'],['jacket','Jacket or blazer']],
  middle:[['pants','Pants or jeans'],['skirt','Skirt'],['shorts','Shorts']],
  shoe:[['sneaker','Sneakers or flats'],['boot','Boots'],['heel','Heels']]
};
const ALLTYPES=Object.values(TYPES).flat().map(t=>t[0]);
const LETTER=['XS','S','M','L','XL','XXL'];
const SHOES=[];for(let s=4;s<=15;s+=.5)SHOES.push(s);
const MATERIALS=[['','Not sure'],['cotton','Cotton'],['denim','Denim'],['knit','Knit'],['wool','Wool'],['linen','Linen'],['satin','Satin'],['velvet','Velvet'],['leather','Leather'],['corduroy','Corduroy'],['synthetic','Synthetic']];
const MATKEYS=MATERIALS.map(m=>m[0]).filter(Boolean);
const NAMED=[['Black',30,30,32],['White',242,242,240],['Cream',236,226,205],['Gray',140,140,145],['Navy',40,52,90],['Blue',70,110,190],['Denim',90,120,160],['Red',190,40,45],['Pink',230,150,175],['Burgundy',110,30,50],['Green',60,130,80],['Sage',150,175,150],['Olive',110,110,60],['Brown',100,65,40],['Tan',195,160,120],['Yellow',230,200,70],['Orange',220,120,50],['Purple',110,70,140],['Lavender',180,160,210],['Rust',170,80,45]];
const OCC=[['class','Class'],['work','Work'],['interview','Interview'],['date','Date night'],['game','Game day'],['errands','Errands']];
const OCC_TARGET={class:1.3,work:2.4,interview:2.8,date:2.4,game:1,errands:.6};
const CONDS=[['clear','Clear'],['cloudy','Cloudy'],['rain','Rain'],['snow','Snow']];

const SH={
 tee:'<path d="M30 18 L42 13 Q50 22 58 13 L70 18 L88 33 L78 45 L70 39 L70 87 L30 87 L30 39 L22 45 L12 33 Z"/>',
 tank:'<path d="M36 12 L42 12 Q50 32 58 12 L64 12 Q64 30 72 38 L72 88 L28 88 L28 38 Q36 30 36 12 Z"/>',
 sweater:'<path d="M30 15 L42 11 Q50 19 58 11 L70 15 L84 29 L93 74 L81 77 L72 45 L72 88 L28 88 L28 45 L19 77 L7 74 L16 29 Z"/><path class="d" d="M28 82 L72 82"/>',
 jacket:'<path d="M30 15 L42 11 Q50 19 58 11 L70 15 L84 29 L93 74 L81 77 L72 45 L72 88 L28 88 L28 45 L19 77 L7 74 L16 29 Z"/><path class="d" d="M50 34 L50 88 M42 11 L50 34 L58 11"/>',
 pants:'<path d="M30 10 L70 10 L75 90 L56 90 L50 36 L44 90 L25 90 Z"/><path class="d" d="M30 17 L70 17"/>',
 skirt:'<path d="M34 14 L66 14 L83 80 Q50 89 17 80 Z"/><path class="d" d="M34 21 L66 21 M45 21 L39 84 M55 21 L61 84"/>',
 shorts:'<path d="M27 22 L73 22 L79 68 L56 70 L50 44 L44 70 L21 68 Z"/><path class="d" d="M27 29 L73 29"/>',
 sneaker:'<path d="M8 64 Q10 46 24 44 L42 40 Q52 51 66 53 L84 57 Q93 60 93 70 L93 74 L8 74 Z"/><path class="d" d="M8 68 L93 68 M30 46 L36 52 M37 43 L43 49"/>',
 boot:'<path d="M28 12 L54 12 L56 54 L80 61 Q91 64 91 75 L91 84 L26 84 Z"/><path class="d" d="M26 78 L91 78 M28 20 L54 20"/>',
 heel:'<path d="M12 50 Q28 48 44 60 L72 64 Q86 65 90 74 L86 80 L70 78 L64 71 L28 66 L24 86 L17 86 L17 62 Z"/>'
};

/* ================= Helpers ================= */
const $=s=>document.querySelector(s);
const uid=()=>Math.random().toString(36).slice(2,10);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const isoDay=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const today=()=>isoDay(new Date());
const daysAgo=n=>{const d=new Date();d.setDate(d.getDate()-n);return isoDay(d)};
const daysSince=s=>{if(!s)return null;const [y,m,d]=s.split('-').map(Number);const a=new Date(y,m-1,d),b=new Date();b.setHours(0,0,0,0);return Math.round((b-a)/864e5)};
const isHex=c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c);
const isPhoto=p=>typeof p==='string'&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p)&&p.length<400000;
function rgb(hex){const n=parseInt(hex.slice(1),16);return[n>>16&255,n>>8&255,n&255]}
function lum(hex){const[r,g,b]=rgb(hex);return(0.299*r+0.587*g+0.114*b)/255}
function hsl(hex){let[r,g,b]=rgb(hex).map(v=>v/255);const mx=Math.max(r,g,b),mn=Math.min(r,g,b),l=(mx+mn)/2;let h=0,s=0;
  if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return{h,s,l}}
function nearest(hex){if(!isHex(hex))return'';const[r,g,b]=rgb(hex);let best='',bd=1e9;
  NAMED.forEach(([nm,R,G,B])=>{const d=(r-R)**2*.3+(g-G)**2*.59+(b-B)**2*.11;if(d<bd){bd=d;best=nm}});return best}
function svgFor(type,color){
  const c=isHex(color)?color:'#999999';
  const st=lum(c)<0.35?'rgba(255,255,255,.45)':'rgba(0,0,0,.3)';
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><g fill="${c}" stroke="${st}" stroke-width="2" stroke-linejoin="round">${(SH[type]||SH.tee).replace(/class="d"/g,'fill="none"')}</g></svg>`;
}
function visual(it){return `<span class="vis">${isPhoto(it.photo)?`<img src="${esc(it.photo)}" alt="">`:svgFor(it.type,it.color)}</span>`}
function wornLabel(it){const n=daysSince(it.lastWorn);if(n==null)return'Not worn yet';if(n<=0)return'Worn today';if(n===1)return'Worn yesterday';if(n<30)return`Worn ${n} days ago`;return`Not worn in ${n} days`}
const sizeLabel=it=>it.cat==='shoe'?`US ${it.size}`:it.size;
const money=n=>'$'+Math.round(n).toLocaleString();

/* ================= Seed ================= */
function seed(){return []}
function seedUnused(){
  const now=Date.now();let k=0;
  const mk=(cat,type,name,color,size,price,wears,last,material,brand)=>({id:uid(),cat,type,name,color,size,price,wears,lastWorn:daysAgo(last),material:material||'',brand:brand||'',added:now-(k++)*1000,example:true});
  return [
    mk('top','tee','White linen tee','#F3F1EC','M',24,14,9,'linen'),
    mk('top','tank','Black ribbed tank','#232126','M',18,22,3,'cotton'),
    mk('top','sweater','Burgundy knit','#6B1F35','M',52,8,41,'knit'),
    mk('top','sweater','Sage cardigan','#9CB59A','M',48,9,12,'knit'),
    mk('top','jacket','Olive leather bomber','#5C5F33','M',110,5,55,'leather'),
    mk('top','jacket','Navy blazer','#2E3A5C','L',89,6,20,'wool'),
    mk('top','sweater','Rust turtleneck','#B5552F','S',39,11,33,'knit'),
    mk('top','tee','Pink baby tee','#EBA3BD','XS',16,30,90,'cotton'),
    mk('middle','pants','High rise jeans','#4B6C9B','M',68,40,1,'denim',"Levi's"),
    mk('middle','pants','Black trousers','#2A2A2E','M',55,18,6,'wool'),
    mk('middle','skirt','Cream satin skirt','#E9DFC9','M',46,6,38,'satin'),
    mk('middle','skirt','Pleated midi skirt','#C8B289','M',42,7,25,'cotton'),
    mk('middle','shorts','Denim shorts','#86A5CB','XS',30,12,70,'denim'),
    mk('shoe','sneaker','White sneakers','#F1F1F1',8,75,55,1,'leather'),
    mk('shoe','boot','Chelsea boots','#5B3B2A',8,120,20,4,'leather'),
    mk('shoe','heel','Black heels','#1F1D22',8.5,65,4,64,'leather'),
    mk('shoe','sneaker','Red canvas sneakers','#C2342F',7,45,25,30,'cotton')
  ];
}
const EXAMPLE_POSTS=[
  {id:'e1',ex:true,user:'Maya R.',color:'#B3306A',ago:'2h',title:'Blazer, fourth way',caption:'Same blazer, fourth way this month. Skirt from my sister’s closet swap.',likes:214,
   pieces:[{type:'jacket',color:'#3B3B40'},{type:'skirt',color:'#D9C7A3'},{type:'boot',color:'#2A1E18'}]},
  {id:'e2',ex:true,user:'Jordan T.',color:'#2C7A57',ago:'5h',title:'Brunch, not gym',caption:'Gym tee but make it brunch. Zero new purchases.',likes:96,
   pieces:[{type:'tee',color:'#7E9C7C'},{type:'pants',color:'#C9B79A'},{type:'sneaker',color:'#F0F0EE'}]},
  {id:'e3',ex:true,user:'Priya K.',color:'#5A4A9A',ago:'1d',title:'Interview uniform',caption:'12 pieces, 64 outfits. This one is my favorite for interviews.',likes:381,
   pieces:[{type:'sweater',color:'#E8E1D6'},{type:'pants',color:'#26314F'},{type:'heel',color:'#7A2436'}]}
];

/* ================= Weather ================= */
const WX={
 hot:{tank:['good','Light for the heat'],tee:['good','Light for the heat'],sweater:['bad','Too warm for today'],jacket:['bad','Too warm for today'],shorts:['good','Cool for the heat'],skirt:['good','Breezy for the heat'],pants:['ok','A bit warm'],sneaker:['good','Fine for today'],heel:['ok','Fine for today'],boot:['bad','Too heavy for the heat']},
 mild:{tank:['ok','Bring a layer'],tee:['good','Right for today'],sweater:['ok','Might run warm'],jacket:['good','Easy layer'],shorts:['ok','Fine if it stays warm'],skirt:['good','Right for today'],pants:['good','Right for today'],sneaker:['good','Right for today'],heel:['good','Right for today'],boot:['ok','Fine for today']},
 cool:{tank:['bad','Too light for today'],tee:['ok','Add a layer'],sweater:['good','Warm enough'],jacket:['good','Warm enough'],shorts:['bad','Too cold for shorts'],skirt:['ok','Add tights'],pants:['good','Warm enough'],sneaker:['good','Right for today'],heel:['ok','Cold on the feet'],boot:['good','Warm enough']},
 cold:{tank:['bad','Too light for the cold'],tee:['bad','Too light for the cold'],sweater:['good','Warm enough'],jacket:['good','Warm enough'],shorts:['bad','Too cold for shorts'],skirt:['ok','Add tights'],pants:['good','Warm enough'],sneaker:['ok','Wear thick socks'],heel:['bad','Too cold for heels'],boot:['good','Built for this']}
};
const band=t=>t>=80?'hot':t>=60?'mild':t>=45?'cool':'cold';
function wx(it){
  const c=S.weather.cond;let [k,t]=(WX[band(S.weather.temp)]||WX.mild)[it.type]||['ok',''];
  if(c==='rain'){if(it.type==='heel')[k,t]=['bad','Slippery in the rain'];else if(it.type==='sneaker')[k,t]=['ok','Might get wet'];else if(it.type==='boot')[k,t]=['good','Good in the rain'];else if(it.material==='satin'||it.material==='velvet')[k,t]=['ok','Rain can spot '+it.material]}
  if(c==='snow'){if(it.type==='boot')[k,t]=['good','Good in the snow'];else if(it.cat==='shoe')[k,t]=['bad','Not for snow'];else if(it.type==='shorts')[k,t]=['bad','Too cold for shorts']}
  return{k,t};
}

/* ================= Trends (Fall 2026) ================= */
const fam=it=>nearest(it.color);
const has=(o,names)=>o.some(i=>names.includes(fam(i)));
const TRENDS=[
 {id:'browns',for:'women',name:'Brown and cream',note:'Chocolate, caramel, and ivory tones lead this fall’s color lists.',test:o=>has(o,['Brown','Tan','Rust'])&&has(o,['Cream','White'])},
 {id:'maroon',for:'women',name:'Moody maroon',note:'Burgundy, oxblood, and wine, even head to toe.',test:o=>has(o,['Burgundy'])},
 {id:'purple',for:'women',name:'Royal purple',note:'Plum to violet in knits, shoes, and bags.',test:o=>has(o,['Purple','Lavender'])},
 {id:'olive',for:'women',name:'Olive and moss',note:'Earthy greens like olive, moss, and khaki.',test:o=>has(o,['Olive','Green','Sage'])},
 {id:'red',for:'women',name:'Bright red pop',note:'One saturated red piece to lift a neutral look.',test:o=>has(o,['Red'])},
 {id:'tux',for:'women',name:'Black and white',note:'Tuxedo style contrast with nothing else in the mix.',test:o=>o.length===3&&o.every(i=>['Black','White','Gray'].includes(fam(i)))&&has(o,['Black'])&&has(o,['White'])},
 {id:'tailor',for:'women',name:'Lean tailoring',note:'A structured jacket with slim trousers.',test:o=>o.some(i=>i.type==='jacket'&&i.material!=='leather')&&o.some(i=>i.type==='pants'&&i.material!=='denim')},
 {id:'leather',for:'women',name:'Leather jackets',note:'Bombers in olive, chocolate, and espresso.',test:o=>o.some(i=>i.type==='jacket'&&i.material==='leather')},
 {id:'satin',for:'women',name:'Satin',note:'Fluid satin skirts, pants, and camis.',test:o=>o.some(i=>i.material==='satin')},
 {id:'velvet',for:'women',name:'Velvet',note:'Velvet and other evening fabrics worn in the day.',test:o=>o.some(i=>i.material==='velvet')},
 {id:'m-earth',for:'men',name:'Heritage browns and greys',note:'Camel, chocolate, taupe, and charcoal worn together.',test:o=>o.filter(i=>['Brown','Tan','Gray','Rust'].includes(fam(i))).length>=2},
 {id:'m-red',for:'men',name:'Spiced red',note:'Deep red or bordeaux as the one accent piece.',test:o=>has(o,['Red','Burgundy'])},
 {id:'m-knit',for:'men',name:'Vintage knits',note:'Cable knit, fair isle, and chunky rollneck sweaters.',test:o=>o.some(i=>i.type==='sweater'&&['knit','wool'].includes(i.material))},
 {id:'m-tailor',for:'men',name:'Relaxed tailoring',note:'A trimmed blazer with easy, pleated trousers.',test:o=>o.some(i=>i.type==='jacket'&&i.material!=='leather')&&o.some(i=>i.type==='pants'&&i.material!=='denim')},
 {id:'m-sneak',for:'men',name:'Blazer and clean sneakers',note:'An unstructured blazer worn with white or grey sneakers.',test:o=>o.some(i=>i.type==='jacket'&&i.material!=='leather')&&o.some(i=>i.type==='sneaker'&&['White','Cream','Gray'].includes(fam(i)))},
 {id:'m-green',for:'men',name:'Forest green',note:'Deep greens next to camel and charcoal.',test:o=>has(o,['Green','Olive'])},
 {id:'m-texture',for:'men',name:'Corduroy and velvet',note:'The standout fabrics of the season.',test:o=>o.some(i=>['corduroy','velvet'].includes(i.material))},
 {id:'m-boots',for:'men',name:'Chelsea and hiking boots',note:'Boots took over the fall runways.',test:o=>o.some(i=>i.type==='boot')}
];
const FADING=[
 {id:'linen',for:'all',name:'Linen',note:'Reads as summer now. Layer it under a knit.',test:o=>o.some(i=>i.material==='linen')},
 {id:'yellow',for:'women',name:'Yellow',note:'Cooling off for fall.',test:o=>has(o,['Yellow'])}
];
const STYLES=[['women','Women’s'],['men','Men’s'],['both','Both']];
const styleOn=t=>t.for==='all'||S.profile.style==='both'||t.for===S.profile.style;
const activeTrends=()=>TRENDS.filter(styleOn),activeFading=()=>FADING.filter(styleOn);
const styleWord=()=>({women:'women’s',men:'men’s',both:''})[S.profile.style]||'';

/* ================= Color harmony ================= */
const NEUTRAL=['Black','White','Cream','Gray','Navy','Tan','Denim','Brown'];
function harmony(o){
  const acc=o.filter(i=>i.material!=='denim'&&!NEUTRAL.includes(fam(i))&&hsl(i.color).s>0.33);
  if(!acc.length)return{k:'good',t:'Easy neutrals'};
  if(acc.length===1)return{k:'good',t:`One ${fam(acc[0]).toLowerCase()} pop`};
  let worst=0;
  for(let a=0;a<acc.length;a++)for(let b=a+1;b<acc.length;b++){let d=Math.abs(hsl(acc[a].color).h-hsl(acc[b].color).h);d=Math.min(d,360-d);
    const s=d<40?0:d>150?1:2;worst=Math.max(worst,s)}
  if(acc.length>=3)return{k:'ok',t:'Busy, pick one star'};
  return worst===0?{k:'good',t:'Tonal match'}:worst===1?{k:'ok',t:'Bold contrast'}:{k:'bad',t:'Colors may clash'};
}

/* ================= State + storage ================= */
const KEY='remix-closet-v3';
let S={items:seed(),profile:{top:'M',middle:'M',shoe:8,outfitValue:60,style:'women',name:''},looks:[],log:[],localPosts:[],liked:{},myTokens:{},
  weather:{temp:48,cond:'cloudy'},occasion:'class',note:'',wxOnly:false,fitOnly:false,wxOpen:false,
  idx:{top:0,middle:0,shoe:0},locked:{},tab:'style',closetFilter:'all',q:'',sort:'newest',
  suggestion:null,thinking:false,recent:[],posts:[],likes:{},names:{}};
function loadLocal(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');
    if(s&&Array.isArray(s.items)){applyBlob(s);return}
    const old=JSON.parse(localStorage.getItem('remix-closet-v2')||'null');
    if(old&&Array.isArray(old.items)){
      S.items=old.items.filter(i=>i&&!i.example).map(i=>Object.assign({added:Date.now()},i));
      S.profile=Object.assign(S.profile,old.profile||{});S.looks=(old.looks||[]).map(l=>({id:l.id||uid(),ids:l.ids,at:Date.now()}));
      S.weather=old.weather||S.weather;S.liked=old.liked||{};
      S.localPosts=(old.myPosts||[]).map(p=>({id:p.id,at:Date.now(),caption:p.caption||'',title:'',pieces:(p.pieces||[]).map(pc=>({type:pc.type,color:pc.color,name:''}))}));
    }
  }catch(e){}
}
function applyBlob(s){
  if(Array.isArray(s.items))S.items=s.items.filter(i=>i&&!i.example);
  const p=s.prof||s;
  if(p.profile)S.profile=Object.assign({},S.profile,p.profile);
  if(p.weather)S.weather=Object.assign({},S.weather,p.weather);
  if(Array.isArray(p.looks))S.looks=p.looks;
  if(Array.isArray(p.log))S.log=p.log;
  if(p.occasion)S.occasion=p.occasion;
  if(Array.isArray(s.localPosts))S.localPosts=s.localPosts;
  if(s.liked)S.liked=s.liked;
  if(s.myTokens&&typeof s.myTokens==='object')S.myTokens=s.myTokens;
}
const profBlob=()=>({profile:S.profile,weather:S.weather,looks:S.looks.slice(0,60),log:S.log.slice(0,120),occasion:S.occasion});
let storageWarned=false;
function persistLocal(){
  try{localStorage.setItem(KEY,JSON.stringify({items:S.items,prof:profBlob(),localPosts:S.localPosts.slice(0,20),liked:S.liked,myTokens:S.myTokens}))}
  catch(e){if(!storageWarned){storageWarned=true;toast('Couldn’t save on this device. Private browsing can block storage.')}}
}

/* On-device storage: closets live on each person's phone. Nothing leaves it unless they post a look. */
const CAP={ai:false,feed:false,checked:false};
function saveItem(){persistLocal()}
function dropItem(){persistLocal()}
function saveProfile(){persistLocal()}
function cleanItem(v){
  if(!v||!CATS.some(c=>c.key===v.cat)||!ALLTYPES.includes(v.type))return null;
  const o={id:String(v.id||'').slice(0,20),cat:v.cat,type:v.type,name:String(v.name||'Piece').slice(0,40),color:isHex(v.color)?v.color:'#999999',
    size:v.cat==='shoe'?(Number(v.size)||8):(LETTER.includes(v.size)?v.size:'M'),price:Math.max(0,Number(v.price)||0),wears:Math.max(0,Math.round(Number(v.wears)||0)),
    lastWorn:typeof v.lastWorn==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v.lastWorn)?v.lastWorn:null,material:MATKEYS.includes(v.material)?v.material:'',
    brand:String(v.brand||'').slice(0,30),care:String(v.care||'').slice(0,80),added:Number(v.added)||0,example:!!v.example};
  if(isPhoto(v.photo))o.photo=v.photo;
  return o.id?o:null;
}

/* A random id for this device, used only so the feed can count one like per phone */
let DEVICE='';
try{DEVICE=localStorage.getItem('remix-device')||'';
  if(!/^[a-z0-9]{16,32}$/.test(DEVICE)){DEVICE=Array.from(crypto.getRandomValues(new Uint8Array(12)),b=>b.toString(36).padStart(2,'0')).join('').slice(0,22);localStorage.setItem('remix-device',DEVICE)}
}catch(e){DEVICE=(uid()+uid()).slice(0,16)}

/* Talking to the Remix Worker (it holds the Claude key and the shared feed) */
class ApiError extends Error{constructor(code,msg){super(msg||code);this.code=code}}
async function api(path,body){
  if(!navigator.onLine)throw new ApiError('offline');
  let r;
  try{r=await fetch('api/'+path,{method:body?'POST':'GET',headers:body?{'content-type':'application/json'}:{},body:body?JSON.stringify(body):undefined,cache:'no-store'})}
  catch(e){throw new ApiError('network')}
  let d=null;try{d=await r.json()}catch(e){}
  if(!r.ok)throw new ApiError((d&&d.error)||(r.status===429?'rate_limited':'server'),d&&d.message);
  return d;
}
function cleanPost(p){
  if(!p||typeof p.id!=='string'||!/^[a-z0-9]{8,32}$/.test(p.id))return null;
  const pieces=(Array.isArray(p.pieces)?p.pieces:[]).slice(0,3).map(pc=>({type:ALLTYPES.includes(pc&&pc.type)?pc.type:'tee',color:isHex(pc&&pc.color)?pc.color:'#999999',name:String(pc&&pc.name||'').slice(0,40)}));
  if(!pieces.length)return null;
  return{id:p.id,name:String(p.name||'').slice(0,24),at:Number(p.at)||0,caption:String(p.caption||'').slice(0,160),title:String(p.title||'').slice(0,40),pieces,
    likes:Math.max(0,Math.round(Number(p.likes)||0)),liked:!!p.liked};
}
let feedAt=0;
async function loadFeed(force){
  if(!force&&Date.now()-feedAt<15000)return;feedAt=Date.now();
  try{const d=await api('feed?device='+encodeURIComponent(DEVICE));S.posts=(Array.isArray(d&&d.posts)?d.posts:[]).map(cleanPost).filter(Boolean);CAP.feed=true}
  catch(e){if(e.code!=='rate_limited')CAP.feed=false}
  if(S.tab==='feed')render();
}

/* ================= Derived ================= */
function fit(it){
  if(it.cat==='shoe'){const d=Number(it.size)-Number(S.profile.shoe);if(d===0)return{k:'fits',t:'Fits'};if(Math.abs(d)<=.5)return{k:'check',t:'Check fit'};return{k:'no',t:d<0?'Too small':'Too big'}}
  const d=LETTER.indexOf(it.size)-LETTER.indexOf(S.profile[it.cat]);
  if(d===0)return{k:'fits',t:'Fits'};if(Math.abs(d)===1)return{k:'check',t:'Check fit'};return{k:'no',t:d<0?'Too small':'Too big'};
}
function pool(cat){let l=S.items.filter(i=>i.cat===cat);if(S.fitOnly)l=l.filter(i=>fit(i).k!=='no');if(S.wxOnly)l=l.filter(i=>wx(i).k!=='bad');return l}
function current(cat){const l=pool(cat);if(!l.length)return null;S.idx[cat]=((S.idx[cat]%l.length)+l.length)%l.length;return l[S.idx[cat]]}
const outfit=()=>CATS.map(c=>current(c.key)).filter(Boolean);
const combos=()=>CATS.reduce((n,c)=>n*pool(c.key).length,1);
const needsFit=()=>S.items.filter(i=>fit(i).k==='no');
const cpw=it=>it.price?(it.wears?`$${(it.price/it.wears).toFixed(2)}/wear`:'Not worn yet'):'';
function formal(it){return({tee:1,tank:.8,sweater:2,jacket:it.material==='leather'?2:3,pants:it.material==='denim'?1.2:2.8,skirt:it.material==='satin'?2.6:2,shorts:.3,sneaker:it.material==='cotton'?.8:1.2,boot:2.2,heel:3})[it.type]||1.5}
function lookScore(o){
  if(o.length<3)return null;
  const w=o.reduce((s,i)=>s+({good:10,ok:6,bad:0})[wx(i).k],0);
  const f=o.reduce((s,i)=>s+({fits:20/3,check:4,no:0})[fit(i).k],0);
  const h=harmony(o),c=({good:25,ok:15,bad:5})[h.k];
  const hits=activeTrends().filter(t=>t.test(o)).length,t=hits>=2?25:hits===1?17:5;
  return{total:Math.round(w+f+c+t),hits,h};
}

/* Built-in stylist: scores every combination in the closet */
function localPick(){
  const rows=CATS.map(c=>{if(S.locked[c.key]){const it=current(c.key);return it?[it]:[]}let l=pool(c.key).filter(i=>fit(i).k!=='no');if(!l.length)l=pool(c.key);return l});
  if(rows.some(r=>!r.length))return null;
  const target=OCC_TARGET[S.occasion]||1.5;const scored=[];
  for(const a of rows[0])for(const b of rows[1])for(const c of rows[2]){
    const o=[a,b,c],sc=lookScore(o);
    const form=o.reduce((s,i)=>s+formal(i),0)/3;
    const fresh=o.reduce((s,i)=>s+Math.min(30,daysSince(i.lastWorn)??30),0)/9;
    scored.push({o,s:sc.total-Math.abs(form-target)*12+fresh,key:o.map(i=>i.id).join()});
  }
  scored.sort((x,y)=>y.s-x.s);
  const fresh=scored.filter(x=>!S.recent.includes(x.key));
  const top=(fresh.length?fresh:scored).slice(0,3);
  const pick=top[Math.floor(Math.random()*top.length)];
  const o=pick.o,sc=lookScore(o),occ=(OCC.find(x=>x[0]===S.occasion)||OCC[0])[1];
  const trend=activeTrends().find(t=>t.test(o));
  const forgotten=o.find(i=>(daysSince(i.lastWorn)??99)>=30);
  let why=`${o.every(i=>wx(i).k!=='bad')?`Works for ${S.weather.temp}°F`:'Closest fit for today’s weather'} and ${sc.h.t.toLowerCase()}.`;
  if(trend)why+=` It also hits ${trend.name.toLowerCase()}.`;
  else if(forgotten)why+=` Your ${forgotten.name.toLowerCase()} is due for a wear.`;
  const [top1,mid,sh]=o;let tip='Front tuck the top to give the outfit some shape.';
  if(mid.type==='skirt'&&band(S.weather.temp)!=='hot'&&band(S.weather.temp)!=='mild')tip='Add sheer black tights to keep the skirt warm enough.';
  else if(top1.type==='jacket')tip='Push the jacket sleeves up for an easier look.';
  else if(mid.material==='denim'&&sh.type!=='sneaker')tip='Cuff the jeans once so the shoes show.';
  else if(top1.type==='sweater')tip='Let a little of the sweater hem hang over the waistband.';
  return{ids:o.map(i=>i.id),title:`${occ} remix`,why,tip,by:'built-in'};
}
function applyPick(p){
  if(!p){toast('Add a piece to every row first');return}
  const items=p.ids.map(id=>S.items.find(i=>i.id===id));
  if(items.some(it=>!it)){toast('Add a piece to every row first');return}
  if(items.some(it=>pool(it.cat).indexOf(it)<0)){S.fitOnly=false;S.wxOnly=false}
  items.forEach(it=>{S.idx[it.cat]=pool(it.cat).indexOf(it)});
  S.recent=[p.ids.join(),...S.recent].slice(0,6);
  S.suggestion=p;render({pop:true});
}

/* ================= Claude features ================= */
function occLabel(){return(OCC.find(x=>x[0]===S.occasion)||OCC[0])[1]}
const AI_OFF_MSG={offline:'You’re offline, so the built-in stylist picked this one.',rate_limited:'The stylist is busy. The built-in stylist picked this one.'};
async function styleMe(again){
  if(S.thinking)return;
  if(CATS.some(c=>!pool(c.key).length)){toast('Add a piece to every row first');return}
  if(!CAP.ai||!navigator.onLine){applyPick(localPick());return}
  S.thinking=true;render();
  try{
    const locked=CATS.filter(c=>S.locked[c.key]).map(c=>current(c.key)).filter(Boolean).map(i=>i.id);
    const closet=S.items.filter(i=>fit(i).k!=='no').slice(0,80).map(i=>({id:i.id,cat:i.cat,name:i.name,type:i.type,color:fam(i),material:i.material||'',weather:wx(i).k,worn:wornLabel(i).toLowerCase()}));
    const r=await api('style',{occasion:occLabel(),note:S.note.trim().slice(0,200),weather:{temp:S.weather.temp,cond:S.weather.cond},
      trends:activeTrends().map(t=>t.name),locked,recent:S.recent.slice(0,4),closet});
    S.thinking=false;
    const fallback=localPick();if(!fallback){render();return}
    const final=['top','middle','shoe'].map((k,n)=>{if(S.locked[k]){const c=current(k);if(c)return c.id}
      const id=String(r&&r[k]||'');return S.items.some(i=>i.id===id&&i.cat===k)?id:fallback.ids[n]});
    applyPick({ids:final,title:String(r&&r.title||fallback.title).slice(0,40),why:String(r&&r.why||fallback.why).slice(0,240),tip:String(r&&r.tip||fallback.tip).slice(0,160),by:'claude'});
  }catch(e){
    S.thinking=false;
    if(e.code==='ai_off')CAP.ai=false;
    applyPick(localPick());
    toast(AI_OFF_MSG[e.code]||'Claude didn’t answer, so the built-in stylist picked this one.');
  }
}
const toBase64=blob=>new Promise((res,rej)=>{const fr=new FileReader();fr.onload=()=>res(String(fr.result).split(',')[1]||'');fr.onerror=()=>rej(fr.error);fr.readAsDataURL(blob)});
async function readItemPhoto(blob){return api('read-item',{image:await toBase64(blob),mediaType:'image/jpeg'})}
async function readTagPhoto(blob){return api('read-tag',{image:await toBase64(blob),mediaType:'image/jpeg'})}

/* ================= UI helpers ================= */
const view=$('#view');
function toast(msg,label,fn){
  const t=$('#toast');t.textContent='';const s=document.createElement('span');s.textContent=msg;t.append(s);
  if(label){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=()=>{t.hidden=true;fn()};t.append(b)}
  t.hidden=false;clearTimeout(toast._t);toast._t=setTimeout(()=>{t.hidden=true},label?5000:2600);
}
const IC={
  l:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  r:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>',
  lock:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>',
  shuffle:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/></svg>',
  save:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-6-4-6 4z"/></svg>',
  share:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>',
  wear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l4 4 10-10"/></svg>',
  heart:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  cam:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  tag:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/></svg>',
  spark:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" width="16" height="16"><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z"/></svg>',
  clear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8"/></svg>',
  cloudy:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M7 18h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 18z"/></svg>',
  rain:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 15h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 15z"/><path d="M9 18l-1 3M13 18l-1 3M17 18l-1 3"/></svg>',
  snow:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.6 1.5A3.3 3.3 0 0 0 7 14z"/><path d="M8 18h.01M12 20h.01M16 18h.01M10 22h.01M14 22h.01"/></svg>'
};
const examplesOnly=()=>S.items.length>0&&S.items.every(i=>i.example);

/* ================= Style tab ================= */
function renderStyle(dir){
  let h='';
  const bad=needsFit();
  if(bad.length)h+=`<div class="banner bad"><div class="grow"><b>${bad.length} ${bad.length===1?'piece no longer fits':'pieces no longer fit'}</b> your saved sizes.</div><button class="btn-sm" data-go-fit>Review</button></div>`;
  const W=S.weather,cl=(CONDS.find(c=>c[0]===W.cond)||CONDS[1])[1];
  h+=`<section class="wx" aria-label="Today's weather"><div class="wx-top"><div class="wx-ic">${IC[W.cond]}</div>
    <div style="flex:1;min-width:0"><div class="wx-temp"><span id="wx-num">${W.temp}</span>°F · ${cl}</div><div class="wx-sub">Set today’s weather and the picks follow it</div></div>
    <button class="btn-sm" id="wx-toggle" aria-expanded="${S.wxOpen}">${S.wxOpen?'Done':'Change'}</button></div>
    ${S.wxOpen?`<input type="range" id="wx-temp" min="-10" max="100" step="1" value="${W.temp}" aria-label="Temperature in Fahrenheit">
    <div class="chips" role="group" aria-label="Conditions">${CONDS.map(([k,t])=>`<button class="chip" data-cond="${k}" aria-pressed="${W.cond===k}">${t}</button>`).join('')}</div>`:''}</section>`;

  const ai=CAP.ai;
  h+=`<section class="stylist" aria-label="Stylist"><div><div class="label">Stylist</div><h3>What’s today?</h3></div>
    <div class="occ" role="group" aria-label="Occasion">${OCC.map(([k,t])=>`<button data-occ="${k}" aria-pressed="${S.occasion===k}">${t}</button>`).join('')}</div>
    <div class="ask"><label class="sr" for="note">Add a detail</label><input id="note" maxlength="200" placeholder="Add a detail (optional)" value="${esc(S.note)}">
    <button class="go" data-style-me ${S.thinking?'disabled':''}>${S.thinking?'<span class="spin"></span>Styling':IC.spark+'Style me'}</button></div>`;
  if(S.suggestion&&!S.thinking){const s=S.suggestion;
    h+=`<div class="result anim-pop"><div class="by">${s.by==='claude'?'Styled by Claude':'Built-in stylist'}</div><div class="title">${esc(s.title)}</div><p>${esc(s.why)}</p>
      ${s.tip?`<div class="tipline"><b>Tip</b> ${esc(s.tip)}</div>`:''}
      <div class="row-btns"><button data-style-again>Try another</button><button data-dismiss>Done</button></div></div>`}
  else if(!S.suggestion&&!S.thinking)h+=`<p class="note" style="color:var(--inv-muted)">${ai?'Claude picks from your closet, using the weather, your sizes, and what you haven’t worn lately.':'Picks from your closet using the weather, your sizes, trends, and what you haven’t worn lately.'}</p>`;
  h+='</section>';

  h+=`<div class="toolbar"><h2>Mix &amp; match</h2><div class="filters">
    <button class="fchip" data-flt="fit" aria-pressed="${S.fitOnly}">Fits me</button><button class="fchip" data-flt="wx" aria-pressed="${S.wxOnly}">Weather OK</button></div></div><div class="rows">`;
  CATS.forEach(c=>{
    const l=pool(c.key),it=current(c.key),locked=!!S.locked[c.key];
    const an=dir&&dir.pop?'anim-pop':dir&&dir.cat===c.key?(dir.d>0?'anim-r':'anim-l'):'';
    h+=`<div><div class="row-head"><span class="label">${c.label} · ${l.length?`${S.idx[c.key]+1} of ${l.length}`:'empty'}</span><button class="lock" data-lock="${c.key}" aria-pressed="${locked}">${locked?IC.lock+'Locked':'Lock'}</button></div>
    <div class="row"><button class="arrow" data-step="${c.key}" data-d="-1" aria-label="Previous ${c.label.toLowerCase()}" ${l.length<2?'disabled':''}>${IC.l}</button>`;
    if(it){const f=fit(it),w=wx(it);h+=`<button class="piece ${locked?'locked':''} ${an}" data-swipe="${c.key}" data-detail="${it.id}" aria-label="${esc(it.name)} details">${visual(it)}<span class="info"><span class="name">${esc(it.name)}</span><span class="tags"><span class="sz">${esc(sizeLabel(it))}</span><span class="badge ${f.k}">${f.t}</span></span><span class="wxl ${w.k}">${w.t}</span><span class="worn">${wornLabel(it)}</span></span></button>`}
    else h+=`<div class="piece empty-piece">No ${c.hint.toLowerCase()} ${S.fitOnly||S.wxOnly?'match your filters':'yet'}. ${S.fitOnly||S.wxOnly?'Try turning a filter off.':'Add some in Closet.'}</div>`;
    h+=`<button class="arrow" data-step="${c.key}" data-d="1" aria-label="Next ${c.label.toLowerCase()}" ${l.length<2?'disabled':''}>${IC.r}</button></div></div>`;
  });
  h+='</div>'+lookCheck();
  const loggedToday=S.log.find(e=>e.d===today());
  h+=`<div class="actions">
    <button class="act" data-act="shuffle">${IC.shuffle}Shuffle</button>
    <button class="act" data-act="save">${IC.save}Save look</button>
    <button class="act" data-act="wear">${IC.wear}${loggedToday?'Wearing':'Wear today'}</button>
    <button class="act primary" data-act="share">${IC.share}Share</button></div>
    <p class="note">Swipe a piece or tap the arrows. Tap a piece for details. Lock a row to keep it while you shuffle or restyle.</p>`;
  view.innerHTML=h;
}
function lookCheck(){
  const o=outfit();const sc=lookScore(o);if(!sc)return'';
  const okW=o.filter(i=>wx(i).k!=='bad').length,goodW=o.filter(i=>wx(i).k==='good').length;
  const badF=o.filter(i=>fit(i).k==='no').length,chkF=o.filter(i=>fit(i).k==='check').length;
  const hits=activeTrends().filter(t=>t.test(o)),fades=activeFading().filter(t=>t.test(o));
  const wk=okW<o.length?'bad':goodW===o.length?'good':'ok';
  const wt=okW<o.length?`${o.length-okW} ${o.length-okW===1?'piece':'pieces'} won’t work in ${S.weather.temp}°F`:goodW===o.length?'Ready for today':'Works for today';
  const fk=badF?'bad':chkF?'ok':'good',ft=badF?`${badF} ${badF===1?'piece doesn’t':'pieces don’t'} fit`:chkF?'Check one size':'All fit';
  const tk=hits.length?'good':'ok',tt=hits.length?`${hits.length} ${styleWord()} match${hits.length>1?'es':''}`:'No trend matches';
  const pct=sc.total,R=32,C=2*Math.PI*R,col=pct>=80?'var(--ok)':pct>=60?'var(--accent)':'var(--warn)';
  let h=`<section class="look-check" aria-label="Look check"><div class="lc-top">
    <div class="ring" role="img" aria-label="Remix score ${pct} out of 100"><svg viewBox="0 0 76 76"><circle cx="38" cy="38" r="${R}" fill="none" stroke="var(--well)" stroke-width="7"/><circle cx="38" cy="38" r="${R}" fill="none" stroke="${col}" stroke-width="7" stroke-linecap="round" stroke-dasharray="${(C*pct/100).toFixed(1)} ${C.toFixed(1)}"/></svg><div class="num"><div>${pct}<small>SCORE</small></div></div></div>
    <div class="checks"><div class="label">Look check</div>
      <div class="chk"><span>Weather</span><b class="${wk}">${wt}</b></div>
      <div class="chk"><span>Fit</span><b class="${fk}">${ft}</b></div>
      <div class="chk"><span>Colors</span><b class="${sc.h.k}">${sc.h.t}</b></div>
      <div class="chk"><span>Trends</span><b class="${tk}">${tt}</b></div></div></div>`;
  if(hits.length||fades.length)h+=`<div class="tags">${hits.map(t=>`<span class="tchip" title="${esc(t.note)}">${esc(t.name)}</span>`).join('')}${fades.map(t=>`<span class="tchip fade" title="${esc(t.note)}">${esc(t.name)} is cooling off</span>`).join('')}</div>`;
  const tip=trendTip(o);
  if(tip)h+=`<div class="tip"><div class="grow">Swap in your <b>${esc(tip.it.name)}</b> to hit <b>${esc(tip.tr.name)}</b>.</div><button class="btn-sm" data-tip="${tip.cat}" data-j="${tip.j}">Swap it in</button></div>`;
  return h+'</section>';
}
function trendTip(o){
  if(o.length<3)return null;
  for(const tr of activeTrends()){if(tr.test(o))continue;
    for(const c of CATS){if(S.locked[c.key])continue;const l=pool(c.key);
      for(let j=0;j<l.length;j++){const it=l[j];if(o.includes(it)||fit(it).k==='no')continue;
        const sw=o.map(x=>x.cat===c.key?it:x);if(tr.test(sw)&&wx(it).k!=='bad'&&harmony(sw).k!=='bad')return{tr,it,cat:c.key,j}}}}
  return null;
}

/* ================= Closet tab ================= */
function renderCloset(){
  const F=[['all','All'],['top','Top'],['middle','Middle'],['shoe','Bottom'],['fit','Needs fit check']];
  let list=S.items.slice();
  if(S.closetFilter==='fit')list=list.filter(i=>fit(i).k!=='fits');
  else if(S.closetFilter!=='all')list=list.filter(i=>i.cat===S.closetFilter);
  const qq=S.q.trim().toLowerCase();
  if(qq)list=list.filter(i=>[i.name,i.brand,fam(i),i.material,i.type].join(' ').toLowerCase().includes(qq));
  const sorters={newest:(a,b)=>b.added-a.added,most:(a,b)=>b.wears-a.wears,least:(a,b)=>(daysSince(b.lastWorn)??999)-(daysSince(a.lastWorn)??999),cpw:(a,b)=>((b.price||0)/Math.max(1,b.wears))-((a.price||0)/Math.max(1,a.wears))};
  list.sort(sorters[S.sort]||sorters.newest);
  const value=S.items.reduce((s,i)=>s+(i.price||0),0);
  const forgotten=S.items.filter(i=>fit(i).k!=='no'&&(i.lastWorn?daysSince(i.lastWorn)>=30:Date.now()-(i.added||0)>30*864e5)).sort((a,b)=>(daysSince(b.lastWorn)??999)-(daysSince(a.lastWorn)??999)).slice(0,6);
  let h='';
  if(!S.items.length)h+=`<div class="banner info"><div class="grow">Your closet is empty. Add your first piece to start mixing outfits.</div></div>`;
  h+=`<div class="toolbar"><h2>My closet</h2><span class="muted" style="font-variant-numeric:tabular-nums">${S.items.length} pieces · ${money(value)}</span></div>`;
  if(forgotten.length)h+=`<section><div class="toolbar" style="margin-bottom:8px"><span class="label">Forgotten pieces</span><span class="note">Not worn in 30+ days</span></div>
    <div class="strip">${forgotten.map(i=>`<button class="mini" data-style-around="${i.id}">${visual(i)}<span class="name">${esc(i.name)}</span><span class="worn">${wornLabel(i)}</span><span class="link">Style it</span></button>`).join('')}</div></section>`;
  h+=`<label class="sr" for="closet-q">Search your closet</label><input class="search" id="closet-q" type="search" placeholder="Search by name, color, brand" value="${esc(S.q)}">
  <div class="toolbar"><div class="chips" role="group" aria-label="Filter">${F.map(([k,t])=>`<button class="chip" data-filter="${k}" aria-pressed="${S.closetFilter===k}">${t}</button>`).join('')}</div>
  <label class="sr" for="closet-sort">Sort</label><select class="sortsel" id="closet-sort">${[['newest','Newest'],['most','Most worn'],['least','Least recently worn'],['cpw','Highest cost per wear']].map(([k,t])=>`<option value="${k}" ${S.sort===k?'selected':''}>${t}</option>`).join('')}</select></div>
  <div class="grid"><button class="add-card" data-add><span class="plus">+</span>Add a piece<small class="muted">${CAP.ai?'Claude reads the photo and the tag':'Photo or tag'}</small></button>`;
  list.forEach(it=>{const f=fit(it);h+=`<button class="card" data-detail="${it.id}">${visual(it)}<span class="name">${esc(it.name)}</span><span class="tags"><span class="sz">${esc(sizeLabel(it))}</span><span class="badge ${f.k}">${f.t}</span></span><span class="meta">${it.wears||0} wears${it.price?' · '+cpw(it):''}</span></button>`});
  h+='</div>';
  if(!list.length)h+=`<p class="note">${qq?'Nothing matches that search.':'Nothing here. Everything in this view fits your sizes.'}</p>`;
  view.innerHTML=h;
}

/* ================= Feed tab ================= */
function initials(n){return(String(n||'?').trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2)||'?').toUpperCase()}
function hueOf(s){let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))%360;return h}
function renderFeed(){
  const real=[...S.localPosts.map(p=>Object.assign({local:true},p)),...(CAP.feed?S.posts:[])].sort((a,b)=>b.at-a.at);
  const posts=real;
  let h=`<div class="toolbar"><h2>Community looks</h2><span class="muted">Restyled, not rebought</span></div>`;
  if(CAP.checked&&!CAP.feed)h+=`<p class="note">The shared feed isn’t reachable right now, so you’re seeing looks saved on this phone.</p>`;
  h+='<div class="rows">';
  posts.forEach(p=>{
    const key=p.ex?'ex:'+p.id:p.local?'local:'+p.id:p.id;
    const mine=p.local||!!S.myTokens[p.id];
    const liked=p.ex||p.local?!!S.liked[key]:p.liked;
    const n=p.ex?p.likes+(liked?1:0):p.local?(liked?1:0):p.likes;
    const name=p.ex?p.user:mine?'You':(p.name||'Someone');
    const bg=p.ex?p.color:mine?'var(--accent)':`hsl(${hueOf(p.name||p.id)} 45% 42%)`;
    const ago=p.ex?p.ago:agoLabel(p.at);
    h+=`<article class="post"><div class="post-head"><div class="avatar" style="background:${bg}">${esc(initials(mine&&S.profile.name?S.profile.name:name))}</div><div class="who"><b>${esc(name)}</b><span>${esc(ago)}${p.local?' · on this phone':''}</span></div>${p.ex?'<span class="ex">Example</span>':''}</div>
    <div class="stack">${p.pieces.map(pc=>visual(pc)).join('')}</div>
    ${p.title?`<div class="ptitle">${esc(p.title)}</div>`:''}${p.caption?`<div>${esc(p.caption)}</div>`:''}
    <div class="post-foot"><button class="like" data-like="${esc(key)}" aria-pressed="${liked}" aria-label="Like">${IC.heart}${n}</button><span class="muted" style="font-size:13px">${p.pieces.length} pieces already owned</span>
    ${mine?`<button class="del" data-delpost="${esc(key)}">Delete</button>`:!p.ex?`<button class="del" data-report="${esc(p.id)}">Report</button>`:''}</div></article>`;
  });
  if(!posts.length)h+='<p class="note">No looks shared yet. Build an outfit on the Style tab and tap Share.</p>';
  view.innerHTML=h+'</div>';
}
function agoLabel(t){const m=Math.max(0,Math.round((Date.now()-t)/6e4));if(m<1)return'now';if(m<60)return m+'m';const h=Math.round(m/60);if(h<24)return h+'h';return Math.round(h/24)+'d'}

/* ================= Me tab ================= */
function renderMe(){
  const P=S.profile,bad=S.items.filter(i=>fit(i).k!=='fits');
  const opt=(arr,v)=>arr.map(x=>`<option value="${x}" ${String(x)===String(v)?'selected':''}>${x}</option>`).join('');
  const name=S.profile.name;
  const wearsAll=S.items.reduce((s,i)=>s+(i.wears||0),0),valueAll=S.items.reduce((s,i)=>s+(i.price||0),0);
  const logged=S.log.length,kept=logged*Number(P.outfitValue||0);
  let h=`<div class="me-head"><div class="avatar">${esc(name?initials(name):'You')}</div><div><h2>${name?esc(name.split(' ')[0])+'’s closet':'My closet'}</h2><p class="note">Saved on this phone</p></div></div>
  <section class="panel"><h3>Money kept</h3><div class="stats">
    <div class="stat"><div class="n">${logged}</div><div class="k">outfits you rewore</div></div>
    <div class="stat"><div class="n">${money(kept)}</div><div class="k">not spent on new outfits</div></div>
    <div class="stat"><div class="n">${combos()}</div><div class="k">possible outfits</div></div>
    <div class="stat"><div class="n">${wearsAll?'$'+(valueAll/wearsAll).toFixed(2):'–'}</div><div class="k">average cost per wear</div></div></div>
    <div class="field"><label for="p-value">What a new outfit usually costs you ($)</label><input id="p-value" type="number" min="0" step="5" inputmode="numeric" value="${esc(P.outfitValue)}"></div></section>`;
  h+=`<section class="panel"><div class="toolbar"><h3>Outfit diary</h3><span class="note">Last 14 days</span></div><div class="diary">`;
  for(let n=13;n>=0;n--){const d=daysAgo(n),e=S.log.find(x=>x.d===d);const dt=new Date();dt.setDate(dt.getDate()-n);
    const dots=e?e.ids.map(id=>S.items.find(i=>i.id===id)).filter(Boolean).map(i=>`<i style="background:${i.color}"></i>`).join(''):'';
    h+=`<div class="day ${n===0?'today':''}" title="${d}"><span class="d">${'SMTWTFS'[dt.getDay()]}${dt.getDate()}</span><span class="dots">${dots}</span></div>`}
  h+=`</div><p class="note">Tap Wear today on the Style tab to log an outfit. Each one adds a wear and lowers cost per wear.</p></section>`;
  h+=`<section class="panel"><h3>Saved looks</h3>`;
  const looks=S.looks.filter(l=>l.ids.every(id=>S.items.some(i=>i.id===id)));
  if(looks.length)h+=`<div class="looks">${looks.map(l=>`<button class="look" data-load-look="${l.id}" aria-label="Wear this look">${l.ids.map(id=>visual(S.items.find(i=>i.id===id))).join('')}${l.title?`<span class="lt">${esc(l.title)}</span>`:''}</button>`).join('')}</div><p class="note">Tap a look to put it back on the Style tab.</p>`;
  else h+='<p class="note">Tap Save look on the Style tab to keep outfits you like.</p>';
  h+=`</section>
  <section class="panel"><div><h3>My sizes</h3><p class="note">Change these any time. Pieces that no longer match get flagged.</p></div>
  <div class="sizes"><div class="field"><label for="p-top">Top</label><select id="p-top" data-size="top">${opt(LETTER,P.top)}</select></div>
  <div class="field"><label for="p-middle">Middle</label><select id="p-middle" data-size="middle">${opt(LETTER,P.middle)}</select></div>
  <div class="field"><label for="p-shoe">Shoes (US)</label><select id="p-shoe" data-size="shoe">${opt(SHOES,P.shoe)}</select></div></div></section>
  <section class="panel"><h3>Fit alerts</h3>`;
  if(bad.length)h+=`<ul class="alert-list">${bad.map(it=>{const f=fit(it);return`<li>${visual(it)}<div style="flex:1;min-width:0"><b>${esc(it.name)}</b><div class="note">Size ${esc(sizeLabel(it))}, you wear ${it.cat==='shoe'?'US '+P.shoe:P[it.cat]}</div></div><span class="badge ${f.k}">${f.t}</span></li>`}).join('')}</ul><p class="note">Pieces that don’t fit could go to a swap, resale, or donation.</p>`;
  else h+='<p class="note">Everything in your closet matches your sizes.</p>';
  h+=`</section><section class="panel"><div><h3>Trends for</h3><p class="note">Pick whose trends the stylist and look check use.</p></div>
  <div class="seg" role="group" aria-label="Trends for">${STYLES.map(([k,t])=>`<button class="seg-btn" data-style="${k}" aria-pressed="${P.style===k}">${t}</button>`).join('')}</div></section>
  <details class="panel"><summary><h3>Fall 2026 trend notes</h3></summary>
  <ul class="trend-list">${activeTrends().map(t=>`<li><b>${esc(t.name)}</b><span>${esc(t.note)}</span></li>`).join('')}${activeFading().map(t=>`<li><b>${esc(t.name)}</b> <span class="ex">Cooling off</span><span>${esc(t.note)}</span></li>`).join('')}</ul></details>
  <section class="panel"><div><h3>Your name on the feed</h3><p class="note">Shown on looks you post. A first name or a nickname works.</p></div>
  <div class="field"><label class="sr" for="p-name">Your name on the feed</label><input id="p-name" maxlength="24" autocomplete="nickname" placeholder="First name or a nickname" value="${esc(P.name||'')}"></div></section>
  ${INSTALL.evt||INSTALL.ios?`<section class="panel"><div><h3>Put Remix on your home screen</h3><p class="note">${INSTALL.evt?'It opens full screen like an app and works offline.':'In Safari, tap Share, then Add to Home Screen. It opens full screen like an app and works offline.'}</p></div>${INSTALL.evt?'<button class="primary-btn" id="install-me">Install Remix</button>':''}</section>`:''}
  <section class="panel"><div><h3>Your data</h3><p class="note">Your closet lives on this phone. Download a backup before you switch phones or clear your browser.</p></div>
  <div class="two"><button class="secondary-btn" id="export-btn">Download backup</button><label class="secondary-btn" for="import-file" style="text-align:center;cursor:pointer">Restore backup<input id="import-file" type="file" accept="application/json,.json" class="sr"></label></div></section>
  <button class="danger-btn" id="reset">Clear my closet and start over</button>`;
  view.innerHTML=h;
}

/* ================= Render ================= */
function renderChrome(){
  $('#combo-pill').textContent=`${combos()} outfits`;
  document.querySelectorAll('.tab').forEach(t=>t.setAttribute('aria-current',t.dataset.tab===S.tab?'page':'false'));
}
function render(dir){
  renderChrome();
  ({style:renderStyle,closet:renderCloset,feed:renderFeed,me:renderMe})[S.tab](dir);
}
function go(tab){S.tab=tab;render();window.scrollTo({top:0});try{history.replaceState(null,'','#'+tab)}catch(e){}if(tab==='feed'&&CAP.checked)loadFeed()}

/* ================= Actions ================= */
function step(cat,d){S.idx[cat]+=d;render({cat,d})}
function shuffle(){CATS.forEach(c=>{if(S.locked[c.key])return;const n=pool(c.key).length;if(n>1){let r;do r=Math.floor(Math.random()*n);while(r===S.idx[c.key]);S.idx[c.key]=r}});S.suggestion=null;render({pop:true})}
function saveLook(){const o=outfit();if(o.length<3){toast('Add a piece to every row first');return}
  const ids=o.map(i=>i.id),k=ids.join();if(S.looks.some(l=>l.ids.join()===k)){toast('Already in your saved looks');return}
  S.looks.unshift({id:uid(),ids,title:S.suggestion&&S.suggestion.ids&&S.suggestion.ids.join()===k?S.suggestion.title:'',at:Date.now()});saveProfile();toast('Saved to your looks')}
function wear(){
  const o=outfit();if(o.length<3){toast('Add a piece to every row first');return}
  const d=today(),prev=S.log.find(e=>e.d===d);
  const before={log:JSON.parse(JSON.stringify(S.log)),items:o.concat(prev?prev.ids.map(id=>S.items.find(i=>i.id===id)).filter(Boolean):[]).map(i=>({id:i.id,wears:i.wears,lastWorn:i.lastWorn}))};
  if(prev)prev.ids.forEach(id=>{const it=S.items.find(i=>i.id===id);if(it){it.wears=Math.max(0,it.wears-1);saveItem(it)}});
  o.forEach(i=>{i.wears=(i.wears||0)+1;i.lastWorn=d;saveItem(i)});
  S.log=[{d,ids:o.map(i=>i.id)},...S.log.filter(e=>e.d!==d)].slice(0,120);saveProfile();render();
  toast(prev?'Updated today’s outfit':'Logged. Cost per wear just went down.','Undo',()=>{
    S.log=before.log;before.items.forEach(b=>{const it=S.items.find(i=>i.id===b.id);if(it){it.wears=b.wears;it.lastWorn=b.lastWorn;saveItem(it)}});saveProfile();render()});
}
function styleAround(id){
  const it=S.items.find(i=>i.id===id);if(!it)return;
  if(pool(it.cat).indexOf(it)<0){S.fitOnly=false;S.wxOnly=false}
  S.idx[it.cat]=pool(it.cat).indexOf(it);S.locked={};S.locked[it.cat]=true;
  closeSheet();S.tab='style';S.suggestion=null;
  const p=localPick();if(p)applyPick(p);else render();window.scrollTo({top:0});
  toast(`Locked your ${it.name.toLowerCase()}. Tap Style me for more ideas.`);
}

/* ================= Sheets ================= */
const bd=$('#backdrop'),sheet=$('#sheet');let lastFocus=null;
function openSheet(html,label){lastFocus=document.activeElement;sheet.innerHTML=html;sheet.setAttribute('aria-label',label||'Details');bd.hidden=false;document.body.style.overflow='hidden';
  setTimeout(()=>{const f=sheet.querySelector('.x');f&&f.focus()},30)}
function closeSheet(){if(bd.hidden)return;bd.hidden=true;document.body.style.overflow='';sheetAbort&&sheetAbort.abort();if(lastFocus&&document.contains(lastFocus))lastFocus.focus()}
bd.addEventListener('click',e=>{if(e.target===bd||e.target.closest('[data-close]'))closeSheet()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!bd.hidden)closeSheet()});
let sheetAbort=null;

function detailSheet(id){
  const it=S.items.find(i=>i.id===id);if(!it)return;const f=fit(it),w=wx(it);
  openSheet(`<div class="sheet-head"><h3>${esc(it.name)}</h3><button class="x" data-close aria-label="Close">×</button></div>
  <div class="detail-hero">${visual(it)}<div class="info"><span class="tags"><span class="sz">${esc(sizeLabel(it))}</span><span class="badge ${f.k}">${f.t}</span>${it.material?`<span class="badge plain">${esc(it.material)}</span>`:''}</span>
    <span class="wxl ${w.k}">${w.t}</span>${it.brand?`<span class="note">${esc(it.brand)}</span>`:''}${it.care?`<span class="note">Care: ${esc(it.care)}</span>`:''}${it.example?'<span class="note">Example piece</span>':''}</div></div>
  <div class="facts"><div class="fact"><div class="n">${it.wears||0}</div><div class="k">wears</div></div><div class="fact"><div class="n">${it.price?(it.wears?'$'+(it.price/it.wears).toFixed(2):'$'+it.price):'–'}</div><div class="k">${it.price&&it.wears?'cost per wear':'price paid'}</div></div>
    <div class="fact" style="grid-column:1/-1"><div class="n" style="font-size:15px">${wornLabel(it)}</div><div class="k">${esc(fam(it))} ${esc(TYPES[it.cat].find(t=>t[0]===it.type)[1].toLowerCase())}</div></div></div>
  <button class="primary-btn" data-style-around="${it.id}">Style an outfit around this</button>
  <button class="secondary-btn" data-edit="${it.id}">Edit details</button>`,it.name);
}

function shareSheet(){const o=outfit();if(o.length<3){toast('Add a piece to every row first');return}
  const shared=CAP.feed;
  openSheet(`<div class="sheet-head"><h3>Share this look</h3><button class="x" data-close aria-label="Close">×</button></div>
  <div class="stack">${o.map(i=>visual({type:i.type,color:i.color})).join('')}</div>
  <div class="field"><label for="s-name">Your name on the feed</label><input id="s-name" maxlength="24" autocomplete="nickname" placeholder="First name or a nickname" value="${esc(S.profile.name||'')}"></div>
  <div class="field"><label for="s-title">Name the look (optional)</label><input id="s-title" maxlength="40" value="${esc(S.suggestion?S.suggestion.title:'')}"></div>
  <div class="field"><label for="s-cap">Caption</label><textarea id="s-cap" maxlength="140" placeholder="Where are you wearing it?"></textarea></div>
  <p class="note">${shared?'Anyone using Remix can see this post. Each piece shows as a drawing in its color, so your photos stay on your phone.':'The shared feed isn’t reachable right now, so this saves to your phone.'}</p>
  <button class="primary-btn" id="s-post">${shared?'Post to the feed':'Save to my feed'}</button>`,'Share this look');
  const btn=sheet.querySelector('#s-post');
  btn.onclick=async()=>{
    const name=sheet.querySelector('#s-name').value.trim().slice(0,24);
    if(shared&&!name){sheet.querySelector('#s-name').focus();toast('Add a name so people know who posted');return}
    if(name&&name!==S.profile.name){S.profile.name=name;saveProfile()}
    btn.disabled=true;btn.textContent='Posting…';
    const ok=await postLook(name,sheet.querySelector('#s-title').value.trim().slice(0,40),sheet.querySelector('#s-cap').value.trim().slice(0,140),o);
    if(ok){closeSheet();go('feed')}else{btn.disabled=false;btn.textContent=shared?'Post to the feed':'Save to my feed'}};
}
async function postLook(name,title,caption,o){
  const pieces=o.map(i=>({type:i.type,color:i.color,name:i.name.slice(0,40)}));
  if(CAP.feed){
    try{const r=await api('posts',{name,title,caption,pieces,device:DEVICE});const p=cleanPost(r&&r.post);
      if(p&&typeof r.token==='string'){S.myTokens[p.id]=r.token;S.posts.unshift(p);persistLocal();toast('Posted to the feed');return true}}
    catch(e){
      if(e.code==='bad_input'){toast(e.message||'That post can’t be shared. Try different words.');return false}
      if(e.code==='rate_limited'){toast('You’re posting fast. Try again in a minute.');return false}
    }
  }
  S.localPosts.unshift({id:uid(),at:Date.now(),title,caption,pieces});persistLocal();toast('Saved to your feed on this phone');return true;
}
async function toggleLike(key){
  if(key.startsWith('ex:')||key.startsWith('local:')){S.liked[key]=!S.liked[key];persistLocal();render();return}
  const p=S.posts.find(x=>x.id===key);if(!p)return;
  const on=!p.liked;p.liked=on;p.likes=Math.max(0,p.likes+(on?1:-1));render();
  try{const r=await api('like',{post:key,device:DEVICE,on});if(r&&typeof r.likes==='number'){p.likes=r.likes;render()}}
  catch(e){p.liked=!on;p.likes=Math.max(0,p.likes+(on?-1:1));render();toast(e.code==='rate_limited'?'Slow down a little and try again.':'Couldn’t save that like.')}
}
async function deletePost(key){
  if(key.startsWith('local:')){const id=key.slice(6);S.localPosts=S.localPosts.filter(p=>p.id!==id);persistLocal();render();toast('Post deleted');return}
  const token=S.myTokens[key];if(!token)return;
  try{await api('delete',{post:key,token});S.posts=S.posts.filter(p=>p.id!==key);delete S.myTokens[key];persistLocal();render();toast('Post deleted')}
  catch(e){toast('Couldn’t delete that post. Check your connection.')}
}
async function reportPost(id){
  try{await api('report',{post:id,device:DEVICE});S.posts=S.posts.filter(p=>p.id!==id);render();toast('Reported. Thanks for keeping the feed friendly.')}
  catch(e){toast('Couldn’t send that report. Try again.')}
}

/* Backup and restore: closets live on the phone, so this is how you move to a new one */
function exportBackup(){
  const data={app:'Remix Closet',version:1,exportedAt:new Date().toISOString(),items:S.items,prof:profBlob(),localPosts:S.localPosts,myTokens:S.myTokens,liked:S.liked};
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data)],{type:'application/json'}));a.download=`remix-closet-${today()}.json`;
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);toast('Backup downloaded');
}
async function importBackup(file){
  try{
    if(!file||file.size>25e6)throw 0;
    const d=JSON.parse(await file.text());
    if(!d||d.app!=='Remix Closet'||!Array.isArray(d.items))throw 0;
    const items=d.items.map(cleanItem).filter(Boolean);if(!items.length)throw 0;
    const prof=d.prof&&typeof d.prof==='object'?d.prof:{};
    if(prof.profile)prof.profile={top:LETTER.includes(prof.profile.top)?prof.profile.top:'M',middle:LETTER.includes(prof.profile.middle)?prof.profile.middle:'M',
      shoe:SHOES.includes(Number(prof.profile.shoe))?Number(prof.profile.shoe):8,outfitValue:Math.max(0,Number(prof.profile.outfitValue)||60),
      style:['women','men','both'].includes(prof.profile.style)?prof.profile.style:'women',name:String(prof.profile.name||'').slice(0,24)};
    const tokens={};Object.entries(d.myTokens&&typeof d.myTokens==='object'?d.myTokens:{}).forEach(([k,v])=>{if(/^[a-z0-9]{8,32}$/.test(k)&&typeof v==='string'&&/^[a-f0-9]{32,64}$/.test(v))tokens[k]=v});
    const posts=(Array.isArray(d.localPosts)?d.localPosts:[]).filter(p=>p&&typeof p.id==='string'&&Array.isArray(p.pieces)).slice(0,20);
    applyBlob({items,prof,localPosts:posts,liked:d.liked&&typeof d.liked==='object'?d.liked:{},myTokens:tokens});
    S.items=items;S.idx={top:0,middle:0,shoe:0};S.locked={};S.suggestion=null;persistLocal();render();toast(`Restored ${items.length} pieces`);
  }catch(e){toast('That file isn’t a Remix backup. Choose the .json file you downloaded.')}
}

/* Add or edit a piece */
let draft=null;
function compress(file,max){return new Promise((res,rej)=>{const fr=new FileReader();fr.onerror=()=>rej(fr.error);fr.onload=()=>{const img=new Image();img.onerror=()=>rej(new Error('bad image'));img.onload=()=>{
  const s=Math.min(1,max/Math.max(img.width,img.height)),c=document.createElement('canvas');c.width=Math.max(1,Math.round(img.width*s));c.height=Math.max(1,Math.round(img.height*s));
  const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(img,0,0,c.width,c.height);res(c)};img.src=fr.result};fr.readAsDataURL(file)})}
const toBlob=c=>new Promise(r=>c.toBlob(b=>r(b),'image/jpeg',.85));
function avgColor(src){const c=document.createElement('canvas');c.width=c.height=40;const x=c.getContext('2d');x.drawImage(src,0,0,40,40);
  const d=x.getImageData(10,10,20,20).data;let r=0,g=0,b=0,n=0;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];n++}
  const h=v=>Math.round(v/n).toString(16).padStart(2,'0');return '#'+h(r)+h(g)+h(b)}
function itemSheet(it){
  draft=it?Object.assign({},it):{cat:['middle','shoe'].includes(S.closetFilter)?S.closetFilter:'top',type:'',name:'',color:'#9CB59A',size:'',brand:'',price:'',wears:0,photo:null,material:'',care:''};
  const isNew=!it,ai=CAP.ai;
  openSheet(`<div class="sheet-head"><h3>${isNew?'Add a piece':'Edit piece'}</h3><button class="x" data-close aria-label="Close">×</button></div>
  <div class="capture">
    <label class="cap" for="f-photo"><span id="cap-photo">${isPhoto(draft.photo)?`<img src="${esc(draft.photo)}" alt="">`:IC.cam}</span>Photo of item<small>${ai?'Claude fills in the details':'We read the color'}</small><input id="f-photo" type="file" accept="image/*" capture="environment"></label>
    <label class="cap" for="f-tag"><span id="cap-tag">${IC.tag}</span>Photo of the tag<small>${ai?'Claude reads size and fabric':'Then type the size below'}</small><input id="f-tag" type="file" accept="image/*" capture="environment"></label>
  </div>
  <div id="detect" class="detect" hidden></div>
  <div class="field"><label for="f-name">Name</label><input id="f-name" maxlength="40" placeholder="e.g. Cream wrap top" value="${esc(draft.name)}"></div>
  <div class="two"><div class="field"><label for="f-cat">Goes in</label><select id="f-cat">${CATS.map(c=>`<option value="${c.key}" ${draft.cat===c.key?'selected':''}>${c.hint}</option>`).join('')}</select></div>
  <div class="field"><label for="f-type">Type</label><select id="f-type"></select></div></div>
  <div class="two"><div class="field"><label for="f-size">Size</label><select id="f-size"></select></div>
  <div class="field"><label for="f-color">Color</label><div class="color-row"><input type="color" id="f-color" value="${isHex(draft.color)?draft.color:'#9cb59a'}"><span id="color-name" class="note"></span></div></div></div>
  <div class="field"><label for="f-mat">Material</label><select id="f-mat">${MATERIALS.map(([k,t])=>`<option value="${k}" ${(draft.material||'')===k?'selected':''}>${t}</option>`).join('')}</select></div>
  <div class="two"><div class="field"><label for="f-brand">Brand</label><input id="f-brand" maxlength="30" value="${esc(draft.brand)}"></div>
  <div class="field"><label for="f-price">Price paid ($)</label><input id="f-price" type="number" min="0" inputmode="decimal" value="${esc(draft.price)}"></div></div>
  <button class="primary-btn" id="f-save">${isNew?'Add to closet':'Save changes'}</button>
  ${isNew?'':'<button class="danger-btn" id="f-del">Remove from closet</button>'}`,isNew?'Add a piece':'Edit piece');
  const $s=s=>sheet.querySelector(s);
  sheetAbort=new AbortController();const signal=sheetAbort.signal;
  function fillCat(){const c=$s('#f-cat').value;
    $s('#f-type').innerHTML=TYPES[c].map(([k,t])=>`<option value="${k}" ${draft.type===k?'selected':''}>${t}</option>`).join('');
    const sizes=c==='shoe'?SHOES:LETTER,def=c==='shoe'?S.profile.shoe:S.profile[c];
    const cur=draft.cat===c&&draft.size!==''?draft.size:def;
    $s('#f-size').innerHTML=sizes.map(s=>`<option value="${s}" ${String(s)===String(cur)?'selected':''}>${c==='shoe'?'US '+s:s}</option>`).join('')}
  fillCat();$s('#f-cat').onchange=()=>{draft.type='';draft.cat=$s('#f-cat').value;draft.size='';fillCat()};
  const showName=()=>{$s('#color-name').textContent=nearest($s('#f-color').value)};showName();$s('#f-color').oninput=showName;
  const status=(msg,busy)=>{const d=$s('#detect');if(!d)return;d.hidden=!msg;d.classList.toggle('busy',!!busy);d.innerHTML=busy?`<span class="spin"></span><span>${esc(msg)}</span>`:`<span>${esc(msg)}</span>`};
  $s('#f-photo').onchange=async e=>{const file=e.target.files[0];if(!file)return;
    try{const c=await compress(file,320);draft.photo=c.toDataURL('image/jpeg',.78);$s('#cap-photo').innerHTML=`<img src="${esc(draft.photo)}" alt="">`;
      const hex=avgColor(c);$s('#f-color').value=hex;showName();
      if(!CAP.ai){status(`Detected color: ${nearest(hex)}. Adjust it below if it looks off.`);return}
      status('Claude is reading your photo…',true);
      const big=await toBlob(await compress(file,1024));
      const r=await readItemPhoto(big);if(signal.aborted)return;
      if(r&&r.clothing===false){status('That doesn’t look like clothing. Fill in the details below.');return}
      if(r&&['top','middle','shoe'].includes(r.row)){$s('#f-cat').value=r.row;draft.cat=r.row;draft.size=''}
      if(r&&ALLTYPES.includes(r.type)&&TYPES[draft.cat].some(t=>t[0]===r.type))draft.type=r.type;
      fillCat();
      if(r&&isHex(r.color)){$s('#f-color').value=r.color.toLowerCase();showName()}
      if(r&&MATKEYS.includes(r.material))$s('#f-mat').value=r.material;
      if(r&&r.name&&!$s('#f-name').value.trim())$s('#f-name').value=String(r.name).slice(0,40);
      status('Filled in by Claude. Check it over before you save.');
    }catch(err){if(signal.aborted)return;
      if(err&&err.code==='ai_off')CAP.ai=false;
      status(err&&err.code?'Couldn’t read the photo with Claude. Fill in the details below.':'That photo couldn’t be opened. Try a JPG or PNG.')}};
  $s('#f-tag').onchange=async e=>{const file=e.target.files[0];if(!file)return;
    try{const c=await compress(file,1024);$s('#cap-tag').innerHTML=`<img src="${esc(c.toDataURL('image/jpeg',.7))}" alt="">`;
      if(!CAP.ai){status('Tag photo added. Type the brand, size, and material below.');$s('#f-brand').focus();return}
      status('Claude is reading the tag…',true);
      const r=await readTagPhoto(await toBlob(c));if(signal.aborted)return;
      if(r&&r.brand)$s('#f-brand').value=String(r.brand).slice(0,30);
      if(r&&MATKEYS.includes(r.material))$s('#f-mat').value=r.material;
      if(r&&r.care)draft.care=String(r.care).slice(0,80);
      const cat=$s('#f-cat').value;
      if(cat==='shoe'&&Number(r&&r.shoe)){const v=Math.round(Number(r.shoe)*2)/2;if(SHOES.includes(v)){draft.size=v;fillCat()}}
      else if(cat!=='shoe'&&LETTER.includes(r&&r.letter)){draft.size=r.letter;fillCat()}
      status(`Read the tag${r&&r.care?': '+String(r.care).slice(0,60):''}. Check the size before you save.`);
    }catch(err){if(signal.aborted)return;status('Couldn’t read that tag. Type the details below.')}};
  $s('#f-save').onclick=()=>{
    const name=$s('#f-name').value.trim();if(!name){$s('#f-name').focus();toast('Give it a name so you can find it');return}
    const c=$s('#f-cat').value;
    Object.assign(draft,{name,cat:c,type:$s('#f-type').value,size:c==='shoe'?Number($s('#f-size').value):$s('#f-size').value,color:$s('#f-color').value,material:$s('#f-mat').value,brand:$s('#f-brand').value.trim(),price:Number($s('#f-price').value)||0});
    if(isNew){Object.assign(draft,{id:uid(),added:Date.now(),wears:0,lastWorn:null,example:false});S.items.unshift(draft)}
    else{draft.example=false;const i=S.items.findIndex(x=>x.id===draft.id);if(i>=0)S.items[i]=draft}
    const saved=cleanItem(draft);if(saved){const i=S.items.findIndex(x=>x.id===saved.id);S.items[i]=saved;saveItem(saved)}
    closeSheet();render();const f=fit(draft);toast(isNew?(f.k==='fits'?'Added to your closet':`Added. Heads up: ${f.t.toLowerCase()} for your size.`):'Saved');};
  if(!isNew){const del=$s('#f-del');del.onclick=()=>{
    const gone=S.items.find(x=>x.id===draft.id);if(!gone)return;
    S.items=S.items.filter(x=>x.id!==gone.id);dropItem(gone.id);closeSheet();render();
    toast('Removed from closet','Undo',()=>{S.items.unshift(gone);S.items.sort((a,b)=>b.added-a.added);saveItem(gone);render()})}}
}

/* ================= Events ================= */
document.querySelector('nav.tabs').addEventListener('click',e=>{const t=e.target.closest('[data-tab]');if(t)go(t.dataset.tab)});
function onClick(e){
  const t=e.target.closest('button');if(!t)return;const D=t.dataset;
  if(D.step)step(D.step,Number(D.d));
  else if(D.lock){S.locked[D.lock]=!S.locked[D.lock];render()}
  else if(D.act)({shuffle,save:saveLook,wear,share:shareSheet})[D.act]();
  else if(D.occ){S.occasion=D.occ;saveProfile();render()}
  else if('styleMe' in D)styleMe(false);
  else if('styleAgain' in D)styleMe(true);
  else if('dismiss' in D){S.suggestion=null;render()}
  else if(D.flt){if(D.flt==='fit')S.fitOnly=!S.fitOnly;else S.wxOnly=!S.wxOnly;render()}
  else if(t.id==='wx-toggle'){S.wxOpen=!S.wxOpen;render()}
  else if(D.cond){S.weather.cond=D.cond;saveProfile();render()}
  else if(D.tip){S.idx[D.tip]=Number(D.j);S.suggestion=null;render({cat:D.tip,d:1})}
  else if('goFit' in D){S.closetFilter='fit';go('closet')}
  else if(D.filter){S.closetFilter=D.filter;render()}
  else if('add' in D)itemSheet(null);
  else if(D.detail)detailSheet(D.detail);
  else if(D.edit){const it=S.items.find(i=>i.id===D.edit);if(it)itemSheet(it)}
  else if(D.styleAround)styleAround(D.styleAround);
  else if(D.like)toggleLike(D.like);
  else if(D.report){if(!t.classList.contains('armed')){t.classList.add('armed');t.textContent='Tap to report';setTimeout(()=>{if(document.contains(t)){t.classList.remove('armed');t.textContent='Report'}},3000);return}reportPost(D.report)}
  else if(D.delpost){if(!t.classList.contains('armed')){t.classList.add('armed');t.textContent='Tap to confirm';setTimeout(()=>{if(document.contains(t)){t.classList.remove('armed');t.textContent='Delete'}},3000);return}deletePost(D.delpost)}
  else if(D.style){S.profile.style=D.style;saveProfile();render();toast(D.style==='both'?'Showing women’s and men’s trends':`Showing ${styleWord()} trends`)}
  else if(D.loadLook){const l=S.looks.find(x=>x.id===D.loadLook);if(l){S.locked={};S.tab='style';applyPick({ids:l.ids,title:l.title||'Saved look',why:'One of your saved looks.',tip:'',by:'built-in'});window.scrollTo({top:0})}}
  else if(t.id==='export-btn')exportBackup();
  else if(t.id==='install-me')installApp();
  else if(t.id==='clear-ex'){if(!t.classList.contains('armed')){t.classList.add('armed');t.textContent='Tap to confirm';return}
    const ex=S.items.filter(i=>i.example);S.items=S.items.filter(i=>!i.example);ex.forEach(i=>dropItem(i.id));S.looks=[];S.log=[];saveProfile();render();toast('Examples cleared. Add your first piece.')}
  else if(t.id==='reset'){if(!t.classList.contains('armed')){t.classList.add('armed');t.textContent='Tap again to remove every piece';return}
    const old=S.items.slice();S.items=seed();old.forEach(i=>dropItem(i.id));S.items.forEach(saveItem);
    Object.assign(S,{looks:[],log:[],profile:{top:'M',middle:'M',shoe:8,outfitValue:60,style:'women',name:S.profile.name||'',fresh:1},idx:{top:0,middle:0,shoe:0},locked:{},suggestion:null,recent:[],weather:{temp:48,cond:'cloudy'}});
    saveProfile();render();toast('Closet cleared. Add your first piece.')}
}
view.addEventListener('click',onClick);sheet.addEventListener('click',e=>{const b=e.target.closest('[data-style-around],[data-edit]');if(b)onClick(e)});
view.addEventListener('change',e=>{
  const T=e.target;
  if(T.id==='wx-temp'){S.weather.temp=Number(T.value);saveProfile();render()}
  else if(T.dataset.size){const k=T.dataset.size;S.profile[k]=k==='shoe'?Number(T.value):T.value;saveProfile();render();
    const n=needsFit().length;toast(n?`Sizes updated. ${n} ${n===1?'piece needs':'pieces need'} attention.`:'Sizes updated. Everything still fits.')}
  else if(T.id==='p-value'){S.profile.outfitValue=Math.max(0,Number(T.value)||0);saveProfile();render()}
  else if(T.id==='closet-sort'){S.sort=T.value;render()}
  else if(T.id==='p-name'){S.profile.name=T.value.trim().slice(0,24);saveProfile();render()}
  else if(T.id==='import-file'){importBackup(T.files&&T.files[0]);T.value=''}
});
view.addEventListener('input',e=>{
  const T=e.target;
  if(T.id==='wx-temp'){const n=$('#wx-num');if(n)n.textContent=T.value}
  else if(T.id==='note')S.note=T.value;
  else if(T.id==='closet-q'){S.q=T.value;const pos=T.selectionStart;render();const nq=$('#closet-q');if(nq){nq.focus();try{nq.setSelectionRange(pos,pos)}catch(x){}}}
});
view.addEventListener('keydown',e=>{if(e.target.id==='note'&&e.key==='Enter'){e.preventDefault();styleMe(false)}});
let sx=null,scat=null,moved=false;
view.addEventListener('touchstart',e=>{const p=e.target.closest('[data-swipe]');if(!p)return;sx=e.touches[0].clientX;scat=p.dataset.swipe;moved=false},{passive:true});
view.addEventListener('touchend',e=>{if(sx===null)return;const dx=e.changedTouches[0].clientX-sx;if(Math.abs(dx)>40&&pool(scat).length>1){moved=true;step(scat,dx<0?1:-1)}sx=null},{passive:true});
view.addEventListener('click',e=>{if(moved&&e.target.closest('[data-swipe]')){e.stopImmediatePropagation();moved=false}},true);

/* ================= Boot ================= */
const INSTALL={evt:null,ios:false};
INSTALL.ios=(/iphone|ipad|ipod/i.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))&&!(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone===true);
async function boot(){
  try{const d=await api('health');CAP.ai=!!(d&&d.ai);CAP.feed=!!(d&&d.feed)}catch(e){CAP.ai=false;CAP.feed=false}
  CAP.checked=true;render();if(CAP.feed)loadFeed(true);
}
async function installApp(){if(!INSTALL.evt)return;INSTALL.evt.prompt();try{await INSTALL.evt.userChoice}catch(e){}INSTALL.evt=null;$('#install-btn').hidden=true;render()}
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();INSTALL.evt=e;$('#install-btn').hidden=false;if(S.tab==='me')render()});
window.addEventListener('appinstalled',()=>{INSTALL.evt=null;$('#install-btn').hidden=true;toast('Remix is on your home screen')});
$('#install-btn').addEventListener('click',installApp);
window.addEventListener('online',boot);
window.addEventListener('offline',()=>{CAP.ai=false;render()});
if('serviceWorker' in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
const hashTab=location.hash.slice(1);if(['style','closet','feed','me'].includes(hashTab))S.tab=hashTab;
loadLocal();
if(!S.profile.fresh){S.items=[];S.looks=[];S.log=[];S.profile.fresh=1;persistLocal()}
render();boot();
})();
