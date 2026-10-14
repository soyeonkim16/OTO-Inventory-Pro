import {Box,LogOut,Plus,RefreshCw,Search,Truck,Users,BarChart3,Download,MapPin,ShieldCheck,UserCog,KeyRound,UserX,UserCheck,Printer,Trash2} from 'lucide-react';
import './styles.css';

const APP_VERSION='6.6.2';
const APP_VERSION='6.6.3';

// 거래명세표 화면 전용 상단 메뉴바
// 기존 .invoice-toolbar / .no-print 스타일과 완전히 분리합니다.
@@ -3451,6 +3451,43 @@ function EmployeeCreateModal({onClose,onCreate}){
</Modal>;
}

if(typeof document!=='undefined'&&!document.getElementById('oto-compact-logs-style')){const el=document.createElement('style');el.id='oto-compact-logs-style';el.textContent=`
/* v6.6.3 입출고 기록 컴팩트 표 */
.oto-compact-log-wrap{width:100%;overflow-x:auto;padding:0 14px 14px;box-sizing:border-box;background:#fff}
.oto-compact-log-table{width:100%;border-collapse:collapse;table-layout:fixed;min-width:760px;font-size:13px}
.oto-compact-log-table th{padding:12px 10px;background:#f8fafc;color:#475467;border-top:1px solid #e4e7ec;border-bottom:1px solid #e4e7ec;text-align:left;font-size:12px}
.oto-compact-log-table td{padding:9px 10px;border-bottom:1px solid #eef1f5;vertical-align:middle;overflow-wrap:anywhere}
.oto-compact-log-table tbody tr:not(.oto-log-detail-row):hover td,.oto-log-selected td{background:#f5f8ff}
.oto-compact-log-table th:nth-child(1){width:125px}
.oto-compact-log-table th:nth-child(2){width:70px}
.oto-compact-log-table th:nth-child(4){width:185px}
.oto-compact-log-table th:nth-child(5){width:95px;text-align:right}
.oto-compact-log-table th:nth-child(6){width:105px;text-align:center}
.oto-log-date{color:#667085;font-variant-numeric:tabular-nums;white-space:nowrap}
.oto-log-badge{display:inline-block;padding:4px 9px;border-radius:7px;font-weight:800;font-size:11px}
.oto-log-badge.in{background:#ecfdf3;color:#067647}
.oto-log-badge.out{background:#fef3f2;color:#b42318}
.oto-log-product{border:0;background:none;padding:0;color:#155eef;font-size:13px;font-weight:700;text-align:left;cursor:pointer}
.oto-log-product:hover{text-decoration:underline}
.oto-log-customer small{display:block;color:#98a2b3;font-size:11px;margin-top:2px}
.oto-log-quantity{text-align:right;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}
.oto-log-quantity.in{color:#067647}.oto-log-quantity.out{color:#b42318}
.oto-compact-log-table td:last-child{text-align:center}
.oto-log-detail-button{font-size:12px!important;min-height:30px!important;height:30px!important;padding:0 10px!important;white-space:nowrap}
.oto-log-detail-row td{background:#f8faff!important;padding:16px!important}
.oto-log-detail-content{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px 18px;text-align:left}
.oto-log-detail-content>div{display:flex;flex-direction:column;gap:4px;min-width:0}
.oto-log-detail-content b{font-size:11px;color:#667085}
.oto-log-detail-content span{font-size:12px;color:#344054}
.oto-log-detail-memo{grid-column:1/-1}
.oto-log-detail-actions{display:flex;justify-content:flex-end;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid #dbe5ff;font-size:12px}
.oto-log-detail-actions input{min-height:34px}
.oto-log-pagination{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 18px 20px;color:#667085;font-size:12px}
.oto-log-pagination>div{display:flex;align-items:center;gap:12px}
.oto-log-pagination button{min-height:34px;padding:0 12px}
@media(max-width:700px){.oto-compact-log-wrap{padding:0 8px 10px}.oto-log-detail-content{grid-template-columns:repeat(2,minmax(0,1fr))}.oto-log-pagination{flex-wrap:wrap}}
`;document.head.appendChild(el)}

