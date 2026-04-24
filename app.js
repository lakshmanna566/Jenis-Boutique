/* ── JENI'S BOUTIQUE — SHARED APP JS ── */

// ── DATA HELPERS ──
const DB = {
  get:(k)=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}},
  set:(k,v)=>localStorage.setItem(k,JSON.stringify(v)),
  del:(k)=>localStorage.removeItem(k)
};

// ── AUTH ──
const Auth = {
  currentUser:()=>DB.get('jeni_user'),
  isAdmin:()=>{const u=DB.get('jeni_user');return u&&u.role==='admin';},
  isLoggedIn:()=>!!DB.get('jeni_user'),
  logout:()=>{DB.del('jeni_user');window.location.href='login.html';},
  register:(name,email,phone,password)=>{
    const users=DB.get('jeni_users')||[];
    if(users.find(u=>u.email===email))return{ok:false,msg:'Email already registered.'};
    const user={id:'U'+Date.now(),name,email,phone,password,role:'customer',joinedAt:new Date().toISOString()};
    users.push(user);DB.set('jeni_users',users);
    const {password:_,...safe}=user;DB.set('jeni_user',safe);
    return{ok:true,user:safe};
  },
  login:(email,password)=>{
    // Admin shortcut
    if(email==='admin@jeni.com'&&password==='admin123'){
      const admin={id:'ADMIN',name:'Jeni (Admin)',email,role:'admin'};
      DB.set('jeni_user',admin);
      return{ok:true,user:admin};
    }
    const users=DB.get('jeni_users')||[];
    const user=users.find(u=>u.email===email&&u.password===password);
    if(!user)return{ok:false,msg:'Invalid email or password.'};
    const {password:_,...safe}=user;DB.set('jeni_user',safe);
    return{ok:true,user:safe};
  }
};

