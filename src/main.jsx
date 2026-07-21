import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createClient} from '@supabase/supabase-js';
import {Box,LogOut,Plus,RefreshCw,Search,Truck,Users,BarChart3,Download,MapPin,ShieldCheck,UserCog,KeyRound,UserX,UserCheck} from 'lucide-react';
import './styles.css';

const APP_VERSION='1.8.0';
const SUPABASE_URL='https://asphxewwlaiskwmxopyt.supabase.co';
const SUPABASE_KEY='sb_publishable_54jZNgv3W_Dj49xZFmt35g_W-9m9oVe';
const supabase=createClient(SUPABASE_URL,SUPABASE_KEY,{
  auth:{
    persistSession:true,
    autoRefreshToken:true,
    detectSessionInUrl:true,
    storage:window.localStorage
  },
  realtime:{params:{eventsPerSecond:4}}
});

const emptyProduct={name:'',category:'사육장',size:'없음',color:'없음',quantity:0,minimum_quantity:5,memo:''};
const emptyCustomer={name:'',recipient_name:'',phone:'',postal_code:'',address:'',address_detail:'',courier:'',memo:''};
const courierOptions=['','CJ대한통운','한진택배','롯데택배','로젠택배','우체국택배','기타'];

function App(){
  const [session,setSession]=useState(null);
  const [profile,setProfile]=useState(null);
  const [authReady,setAuthReady]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [products,setProducts]=useState([]);
  const [logs,setLogs]=useState([]);
  const [customers,setCustomers]=useState([]);
  const [tab,setTab]=useState('inventory');
  const [query,setQuery]=useState('');
  const [productModal,setProductModal]=useState(null);
  const [moveModal,setMoveModal]=useState(null);
  const [customerModal,setCustomerModal]=useState(null);
  const reloadTimer=useRef(null);
  const mounted=useRef(true);


  useEffect(()=>{
    mounted.current=true;
    let fallback=setTimeout(()=>mounted.current&&setAuthReady(true),5000);
    supabase.auth.getSession().then(({data,error})=>{
      if(!mounted.current)return;
      if(error)setError('로그인 상태 확인 실패: '+error.message);
      setSession(data?.session??null);
      setAuthReady(true);
      clearTimeout(fallback);
    });
    const {data}=supabase.auth.onAuthStateChange((_event,nextSession)=>{
      if(!mounted.current)return;
      setSession(nextSession);
      setAuthReady(true);
    });
    return()=>{
      mounted.current=false;
      clearTimeout(fallback);
      data.subscription.unsubscribe();
    };
  },[]);

  const scheduleLoad=()=>{
    clearTimeout(reloadTimer.current);
    reloadTimer.current=setTimeout(()=>loadAll({silent:true}),350);
  };

  useEffect(()=>{
    if(!session){
      setProfile(null);
      setProducts([]);
      setLogs([]);
      setCustomers([]);
      return;
    }
    loadAll();
    const channel=supabase.channel(`oto-live-${session.user.id}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'products'},scheduleLoad)
      .on('postgres_changes',{event:'*',schema:'public',table:'stock_logs'},scheduleLoad)
      .on('postgres_changes',{event:'*',schema:'public',table:'customers'},scheduleLoad)
      .subscribe();
    return()=>{
      clearTimeout(reloadTimer.current);
      supabase.removeChannel(channel);
    };
  },[session?.user?.id]);

  async function loadAll({silent=false}={}){
    if(!session?.user?.id)return;
    if(!silent)setLoading(true);
    setError('');
    try{
      const [profileRes,productRes,logRes,customerRes]=await Promise.all([
        supabase.from('profiles').select('id,name,role,active').eq('id',session.user.id).maybeSingle(),
        supabase.from('products').select('*').order('created_at',{ascending:false}),
        supabase.from('stock_logs').select('*').order('created_at',{ascending:false}).limit(1500),
        supabase.from('customers').select('*').order('name')
      ]);

      if(profileRes.error)throw profileRes.error;
      if(!profileRes.data)throw new Error('직원 프로필이 없습니다. 관리자에게 계정 등록을 요청하세요.');
      if(!profileRes.data.active){
        await supabase.auth.signOut();
        throw new Error('사용이 중지된 계정입니다.');
      }
      if(productRes.error)throw productRes.error;
      if(logRes.error)throw logRes.error;
      if(customerRes.error)throw customerRes.error;

      if(!mounted.current)return;
      setProfile(profileRes.data);
      setProducts(productRes.data||[]);
      setLogs(logRes.data||[]);
      setCustomers(customerRes.data||[]);
    }catch(e){
      if(mounted.current)setError(normalizeError(e));
    }finally{
      if(mounted.current&&!silent)setLoading(false);
    }
  }

  if(!authReady)return <div className="auth-blank" aria-hidden="true"/>;
  if(!session)return <Login/>;

  async function deleteCustomer(customer){
    const relatedLogs=logs.filter(log=>
      log.movement_type==='out' &&
      (log.customer_id===customer.id || (!log.customer_id && log.customer_name===customer.name))
    );
    const totalQuantity=relatedLogs.reduce((sum,log)=>sum+Number(log.quantity||0),0);

    const message=relatedLogs.length
      ? `"${customer.name}" 거래처를 삭제할까요?\n\n출고 기록 ${relatedLogs.length.toLocaleString()}건, 총 ${totalQuantity.toLocaleString()}개의 이력은 그대로 보존됩니다.`
      : `"${customer.name}" 거래처를 삭제할까요?`;

    if(!window.confirm(message))return;

    const typed=window.prompt(`삭제 확인을 위해 거래처명 "${customer.name}"을(를) 그대로 입력하세요.`);
    if(typed!==customer.name){
      if(typed!==null)window.alert('거래처명이 일치하지 않아 삭제하지 않았습니다.');
      return;
    }

    setLoading(true);
    setError('');
    try{
      const {error}=await supabase.rpc('delete_customer_safely',{p_customer_id:customer.id});
      if(error)throw error;
      if(customerModal?.id===customer.id)setCustomerModal(null);
      await loadAll({silent:true});
      window.alert('거래처가 삭제되었습니다. 기존 출고 이력은 보존됩니다.');
    }catch(e){
      const message=normalizeError(e);
      setError(
        message.includes('delete_customer_safely')
          ? '거래처 삭제용 Supabase SQL이 아직 적용되지 않았습니다. v1.8 SQL을 먼저 실행하세요.'
          : message
      );
    }finally{
      setLoading(false);
    }
  }

  async function deleteProduct(product){
    const stock=Number(product.quantity||0);
    const firstMessage=stock>0
      ? `현재 재고가 ${stock.toLocaleString()}개 남아 있습니다.\n\n"${product.name}" 상품을 정말 삭제할까요?\n입출고 이력은 그대로 보존됩니다.`
      : `"${product.name}" 상품을 삭제할까요?\n입출고 이력은 그대로 보존됩니다.`;

    if(!window.confirm(firstMessage))return;

    const typed=window.prompt(`삭제 확인을 위해 상품명 "${product.name}"을(를) 그대로 입력하세요.`);
    if(typed!==product.name){
      if(typed!==null)window.alert('상품명이 일치하지 않아 삭제하지 않았습니다.');
      return;
    }

    setLoading(true);
    setError('');
    try{
      const {error}=await supabase.rpc('delete_product_safely',{p_product_id:product.id});
      if(error)throw error;
      await loadAll({silent:true});
      window.alert('상품이 삭제되었습니다. 기존 입출고 이력은 보존됩니다.');
    }catch(e){
      const message=normalizeError(e);
      setError(
        message.includes('delete_product_safely')
          ? '상품 삭제용 Supabase SQL이 아직 적용되지 않았습니다. 함께 제공된 SQL을 먼저 실행하세요.'
          : message
      );
    }finally{
      setLoading(false);
    }
  }

  const isAdmin=profile?.role==='admin';
  const today=new Date().toLocaleDateString('en-CA');
  const filtered=products.filter(p=>[p.name,p.category,p.size,p.color,p.memo].join(' ').toLowerCase().includes(query.toLowerCase()));
  const outgoing=logs.filter(l=>l.movement_type==='out');
  const stats=Object.entries(outgoing.reduce((acc,l)=>{
    acc[l.product_name]=(acc[l.product_name]||0)+Number(l.quantity);
    return acc;
  },{})).sort((a,b)=>b[1]-a[1]).slice(0,8);

  return <div className="app">
    <header>
      <div className="brand">
        <img className="app-logo header-logo" src="/oto-app-logo.png" alt="OTO"/>
        <div><b>OTO 재고관리</b><small>{profile?.name||'직원'} · {isAdmin?'관리자':'직원'}</small></div>
      </div>
      <div className="header-actions">
        <button className="ghost" onClick={()=>loadAll()} aria-label="새로고침"><RefreshCw size={17}/></button>
        <button className="ghost" onClick={()=>supabase.auth.signOut()}><LogOut size={17}/><span>로그아웃</span></button>
      </div>
    </header>

    <main>
      {error&&<div className="error error-wide"><b>확인 필요</b><span>{error}</span><button onClick={()=>loadAll()}>다시 시도</button></div>}

      <section className="stats">
        <Stat label="등록 상품" value={products.length}/>
        <Stat label="전체 재고" value={products.reduce((a,p)=>a+Number(p.quantity),0)}/>
        <Stat label="부족 재고" value={products.filter(p=>Number(p.quantity)<=Number(p.minimum_quantity)).length} danger/>
        <Stat label="오늘 입출고" value={logs.filter(l=>new Date(l.created_at).toLocaleDateString('en-CA')===today).length}/>
      </section>

      <nav>
        {[
          ['inventory',Box,'재고'],
          ['logs',Truck,'입출고'],
          ['customers',Users,'거래처'],
          ['stats',BarChart3,'통계'],
          ...(isAdmin?[['employees',UserCog,'직원관리']]:[])
        ].map(([id,Icon,title])=>
          <button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon size={18}/>{title}</button>
        )}
      </nav>

      {tab==='inventory'&&
        <section className="panel">
          <div className="toolbar">
            <div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="상품명, 사이즈, 색상 검색"/></div>
            {isAdmin&&<button className="primary" onClick={()=>setProductModal(emptyProduct)}><Plus size={18}/>상품 등록</button>}
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>상품</th><th>사이즈</th><th>색상</th><th>재고</th><th>상태</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p=><tr key={p.id}>
                  <td><b>{p.name}</b><small>{p.category}</small></td>
                  <td>{p.size||'없음'}</td>
                  <td>{p.color||'없음'}</td>
                  <td><b>{p.quantity}</b> <small>/ 최소 {p.minimum_quantity}</small></td>
                  <td><Badge p={p}/></td>
                  <td><div className="row-actions">
                    <button onClick={()=>setMoveModal(p)}>입출고</button>
                    {isAdmin&&<button onClick={()=>setProductModal(p)}>수정</button>}
                    {isAdmin&&<button className="danger-button" onClick={()=>deleteProduct(p)}>삭제</button>}
                  </div></td>
                </tr>)}
                {!filtered.length&&<tr><td colSpan="6"><Empty text={query?'검색 결과가 없습니다.':'등록된 상품이 없습니다.'}/></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      }

      {tab==='logs'&&<Logs logs={logs}/>}
      {tab==='customers'&&<Customers customers={customers} logs={logs} isAdmin={isAdmin} onAdd={()=>setCustomerModal(emptyCustomer)} onEdit={setCustomerModal} onDelete={deleteCustomer}/>}
      {tab==='stats'&&<section className="panel"><h3 className="panel-title">상품별 누적 출고</h3><div className="bars">{stats.map(([name,value])=><div className="bar" key={name}><span>{name}</span><i style={{width:`${Math.max(8,value/(stats[0]?.[1]||1)*100)}%`}}></i><b>{value}</b></div>)}{!stats.length&&<Empty text="출고 통계가 아직 없습니다."/>}</div></section>}
      {tab==='employees'&&isAdmin&&<EmployeeManagement session={session} currentUserId={session.user.id}/>}

      <footer><ShieldCheck size={14}/> 자동 로그인 유지 · 실시간 동기화 · v{APP_VERSION}</footer>
    </main>

    {productModal&&<ProductModal value={productModal} onClose={()=>setProductModal(null)} onSaved={()=>{setProductModal(null);loadAll()}}/>}
    {moveModal&&<MoveModal product={moveModal} customers={customers} profile={profile} user={session.user} onClose={()=>setMoveModal(null)} onSaved={()=>{setMoveModal(null);loadAll()}}/>}
    {customerModal&&<CustomerModal value={customerModal} onClose={()=>setCustomerModal(null)} onSaved={()=>{setCustomerModal(null);loadAll()}}/>}
    {loading&&<div className="loading">데이터를 안전하게 불러오는 중…</div>}
  </div>;
}


function Login(){
  const [loginId,setLoginId]=useState(localStorage.getItem('oto_last_login_id')||'');
  const [password,setPassword]=useState('');
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  function toAuthEmail(value){
    const normalized=value.trim().toLowerCase();
    // 기존 이메일 계정은 그대로 사용할 수 있고,
    // 새 직원 계정은 아이디@login.otolab.co.kr 형식으로 로그인합니다.
    return normalized.includes('@') ? normalized : `${normalized}@login.otolab.co.kr`;
  }

  async function submit(event){
    event.preventDefault();
    if(saving)return;

    const normalizedId=loginId.trim().toLowerCase();
    if(!/^[a-z0-9._-]{3,30}$/.test(normalizedId) && !normalizedId.includes('@')){
      setError('아이디는 영문 소문자, 숫자, 마침표, 밑줄, 하이픈으로 3자 이상 입력하세요.');
      return;
    }

    setSaving(true);
    setError('');
    localStorage.setItem('oto_last_login_id',normalizedId);

    try{
      const {error}=await supabase.auth.signInWithPassword({
        email:toAuthEmail(normalizedId),
        password
      });
      if(error)throw error;
    }catch(e){
      const message=normalizeError(e);
      setError(
        message.toLowerCase().includes('invalid login credentials')
          ? '아이디 또는 비밀번호가 맞지 않습니다.'
          : '로그인 실패: '+message
      );
    }finally{
      setSaving(false);
    }
  }

  return <div className="login"><form onSubmit={submit}>
    <img className="app-logo login-logo" src="/oto-app-logo.png" alt="OTO"/>
    <h1>OTO 재고관리</h1>
    <p className="brand-sub">ORIGIN TIGRIS OBJECT</p>
    <p>아이디와 비밀번호로 로그인하세요. 한 번 로그인하면 로그아웃하기 전까지 자동 로그인됩니다.</p>
    <label>아이디
      <input
        type="text"
        inputMode="text"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck="false"
        autoComplete="username"
        placeholder="예: soyeon"
        value={loginId}
        onChange={e=>setLoginId(e.target.value)}
        required
      />
    </label>
    <label>비밀번호
      <input
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        required
      />
    </label>
    {error&&<div className="error">{error}</div>}
    <button className="primary full" disabled={saving}>{saving?'로그인 중…':'로그인'}</button>
  </form></div>;
}

function Stat({label,value,danger}){return <div className={'stat '+(danger?'danger':'')}><small>{label}</small><strong>{Number(value).toLocaleString()}</strong></div>}
function Badge({p}){const q=Number(p.quantity),m=Number(p.minimum_quantity);return <span className={'badge '+(q===0?'out':q<=m?'low':'ok')}>{q===0?'품절':q<=m?'부족':'정상'}</span>}
function Empty({text}){return <div className="empty">{text}</div>}

function ProductModal({value,onClose,onSaved}){
  const [form,setForm]=useState({...value});
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  async function save(event){
    event.preventDefault();
    if(saving)return;
    setSaving(true);setError('');
    const payload={
      name:form.name.trim(),
      category:form.category.trim(),
      size:form.size,
      color:form.color,
      quantity:Number(form.quantity),
      minimum_quantity:Number(form.minimum_quantity),
      memo:form.memo?.trim()||null,
      updated_at:new Date().toISOString()
    };
    try{
      const result=form.id
        ?await supabase.from('products').update(payload).eq('id',form.id)
        :await supabase.from('products').insert({...payload,sku:null});
      if(result.error)throw result.error;
      onSaved();
    }catch(e){
      setError(normalizeError(e));
    }finally{setSaving(false)}
  }
  return <Modal title={form.id?'상품 수정':'상품 등록'} onClose={onClose}>
    <form onSubmit={save} className="form-grid">
      <Field label="상품명" value={form.name} set={v=>setForm({...form,name:v})}/>
      <Select label="사이즈" value={form.size} set={v=>setForm({...form,size:v})} options={['없음','소','중','대']}/>
      <Select label="색상" value={form.color} set={v=>setForm({...form,color:v})} options={['없음','투명','검정','기타']}/>
      <Field label="카테고리" value={form.category} set={v=>setForm({...form,category:v})}/>
      <Field label="현재 수량" type="number" value={form.quantity} set={v=>setForm({...form,quantity:v})}/>
      <Field label="최소 수량" type="number" value={form.minimum_quantity} set={v=>setForm({...form,minimum_quantity:v})}/>
      <Field label="메모" value={form.memo||''} set={v=>setForm({...form,memo:v})} full/>
      {error&&<div className="error full">{error}</div>}
      <button className="primary full" disabled={saving}>{saving?'저장 중…':'저장'}</button>
    </form>
  </Modal>;
}

function MoveModal({product,customers,profile,user,onClose,onSaved}){
  const [form,setForm]=useState({type:'out',qty:1,customer_id:'',recipient_name:'',phone:'',postal_code:'',address:'',address_detail:'',courier:'',tracking:'',order:'',memo:''});
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  function pick(id){
    const customer=customers.find(item=>item.id===id);
    setForm({...form,customer_id:id,recipient_name:customer?.recipient_name||'',phone:customer?.phone||'',postal_code:customer?.postal_code||'',address:customer?.address||'',address_detail:customer?.address_detail||'',courier:customer?.courier||''});
  }

  async function save(event){
    event.preventDefault();
    if(saving)return;
    if(form.type==='out'&&Number(form.qty)>Number(product.quantity)){
      setError('현재 재고보다 많이 출고할 수 없습니다.');
      return;
    }
    setSaving(true);setError('');
    try{
      const {error}=await supabase.rpc('process_stock_movement',{
        p_product_id:product.id,
        p_type:form.type,
        p_quantity:Number(form.qty),
        p_user_id:user.id,
        p_staff_name:profile.name,
        p_customer_id:form.customer_id||null,
        p_customer_name:customers.find(c=>c.id===form.customer_id)?.name||null,
        p_recipient_name:form.recipient_name||null,
        p_destination:form.address||null,
        p_destination_postal_code:form.postal_code||null,
        p_destination_detail:form.address_detail||null,
        p_recipient_phone:form.phone||null,
        p_courier:form.courier||null,
        p_tracking_number:form.tracking||null,
        p_order_number:form.order||null,
        p_memo:form.memo||null
      });
      if(error)throw error;
      onSaved();
    }catch(e){
      const msg=normalizeError(e);
      setError(msg.includes('process_stock_movement')?'출고 처리 함수가 없습니다. Supabase SQL 설정을 확인하세요.':msg);
    }finally{setSaving(false)}
  }

  return <Modal title={`${product.name} 입출고`} onClose={onClose}>
    <form onSubmit={save} className="form-grid">
      <Select label="구분" value={form.type} set={v=>setForm({...form,type:v})} options={['in','out']} labels={{in:'입고',out:'출고'}}/>
      <Field label="수량" type="number" value={form.qty} set={v=>setForm({...form,qty:v})}/>
      {form.type==='out'&&<>
        <Select label="거래처" value={form.customer_id} set={pick} options={['',...customers.map(c=>c.id)]} labels={Object.fromEntries(customers.map(c=>[c.id,c.name]))}/>
        <Field label="받는 사람" value={form.recipient_name} set={v=>setForm({...form,recipient_name:v})}/>
        <Field label="연락처" value={form.phone} set={v=>setForm({...form,phone:v})}/>
        <div className="full address">
          <label>우편번호<input value={form.postal_code} readOnly/></label>
          <label>주소<input value={form.address} readOnly/></label>
          <button type="button" className="ghost" onClick={()=>postcode(data=>setForm({...form,postal_code:data.zonecode,address:data.roadAddress||data.jibunAddress}))}><MapPin size={17}/>주소검색</button>
        </div>
        <Field label="상세주소" value={form.address_detail} set={v=>setForm({...form,address_detail:v})} full/>
        <Select label="택배사" value={form.courier} set={v=>setForm({...form,courier:v})} options={courierOptions}/>
        <Field label="송장번호" value={form.tracking} set={v=>setForm({...form,tracking:v})}/>
        <Field label="주문번호" value={form.order} set={v=>setForm({...form,order:v})}/>
      </>}
      <Field label="메모" value={form.memo} set={v=>setForm({...form,memo:v})} full/>
      {error&&<div className="error full">{error}</div>}
      <button className="primary full" disabled={saving}>{saving?'처리 중…':'처리'}</button>
    </form>
  </Modal>;
}

function CustomerModal({value,onClose,onSaved}){
  const [form,setForm]=useState({...value});
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);
  async function save(event){
    event.preventDefault();
    if(saving)return;
    setSaving(true);setError('');
    try{
      const payload={name:form.name.trim(),recipient_name:form.recipient_name?.trim()||null,phone:form.phone?.trim()||null,postal_code:form.postal_code||null,address:form.address||null,address_detail:form.address_detail?.trim()||null,courier:form.courier||null,memo:form.memo?.trim()||null};
      const result=form.id?await supabase.from('customers').update(payload).eq('id',form.id):await supabase.from('customers').insert(payload);
      if(result.error)throw result.error;
      onSaved();
    }catch(e){setError(normalizeError(e))}finally{setSaving(false)}
  }
  return <Modal title={form.id?'거래처 수정':'거래처 등록'} onClose={onClose}>
    <form onSubmit={save} className="form-grid">
      <Field label="거래처명" value={form.name} set={v=>setForm({...form,name:v})} full/>
      <Field label="받는 사람" value={form.recipient_name||''} set={v=>setForm({...form,recipient_name:v})}/>
      <Field label="연락처" value={form.phone||''} set={v=>setForm({...form,phone:v})}/>
      <div className="full address">
        <label>우편번호<input value={form.postal_code||''} readOnly/></label>
        <label>주소<input value={form.address||''} readOnly/></label>
        <button type="button" className="ghost" onClick={()=>postcode(data=>setForm({...form,postal_code:data.zonecode,address:data.roadAddress||data.jibunAddress}))}><MapPin size={17}/>주소검색</button>
      </div>
      <Field label="상세주소" value={form.address_detail||''} set={v=>setForm({...form,address_detail:v})} full/>
      <Select label="택배사" value={form.courier||''} set={v=>setForm({...form,courier:v})} options={courierOptions}/>
      <Field label="메모" value={form.memo||''} set={v=>setForm({...form,memo:v})}/>
      {error&&<div className="error full">{error}</div>}
      <button className="primary full" disabled={saving}>{saving?'저장 중…':'저장'}</button>
    </form>
  </Modal>;
}

function postcode(done){
  if(!window.daum?.Postcode){alert('주소검색 서비스를 불러오지 못했습니다. 인터넷 연결을 확인하세요.');return}
  new window.daum.Postcode({oncomplete:done}).open({popupTitle:'OTO 주소검색'});
}

function Customers({customers,logs,isAdmin,onAdd,onEdit,onDelete}){
  const [query,setQuery]=useState('');
  const [selectedId,setSelectedId]=useState('');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');

  const rows=customers.filter(c=>
    [c.name,c.recipient_name,c.phone,c.address]
      .join(' ')
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const selected=customers.find(c=>c.id===selectedId)||null;

  const customerLogs=useMemo(()=>{
    if(!selected)return [];
    return logs.filter(log=>{
      if(log.movement_type!=='out')return false;
      const matchesCustomer=
        log.customer_id===selected.id ||
        (!log.customer_id && log.customer_name===selected.name);
      if(!matchesCustomer)return false;

      const date=new Date(log.created_at).toLocaleDateString('en-CA');
      return (!from||date>=from)&&(!to||date<=to);
    });
  },[logs,selected,from,to]);

  const dailyGroups=useMemo(()=>{
    const groups={};
    customerLogs.forEach(log=>{
      const date=new Date(log.created_at).toLocaleDateString('en-CA');
      if(!groups[date])groups[date]={total:0,items:{}};
      groups[date].total+=Number(log.quantity||0);
      groups[date].items[log.product_name]=(groups[date].items[log.product_name]||0)+Number(log.quantity||0);
    });
    return Object.entries(groups)
      .sort((a,b)=>b[0].localeCompare(a[0]))
      .map(([date,data])=>({
        date,
        total:data.total,
        items:Object.entries(data.items).sort((a,b)=>b[1]-a[1])
      }));
  },[customerLogs]);

  function exportCustomerCsv(){
    if(!selected)return;
    const data=[
      ['출고일','거래처','품목','수량'],
      ...dailyGroups.flatMap(day=>
        day.items.map(([item,qty])=>[
          day.date,
          selected.name,
          item,
          qty
        ])
      )
    ];
    downloadCsv(data,`${selected.name}_일자별출고_${new Date().toISOString().slice(0,10)}.csv`);
  }

  return <section className="panel customer-panel">
    <div className="toolbar">
      <div className="search">
        <Search size={18}/>
        <input
          value={query}
          onChange={e=>setQuery(e.target.value)}
          placeholder="거래처명, 받는 사람, 연락처 검색"
        />
      </div>
      {isAdmin&&<button className="primary" onClick={onAdd}><Plus size={18}/>거래처 등록</button>}
    </div>

    <div className="customer-layout">
      <div className="customer-grid">
        {rows.map(c=>{
          const totalOut=logs
            .filter(log=>log.movement_type==='out'&&(log.customer_id===c.id||(!log.customer_id&&log.customer_name===c.name)))
            .reduce((sum,log)=>sum+Number(log.quantity||0),0);

          return <article
            key={c.id}
            className={selectedId===c.id?'selected':''}
            onClick={()=>setSelectedId(c.id)}
          >
            <div className="customer-card-head">
              <b>{c.name}</b>
              <span>누적 출고 {totalOut.toLocaleString()}개</span>
            </div>
            <small>{c.recipient_name||'-'} · {c.phone||'-'}</small>
            <p>{[c.address,c.address_detail].filter(Boolean).join(' ')||'주소 없음'}</p>
            <div className="customer-card-actions">
              <button onClick={e=>{e.stopPropagation();setSelectedId(c.id)}}>출고내역</button>
              {isAdmin&&<button onClick={e=>{e.stopPropagation();onEdit(c)}}>수정</button>}
              {isAdmin&&<button className="danger-button" onClick={e=>{e.stopPropagation();onDelete(c)}}>삭제</button>}
            </div>
          </article>
        })}
        {!rows.length&&<Empty text={query?'검색 결과가 없습니다.':'등록된 거래처가 없습니다.'}/>}
      </div>

      <aside className="customer-history">
        {!selected&&
          <div className="customer-history-empty">
            <Users size={34}/>
            <b>거래처를 선택하세요</b>
            <span>날짜별 출고수량과 품목을 확인할 수 있습니다.</span>
          </div>
        }

        {selected&&<>
          <div className="customer-history-head">
            <div>
              <small>거래처 출고현황</small>
              <h3>{selected.name}</h3>
            </div>
            <button onClick={()=>setSelectedId('')} aria-label="닫기">×</button>
          </div>

          <div className="customer-history-filter">
            <label>시작일<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
            <label>종료일<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
            <button onClick={exportCustomerCsv}><Download size={16}/>CSV</button>
          </div>

          <div className="customer-history-summary">
            <div><small>출고일수</small><strong>{dailyGroups.length.toLocaleString()}일</strong></div>
            <div><small>총 출고수량</small><strong>{customerLogs.reduce((s,l)=>s+Number(l.quantity||0),0).toLocaleString()}개</strong></div>
            <div><small>출고 품목수</small><strong>{new Set(customerLogs.map(l=>l.product_name)).size.toLocaleString()}종</strong></div>
          </div>

          <div className="daily-shipments">
            {dailyGroups.map(day=>
              <article key={day.date}>
                <div className="daily-shipment-head">
                  <b>{new Date(day.date+'T00:00:00').toLocaleDateString('ko-KR',{year:'numeric',month:'long',day:'numeric',weekday:'short'})}</b>
                  <strong>{day.total.toLocaleString()}개</strong>
                </div>
                <div className="daily-items">
                  {day.items.map(([item,qty])=>
                    <div key={item}>
                      <span>{item}</span>
                      <b>{qty.toLocaleString()}개</b>
                    </div>
                  )}
                </div>
              </article>
            )}
            {!dailyGroups.length&&<Empty text="선택한 기간에 출고 내역이 없습니다."/>}
          </div>
        </>}
      </aside>
    </div>
  </section>;
}


function EmployeeManagement({session,currentUserId}){
  const [employees,setEmployees]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [createOpen,setCreateOpen]=useState(false);
  const [busyId,setBusyId]=useState('');

  async function api(action,payload={}){
    const response=await fetch('/api/admin-users',{
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'Authorization':`Bearer ${session.access_token}`
      },
      body:JSON.stringify({action,...payload})
    });
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(data.error||'직원 관리 요청을 처리하지 못했습니다.');
    return data;
  }

  async function load(){
    setLoading(true);
    setError('');
    try{
      const data=await api('list');
      setEmployees(data.users||[]);
    }catch(e){
      setError(normalizeError(e));
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{load()},[]);

  async function createEmployee(form){
    setError('');
    try{
      await api('create',{employee:form});
      setCreateOpen(false);
      await load();
      window.alert('직원 계정이 생성되었습니다.');
    }catch(e){
      throw e;
    }
  }

  async function changeRole(employee){
    const nextRole=employee.role==='admin'?'staff':'admin';
    if(employee.id===currentUserId&&nextRole!=='admin'){
      window.alert('현재 로그인한 자신의 관리자 권한은 해제할 수 없습니다.');
      return;
    }
    if(!window.confirm(`${employee.name}님의 권한을 ${nextRole==='admin'?'관리자':'직원'}로 변경할까요?`))return;
    setBusyId(employee.id);
    try{
      await api('set_role',{user_id:employee.id,role:nextRole});
      await load();
    }catch(e){setError(normalizeError(e))}
    finally{setBusyId('')}
  }

  async function toggleActive(employee){
    if(employee.id===currentUserId&&!employee.active){
      return;
    }
    if(employee.id===currentUserId&&employee.active){
      window.alert('현재 로그인한 자신의 계정은 중지할 수 없습니다.');
      return;
    }
    const next=!employee.active;
    if(!window.confirm(`${employee.name}님의 계정을 ${next?'활성화':'중지'}할까요?`))return;
    setBusyId(employee.id);
    try{
      await api('set_active',{user_id:employee.id,active:next});
      await load();
    }catch(e){setError(normalizeError(e))}
    finally{setBusyId('')}
  }

  async function resetPassword(employee){
    const password=window.prompt(`${employee.name}님의 새 비밀번호를 입력하세요.\n8자 이상을 권장합니다.`);
    if(password===null)return;
    if(password.length<6){
      window.alert('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    const confirmPassword=window.prompt('새 비밀번호를 한 번 더 입력하세요.');
    if(password!==confirmPassword){
      window.alert('비밀번호가 일치하지 않습니다.');
      return;
    }
    setBusyId(employee.id);
    try{
      await api('reset_password',{user_id:employee.id,password});
      window.alert('비밀번호가 변경되었습니다.');
    }catch(e){setError(normalizeError(e))}
    finally{setBusyId('')}
  }

  return <section className="panel employee-panel">
    <div className="toolbar">
      <div>
        <h3 className="employee-title">직원 계정 관리</h3>
        <p className="employee-subtitle">직원 생성, 권한 변경, 계정 중지와 비밀번호 변경을 관리합니다.</p>
      </div>
      <button className="primary" onClick={()=>setCreateOpen(true)}><Plus size={18}/>직원 추가</button>
    </div>

    {error&&<div className="error employee-error">{error}</div>}

    <div className="employee-list">
      {loading&&<div className="employee-loading">직원 목록을 불러오는 중…</div>}
      {!loading&&employees.map(employee=>
        <article key={employee.id} className={!employee.active?'inactive':''}>
          <div className="employee-avatar">{employee.name?.slice(0,1)||'직'}</div>
          <div className="employee-info">
            <div>
              <b>{employee.name}</b>
              {employee.id===currentUserId&&<span className="self-badge">내 계정</span>}
              <span className={`role-badge ${employee.role}`}>{employee.role==='admin'?'관리자':'직원'}</span>
              <span className={`active-badge ${employee.active?'on':'off'}`}>{employee.active?'사용 중':'중지됨'}</span>
            </div>
            <small>아이디: {employee.login_id}</small>
            <small>최근 로그인: {employee.last_sign_in_at?new Date(employee.last_sign_in_at).toLocaleString('ko-KR'):'로그인 기록 없음'}</small>
          </div>
          <div className="employee-actions">
            <button disabled={busyId===employee.id} onClick={()=>resetPassword(employee)}><KeyRound size={16}/>비밀번호</button>
            <button disabled={busyId===employee.id||employee.id===currentUserId} onClick={()=>changeRole(employee)}><ShieldCheck size={16}/>{employee.role==='admin'?'직원으로':'관리자로'}</button>
            <button className={employee.active?'danger-button':'activate-button'} disabled={busyId===employee.id||employee.id===currentUserId} onClick={()=>toggleActive(employee)}>
              {employee.active?<UserX size={16}/>:<UserCheck size={16}/>}
              {employee.active?'계정 중지':'계정 활성화'}
            </button>
          </div>
        </article>
      )}
      {!loading&&!employees.length&&<Empty text="등록된 직원이 없습니다."/>}
    </div>

    {createOpen&&<EmployeeCreateModal onClose={()=>setCreateOpen(false)} onCreate={createEmployee}/>}
  </section>;
}

function EmployeeCreateModal({onClose,onCreate}){
  const [form,setForm]=useState({login_id:'',name:'',password:'',role:'staff'});
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');

  async function submit(event){
    event.preventDefault();
    const login=form.login_id.trim().toLowerCase();
    if(!/^[a-z0-9._-]{3,30}$/.test(login)){
      setError('아이디는 영문 소문자, 숫자, 마침표, 밑줄, 하이픈으로 3~30자 입력하세요.');
      return;
    }
    if(form.password.length<6){
      setError('비밀번호는 최소 6자 이상이어야 합니다.');
      return;
    }
    setSaving(true);setError('');
    try{
      await onCreate({...form,login_id:login,name:form.name.trim()});
    }catch(e){
      setError(normalizeError(e));
    }finally{
      setSaving(false);
    }
  }

  return <Modal title="직원 계정 추가" onClose={onClose}>
    <form onSubmit={submit} className="form-grid">
      <Field label="직원 이름" value={form.name} set={v=>setForm({...form,name:v})} full/>
      <Field label="로그인 아이디" value={form.login_id} set={v=>setForm({...form,login_id:v})}/>
      <Field label="초기 비밀번호" type="password" value={form.password} set={v=>setForm({...form,password:v})}/>
      <Select label="권한" value={form.role} set={v=>setForm({...form,role:v})} options={['staff','admin']} labels={{staff:'직원',admin:'관리자'}}/>
      <div className="employee-id-help full">
        아이디 <b>{form.login_id||'employee'}</b>는 내부적으로 <code>{form.login_id||'employee'}@login.otolab.co.kr</code> 계정으로 안전하게 생성됩니다.
      </div>
      {error&&<div className="error full">{error}</div>}
      <button className="primary full" disabled={saving}>{saving?'생성 중…':'직원 계정 만들기'}</button>
    </form>
  </Modal>;
}

function Logs({logs}){
  const [query,setQuery]=useState('');
  const [type,setType]=useState('');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');

  const rows=useMemo(()=>logs.filter(log=>{
    const date=new Date(log.created_at).toLocaleDateString('en-CA');
    const text=[log.product_name,log.customer_name,log.recipient_name,log.destination,log.tracking_number,log.order_number,log.staff_name].join(' ').toLowerCase();
    return (!type||log.movement_type===type)&&(!from||date>=from)&&(!to||date<=to)&&text.includes(query.toLowerCase());
  }),[logs,query,type,from,to]);

  function csv(){
    const head=['일시','구분','상품','수량','담당자','거래처','받는사람','주소','택배사','송장번호','주문번호','메모'];
    const data=[head,...rows.map(log=>[
      new Date(log.created_at).toLocaleString('ko-KR'),
      log.movement_type==='in'?'입고':'출고',
      log.product_name,
      log.quantity,
      log.staff_name,
      log.customer_name||'',
      log.recipient_name||'',
      [log.destination,log.destination_detail].filter(Boolean).join(' '),
      log.courier||'',
      log.tracking_number||'',
      log.order_number||'',
      log.memo||''
    ])];
    downloadCsv(data,`OTO_입출고_${new Date().toISOString().slice(0,10)}.csv`);
  }

  return <section className="panel">
    <div className="log-filter">
      <div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="상품, 거래처, 송장번호, 담당자 검색"/></div>
      <select value={type} onChange={e=>setType(e.target.value)}><option value="">전체 구분</option><option value="in">입고</option><option value="out">출고</option></select>
      <input type="date" value={from} onChange={e=>setFrom(e.target.value)}/>
      <input type="date" value={to} onChange={e=>setTo(e.target.value)}/>
      <button onClick={csv}><Download size={17}/>CSV</button>
    </div>
    <div className="log-summary">검색 결과 {rows.length.toLocaleString()}건 · 입고 {rows.filter(l=>l.movement_type==='in').reduce((a,l)=>a+Number(l.quantity),0).toLocaleString()}개 · 출고 {rows.filter(l=>l.movement_type==='out').reduce((a,l)=>a+Number(l.quantity),0).toLocaleString()}개</div>
    <div className="log-list">
      {rows.map(log=><article key={log.id}>
        <span className={log.movement_type}>{log.movement_type==='in'?'입고':'출고'}</span>
        <div><b>{log.product_name}</b><small>{new Date(log.created_at).toLocaleString('ko-KR')} · {log.staff_name}</small>{log.movement_type==='out'&&<p>{[log.customer_name,log.recipient_name,[log.destination,log.destination_detail].filter(Boolean).join(' '),log.tracking_number].filter(Boolean).join(' · ')}</p>}</div>
        <strong>{log.movement_type==='in'?'+':'-'}{log.quantity}</strong>
      </article>)}
      {!rows.length&&<Empty text="조건에 맞는 입출고 기록이 없습니다."/>}
    </div>
  </section>;
}

function downloadCsv(rows,name){
  const csv='\uFEFF'+rows.map(row=>row.map(value=>`"${String(value??'').replaceAll('"','""')}"`).join(',')).join('\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  const anchor=document.createElement('a');
  anchor.href=url;anchor.download=name;anchor.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function Modal({title,onClose,children}){
  useEffect(()=>{
    const listener=e=>e.key==='Escape'&&onClose();
    window.addEventListener('keydown',listener);
    return()=>window.removeEventListener('keydown',listener);
  },[onClose]);
  return <div className="modal" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal-card"><div className="modal-head"><h2>{title}</h2><button onClick={onClose} aria-label="닫기">×</button></div>{children}</div></div>;
}

function Field({label,value,set,type='text',full}){
  const optional=['메모','상세주소','송장번호','주문번호'].includes(label);
  return <label className={full?'full':''}>{label}<input type={type} min={type==='number'?0:undefined} value={value} onChange={e=>set(e.target.value)} required={!optional}/></label>;
}
function Select({label,value,set,options,labels={}}){return <label>{label}<select value={value} onChange={e=>set(e.target.value)}>{options.map(option=><option key={option} value={option}>{labels[option]??(option||'선택 안 함')}</option>)}</select></label>}
function normalizeError(error){return error?.message||String(error||'알 수 없는 오류가 발생했습니다.')}

createRoot(document.getElementById('root')).render(<App/>);

if('serviceWorker'in navigator){
  window.addEventListener('load',async()=>{
    try{
      const registration=await navigator.serviceWorker.register('/sw.js');
      registration.update();
    }catch(error){
      console.warn('Service worker registration failed',error);
    }
  });
}