function Logs({logs,products,customers,isAdmin,onMove,onDelete,onDateChange}){
const [inProductId,setInProductId]=useState('');
const [outProductId,setOutProductId]=useState('');
@@ -3461,6 +3498,9 @@ function Logs({logs,products,customers,isAdmin,onMove,onDelete,onDateChange}){
const [to,setTo]=useState('');
const [dateDrafts,setDateDrafts]=useState({});
const [dateSavingId,setDateSavingId]=useState('');
  const [page,setPage]=useState(1);
  const [expandedLogId,setExpandedLogId]=useState(null);
  const pageSize=30;

async function saveLogDate(log){
const draft=dateDrafts[log.id]||stockLogDate(log);
@@ -3483,6 +3523,15 @@ function Logs({logs,products,customers,isAdmin,onMove,onDelete,onDateChange}){
return (!type||log.movement_type===type)&&(!from||date>=from)&&(!to||date<=to)&&text.includes(query.toLowerCase());
}),[logs,query,type,from,to]);

  useEffect(()=>{setPage(1);setExpandedLogId(null)},[query,type,from,to]);
  const sortedRows=useMemo(()=>[...rows].sort((a,b)=>
    stockLogDate(b).localeCompare(stockLogDate(a))||
    String(b.created_at||'').localeCompare(String(a.created_at||''))
  ),[rows]);
  const totalPages=Math.max(1,Math.ceil(sortedRows.length/pageSize));
  const currentPage=Math.min(page,totalPages);
  const visibleRows=sortedRows.slice((currentPage-1)*pageSize,currentPage*pageSize);

function csv(){
const head=['일시','구분','상품','수량','담당자','거래처','받는사람','주소','택배사','송장번호','주문번호','메모'];
const data=[head,...rows.map(log=>[
@@ -3535,15 +3584,47 @@ function Logs({logs,products,customers,isAdmin,onMove,onDelete,onDateChange}){
<button onClick={csv}><Download size={17}/>CSV</button>
</div>
<div className="log-summary">검색 결과 {rows.length.toLocaleString()}건 · 입고 {rows.filter(l=>l.movement_type==='in').reduce((a,l)=>a+Number(l.quantity),0).toLocaleString()}개 · 출고 {rows.filter(l=>l.movement_type==='out').reduce((a,l)=>a+Number(l.quantity),0).toLocaleString()}개</div>
    <div className="log-list">
      {rows.map(log=><article key={log.id}>
        <span className={log.movement_type}>{log.movement_type==='in'?'입고':'출고'}</span>
        <div><button type="button" className="log-product-link" title="입출고 상세보기" aria-label={`${log.product_name} 입출고 상세보기`} onClick={()=>{const product=products.find(item=>String(item.id)===String(log.product_id))||products.find(item=>String(log.product_name||'').startsWith(item.name));setDetailProduct(product||{id:log.product_id,name:log.product_name,quantity:0})}}>{log.product_name}</button><small>{stockLogDateKo(log)} · {log.staff_name}</small>{isAdmin&&<div style={{display:'flex',alignItems:'center',gap:6,marginTop:6,fontSize:12,color:'#667085'}}><span>{log.movement_type==='out'?'출고일':'입고일'}</span><input type="date" value={dateDrafts[log.id]??stockLogDate(log)} onChange={e=>setDateDrafts(current=>({...current,[log.id]:e.target.value}))}/><button type="button" className="ghost" disabled={dateSavingId===log.id||!(dateDrafts[log.id]&&dateDrafts[log.id]!==stockLogDate(log))} onClick={()=>saveLogDate(log)}>{dateSavingId===log.id?'저장 중…':'저장'}</button></div>}{log.movement_type==='out'&&<p>{[log.customer_name,log.recipient_name,[log.destination,log.destination_detail].filter(Boolean).join(' '),log.tracking_number].filter(Boolean).join(' · ')}</p>}</div>
        <strong>{log.movement_type==='in'?'+':'-'}{formatNumber(log.quantity)}</strong>
        {isAdmin&&<button className="log-delete-button" onClick={()=>onDelete(log)}>삭제</button>}
      </article>)}
      {!rows.length&&<Empty text="조건에 맞는 입출고 기록이 없습니다."/>}
    <div className="oto-compact-log-wrap">
      <table className="oto-compact-log-table">
        <thead><tr><th>날짜</th><th>구분</th><th>상품명</th><th>거래처 / 담당자</th><th>수량</th><th>상세</th></tr></thead>
        <tbody>
          {visibleRows.map(log=><React.Fragment key={log.id}>
            <tr className={expandedLogId===log.id?'oto-log-selected':''}>
              <td className="oto-log-date">{stockLogDateKo(log)}</td>
              <td><span className={'oto-log-badge '+(log.movement_type==='in'?'in':'out')}>{log.movement_type==='in'?'입고':'출고'}</span></td>
              <td><button type="button" className="oto-log-product" onClick={()=>{const product=products.find(item=>String(item.id)===String(log.product_id))||products.find(item=>String(log.product_name||'').startsWith(item.name));setDetailProduct(product||{id:log.product_id,name:log.product_name,quantity:0})}}>{log.product_name}</button></td>
              <td className="oto-log-customer">{log.customer_name||log.staff_name||'-'}{log.customer_name&&log.staff_name&&<small>{log.staff_name}</small>}</td>
              <td className={'oto-log-quantity '+(log.movement_type==='in'?'in':'out')}>{log.movement_type==='in'?'+':'-'}{formatNumber(log.quantity)}</td>
              <td><button type="button" className="ghost oto-log-detail-button" onClick={()=>setExpandedLogId(id=>id===log.id?null:log.id)}>{expandedLogId===log.id?'접기':'상세 보기'}</button></td>
            </tr>
            {expandedLogId===log.id&&<tr className="oto-log-detail-row"><td colSpan="6">
              <div className="oto-log-detail-content">
                <div><b>담당자</b><span>{log.staff_name||'-'}</span></div>
                <div><b>거래처</b><span>{log.customer_name||'-'}</span></div>
                <div><b>받는 사람</b><span>{log.recipient_name||'-'}</span></div>
                <div><b>택배사 / 송장번호</b><span>{[log.courier,log.tracking_number].filter(Boolean).join(' / ')||'-'}</span></div>
                <div><b>주문번호</b><span>{log.order_number||'-'}</span></div>
                <div><b>배송지</b><span>{[log.destination,log.destination_detail].filter(Boolean).join(' ')||'-'}</span></div>
                <div className="oto-log-detail-memo"><b>메모</b><span>{log.memo||'-'}</span></div>
              </div>
              {isAdmin&&<div className="oto-log-detail-actions">
                <span>{log.movement_type==='out'?'출고일':'입고일'} 수정</span>
                <input type="date" value={dateDrafts[log.id]??stockLogDate(log)} onChange={e=>setDateDrafts(current=>({...current,[log.id]:e.target.value}))}/>
                <button type="button" className="ghost" disabled={dateSavingId===log.id||!(dateDrafts[log.id]&&dateDrafts[log.id]!==stockLogDate(log))} onClick={()=>saveLogDate(log)}>{dateSavingId===log.id?'저장 중…':'날짜 저장'}</button>
                <button type="button" className="log-delete-button" onClick={()=>onDelete(log)}>삭제</button>
              </div>}
            </td></tr>}
          </React.Fragment>)}
          {!visibleRows.length&&<tr><td colSpan="6"><Empty text="조건에 맞는 입출고 기록이 없습니다."/></td></tr>}
        </tbody>
      </table>
</div>
    {sortedRows.length>pageSize&&<div className="oto-log-pagination">
      <span>{sortedRows.length.toLocaleString()}건 중 {((currentPage-1)*pageSize+1).toLocaleString()}~{Math.min(currentPage*pageSize,sortedRows.length).toLocaleString()}건</span>
      <div><button type="button" className="ghost" disabled={currentPage===1} onClick={()=>{setPage(p=>Math.max(1,p-1));setExpandedLogId(null)}}>이전</button>
      <strong>{currentPage} / {totalPages}</strong>
      <button type="button" className="ghost" disabled={currentPage===totalPages} onClick={()=>{setPage(p=>Math.min(totalPages,p+1));setExpandedLogId(null)}}>다음</button></div>
    </div>}
{detailProduct&&<ProductHistoryModal product={detailProduct} logs={logs} customers={customers} onClose={()=>setDetailProduct(null)}/>}
</section>;
}