// ── VALIDATION HELPERS ──
function validatePhone(phone){
  const digits=phone.replace(/\D/g,'');
  return digits.length===10;
}
function validateEmail(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ── ORDERS ──
const Orders = {
  all:()=>DB.get('jeni_orders')||[],
  byUser:(uid)=>Orders.all().filter(o=>o.userId===uid),
  byId:(id)=>Orders.all().find(o=>o.id===id),
  create:(data)=>{
    const orders=Orders.all();
    const user=Auth.currentUser();
    const order={
      id:'ORD'+Date.now(),
      userId:user?user.id:'GUEST',
      userName:user?user.name:data.name,
      userEmail:user?user.email:data.email,
      userPhone:user?user.phone:data.phone,
      ...data,
      status:'Received',
      statusHistory:[{status:'Received',time:new Date().toISOString(),note:'Order placed successfully.'}],
      placedAt:new Date().toISOString(),
      estimatedDelivery:new Date(Date.now()+5*24*60*60*1000).toISOString()
    };
    orders.push(order);DB.set('jeni_orders',orders);
    return order;
  },
  updateStatus:(id,status,note='')=>{
    const orders=Orders.all();
    const idx=orders.findIndex(o=>o.id===id);
    if(idx===-1)return false;
    orders[idx].status=status;
    orders[idx].statusHistory.push({status,time:new Date().toISOString(),note});
    DB.set('jeni_orders',orders);return true;
  }
};

// ── TOAST ──
function showToast(msg,type='info'){
  let container=document.getElementById('toast-container');
  if(!container){container=document.createElement('div');container.id='toast-container';container.className='toast-container';document.body.appendChild(container);}
  const t=document.createElement('div');
  t.className=`toast ${type}`;
  t.innerHTML=`<span>${msg}</span><button class="toast-close" onclick="this.parentElement.remove()">✕</button>`;
  container.appendChild(t);
  setTimeout(()=>t.remove(),4000);
}

// ── NAV RENDER ──
function renderNav(activePage=''){
  const user=Auth.currentUser();
  const pages=[
    {href:'index.html',label:'Home'},
    {href:'occasions.html',label:'Occasions'},
    {href:'plans.html',label:'Plans'},
    {href:'order.html',label:'Order'},
    {href:'track.html',label:'Track Order'},
    {href:'delivery.html',label:'Delivery & Store'},
  ];
  const links=pages.map(p=>`<a href="${p.href}" class="${activePage===p.href?'active':''}">${p.label}</a>`).join('');
  const mobileLinks=pages.map(p=>`<a href="${p.href}">${p.label}</a>`).join('');
  const authHtml=user
    ? `<span class="nav-user">Hi, ${user.name.split(' ')[0]}</span>
       ${user.role==='admin'?`<a href="admin.html" class="nav-cta outline btn-sm">Admin</a>`:''}
       <a href="dashboard.html" class="nav-cta outline">My Orders</a>
       <button class="nav-cta" onclick="Auth.logout()">Logout</button>`
    : `<a href="login.html" class="nav-cta outline">Login</a><a href="login.html?tab=register" class="nav-cta">Register</a>`;
  const navEl=document.getElementById('main-nav');
  if(!navEl)return;
  navEl.innerHTML=`
    <a href="index.html" class="nav-logo">Jeni's <span>Boutique</span></a>
    <div class="nav-links">${links}</div>
    <div class="nav-right">${authHtml}</div>
    <button class="hamburger" onclick="document.getElementById('mobile-nav').classList.toggle('open')" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>`;
  const mobileNav=document.getElementById('mobile-nav');
  if(mobileNav)mobileNav.innerHTML=mobileLinks+`<div style="margin-top:.5rem;">${authHtml}</div>`;
}

// ── FOOTER RENDER ──
function renderFooter(){
  const el=document.getElementById('main-footer');
  if(!el)return;
  el.innerHTML=`
    <div class="footer-grid">
      <div>
        <div class="footer-logo">Jeni's <span>Boutique</span></div>
        <p class="footer-tagline">Premium tailoring for every occasion. Crafted with love, delivered to your door.</p>
      </div>
      <div class="footer-col"><h4>Pages</h4>
        <a href="index.html">Home</a><a href="occasions.html">Occasions</a>
        <a href="plans.html">Plans</a><a href="order.html">Place Order</a>
      </div>
      <div class="footer-col"><h4>Services</h4>
        <a href="track.html">Track Order</a><a href="delivery.html">Delivery & Store</a>
        <a href="dashboard.html">My Dashboard</a>
      </div>
      <div class="footer-col"><h4>Contact</h4>
        <a href="tel:+919535629318">+91 9535629318</a>
        <a href="mailto:lucky111390@gmail.com">lucky111390@gmail.com</a>
        <a href="delivery.html">Bengaluru Store</a>
      </div>
    </div>
    <div class="footer-bottom">
      <span class="footer-copy">© 2024 Jeni's Boutique. All rights reserved.</span>
      <span class="footer-copy">Tailoring Management System</span>
    </div>`;
}

// ── STATUS COLORS ──
function statusBadge(status){
  const map={
    'Received':'badge-info','Cutting':'badge-warning','Stitching':'badge-warning',
    'Quality Check':'badge-warning','Ready':'badge-success','Out for Delivery':'badge-gold',
    'Delivered':'badge-success','Cancelled':'badge-muted'
  };
  return`<span class="badge ${map[status]||'badge-muted'}">${status}</span>`;
}

// ── FORMAT DATE ──
function fmtDate(iso){return new Date(iso).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
function fmtDateTime(iso){return new Date(iso).toLocaleString('en-IN',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});}

// ── INIT SAMPLE DATA (first load) ──
function initSampleData(){
  if(DB.get('jeni_init'))return;
  const sampleOrders=[
    {id:'ORD1001',userId:'U001',userName:'Priya Sharma',userEmail:'priya@gmail.com',userPhone:'9876543210',
     occasion:'Marriage',plan:'Plus',fabric:'Banarasi Silk',colour:'Deep Red',delivery:'Home Delivery',
     addOns:['Embroidery','Family Matching'],cost:4200,status:'Stitching',
     statusHistory:[
       {status:'Received',time:new Date(Date.now()-4*86400000).toISOString(),note:'Order placed.'},
       {status:'Cutting',time:new Date(Date.now()-3*86400000).toISOString(),note:'Fabric cut.'},
       {status:'Stitching',time:new Date(Date.now()-86400000).toISOString(),note:'Master tailor working.'}
     ],
     placedAt:new Date(Date.now()-4*86400000).toISOString(),
     estimatedDelivery:new Date(Date.now()+2*86400000).toISOString()},
    {id:'ORD1002',userId:'U002',userName:'Rahul Mehta',userEmail:'rahul@gmail.com',userPhone:'9123456789',
     occasion:'Birthday',plan:'Basic',fabric:'Cotton Linen',colour:'Navy Blue',delivery:'Store Pickup',
     addOns:['Monogram'],cost:1100,status:'Delivered',
     statusHistory:[
       {status:'Received',time:new Date(Date.now()-10*86400000).toISOString(),note:''},
       {status:'Cutting',time:new Date(Date.now()-9*86400000).toISOString(),note:''},
       {status:'Stitching',time:new Date(Date.now()-8*86400000).toISOString(),note:''},
       {status:'Quality Check',time:new Date(Date.now()-7*86400000).toISOString(),note:''},
       {status:'Ready',time:new Date(Date.now()-6*86400000).toISOString(),note:''},
       {status:'Delivered',time:new Date(Date.now()-5*86400000).toISOString(),note:'Picked up from store.'}
     ],
     placedAt:new Date(Date.now()-10*86400000).toISOString(),
     estimatedDelivery:new Date(Date.now()-5*86400000).toISOString()}
  ];
  DB.set('jeni_orders',sampleOrders);
  DB.set('jeni_init',true);
}

// Auto-run
document.addEventListener('DOMContentLoaded',()=>{
  initSampleData();
  renderNav();
  renderFooter();
});
