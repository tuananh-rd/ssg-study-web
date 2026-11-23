const B='http://localhost:8788';const H=(c,ip)=>({'content-type':'application/json','x-requested-with':'ssg-web','x-test-ip':ip,...(c?{cookie:c}:{})});
const post=async(p,b,c,ip='9.9.9.9')=>{const r=await fetch(B+p,{method:'POST',headers:H(c,ip),body:JSON.stringify(b)});return {r,t:await r.text()}};
let a=await post('/api/login',{email:'admin@test.local',password:'TestAdmin#2026'});const ac=a.r.headers.getSetCookie()[0].split(';')[0];
const em='lim'+Date.now()+'@x.vn';await post('/api/register',{email:em,name:'Lim It',password:'matkhau123'},null,'9.9.9.1');
const us=JSON.parse((await (await fetch(B+'/api/admin/users',{headers:H(ac,'9.9.9.9')})).text())).users;const id=us.find(u=>u.email===em).id;
await post('/api/admin/users/'+id,{status:'active',subjects:['cpv301']},ac);
a=await post('/api/login',{email:em,password:'matkhau123'},null,'9.9.9.2');const uc=a.r.headers.getSetCookie()[0].split(';')[0];
const codes=[];for(let i=0;i<5;i++){const x=await post('/api/ai',{mode:'chat',subject:'cpv301',messages:[{role:'user',content:'hi '+i}]},uc,'9.9.9.2');codes.push(x.r.status+(x.r.status===429?' '+JSON.parse(x.t).message:''));}
console.log(codes.join(' | '));
const tr=await post('/api/ai',{mode:'translate',subject:'cpv301',messages:[{role:'user',content:'hello'}]},uc,'9.9.9.2');console.log('dịch vẫn được khi hết lượt chat:',tr.r.status);
