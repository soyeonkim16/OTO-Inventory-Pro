import React,{useEffect,useMemo,useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {createPortal} from 'react-dom';
import {createClient} from '@supabase/supabase-js';
import {Box,LogOut,Plus,RefreshCw,Search,Truck,Users,BarChart3,Download,MapPin,ShieldCheck,UserCog,KeyRound,UserX,UserCheck,Printer,Trash2} from 'lucide-react';
import './styles.css';

const APP_VERSION='6.5.2';

// 거래명세표 화면 전용 상단 메뉴바
// 기존 .invoice-toolbar / .no-print 스타일과 완전히 분리합니다.
if(typeof document!=='undefined'&&!document.getElementById('oto-invoice-editor-bar-style')){
  const toolbarStyle=document.createElement('style');
  toolbarStyle.id='oto-invoice-editor-bar-style';
  toolbarStyle.textContent=`
    .invoice-editor-bar{
      display:grid!important;
      grid-template-columns:210px minmax(0,1fr)!important;
      align-items:stretch!important;
      gap:18px!important;
      position:-webkit-sticky!important;
      position:sticky!important;
      top:0!important;
      transform:translateZ(0)!important;
      -webkit-transform:translateZ(0)!important;
      z-index:2147483000!important;
      width:100%!important;
      min-width:0!important;
      min-height:118px!important;
      margin:0!important;
      padding:16px 18px!important;
      box-sizing:border-box!important;
      visibility:visible!important;
      opacity:1!important;
      overflow:visible!important;
      background:#fff!important;
      border-bottom:1px solid #e4e7ec!important;
      box-shadow:0 8px 22px rgba(16,24,40,.08)!important;
    }
    .invoice-editor-bar,.invoice-editor-bar *{visibility:visible!important;opacity:1!important;}
    .invoice-editor-bar .invoice-toolbar-title{display:flex!important;flex-direction:column!important;justify-content:center!important;align-items:flex-start!important;padding-right:18px!important;border-right:1px solid #eaecf0!important;}
    .invoice-editor-bar .invoice-toolbar-title b{font-size:18px!important;font-weight:800!important;color:#101828!important;}
    .invoice-editor-bar .invoice-toolbar-title small{margin-top:5px!important;font-size:12px!important;line-height:1.45!important;color:#667085!important;}
    .invoice-editor-bar .invoice-toolbar-actions{display:flex!important;align-items:stretch!important;flex-wrap:wrap!important;gap:9px!important;min-width:0!important;}
    .invoice-editor-bar .invoice-toolbar-group{display:flex!important;flex-direction:column!important;justify-content:center!important;gap:7px!important;padding:9px 10px!important;border:1px solid #e4e7ec!important;border-radius:11px!important;background:#f9fafb!important;}
    .invoice-editor-bar .invoice-toolbar-group-title{font-size:11px!important;font-weight:700!important;color:#667085!important;}
    .invoice-editor-bar .invoice-toolbar-buttons{display:flex!important;align-items:center!important;gap:7px!important;flex-wrap:nowrap!important;}
    .invoice-editor-bar button,.invoice-editor-bar .price-type-control{display:inline-flex!important;align-items:center!important;justify-content:center!important;height:38px!important;min-height:38px!important;margin:0!important;padding:0 12px!important;border:1px solid #d0d5dd!important;border-radius:9px!important;background:#fff!important;color:#344054!important;font-size:12px!important;font-weight:700!important;white-space:nowrap!important;box-sizing:border-box!important;}
    .invoice-editor-bar .price-type-control{gap:7px!important;}
    .invoice-editor-bar .price-type-control select{height:30px!important;border:0!important;border-left:1px solid #eaecf0!important;padding:0 24px 0 8px!important;background:#fff!important;font-size:12px!important;font-weight:700!important;}
    .invoice-editor-bar .invoice-print-button{background:#155eef!important;border-color:#155eef!important;color:#fff!important;}
    .invoice-editor-bar .invoice-toolbar-final{margin-left:auto!important;background:#f5f8ff!important;border-color:#d6e4ff!important;}
    .invoice-editor-bar .invoice-save-count{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:20px!important;height:20px!important;margin-left:3px!important;padding:0 6px!important;border-radius:999px!important;background:#eef4ff!important;color:#155eef!important;font-size:10px!important;}
    @media(max-width:820px){
      .invoice-editor-bar{display:block!important;padding:13px 12px!important;min-height:0!important;}
      .invoice-editor-bar .invoice-toolbar-title{padding:0 0 11px!important;margin-bottom:11px!important;border-right:0!important;border-bottom:1px solid #eaecf0!important;}
      .invoice-editor-bar .invoice-toolbar-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;}
      .invoice-editor-bar .invoice-toolbar-final{margin-left:0!important;}
      .invoice-editor-bar .invoice-toolbar-buttons{display:grid!important;grid-template-columns:1fr!important;width:100%!important;}
      .invoice-editor-bar button,.invoice-editor-bar .price-type-control{width:100%!important;height:42px!important;min-height:42px!important;}
    }
    @media(max-width:520px){
      .invoice-editor-bar .invoice-toolbar-actions{
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:7px!important;
      }
    }
    @media print{.invoice-editor-bar{display:none!important;}}
  `;
  document.head.appendChild(toolbarStyle);
}


// 거래명세표 인쇄 시 편집용 X 버튼 숨김
if(typeof document!=='undefined'&&!document.getElementById('oto-invoice-print-fix')){
  const style=document.createElement('style');
  style.id='oto-invoice-print-fix';
  style.textContent=`
  /* 거래명세표 상·하단 공통 정렬 */
  .statement-copy{
    width:100%;
    box-sizing:border-box;
    font-size:10.5px!important;
    line-height:1.25;
  }
  .statement-copy table{
    width:100%;
    table-layout:fixed!important;
    border-collapse:collapse!important;
  }
  .statement-copy th,
  .statement-copy td,
  .statement-copy input,
  .statement-copy textarea{
    box-sizing:border-box;
    font-family:inherit!important;
    font-size:10.5px!important;
  }
  .invoice-title-row h1{font-size:22px!important;line-height:1.15!important;}
  .invoice-title-row span{font-size:9.5px!important;}

  /* 공급자 영역을 조금 왼쪽으로 이동: 좌측 51%, 우측 49% */
  .invoice-parties col.party-customer-vertical{width:2.5%!important;}
  .invoice-parties col.party-customer-label{width:7%!important;}
  .invoice-parties col.party-customer-data{width:17%!important;}
  .invoice-parties col.party-customer-label-sub{width:7%!important;}
  .invoice-parties col.party-customer-data-sub{width:17.5%!important;}
  .invoice-parties col.party-supplier-vertical{width:2.5%!important;}
  .invoice-parties col.party-supplier-label{width:7%!important;}
  .invoice-parties col.party-supplier-data{width:17%!important;}
  .invoice-parties col.party-supplier-label-sub{width:7%!important;}
  .invoice-parties col.party-supplier-data-sub{width:15.5%!important;}
  .invoice-parties th,.invoice-parties td{height:27px!important;padding:2px 4px!important;}
  /* 공급받는자·공급자 제목 칸: 가로·세로 정중앙 */
  .invoice-parties th.vertical-label{
    text-align:center!important;
    vertical-align:middle!important;
    padding:0!important;
    line-height:1.35!important;
    white-space:nowrap!important;
  }
  .invoice-parties input{width:100%!important;height:22px!important;padding:1px 3px!important;}

  /* 월·일 칸 축소, 품목 칸 확대 */
  .invoice-items col.invoice-col-month{width:5.5%!important;}
  .invoice-items col.invoice-col-day{width:5.5%!important;}
  .invoice-items col.invoice-col-item{width:43.5%!important;}
  .invoice-items col.invoice-col-qty{width:8.5%!important;}
  .invoice-items col.invoice-col-unit{width:12.5%!important;}
  .invoice-items col.invoice-col-supply{width:14%!important;}
  .invoice-items col.invoice-col-tax{width:10.5%!important;}
  .invoice-items th,.invoice-items td{height:25px!important;padding:2px 4px!important;}
  .invoice-items th:nth-child(1),.invoice-items td:nth-child(1),
  .invoice-items th:nth-child(2),.invoice-items td:nth-child(2){text-align:center!important;padding-left:1px!important;padding-right:1px!important;}
  .invoice-items th:nth-child(n+4),.invoice-items td:nth-child(n+4){text-align:center!important;vertical-align:middle!important;}
  .invoice-items td:nth-child(n+4) input{text-align:center!important;}
  .invoice-items td input{width:100%!important;height:21px!important;padding:1px 3px!important;}
  .invoice-items td:nth-child(1) input,.invoice-items td:nth-child(2) input{text-align:center!important;padding:1px!important;}

  /* v6.0.1: 상단/하단 명세표가 완전히 같은 DOM과 치수를 사용 */
  .statement-copy input,
  .statement-copy textarea{
    display:block!important;
    width:100%!important;
    margin:0!important;
    border:0!important;
    outline:0!important;
    border-radius:0!important;
    background:transparent!important;
    color:inherit!important;
    font:inherit!important;
    line-height:1.25!important;
    box-shadow:none!important;
  }
  .statement-copy input[readonly],
  .statement-copy textarea[readonly]{pointer-events:none!important;}
  .invoice-parties td{vertical-align:middle!important;overflow:hidden!important;}
  .invoice-parties td input{height:22px!important;min-height:22px!important;}
  .invoice-items td{vertical-align:middle!important;overflow:hidden!important;}
  .invoice-items td input{height:21px!important;min-height:21px!important;}
  .invoice-note,
  .invoice-account{display:grid!important;grid-template-columns:70px 1fr!important;align-items:stretch!important;}
  .invoice-note>b,
  .invoice-account>b{display:flex!important;align-items:center!important;justify-content:center!important;}
  .invoice-note textarea{height:38px!important;min-height:38px!important;resize:none!important;padding:5px 7px!important;}
  .invoice-account input{height:28px!important;min-height:28px!important;padding:4px 7px!important;}
  .statement-summary strong{font-size:14px!important;}

  /* v6.3.1 거래명세표 숫자열 정렬 통일 */
  .invoice-items th:nth-child(4),
  .invoice-items td:nth-child(4),
  .invoice-items td:nth-child(4) input{
    text-align:center!important;
  }
  .invoice-items th:nth-child(5),
  .invoice-items th:nth-child(6),
  .invoice-items th:nth-child(7){
    text-align:center!important;
  }
  .invoice-items td:nth-child(5),
  .invoice-items td:nth-child(6),
  .invoice-items td:nth-child(7),
  .invoice-items td:nth-child(5) input,
  .invoice-items td:nth-child(6) input,
  .invoice-items td:nth-child(7) input{
    text-align:right!important;
    padding-left:5px!important;
    padding-right:5px!important;
    font-variant-numeric:tabular-nums!important;
  }
  .invoice-items input[type=number]{-moz-appearance:textfield!important;}
  .invoice-items input[type=number]::-webkit-inner-spin-button,
  .invoice-items input[type=number]::-webkit-outer-spin-button{
    -webkit-appearance:none!important;
    margin:0!important;
  }

  /* A4를 정확히 반으로 나누고, 위·아래 명세표에 동일한 사방 8mm 여백 적용 */
  .invoice-sheet.portrait-double{
    position:relative!important;
    box-sizing:border-box!important;
    display:grid!important;
    grid-template-rows:1fr 1fr!important;
    align-items:stretch!important;
    width:210mm!important;
    height:297mm!important;
    min-height:297mm!important;
    padding:0!important;
    margin:0 auto!important;
    gap:0!important;
    background:#fff!important;
    overflow:hidden!important;
  }
  .invoice-sheet.portrait-double>.statement-copy{
    box-sizing:border-box!important;
    min-width:0!important;
    min-height:0!important;
    width:100%!important;
    height:148.5mm!important;
    margin:0!important;
    padding:8mm!important;
    overflow:hidden!important;
  }
  .invoice-sheet.portrait-double>.cut-line{
    position:absolute!important;
    left:8mm!important;
    right:8mm!important;
    top:50%!important;
    width:auto!important;
    height:0!important;
    margin:0!important;
    padding:0!important;
    border:0!important;
    border-top:1px dashed #777!important;
    box-sizing:border-box!important;
    transform:translateY(-0.5px)!important;
    font-size:0!important;
    line-height:0!important;
    color:transparent!important;
    pointer-events:none!important;
    z-index:3!important;
  }

  /* 거래처 거래현황을 우측 패널이 아닌 목록 아래 전체 너비로 표시 */
  .customer-layout{
    display:block!important;
    grid-template-columns:none!important;
  }
  .customer-list-area{
    width:100%!important;
    min-width:0!important;
  }
  .customer-history{
    position:relative!important;
    top:auto!important;
    right:auto!important;
    width:100%!important;
    max-width:none!important;
    min-width:0!important;
    height:auto!important;
    max-height:none!important;
    margin-top:18px!important;
    border:1px solid #e5e7eb!important;
    border-radius:16px!important;
    box-shadow:none!important;
    overflow:visible!important;
    background:#fff!important;
  }
  .customer-history-head{
    border-radius:16px 16px 0 0;
  }
  .customer-history .daily-shipments{
    max-height:none!important;
    overflow:visible!important;
  }


  /* 선택한 거래처 행 바로 아래 펼쳐지는 거래현황 */
  .customer-history-inline{margin:0!important;border:0!important;border-top:1px solid #dbe3ef!important;border-bottom:1px solid #dbe3ef!important;border-radius:0!important;background:#f8fafc!important;}
  .customer-history-inline .customer-history-head{
    border-radius:0!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:12px!important;
  }
  .customer-history-inline .customer-history-head>div:first-child{
    min-width:0!important;
    flex:1 1 auto!important;
  }
  .customer-history-inline .customer-history-head>div:last-child{
    display:flex!important;
    align-items:center!important;
    justify-content:flex-end!important;
    gap:6px!important;
    flex:0 0 auto!important;
    width:auto!important;
    min-width:max-content!important;
    flex-wrap:nowrap!important;
  }
  .customer-history-inline .customer-history-head>div:last-child button{
    width:auto!important;
    min-width:max-content!important;
    flex:0 0 auto!important;
    white-space:nowrap!important;
    word-break:keep-all!important;
    writing-mode:horizontal-tb!important;
  }
  .customer-inline-detail-row>td{padding:0!important;background:#f8fafc!important;border-bottom:2px solid #2563eb!important;}
  .customer-mobile-inline-detail{padding:0!important;margin:-1px 0 12px!important;border:1px solid #dbe3ef!important;border-top:0!important;border-radius:0 0 14px 14px!important;overflow:hidden!important;}

  /* v6.0: 스크롤바 유무와 관계없이 전체 좌우선 고정 */
  html{overflow-y:scroll!important;scrollbar-gutter:stable!important;}
  html,body,#root{width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
  body{overflow-x:hidden!important;}
  #root>*{max-width:100%!important;box-sizing:border-box!important;}
  .app,.app-shell,.page,.main,.main-content{width:100%!important;max-width:100%!important;box-sizing:border-box!important;}
  [style*=\"100vw\"]{width:100%!important;max-width:100%!important;}
  .panel,.stats-grid,.toolbar,.customer-panel{box-sizing:border-box!important;max-width:100%!important;}

  /* v6.0: 선택 거래처 상세 영역 */
  .customer-table td:first-child b{display:inline-flex;align-items:center;gap:8px;}
  .customer-expand-arrow{display:inline-grid;place-items:center;width:18px;height:18px;color:#475467;font-size:15px;transition:transform .18s ease;}
  tr.selected .customer-expand-arrow{transform:rotate(90deg);color:#155eef;}
  .customer-history-inline{display:grid!important;grid-template-columns:minmax(245px,.78fr) minmax(330px,1.15fr) minmax(390px,1.35fr)!important;align-items:start!important;padding:0 14px 14px!important;gap:12px!important;border:1px solid #b9ccff!important;border-radius:14px!important;margin:10px 12px 14px!important;background:#fff!important;box-shadow:0 8px 24px rgba(16,24,40,.06)!important;}
  .customer-history-inline .customer-history-head{grid-column:1/-1!important;margin:0 -14px!important;padding:12px 16px!important;background:linear-gradient(90deg,#f4f7ff,#fff)!important;border-bottom:1px solid #dbe5ff!important;}
  .customer-history-inline .customer-history-head h3{margin:3px 0 0!important;font-size:18px!important;}
  .customer-history-inline .customer-history-filter{grid-column:1!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin:0!important;padding:12px!important;border:1px solid #e4e7ec!important;border-radius:12px!important;background:#fff!important;}
  .customer-history-inline .customer-history-filter .customer-history-buttons{grid-column:1/-1!important;}
  .customer-history-inline .customer-history-filter button{width:100%!important;justify-content:center!important;}
  .customer-history-inline .customer-history-summary{grid-column:1!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;margin:0!important;}
  .customer-history-inline .customer-history-summary>div{min-width:0!important;padding:12px!important;border:1px solid #e4e7ec!important;border-radius:12px!important;background:#fff!important;}
  .customer-history-inline .customer-history-summary>div:last-child{grid-column:1/-1!important;}
  .customer-history-inline .receivable-history-block{grid-column:2!important;grid-row:2/span 2!important;margin:0!important;height:100%!important;border-radius:12px!important;}
  .customer-history-inline .daily-shipments{grid-column:3!important;grid-row:2/span 2!important;margin:0!important;display:grid!important;gap:10px!important;}
  .customer-history-inline .daily-shipments article{margin:0!important;border:1px solid #e4e7ec!important;border-radius:12px!important;overflow:hidden!important;background:#fff!important;}
  .customer-history-inline .daily-shipment-head{padding:11px 12px!important;background:#fafbfc!important;}
  .customer-history-inline .daily-items{padding:8px 12px!important;}
  .customer-history-inline button{white-space:nowrap!important;word-break:keep-all!important;}

  /* v6.4.1 모든 탭 상단 안내 영역 통일 */
  .tab-intro{
    min-height:92px!important;
    padding:18px 20px!important;
    margin:0 0 14px!important;
    border:1px solid #dfe6f1!important;
    border-radius:15px!important;
    background:#f6f8fc!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:20px!important;
    box-sizing:border-box!important;
    text-align:left!important;
  }
  .tab-intro-text{
    min-width:220px!important;
    flex:1 1 auto!important;
    text-align:left!important;
  }
  .tab-intro h3,
  .tab-intro .panel-title,
  .tab-intro .employee-title{
    margin:0 0 6px!important;
    padding:0!important;
    font-size:18px!important;
    line-height:1.35!important;
    font-weight:700!important;
    color:#101828!important;
    text-align:left!important;
  }
  .tab-intro p,
  .tab-intro .employee-subtitle{
    margin:0!important;
    padding:0!important;
    font-size:13px!important;
    line-height:1.45!important;
    color:#667085!important;
    text-align:left!important;
  }
  .tab-intro-actions,
  .movement-entry-controls{
    flex:0 1 52%!important;
    min-width:360px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:flex-end!important;
    gap:10px!important;
    flex-wrap:nowrap!important;
  }
  .tab-intro-actions select,
  .movement-entry-controls select{
    flex:1 1 auto!important;
    width:auto!important;
    min-width:240px!important;
    height:42px!important;
    min-height:42px!important;
    padding:0 12px!important;
    border:1px solid #d0d5dd!important;
    border-radius:10px!important;
    background:#fff!important;
    font-size:14px!important;
    text-align:left!important;
  }
  .tab-intro-actions button,
  .movement-entry-controls button{
    min-height:42px!important;
    height:42px!important;
    padding:0 16px!important;
    white-space:nowrap!important;
  }
  .movement-entry{
    min-height:92px!important;
    padding:18px 20px!important;
    margin:0 0 14px!important;
    border:1px solid #dfe6f1!important;
    border-radius:15px!important;
    background:#f6f8fc!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:20px!important;
    text-align:left!important;
  }
  .movement-entry>div:first-child{flex:1 1 auto!important;min-width:220px!important;text-align:left!important;}
  .movement-entry .panel-title{margin:0 0 6px!important;font-size:18px!important;line-height:1.35!important;text-align:left!important;}
  .movement-entry p{margin:0!important;font-size:13px!important;line-height:1.45!important;color:#667085!important;text-align:left!important;}

  @media(max-width:1280px){
    .customer-history-inline{grid-template-columns:minmax(230px,.8fr) minmax(0,1.2fr)!important;}
    .customer-history-inline .receivable-history-block{grid-column:2!important;grid-row:2/span 2!important;}
    .customer-history-inline .daily-shipments{grid-column:1/-1!important;grid-row:auto!important;}
  }
  @media(max-width:820px){
    .tab-intro,.movement-entry{display:block!important;min-height:0!important;padding:16px!important;}
    .tab-intro-actions,.movement-entry-controls{min-width:0!important;width:100%!important;margin-top:14px!important;flex-wrap:wrap!important;justify-content:flex-start!important;}
    .tab-intro-actions select,.movement-entry-controls select{width:100%!important;min-width:0!important;flex-basis:100%!important;}
  }
  @media(max-width:820px){
    html{overflow-y:auto!important;scrollbar-gutter:auto!important;}
    .customer-history-inline{display:block!important;margin:0!important;padding:0 10px 10px!important;border-radius:0 0 14px 14px!important;}
    .customer-history-inline .customer-history-head{margin:0 -10px 10px!important;align-items:flex-start!important;}
    .customer-history-inline .customer-history-head>div:last-child{flex-wrap:wrap!important;justify-content:flex-start!important;min-width:0!important;}
    .customer-history-inline .customer-history-filter,.customer-history-inline .customer-history-summary,.customer-history-inline .receivable-history-block,.customer-history-inline .daily-shipments{margin:10px 0!important;}
  }

  /* v6.2 거래내역 선택 입금처리 */
  .transaction-select-box{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:22px!important;height:22px!important;min-width:22px!important;border:1px solid #d0d5dd!important;border-radius:6px!important;background:#fff!important;cursor:pointer!important;}
  .transaction-select-box input{width:15px!important;height:15px!important;margin:0!important;accent-color:#155eef!important;cursor:pointer!important;}
  .daily-shipments article.transaction-selected{border-color:#84adff!important;box-shadow:0 0 0 2px rgba(21,94,239,.12)!important;background:#f8faff!important;}
  .selected-payment-bar{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;padding:10px 12px!important;border:1px solid #b2ccff!important;border-radius:10px!important;background:#eff4ff!important;margin-bottom:8px!important;}
  .selected-payment-bar strong{color:#155eef!important;}
  .selected-payment-bar button{flex:0 0 auto!important;white-space:nowrap!important;position:relative!important;z-index:2!important;pointer-events:auto!important;cursor:pointer!important;}
  .selected-payment-button{min-width:118px!important;}
  .modal-backdrop{z-index:9999!important;}
  .modal-card{position:relative!important;z-index:10000!important;}
  .transaction-paid-badge{display:inline-flex!important;align-items:center!important;padding:3px 7px!important;border-radius:999px!important;font-size:11px!important;font-weight:700!important;background:#ecfdf3!important;color:#067647!important;}
  @media(max-width:620px){.selected-payment-bar{align-items:flex-start!important;flex-direction:column!important;}.selected-payment-bar button{width:100%!important;justify-content:center!important;}}

  /* 모바일 거래명세표 A4 한 장 전체 미리보기 */
  .invoice-preview-viewport{
    position:relative;
    width:100%;
    display:flex;
    justify-content:center;
    align-items:flex-start;
    box-sizing:border-box;
    overflow:hidden;
  }

  @media screen and (max-width:768px){
    .invoice-overlay{
      position:fixed!important;
      inset:0!important;
      width:100vw!important;
      max-width:100vw!important;
      min-width:0!important;
      margin:0!important;
      padding:0!important;
      overflow-x:hidden!important;
      overflow-y:auto!important;
      box-sizing:border-box!important;
    }

    .invoice-window{
      position:relative!important;
      width:100vw!important;
      max-width:100vw!important;
      min-width:0!important;
      min-height:100vh!important;
      max-height:none!important;
      margin:0!important;
      padding:0!important;
      border-radius:0!important;
      overflow:visible!important;
      box-sizing:border-box!important;
    }

    .invoice-toolbar{
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      padding:16px 14px!important;
      box-sizing:border-box!important;
      overflow:hidden!important;
    }

    .invoice-toolbar>div{
      width:100%!important;
      max-width:100%!important;
      min-width:0!important;
      box-sizing:border-box!important;
    }

    .invoice-toolbar>div:last-child{
      display:flex!important;
      flex-wrap:wrap!important;
      align-items:stretch!important;
      gap:8px!important;
    }

    .invoice-toolbar button,
    .invoice-toolbar .price-type-control{
      min-width:0!important;
      max-width:100%!important;
    }

    .invoice-archive{
      width:calc(100% - 24px)!important;
      max-width:calc(100% - 24px)!important;
      min-width:0!important;
      margin:12px!important;
      box-sizing:border-box!important;
    }

    .invoice-preview-viewport{
      position:relative!important;
      display:block!important;
      width:100vw!important;
      max-width:100vw!important;
      min-width:0!important;
      height:var(--invoice-preview-height)!important;
      min-height:var(--invoice-preview-height)!important;
      margin:16px 0 24px!important;
      padding:0!important;
      overflow:hidden!important;
      box-sizing:border-box!important;
    }

    .invoice-preview-viewport .invoice-sheet.portrait-double{
      position:absolute!important;
      top:0!important;
      left:12px!important;
      right:auto!important;
      width:794px!important;
      min-width:794px!important;
      max-width:794px!important;
      height:1123px!important;
      min-height:1123px!important;
      max-height:1123px!important;
      margin:0!important;
      padding:0!important;
      transform:scale(var(--invoice-preview-scale))!important;
      transform-origin:top left!important;
      box-sizing:border-box!important;
    }
  }

  @media print{
    .invoice-preview-viewport{
      display:block!important;
      width:210mm!important;
      height:297mm!important;
      min-height:297mm!important;
      margin:0!important;
      padding:0!important;
      overflow:visible!important;
    }

    .invoice-preview-viewport .invoice-sheet.portrait-double{
      position:static!important;
      transform:none!important;
      width:210mm!important;
      min-width:210mm!important;
      max-width:210mm!important;
      height:297mm!important;
      min-height:297mm!important;
      max-height:297mm!important;
      margin:0!important;
      padding:0!important;
    }

    @page{size:A4 portrait;margin:0!important;}
    html,body{width:210mm!important;height:297mm!important;margin:0!important;padding:0!important;background:#fff!important;}
    .invoice-overlay,.invoice-window{position:static!important;width:210mm!important;min-width:210mm!important;max-width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;margin:0!important;padding:0!important;background:#fff!important;overflow:hidden!important;}
    .invoice-sheet.portrait-double{width:210mm!important;height:297mm!important;min-height:297mm!important;padding:0!important;margin:0!important;box-shadow:none!important;border:0!important;page-break-after:avoid!important;break-after:avoid-page!important;}
    .invoice-delete,.invoice-delete.no-print{display:none!important;visibility:hidden!important;}
    .statement-copy{-webkit-print-color-adjust:exact;print-color-adjust:exact;}
  }
  }`;
  document.head.appendChild(style);
}


/* v6.1 이미지 시안 기반 전체 UI */
if(typeof document!=='undefined'&&!document.getElementById('oto-v61-ui')){
  const uiStyle=document.createElement('style');
  uiStyle.id='oto-v61-ui';
  uiStyle.textContent=`
  :root{
    --ui-blue:#155eef;
    --ui-blue-dark:#004eeb;
    --ui-blue-soft:#eef4ff;
    --ui-border:#e4e7ec;
    --ui-border-strong:#d0d5dd;
    --ui-text:#101828;
    --ui-muted:#667085;
    --ui-bg:#f7f9fc;
    --ui-card:#ffffff;
    --ui-red:#d92d20;
    --ui-orange:#f79009;
    --ui-shadow:0 8px 24px rgba(16,24,40,.06);
  }
  html{background:var(--ui-bg)!important;}
  body{background:var(--ui-bg)!important;color:var(--ui-text)!important;}
  .app{min-height:100vh!important;background:var(--ui-bg)!important;}
  .app>header{
    position:sticky!important;top:0!important;z-index:50!important;
    min-height:68px!important;padding:0 22px!important;
    background:rgba(255,255,255,.96)!important;
    border-bottom:1px solid var(--ui-border)!important;
    box-shadow:0 1px 2px rgba(16,24,40,.03)!important;
    backdrop-filter:blur(10px)!important;
  }
  .brand{gap:10px!important;}
  .brand .header-logo{width:40px!important;height:40px!important;border-radius:11px!important;box-shadow:0 4px 12px rgba(21,94,239,.18)!important;}
  .brand b{font-size:16px!important;letter-spacing:-.2px!important;}
  .brand small{display:block!important;margin-top:2px!important;font-size:12px!important;color:var(--ui-muted)!important;}
  .header-actions{gap:8px!important;}
  .header-actions button{height:38px!important;border:1px solid var(--ui-border)!important;border-radius:10px!important;background:#fff!important;}

  .app>main{width:100%!important;max-width:none!important;margin:0!important;padding:18px 22px 30px!important;box-sizing:border-box!important;}
  .stats{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:14px!important;margin:0 0 12px!important;}
  .stat{
    min-height:88px!important;padding:18px 20px!important;
    border:1px solid var(--ui-border)!important;border-radius:15px!important;
    background:var(--ui-card)!important;box-shadow:var(--ui-shadow)!important;
    display:flex!important;flex-direction:column!important;justify-content:center!important;
  }
  .stat small{font-size:12px!important;font-weight:600!important;color:var(--ui-muted)!important;}
  .stat strong{margin-top:7px!important;font-size:27px!important;line-height:1!important;letter-spacing:-.8px!important;color:var(--ui-text)!important;}
  .stat.danger strong{color:var(--ui-red)!important;}

  .app nav{display:flex!important;align-items:center!important;gap:7px!important;margin:0 0 12px!important;padding:0!important;background:transparent!important;border:0!important;overflow-x:auto!important;}
  .app nav button{
    height:38px!important;padding:0 14px!important;border:1px solid var(--ui-border)!important;border-radius:9px!important;
    background:#fff!important;color:#344054!important;font-size:13px!important;font-weight:700!important;box-shadow:0 1px 2px rgba(16,24,40,.03)!important;
  }
  .app nav button.active{background:var(--ui-blue)!important;border-color:var(--ui-blue)!important;color:#fff!important;box-shadow:0 4px 10px rgba(21,94,239,.22)!important;}

  .panel,.customer-panel{
    border:1px solid var(--ui-border)!important;border-radius:15px!important;background:#fff!important;
    box-shadow:var(--ui-shadow)!important;overflow:hidden!important;
  }
  .toolbar{
    min-height:64px!important;padding:12px 14px!important;border-bottom:1px solid var(--ui-border)!important;
    background:#fff!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:12px!important;
  }
  .search{height:38px!important;max-width:430px!important;border:1px solid var(--ui-border)!important;border-radius:9px!important;background:#fff!important;padding:0 12px!important;box-shadow:0 1px 2px rgba(16,24,40,.02)!important;}
  .search:focus-within{border-color:#84adff!important;box-shadow:0 0 0 3px #eef4ff!important;}
  .search input{font-size:13px!important;}
  button{font-weight:700!important;}
  button.primary{background:var(--ui-blue)!important;border-color:var(--ui-blue)!important;color:#fff!important;}
  button.primary:hover{background:var(--ui-blue-dark)!important;}
  button.ghost{background:#fff!important;border-color:var(--ui-border)!important;color:#344054!important;}
  .danger-button{color:var(--ui-red)!important;border-color:#fda29b!important;background:#fff!important;}

  .customer-table-wrap{overflow-x:auto!important;background:#fff!important;}
  .customer-table{width:100%!important;border-collapse:separate!important;border-spacing:0!important;table-layout:auto!important;}
  .customer-table thead th{height:39px!important;padding:0 11px!important;background:#f8fafc!important;border-bottom:1px solid var(--ui-border)!important;color:#667085!important;font-size:11.5px!important;font-weight:700!important;white-space:nowrap!important;}
  .customer-table thead th button{padding:0!important;background:transparent!important;border:0!important;color:inherit!important;font-size:inherit!important;}
  .customer-table tbody td{height:47px!important;padding:7px 11px!important;border-bottom:1px solid #eef1f5!important;font-size:12.5px!important;vertical-align:middle!important;background:#fff!important;}
  .customer-table tbody tr:not(.customer-inline-detail-row):hover td{background:#f9fbff!important;}
  .customer-table tbody tr.selected td{background:#eef4ff!important;border-bottom-color:#d6e4ff!important;}
  .customer-table tbody tr.selected td:first-child{box-shadow:inset 3px 0 0 var(--ui-blue)!important;}
  .customer-table td:first-child b{font-size:13px!important;color:#101828!important;}
  .customer-table tr.selected td:first-child b{color:var(--ui-blue)!important;}
  .customer-expand-arrow{border:1px solid transparent!important;border-radius:6px!important;}
  tr.selected .customer-expand-arrow{width:24px!important;height:24px!important;border-color:#b2ccff!important;background:#fff!important;}
  .price-type-badge{min-width:42px!important;text-align:center!important;border-radius:999px!important;padding:4px 8px!important;font-size:11px!important;}
  .price-type-badge.retail{background:#fff4e8!important;color:#f26b0a!important;}
  .price-type-badge.wholesale{background:#eef4ff!important;color:#155eef!important;}
  .customer-row-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;flex-wrap:nowrap!important;}
  .customer-row-actions button{height:29px!important;padding:0 10px!important;border-radius:7px!important;font-size:11.5px!important;white-space:nowrap!important;}

  .customer-inline-detail-row>td{background:#fff!important;padding:0!important;border-bottom:0!important;}
  .customer-history-inline{
    display:grid!important;grid-template-columns:minmax(260px,.78fr) minmax(360px,1.05fr) minmax(430px,1.35fr)!important;
    gap:0!important;margin:0!important;padding:0!important;border:1px solid #b2ccff!important;border-radius:0 0 14px 14px!important;
    background:#fff!important;box-shadow:0 10px 22px rgba(21,94,239,.06)!important;overflow:hidden!important;
  }
  .customer-history-inline .customer-history-head{
    grid-column:1/-1!important;margin:0!important;min-height:56px!important;padding:10px 14px!important;
    background:linear-gradient(90deg,#f3f7ff 0%,#fff 62%)!important;border-bottom:1px solid #d6e4ff!important;border-radius:0!important;
  }
  .customer-history-inline .customer-history-head small{font-size:11px!important;color:#667085!important;}
  .customer-history-inline .customer-history-head h3{display:inline-block!important;margin:0 0 0 14px!important;font-size:18px!important;}
  .customer-history-inline .customer-history-head>div:first-child{display:flex!important;align-items:center!important;}
  .customer-history-inline .customer-history-head>div:last-child button{height:32px!important;padding:0 12px!important;border-radius:8px!important;font-size:12px!important;}
  .customer-history-inline .customer-history-head>div:last-child button:first-child{background:#f26b0a!important;border-color:#f26b0a!important;color:#fff!important;}

  .customer-history-inline .customer-history-filter,
  .customer-history-inline .customer-history-summary,
  .customer-history-inline .receivable-history-block,
  .customer-history-inline .daily-shipments{min-width:0!important;}
  .customer-history-inline .customer-history-filter{
    grid-column:1!important;display:grid!important;grid-template-columns:1fr 1fr!important;gap:8px!important;
    margin:0!important;padding:14px!important;border:0!important;border-right:1px solid var(--ui-border)!important;border-radius:0!important;background:#fff!important;
  }
  .customer-history-inline .customer-history-filter:before{content:'기간 조회 및 통계';grid-column:1/-1;font-size:14px;font-weight:800;color:#101828;margin-bottom:2px;}
  .customer-history-inline .customer-history-filter label{font-size:11px!important;color:#667085!important;}
  .customer-history-inline .customer-history-filter input{height:36px!important;border-radius:8px!important;border-color:var(--ui-border)!important;font-size:12px!important;}
  .customer-history-inline .customer-history-summary{
    grid-column:1!important;display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:8px!important;
    margin:0!important;padding:0 14px 14px!important;border-right:1px solid var(--ui-border)!important;background:#fff!important;
  }
  .customer-history-inline .customer-history-summary>div{padding:11px!important;border:1px solid var(--ui-border)!important;border-radius:10px!important;background:#fff!important;}
  .customer-history-inline .customer-history-summary>div:last-child{grid-column:1/-1!important;}
  .customer-history-inline .customer-history-summary small{font-size:11px!important;color:#667085!important;}
  .customer-history-inline .customer-history-summary strong{display:block!important;margin-top:6px!important;font-size:18px!important;}

  .customer-history-inline .receivable-history-block{
    grid-column:2!important;grid-row:2/span 2!important;margin:0!important;height:100%!important;
    border:0!important;border-right:1px solid var(--ui-border)!important;border-radius:0!important;background:#fff!important;
  }
  .customer-history-inline .receivable-history-block>div:first-child{min-height:48px!important;padding:12px 14px!important;background:#fff!important;border-bottom:1px solid var(--ui-border)!important;}
  .customer-history-inline .receivable-history-block>div:first-child b{font-size:14px!important;}
  .customer-history-inline .receivable-history-block>div>div{font-size:12px!important;}
  .customer-history-inline .receivable-history-block button{height:27px!important;font-size:11px!important;}

  .customer-history-inline .daily-shipments{
    grid-column:3!important;grid-row:2/span 2!important;margin:0!important;padding:14px!important;display:grid!important;align-content:start!important;gap:9px!important;background:#fff!important;
  }
  .customer-history-inline .daily-shipments:before{content:'거래 내역 (출고/반품)';font-size:14px;font-weight:800;color:#101828;margin-bottom:1px;}
  .customer-history-inline .daily-shipments article{border:1px solid var(--ui-border)!important;border-left:1px solid var(--ui-border)!important;border-radius:10px!important;box-shadow:none!important;background:#fff!important;}
  .customer-history-inline .daily-shipment-head{padding:9px 10px!important;background:#fff!important;border-bottom:1px solid #f0f2f5!important;}
  .customer-history-inline .daily-items{padding:7px 10px!important;font-size:12px!important;}
  .customer-history-inline .invoice-open-button{height:29px!important;padding:0 9px!important;border-radius:7px!important;}

  @media(max-width:1320px){
    .app>main{padding-left:16px!important;padding-right:16px!important;}
    .customer-history-inline{grid-template-columns:minmax(250px,.82fr) minmax(0,1.18fr)!important;}
    .customer-history-inline .daily-shipments{grid-column:1/-1!important;grid-row:auto!important;border-top:1px solid var(--ui-border)!important;}
  }
  @media(max-width:900px){
    .stats{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
    .toolbar{align-items:stretch!important;flex-direction:column!important;}
    .search{max-width:none!important;width:100%!important;}
    .customer-history-inline{display:block!important;border-radius:0 0 12px 12px!important;}
    .customer-history-inline .customer-history-filter,.customer-history-inline .customer-history-summary,.customer-history-inline .receivable-history-block{border-right:0!important;border-bottom:1px solid var(--ui-border)!important;}
  }
  @media(max-width:560px){
    .app>header{padding:0 12px!important;}
    .app>main{padding:12px!important;}
    .stats{gap:8px!important;}
    .stat{min-height:76px!important;padding:14px!important;}
    .stat strong{font-size:23px!important;}
    .customer-history-inline .customer-history-head{align-items:flex-start!important;}
    .customer-history-inline .customer-history-head>div:last-child{width:100%!important;margin-top:8px!important;}
  }
  .product-cell{display:flex;align-items:center;gap:12px;min-width:210px;}
  .product-thumb{width:56px;height:56px;flex:0 0 56px;border-radius:10px;object-fit:cover;background:#f3f4f6;border:1px solid #e5e7eb;}
  .product-thumb-empty{display:flex;align-items:center;justify-content:center;color:#9ca3af;font-size:10px;text-align:center;line-height:1.2;}
  .product-info{display:flex;flex-direction:column;min-width:0;}
  .product-info b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .image-upload-field{grid-column:1/-1;display:grid;gap:10px;}
  .image-upload-box{display:flex;align-items:center;gap:14px;padding:12px;border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;}
  .image-preview{width:96px;height:96px;flex:0 0 96px;border-radius:12px;object-fit:cover;background:#fff;border:1px solid #e5e7eb;}
  .image-preview-empty{display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:12px;text-align:center;}
  .image-upload-actions{display:flex;flex-direction:column;align-items:flex-start;gap:8px;}
  .image-upload-actions input[type=file]{max-width:100%;font-size:13px;}
  .image-help{font-size:12px;color:#64748b;line-height:1.45;}
  .image-remove{display:flex;align-items:center;gap:6px;font-size:13px;color:#475569;}
  @media(max-width:700px){
    .product-cell{min-width:0;}
    .product-thumb{width:48px;height:48px;flex-basis:48px;}
    .image-upload-box{align-items:flex-start;flex-direction:column;}
  }
  @media print{
    .app>header,.app nav,.stats{display:none!important;}
  }`;
  document.head.appendChild(uiStyle);
}



/* v6.4.2 이미지 시안 기반 전체 UI 최종 통일 */
if(typeof document!=='undefined'&&!document.getElementById('oto-v642-ui-final')){
  const finalUiStyle=document.createElement('style');
  finalUiStyle.id='oto-v642-ui-final';
  finalUiStyle.textContent=`
  :root{
    --oto-blue:#155eef;
    --oto-blue-hover:#004eeb;
    --oto-text:#101828;
    --oto-muted:#667085;
    --oto-line:#e4e7ec;
    --oto-soft:#f8fafc;
    --oto-page:#f7f9fc;
    --oto-white:#ffffff;
    --oto-radius:14px;
    --oto-shadow:0 4px 18px rgba(16,24,40,.045);
  }

  html,body,#root{background:var(--oto-page)!important;color:var(--oto-text)!important;}
  .app{background:var(--oto-page)!important;}

  /* 헤더 */
  .app>header{
    height:76px!important;
    min-height:76px!important;
    padding:0 22px!important;
    border-bottom:1px solid var(--oto-line)!important;
    background:#fff!important;
    box-shadow:none!important;
  }
  .brand{align-items:center!important;gap:11px!important;}
  .brand .header-logo{width:40px!important;height:40px!important;border-radius:11px!important;}
  .brand b{font-size:16px!important;font-weight:800!important;color:var(--oto-text)!important;}
  .brand small{font-size:12px!important;color:var(--oto-muted)!important;}
  .header-actions button{
    height:40px!important;
    padding:0 13px!important;
    border:1px solid var(--oto-line)!important;
    border-radius:10px!important;
    background:#fff!important;
    color:#344054!important;
    box-shadow:none!important;
  }

  /* 전체 폭과 여백 */
  .app>main{
    width:100%!important;
    max-width:none!important;
    margin:0!important;
    padding:16px 22px 28px!important;
  }

  /* 요약 카드 */
  .stats{
    display:grid!important;
    grid-template-columns:repeat(4,minmax(0,1fr))!important;
    gap:14px!important;
    margin:0 0 14px!important;
  }
  .stat{
    min-height:96px!important;
    padding:20px 22px!important;
    border:1px solid var(--oto-line)!important;
    border-radius:14px!important;
    background:#fff!important;
    box-shadow:var(--oto-shadow)!important;
  }
  .stat small{font-size:12px!important;font-weight:700!important;color:var(--oto-muted)!important;}
  .stat strong{margin-top:9px!important;font-size:28px!important;font-weight:800!important;letter-spacing:-.7px!important;}

  /* 상단 탭: 흰색 사각 탭 + 활성 파란 밑줄 */
  .app nav{
    display:flex!important;
    align-items:stretch!important;
    gap:0!important;
    margin:0!important;
    padding:0!important;
    border-bottom:1px solid var(--oto-line)!important;
    background:transparent!important;
    overflow-x:auto!important;
  }
  .app nav button{
    position:relative!important;
    min-width:132px!important;
    height:52px!important;
    padding:0 22px!important;
    margin:0!important;
    display:inline-flex!important;
    align-items:center!important;
    justify-content:center!important;
    gap:9px!important;
    border:1px solid var(--oto-line)!important;
    border-bottom:0!important;
    border-radius:10px 10px 0 0!important;
    background:#fff!important;
    color:#344054!important;
    font-size:15px!important;
    font-weight:700!important;
    box-shadow:none!important;
  }
  .app nav button+button{margin-left:4px!important;}
  .app nav button.active{
    background:#fff!important;
    border-color:var(--oto-line)!important;
    color:var(--oto-blue)!important;
    box-shadow:none!important;
  }
  .app nav button.active:after{
    content:'';
    position:absolute;
    left:-1px;
    right:-1px;
    bottom:-1px;
    height:3px;
    background:var(--oto-blue);
    border-radius:3px 3px 0 0;
  }

  /* 각 탭 전체 패널 */
  .panel,.customer-panel{
    margin-top:0!important;
    border:1px solid var(--oto-line)!important;
    border-top:0!important;
    border-radius:0 0 14px 14px!important;
    background:#fff!important;
    box-shadow:var(--oto-shadow)!important;
    overflow:hidden!important;
  }

  /* 모든 탭 상단 안내 영역 통일 */
  .tab-intro,.movement-entry{
    width:100%!important;
    min-height:96px!important;
    margin:0!important;
    padding:22px 28px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:24px!important;
    border:0!important;
    border-bottom:1px solid var(--oto-line)!important;
    border-radius:0!important;
    background:#fff!important;
    box-shadow:none!important;
    text-align:left!important;
  }
  .tab-intro-text,.movement-entry>div:first-child{
    flex:1 1 auto!important;
    min-width:230px!important;
    text-align:left!important;
  }
  .tab-intro h3,.movement-entry .panel-title,
  .customer-panel .tab-intro h3{
    margin:0 0 6px!important;
    padding:0!important;
    font-size:19px!important;
    line-height:1.3!important;
    font-weight:800!important;
    color:var(--oto-text)!important;
    text-align:left!important;
  }
  .tab-intro p,.movement-entry p,.tab-intro .employee-subtitle{
    margin:0!important;
    padding:0!important;
    font-size:13px!important;
    line-height:1.5!important;
    color:var(--oto-muted)!important;
    text-align:left!important;
  }
  .tab-intro-actions,.movement-entry-controls{
    flex:0 1 52%!important;
    min-width:360px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:flex-end!important;
    gap:12px!important;
  }

  /* 입력창·선택창·버튼 공통 */
  .tab-intro-actions select,.movement-entry-controls select,
  .toolbar select,.toolbar input[type=date]{
    height:42px!important;
    min-height:42px!important;
    padding:0 13px!important;
    border:1px solid var(--oto-line)!important;
    border-radius:9px!important;
    background:#fff!important;
    color:var(--oto-text)!important;
    font-size:13px!important;
    text-align:left!important;
    box-shadow:none!important;
  }
  button.primary{
    min-height:42px!important;
    height:42px!important;
    padding:0 18px!important;
    border:1px solid var(--oto-blue)!important;
    border-radius:9px!important;
    background:var(--oto-blue)!important;
    color:#fff!important;
    font-size:13px!important;
    font-weight:800!important;
    box-shadow:none!important;
  }
  button.primary:hover{background:var(--oto-blue-hover)!important;border-color:var(--oto-blue-hover)!important;}

  /* 검색·필터 줄 */
  .toolbar{
    min-height:72px!important;
    padding:14px 16px!important;
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:14px!important;
    border-bottom:1px solid var(--oto-line)!important;
    background:#fff!important;
  }
  .search{
    width:100%!important;
    max-width:410px!important;
    height:42px!important;
    padding:0 13px!important;
    display:flex!important;
    align-items:center!important;
    gap:9px!important;
    border:1px solid var(--oto-line)!important;
    border-radius:9px!important;
    background:#fff!important;
    box-shadow:none!important;
  }
  .search input{
    width:100%!important;
    height:100%!important;
    border:0!important;
    outline:0!important;
    background:transparent!important;
    font-size:13px!important;
    color:var(--oto-text)!important;
    text-align:left!important;
  }
  .search:focus-within{border-color:#84adff!important;box-shadow:0 0 0 3px #eef4ff!important;}

  /* 재고 기본 표 */
  .table-wrap{padding:0 12px 12px!important;background:#fff!important;overflow-x:auto!important;}
  .table-wrap table{width:100%!important;border-collapse:separate!important;border-spacing:0!important;border:1px solid var(--oto-line)!important;border-radius:10px!important;overflow:hidden!important;}
  .table-wrap thead th{
    height:44px!important;
    padding:0 13px!important;
    background:#f8fafc!important;
    border-bottom:1px solid var(--oto-line)!important;
    color:#344054!important;
    font-size:12px!important;
    font-weight:800!important;
    white-space:nowrap!important;
    text-align:center!important;
  }
  .table-wrap thead th:first-child{text-align:left!important;}
  .table-wrap tbody td{
    height:64px!important;
    padding:8px 13px!important;
    border-bottom:1px solid #eef1f5!important;
    background:#fff!important;
    color:#344054!important;
    font-size:13px!important;
    vertical-align:middle!important;
  }
  .table-wrap tbody tr:last-child td{border-bottom:0!important;}
  .table-wrap tbody tr:hover td{background:#fafcff!important;}
  .table-wrap tbody td:first-child{text-align:left!important;}
  .table-wrap tbody td:not(:first-child){text-align:center!important;}
  .product-cell{gap:12px!important;}
  .product-thumb{width:50px!important;height:50px!important;flex-basis:50px!important;border-radius:8px!important;}
  .product-info b{font-size:14px!important;color:var(--oto-text)!important;text-align:left!important;}
  .product-info small{margin-top:3px!important;font-size:11.5px!important;color:var(--oto-muted)!important;text-align:left!important;}
  .row-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;flex-wrap:nowrap!important;}
  .row-actions button{
    height:31px!important;
    padding:0 10px!important;
    border:1px solid #b2ccff!important;
    border-radius:7px!important;
    background:#fff!important;
    color:var(--oto-blue)!important;
    font-size:11.5px!important;
  }
  .row-actions .danger-button{border-color:#fda29b!important;color:#d92d20!important;}

  /* 거래처·입출고·매출·직원관리의 카드/목록도 동일 톤 */
  .customer-table-wrap,.logs-list,.sales-dashboard,.employee-management{background:#fff!important;}
  .customer-table thead th{height:43px!important;background:#f8fafc!important;color:#344054!important;}
  .customer-table tbody td{height:56px!important;background:#fff!important;}
  .log-card,.daily-shipments article,.employee-card,.sales-card{
    border-color:var(--oto-line)!important;
    border-radius:10px!important;
    box-shadow:none!important;
    background:#fff!important;
  }

  /* v6.4.4 직원관리 탭 제목/설명 글꼴 통일 */
  .employee-panel .tab-intro-text,
  .employee-panel .tab-intro-text *{
    font-family:inherit!important;
    letter-spacing:normal!important;
  }
  .employee-panel .tab-intro .employee-title{
    margin:0 0 6px!important;
    padding:0!important;
    font-family:inherit!important;
    font-size:19px!important;
    line-height:1.3!important;
    font-weight:800!important;
    color:var(--oto-text)!important;
    text-align:left!important;
  }
  .employee-panel .tab-intro .employee-subtitle{
    margin:0!important;
    padding:0!important;
    font-family:inherit!important;
    font-size:13px!important;
    line-height:1.5!important;
    font-weight:400!important;
    color:var(--oto-muted)!important;
    text-align:left!important;
  }

  footer{margin-top:20px!important;color:#98a2b3!important;font-size:12px!important;}

  @media(max-width:1000px){
    .stats{grid-template-columns:repeat(2,minmax(0,1fr))!important;}
    .app nav button{min-width:112px!important;padding:0 15px!important;}
    .tab-intro,.movement-entry{align-items:flex-start!important;}
    .tab-intro-actions,.movement-entry-controls{min-width:300px!important;}
  }
  @media(max-width:760px){
    .app>main{padding:12px!important;}
    .app>header{padding:0 12px!important;}
    .stats{gap:8px!important;}
    .stat{min-height:82px!important;padding:15px!important;}
    .stat strong{font-size:23px!important;}
    .app nav button{min-width:104px!important;height:46px!important;font-size:13px!important;}
    .tab-intro,.movement-entry{display:block!important;min-height:0!important;padding:18px!important;}
    .tab-intro-actions,.movement-entry-controls{width:100%!important;min-width:0!important;margin-top:15px!important;justify-content:flex-start!important;flex-wrap:wrap!important;}
    .tab-intro-actions select,.movement-entry-controls select{width:100%!important;min-width:0!important;flex:1 1 100%!important;}
    .toolbar{align-items:stretch!important;flex-direction:column!important;}
    .search{max-width:none!important;}
    .table-wrap{padding:0 8px 8px!important;}
  }
  @media(max-width:500px){
    .stats{grid-template-columns:1fr 1fr!important;}
    .brand b{font-size:14px!important;}
    .header-actions button span{display:none!important;}
  }
  `;
  document.head.appendChild(finalUiStyle);
}

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

const emptyProduct={name:'',category:'사육장',size:'없음',color:'없음',quantity:0,minimum_quantity:5,wholesale_price:0,retail_price:0,memo:'',image_url:null};
const emptyCustomer={name:'',recipient_name:'',phone:'',postal_code:'',address:'',address_detail:'',courier:'',price_type:'wholesale',memo:''};
const courierOptions=['','CJ대한통운','한진택배','롯데택배','로젠택배','우체국택배','기타'];
const RECEIVABLE_STORAGE_KEY='oto_receivable_entries';

// v6.5 공통 숫자 표시 함수
function formatNumber(value){
  const number=Number(value);
  return (Number.isFinite(number)?number:0).toLocaleString('ko-KR');
}
function formatWon(value){return `${formatNumber(value)}원`}
function formatQty(value){return `${formatNumber(value)}개`}


// v5.4까지 브라우저에 저장된 자료를 Supabase로 옮길 때만 사용합니다.
function readLegacyReceivableEntries(){
  try{
    const parsed=JSON.parse(localStorage.getItem(RECEIVABLE_STORAGE_KEY)||'[]');
    return Array.isArray(parsed)?parsed:[];
  }catch{return []}
}

function normalizeReceivableRow(row){
  return {
    ...row,
    customerId:String(row.customer_id||row.customerId||''),
    customerName:row.customer_name||row.customerName||'',
    type:row.entry_type||row.type||'charge',
    amount:Number(row.amount||0),
    date:row.entry_date||row.date||'',
    method:row.method||'',
    memo:row.memo||'',
    createdAt:row.created_at||row.createdAt||'',
    source:row.source||''
  };
}


function makeInternalSku(form){
  const clean=value=>String(value||'')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9가-힣]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .slice(0,12);

  const name=clean(form.name)||'ITEM';
  const size=clean(form.size)||'NA';
  const color=clean(form.color)||'NA';
  const stamp=Date.now().toString(36).toUpperCase();
  const random=Math.random().toString(36).slice(2,6).toUpperCase();

  return `${name}-${size}-${color}-${stamp}-${random}`.slice(0,80);
}

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
  const [imageViewer,setImageViewer]=useState(null);
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

  async function handleLogout(){
    setLoading(true);
    setError('');
    try{
      const {error}=await supabase.auth.signOut({scope:'local'});
      if(error)throw error;
    }catch(e){
      console.error('logout failed',e);
      setError('로그아웃 처리 중 오류가 발생했습니다. 세션을 초기화합니다.');
    }finally{
      setSession(null);
      setProfile(null);
      setProducts([]);
      setLogs([]);
      setCustomers([]);
      try{
        Object.keys(localStorage).forEach(key=>{
          if(key.startsWith('sb-')||key.includes('supabase'))localStorage.removeItem(key);
        });
        Object.keys(sessionStorage).forEach(key=>{
          if(key.startsWith('sb-')||key.includes('supabase'))sessionStorage.removeItem(key);
        });
      }catch(_e){}
      setLoading(false);
      window.location.replace('/');
    }
  }

  async function deleteStockLog(log){
    if(String(log.id||'').startsWith('temp-')){
      window.alert('방금 등록한 내역을 서버와 동기화하는 중입니다. 잠시 후 다시 시도하세요.');
      return;
    }

    const movementLabel=log.movement_type==='in'?'입고':'출고';
    const stockEffect=log.movement_type==='in'
      ? `재고가 ${Number(log.quantity).toLocaleString()}개 감소합니다.`
      : `재고가 ${Number(log.quantity).toLocaleString()}개 다시 증가합니다.`;

    if(!window.confirm(
      `${movementLabel} 내역을 삭제할까요?\n\n상품: ${log.product_name}\n수량: ${Number(log.quantity).toLocaleString()}개\n${stockEffect}\n\n삭제 후 되돌릴 수 없습니다.`
    ))return;

    setLoading(true);
    setError('');
    try{
      const {data,error}=await supabase.rpc('delete_stock_log_safely',{p_log_id:log.id});
      if(error)throw error;

      const result=Array.isArray(data)?data[0]:data;
      const delta=Number(result?.stock_delta||(
        log.movement_type==='in'?-Number(log.quantity):Number(log.quantity)
      ));

      setLogs(current=>current.filter(item=>item.id!==log.id));
      if(log.product_id){
        setProducts(current=>current.map(product=>
          product.id===log.product_id
            ? {...product,quantity:Number(product.quantity||0)+delta}
            : product
        ));
      }

      setTimeout(()=>loadAll({silent:true}),400);
      if(result?.product_missing){
        window.alert('연결된 상품이 이미 삭제되어 입출고 내역만 삭제했습니다.');
      }else{
        window.alert('입출고 내역이 삭제되고 재고가 원상복구되었습니다.');
      }
    }catch(e){
      const message=normalizeError(e);
      setError(
        message.includes('delete_stock_log_safely')
          ? '입출고 삭제용 Supabase SQL이 아직 적용되지 않았습니다. v2.3 SQL을 먼저 실행하세요.'
          : message
      );
    }finally{
      setLoading(false);
    }
  }

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

  function applyMovementSaved(movement){
    const delta=(movement.type==='in'||movement.type==='return')?Number(movement.quantity):-Number(movement.quantity);
    setProducts(current=>current.map(item=>
      item.id===movement.product_id
        ? {...item,quantity:Number(item.quantity||0)+delta}
        : item
    ));
    setLogs(current=>[{
      id:`temp-${Date.now()}`,
      product_id:movement.product_id,
      product_name:movement.product_name,
      movement_type:movement.type==='return'?'in':movement.type,
      quantity:Number(movement.quantity),
      staff_name:profile.name,
      customer_id:movement.customer_id||null,
      customer_name:movement.customer_name||null,
      recipient_name:movement.recipient_name||null,
      destination:movement.destination||null,
      destination_detail:movement.destination_detail||null,
      courier:movement.courier||null,
      tracking_number:movement.tracking_number||null,
      order_number:movement.order_number||null,
      memo:movement.memo||null,
      created_at:new Date().toISOString()
    },...current]);
    setMoveModal(null);
    setTimeout(()=>loadAll({silent:true}),500);
  }

  const isAdmin=profile?.role==='admin';
  const today=new Date().toLocaleDateString('en-CA');
  const filtered=products.filter(p=>[p.name,p.category,p.size,p.color,p.memo].join(' ').toLowerCase().includes(query.toLowerCase()));

  return <div className="app">
    <header>
      <div className="brand">
        <img className="app-logo header-logo" src="/oto-app-logo.png" alt="OTO"/>
        <div><b>OTO 재고관리</b><small>{profile?.name||'직원'} · {isAdmin?'관리자':'직원'}</small></div>
      </div>
      <div className="header-actions">
        <button className="ghost" onClick={()=>loadAll()} aria-label="새로고침"><RefreshCw size={17}/></button>
        <button className="ghost" onClick={handleLogout} disabled={loading}><LogOut size={17}/><span>로그아웃</span></button>
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
          ['sales',BarChart3,'매출'],
          ...(isAdmin?[['employees',UserCog,'직원관리']]:[])
        ].map(([id,Icon,title])=>
          <button className={tab===id?'active':''} onClick={()=>setTab(id)} key={id}><Icon size={18}/>{title}</button>
        )}
      </nav>

      {tab==='inventory'&&
        <section className="panel">
          <div className="tab-intro">
            <div className="tab-intro-text"><h3>재고 관리</h3><p>상품의 재고 현황을 확인하고 관리할 수 있습니다.</p></div>
            <div className="tab-intro-actions">{isAdmin&&<button className="primary" onClick={()=>setProductModal(emptyProduct)}><Plus size={18}/>상품 등록</button>}</div>
          </div>
          <div className="toolbar">
            <div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="상품명, 사이즈, 색상 검색"/></div>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>상품</th><th>사이즈</th><th>색상</th><th>도매가</th><th>소매가</th><th>재고</th><th>상태</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p=><tr key={p.id}>
                  <td data-label="상품"><div className="product-cell">
                    {p.image_url?<button type="button" className="product-thumb-button" onClick={()=>setImageViewer({url:p.image_url,name:p.name})} title="상품 사진 크게 보기"><img className="product-thumb" src={p.image_url} alt={p.name} loading="lazy"/></button>:<div className="product-thumb product-thumb-empty">사진<br/>없음</div>}
                    <div className="product-info"><b>{p.name}</b><small>{p.category}</small></div>
                  </div></td>
                  <td data-label="사이즈">{p.size||'없음'}</td>
                  <td data-label="색상">{p.color||'없음'}</td>
                  <td data-label="도매가">{formatWon(p.wholesale_price)}</td>
                  <td data-label="소매가">{formatWon(p.retail_price)}</td>
                  <td data-label="재고"><b>{formatNumber(p.quantity)}</b> <small>/ 최소 {formatNumber(p.minimum_quantity)}</small></td>
                  <td data-label="상태"><Badge p={p}/></td>
                  <td data-label="관리"><div className="row-actions">
                    {isAdmin&&<button onClick={()=>setProductModal(p)}>수정</button>}
                    {isAdmin&&<button className="danger-button" onClick={()=>deleteProduct(p)}>삭제</button>}
                  </div></td>
                </tr>)}
                {!filtered.length&&<tr><td colSpan="8"><Empty text={query?'검색 결과가 없습니다.':'등록된 상품이 없습니다.'}/></td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      }

      {tab==='logs'&&<Logs logs={logs} products={products} customers={customers} isAdmin={isAdmin} onMove={setMoveModal} onDelete={deleteStockLog}/>}
      {tab==='customers'&&<Customers customers={customers} products={products} logs={logs} isAdmin={isAdmin} profile={profile} user={session.user} onReturnSaved={applyMovementSaved} onAdd={()=>setCustomerModal(emptyCustomer)} onEdit={setCustomerModal} onDelete={deleteCustomer}/>}
      {tab==='sales'&&<SalesDashboard logs={logs} products={products} customers={customers}/>}
      {tab==='employees'&&isAdmin&&<EmployeeManagement session={session} currentUserId={session.user.id}/>}

      <footer><ShieldCheck size={14}/> 자동 로그인 유지 · 실시간 동기화 · v{APP_VERSION}</footer>
    </main>

    {productModal&&<ProductModal value={productModal} onClose={()=>setProductModal(null)} onSaved={()=>{setProductModal(null);loadAll()}}/>}
    {moveModal&&<MoveModal
      product={moveModal}
      customers={customers}
      profile={profile}
      user={session.user}
      onClose={()=>setMoveModal(null)}
      onSaved={applyMovementSaved}
    />}
    {customerModal&&<CustomerModal value={customerModal} onClose={()=>setCustomerModal(null)} onSaved={()=>{setCustomerModal(null);loadAll()}}/>}
    {imageViewer&&<ImageViewerModal image={imageViewer} onClose={()=>setImageViewer(null)}/>}
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
   <p className="login-guide">
  <span>아이디와 비밀번호로 로그인하세요.</span>
  <span>한 번 로그인하면 로그아웃하기 전까지 자동 로그인됩니다.</span>
</p>
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

function Stat({label,value,danger}){return <div className={'stat '+(danger?'danger':'')}><small>{label}</small><strong>{formatNumber(value)}</strong></div>}
function SalesStat({label,value,suffix='',danger}){
  const number=Number(value);
  const safeValue=Number.isFinite(number)?number:0;
  return <div className={'stat '+(danger?'danger':'')}><small>{label}</small><strong>{formatNumber(safeValue)}{suffix}</strong></div>;
}
function Badge({p}){const q=Number(p.quantity),m=Number(p.minimum_quantity);return <span className={'badge '+(q===0?'out':q<=m?'low':'ok')}>{q===0?'품절':q<=m?'부족':'정상'}</span>}
function Empty({text}){return <div className="empty">{text}</div>}

function ProductModal({value,onClose,onSaved}){
  const [form,setForm]=useState({...value,image_url:value.image_url||null});
  const [imageFile,setImageFile]=useState(null);
  const [imagePreview,setImagePreview]=useState(value.image_url||'');
  const [removeImage,setRemoveImage]=useState(false);
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  useEffect(()=>()=>{
    if(imagePreview&&imagePreview.startsWith('blob:'))URL.revokeObjectURL(imagePreview);
  },[imagePreview]);

  function chooseImage(event){
    const file=event.target.files?.[0];
    if(!file)return;
    if(!file.type.startsWith('image/')){
      setError('이미지 파일만 등록할 수 있습니다.');
      event.target.value='';
      return;
    }
    if(file.size>5*1024*1024){
      setError('사진 용량은 5MB 이하로 선택해주세요.');
      event.target.value='';
      return;
    }
    if(imagePreview&&imagePreview.startsWith('blob:'))URL.revokeObjectURL(imagePreview);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setRemoveImage(false);
    setError('');
  }

  async function uploadProductImage(file){
    const extension=(file.name.split('.').pop()||'jpg').toLowerCase().replace(/[^a-z0-9]/g,'')||'jpg';
    const safeName=`${crypto.randomUUID?.()||Date.now()}-${Date.now()}.${extension}`;
    const path=`products/${safeName}`;
    const upload=await supabase.storage.from('product-images').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
    if(upload.error)throw upload.error;
    const {data}=supabase.storage.from('product-images').getPublicUrl(path);
    if(!data?.publicUrl)throw new Error('업로드한 사진 주소를 만들지 못했습니다.');
    return data.publicUrl;
  }

  async function save(event){
    event.preventDefault();
    if(saving)return;
    setSaving(true);setError('');
    let uploadedImageUrl=form.image_url||null;
    try{
      if(imageFile)uploadedImageUrl=await uploadProductImage(imageFile);
      else if(removeImage)uploadedImageUrl=null;

      const payload={
        name:form.name.trim(),
        category:form.category.trim(),
        size:form.size,
        color:form.color,
        quantity:Number(form.quantity),
        minimum_quantity:Number(form.minimum_quantity),
        wholesale_price:Number(form.wholesale_price||0),
        retail_price:Number(form.retail_price||0),
        memo:form.memo?.trim()||null,
        image_url:uploadedImageUrl,
        updated_at:new Date().toISOString()
      };
      const result=form.id
        ?await supabase.from('products').update(payload).eq('id',form.id)
        :await supabase.from('products').insert({...payload,sku:makeInternalSku(form)});
      if(result.error)throw result.error;
      onSaved();
    }catch(e){
      setError(normalizeError(e));
    }finally{setSaving(false)}
  }
  return <Modal title={form.id?'상품 수정':'상품 등록'} onClose={onClose}>
    <form onSubmit={save} className="form-grid">
      <label className="image-upload-field">
        <span>상품 사진</span>
        <div className="image-upload-box">
          {imagePreview&&!removeImage
            ?<img className="image-preview" src={imagePreview} alt="상품 사진 미리보기"/>
            :<div className="image-preview image-preview-empty">상품 사진<br/>미리보기</div>}
          <div className="image-upload-actions">
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={chooseImage}/>
            <div className="image-help">JPG, PNG, WEBP · 최대 5MB<br/>정사각형 사진을 사용하면 가장 깔끔합니다.</div>
            {(form.image_url||imageFile)&&<label className="image-remove">
              <input type="checkbox" checked={removeImage} onChange={e=>{
                setRemoveImage(e.target.checked);
                if(e.target.checked)setImageFile(null);
                setImagePreview(e.target.checked?'':(form.image_url||''));
              }}/>
              사진 삭제
            </label>}
          </div>
        </div>
      </label>
      <Field label="상품명" value={form.name} set={v=>setForm({...form,name:v})}/>
      <Select label="사이즈" value={form.size} set={v=>setForm({...form,size:v})} options={['없음','소','중','대']}/>
      <Select label="색상" value={form.color} set={v=>setForm({...form,color:v})} options={['없음','투명','검정','기타']}/>
      <Field label="카테고리" value={form.category} set={v=>setForm({...form,category:v})}/>
      <Field label="현재 수량" type="number" value={form.quantity} set={v=>setForm({...form,quantity:v})}/>
      <Field label="최소 수량" type="number" value={form.minimum_quantity} set={v=>setForm({...form,minimum_quantity:v})}/>
      <Field label="도매 단가" type="number" value={form.wholesale_price||0} set={v=>setForm({...form,wholesale_price:v})}/>
      <Field label="소매 단가" type="number" value={form.retail_price||0} set={v=>setForm({...form,retail_price:v})}/>
      <Field label="메모" value={form.memo||''} set={v=>setForm({...form,memo:v})} full/>
      {error&&<div className="error full">{error}</div>}
      <button className="primary full" disabled={saving}>{saving?'저장 중…':'저장'}</button>
    </form>
  </Modal>;
}

function MoveModal({product,customers,profile,user,onClose,onSaved}){
  const [form,setForm]=useState({type:'out',qty:1,customer_id:'',recipient_name:'',phone:'',postal_code:'',address:'',address_detail:'',courier:'',tracking:'',order:'',memo:'',payment_status:'paid',receivable_amount:''});
  const [error,setError]=useState('');
  const [saving,setSaving]=useState(false);

  function pick(id){
    const customer=customers.find(item=>item.id===id);
    const unitPrice=Number(customer?.price_type==='retail'?product.retail_price:product.wholesale_price)||0;
    setForm({...form,customer_id:id,recipient_name:customer?.recipient_name||'',phone:customer?.phone||'',postal_code:customer?.postal_code||'',address:customer?.address||'',address_detail:customer?.address_detail||'',courier:customer?.courier||'',receivable_amount:String(unitPrice*Number(form.qty||0))});
  }

  async function save(event){
    event.preventDefault();
    if(saving)return;
    if(form.type==='out'&&Number(form.qty)>Number(product.quantity)){
      setError('현재 재고보다 많이 출고할 수 없습니다.');
      return;
    }
    if((form.type==='out'||form.type==='return')&&!form.customer_id){
      setError(form.type==='return'?'반품 거래처를 선택하세요.':'출고 거래처를 선택하세요.');
      return;
    }
    setSaving(true);setError('');
    try{
      const isReturn=form.type==='return';
      const storedMemo=isReturn
        ? `[반품]${form.order?` 원주문번호: ${form.order}`:''}${form.memo?` / 사유: ${form.memo}`:''}`
        : (form.memo||null);
      const {error}=await supabase.rpc('process_stock_movement',{
        p_product_id:product.id,
        p_type:isReturn?'in':form.type,
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
        p_memo:storedMemo
      });
      if(error)throw error;
      const selectedCustomer=customers.find(c=>c.id===form.customer_id);
      if(form.type==='out'&&form.payment_status==='credit'){
        const unitPrice=Number(selectedCustomer?.price_type==='retail'?product.retail_price:product.wholesale_price)||0;
        const receivableAmount=Number(form.receivable_amount||unitPrice*Number(form.qty||0));
        if(receivableAmount>0){
          const {error:receivableError}=await supabase.from('receivable_entries').insert({
            customer_id:selectedCustomer.id,
            customer_name:selectedCustomer.name,
            entry_type:'charge',
            amount:receivableAmount,
            entry_date:new Date().toLocaleDateString('en-CA'),
            method:'출고 외상',
            memo:[product.name+` ${Number(form.qty||0).toLocaleString()}개`,form.order?`주문번호 ${form.order}`:'',form.memo||''].filter(Boolean).join(' · '),
            source:'stock_out',
            created_by:user.id
          });
          if(receivableError)throw new Error('출고는 처리되었지만 미수금 저장에 실패했습니다: '+receivableError.message);
        }
      }
      onSaved({
        product_id:product.id,
        product_name:product.name,
        type:form.type,
        quantity:Number(form.qty),
        customer_id:form.customer_id||null,
        customer_name:selectedCustomer?.name||null,
        recipient_name:form.recipient_name||null,
        destination:form.address||null,
        destination_detail:form.address_detail||null,
        courier:form.courier||null,
        tracking_number:form.tracking||null,
        order_number:form.order||null,
        memo:storedMemo
      });
    }catch(e){
      const msg=normalizeError(e);
      setError(msg.includes('process_stock_movement')?'입출고 처리 함수가 없습니다. Supabase SQL 설정을 확인하세요.':msg);
    }finally{setSaving(false)}
  }

  const needsCustomer=form.type==='out'||form.type==='return';

  return <Modal title={`${product.name} 입출고`} onClose={onClose}>
    <form onSubmit={save} className="form-grid">
      <Select label="구분" value={form.type} set={v=>setForm({...form,type:v})} options={['in','out','return']} labels={{in:'입고',out:'출고',return:'반품'}}/>
      <Field label={form.type==='return'?'반품 수량':'수량'} type="number" value={form.qty} set={v=>setForm({...form,qty:v})}/>
      {needsCustomer&&<>
        <Select label={form.type==='return'?'반품 거래처':'거래처'} value={form.customer_id} set={pick} options={['',...customers.map(c=>c.id)]} labels={Object.fromEntries(customers.map(c=>[c.id,c.name]))}/>
        <Field label="받는 사람" value={form.recipient_name} set={v=>setForm({...form,recipient_name:v})}/>
        <Field label="연락처" value={form.phone} set={v=>setForm({...form,phone:v})}/>
        <div className="full address">
          <label>우편번호<input value={form.postal_code} readOnly/></label>
          <label>주소<input value={form.address} readOnly/></label>
          <button type="button" className="ghost" onClick={()=>postcode(data=>setForm({...form,postal_code:data.zonecode,address:data.roadAddress||data.jibunAddress}))}><MapPin size={17}/>주소검색</button>
        </div>
        <Field label="상세주소" value={form.address_detail} set={v=>setForm({...form,address_detail:v})} full/>
        {form.type==='out'&&<>
          <Select label="택배사" value={form.courier} set={v=>setForm({...form,courier:v})} options={courierOptions}/>
          <Field label="송장번호" value={form.tracking} set={v=>setForm({...form,tracking:v})}/>
          <Select label="결제상태" value={form.payment_status} set={v=>{
            const customer=customers.find(item=>item.id===form.customer_id);
            const unitPrice=Number(customer?.price_type==='retail'?product.retail_price:product.wholesale_price)||0;
            setForm({...form,payment_status:v,receivable_amount:v==='credit'?String(unitPrice*Number(form.qty||0)):form.receivable_amount});
          }} options={['paid','credit']} labels={{paid:'결제완료',credit:'외상(미수)'}}/>
          {form.payment_status==='credit'&&<Field label="등록할 미수금액" type="number" value={form.receivable_amount} set={v=>setForm({...form,receivable_amount:v})}/>} 
        </>}
        <Field label={form.type==='return'?'원주문번호':'주문번호'} value={form.order} set={v=>setForm({...form,order:v})}/>
      </>}
      <Field label={form.type==='return'?'반품 사유':'메모'} value={form.memo} set={v=>setForm({...form,memo:v})} full/>
      {error&&<div className="error full">{error}</div>}
      <button className="primary full" disabled={saving}>{saving?'처리 중…':form.type==='return'?'반품 처리':'처리'}</button>
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
      const payload={name:form.name.trim(),recipient_name:form.recipient_name?.trim()||null,phone:form.phone?.trim()||null,postal_code:form.postal_code||null,address:form.address||null,address_detail:form.address_detail?.trim()||null,courier:form.courier||null,price_type:form.price_type||'wholesale',memo:form.memo?.trim()||null};
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
      <Select label="기본 단가 구분" value={form.price_type||'wholesale'} set={v=>setForm({...form,price_type:v})} options={['wholesale','retail']} labels={{wholesale:'도매가',retail:'소매가'}}/>
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

function SalesDashboard({logs,products,customers}){
  const currentMonth=new Date().toLocaleDateString('en-CA').slice(0,7);
  const [month,setMonth]=useState(currentMonth);
  const [invoiceData,setInvoiceData]=useState(null);

  const report=useMemo(()=>{
    const productMap=new Map(products.map(product=>[String(product.id),product]));
    const customerMap=new Map(customers.map(customer=>[String(customer.id),customer]));
    const rows=[];

    logs.forEach(log=>{
      const date=new Date(log.created_at);
      if(Number.isNaN(date.getTime()))return;
      const logMonth=date.toLocaleDateString('en-CA').slice(0,7);
      if(logMonth!==month)return;

      const isReturn=log.movement_type==='in'&&String(log.memo||'').startsWith('[반품]');
      const isSale=log.movement_type==='out';
      if(!isSale&&!isReturn)return;

      const product=productMap.get(String(log.product_id||''))||products.find(item=>String(log.product_name||'').startsWith(item.name));
      const customer=customerMap.get(String(log.customer_id||''))||customers.find(item=>item.name===log.customer_name);
      const priceType=customer?.price_type||'wholesale';
      const fallbackPrice=Number(priceType==='retail'?product?.retail_price:product?.wholesale_price)||0;
      const unitPrice=Number(log.unit_price||fallbackPrice)||0;
      const quantity=Number(log.quantity||0);
      const amount=quantity*unitPrice;

      rows.push({
        id:log.id,
        date:date.toLocaleDateString('en-CA'),
        customer:customer?.name||log.customer_name||'거래처 미지정',
        customerId:customer?.id||log.customer_id||null,
        customerRecord:customer||null,
        product:log.product_name||product?.name||'',
        quantity,
        unitPrice,
        amount,
        isReturn,
        sourceLog:log
      });
    });

    const gross=rows.filter(row=>!row.isReturn).reduce((sum,row)=>sum+row.amount,0);
    const returns=rows.filter(row=>row.isReturn).reduce((sum,row)=>sum+row.amount,0);
    const byCustomer={};
    rows.forEach(row=>{
      if(!byCustomer[row.customer])byCustomer[row.customer]={customer:row.customer,gross:0,returns:0,net:0};
      if(row.isReturn)byCustomer[row.customer].returns+=row.amount;
      else byCustomer[row.customer].gross+=row.amount;
      byCustomer[row.customer].net=byCustomer[row.customer].gross-byCustomer[row.customer].returns;
    });

    return {
      rows:rows.sort((a,b)=>b.date.localeCompare(a.date)),
      gross,
      returns,
      net:gross-returns,
      byCustomer:Object.values(byCustomer).sort((a,b)=>b.net-a.net)
    };
  },[logs,products,customers,month]);

  function download(){
    const data=[
      ['날짜','구분','거래처','품목','수량','단가','금액'],
      ...report.rows.map(row=>[row.date,row.isReturn?'반품':'출고',row.customer,row.product,row.isReturn?-row.quantity:row.quantity,row.unitPrice,row.isReturn?-row.amount:row.amount])
    ];
    downloadCsv(data,`${month}_월별매출.csv`);
  }

  function openInvoice(row){
    const customer=row.customerRecord||customers.find(item=>String(item.id)===String(row.customerId)||item.name===row.customer);
    if(!customer){alert('거래처 정보를 찾을 수 없어 명세표를 열 수 없습니다.');return}

    // 같은 날짜·같은 거래처의 동일 구분(출고 또는 반품) 품목만 한 장으로 묶습니다.
    // 반품 명세표는 InvoiceModal에서 수량과 금액이 음수로 표시됩니다.
    const sameDayLogs=report.rows
      .filter(item=>item.isReturn===row.isReturn&&item.date===row.date&&item.customer===row.customer)
      .map(item=>item.sourceLog)
      .filter(Boolean);

    setInvoiceData({customer,logs:sameDayLogs,isReturn:row.isReturn});
  }

  return <><section className="panel">
    <div className="tab-intro">
      <div className="tab-intro-text"><h3>월별 매출 현황</h3><p>출고매출에서 반품금액을 차감한 순매출입니다.</p></div>
      <div className="tab-intro-actions">
        <input type="month" value={month} onChange={event=>setMonth(event.target.value)} style={{minHeight:42,padding:'0 12px',border:'1px solid #d0d5dd',borderRadius:10}}/>
        <button className="ghost" onClick={download}><Download size={17}/>엑셀 저장</button>
      </div>
    </div>

    <div className="stats" style={{marginTop:18}}>
      <SalesStat label="출고 매출" value={report.gross} suffix="원"/>
      <SalesStat label="반품 금액" value={report.returns} suffix="원" danger={report.returns>0}/>
      <SalesStat label="순매출" value={report.net} suffix="원"/>
      <SalesStat label="거래 건수" value={report.rows.length} suffix="건"/>
    </div>

    <div className="table-wrap" style={{marginTop:18}}>
      <table>
        <thead><tr><th>거래처</th><th>출고매출</th><th>반품액</th><th>순매출</th></tr></thead>
        <tbody>
          {report.byCustomer.map(row=><tr key={row.customer}>
            <td data-label="거래처"><b>{row.customer}</b></td>
            <td data-label="출고매출">{row.gross.toLocaleString()}원</td>
            <td data-label="반품액">{row.returns?`-${row.returns.toLocaleString()}원`:'0원'}</td>
            <td data-label="순매출"><b>{row.net.toLocaleString()}원</b></td>
          </tr>)}
          {!report.byCustomer.length&&<tr><td colSpan="4"><Empty text="선택한 달의 매출내역이 없습니다."/></td></tr>}
        </tbody>
      </table>
    </div>

    <div className="table-wrap" style={{marginTop:22}}>
      <table>
        <thead><tr><th>날짜</th><th>구분</th><th>거래처</th><th>품목</th><th>수량</th><th>단가</th><th>금액</th><th>명세표</th></tr></thead>
        <tbody>
          {report.rows.map(row=><tr key={row.id}>
            <td data-label="날짜">{row.date}</td>
            <td data-label="구분"><b style={{color:row.isReturn?'#d92d20':'inherit'}}>{row.isReturn?'반품':'출고'}</b></td>
            <td data-label="거래처">{row.customer}</td>
            <td data-label="품목">{row.product}</td>
            <td data-label="수량">{row.isReturn?'-':''}{row.quantity.toLocaleString()}개</td>
            <td data-label="단가">{row.unitPrice.toLocaleString()}원</td>
            <td data-label="금액"><b>{row.isReturn?'-':''}{row.amount.toLocaleString()}원</b></td>
            <td data-label="명세표"><button type="button" className="ghost" onClick={()=>openInvoice(row)} style={{padding:'7px 10px',fontSize:12,whiteSpace:'nowrap',color:row.isReturn?'#d92d20':undefined,borderColor:row.isReturn?'#fecdca':undefined}}><Printer size={14}/>{row.isReturn?'반품 명세표':'명세표'}</button></td>
          </tr>)}
          {!report.rows.length&&<tr><td colSpan="8"><Empty text="선택한 달의 상세 거래내역이 없습니다."/></td></tr>}
        </tbody>
      </table>
    </div>

    <p style={{margin:'14px 2px 0',fontSize:12,color:'#667085'}}>
      과거 기록에 저장 단가가 없는 경우 현재 상품 단가와 거래처의 도매·소매 설정을 기준으로 계산됩니다.
    </p>
  </section>
  {invoiceData&&<InvoiceModal customer={invoiceData.customer} products={products} logs={invoiceData.logs} onClose={()=>setInvoiceData(null)}/>} 
  </>;
}

function ReturnFromLogModal({log,customer,product,alreadyReturned,profile,user,onClose,onSaved}){
  const originalQty=Number(log.quantity||0);
  const remaining=Math.max(0,originalQty-Number(alreadyReturned||0));
  const [qty,setQty]=useState(remaining>0?1:0);
  const [memo,setMemo]=useState('');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');

  async function save(event){
    event.preventDefault();
    if(saving)return;
    const amount=Number(qty);
    if(!product?.id){setError('연결된 상품을 찾을 수 없어 반품할 수 없습니다.');return;}
    if(!Number.isFinite(amount)||amount<=0){setError('반품 수량을 1개 이상 입력하세요.');return;}
    if(amount>remaining){setError(`반품 가능한 수량은 최대 ${remaining.toLocaleString()}개입니다.`);return;}
    setSaving(true);setError('');
    try{
      const storedMemo=`[반품] 원출고ID: ${log.id}${log.order_number?` / 원주문번호: ${log.order_number}`:''}${memo.trim()?` / 사유: ${memo.trim()}`:''}`;
      const {error}=await supabase.rpc('process_stock_movement',{
        p_product_id:product.id,
        p_type:'in',
        p_quantity:amount,
        p_user_id:user.id,
        p_staff_name:profile.name,
        p_customer_id:customer.id,
        p_customer_name:customer.name,
        p_recipient_name:log.recipient_name||customer.recipient_name||null,
        p_destination:log.destination||customer.address||null,
        p_destination_postal_code:customer.postal_code||null,
        p_destination_detail:log.destination_detail||customer.address_detail||null,
        p_recipient_phone:customer.phone||null,
        p_courier:null,
        p_tracking_number:null,
        p_order_number:log.order_number||null,
        p_memo:storedMemo
      });
      if(error)throw error;
      onSaved({
        product_id:product.id,
        product_name:log.product_name||product.name,
        type:'return',
        quantity:amount,
        customer_id:customer.id,
        customer_name:customer.name,
        recipient_name:log.recipient_name||customer.recipient_name||null,
        destination:log.destination||customer.address||null,
        destination_detail:log.destination_detail||customer.address_detail||null,
        order_number:log.order_number||null,
        memo:storedMemo
      });
      onClose();
    }catch(e){
      const message=normalizeError(e);
      setError(message.includes('process_stock_movement')?'반품 처리 함수가 없습니다. Supabase SQL 설정을 확인하세요.':message);
    }finally{setSaving(false)}
  }

  return <Modal title="출고상품 반품 처리" onClose={onClose}>
    <form className="form-grid" onSubmit={save}>
      <div className="full" style={{padding:14,border:'1px solid #e4e7ec',borderRadius:12,background:'#f9fafb'}}>
        <b style={{display:'block',marginBottom:6}}>{log.product_name}</b>
        <small style={{display:'block',color:'#667085'}}>출고일 {new Date(log.created_at).toLocaleDateString('ko-KR')} · 출고 {originalQty.toLocaleString()}개 · 기존 반품 {Number(alreadyReturned||0).toLocaleString()}개</small>
        <strong style={{display:'block',marginTop:8,color:remaining?'#175cd3':'#d92d20'}}>반품 가능 {remaining.toLocaleString()}개</strong>
      </div>
      <Field label="반품 수량" type="number" value={qty} set={setQty}/>
      <Field label="반품 사유 (선택)" value={memo} set={setMemo}/>
      {error&&<div className="error full">{error}</div>}
      <button className="primary full" disabled={saving||remaining<=0}>{saving?'반품 처리 중…':remaining>0?'반품 처리':'전량 반품 완료'}</button>
    </form>
  </Modal>;
}


function ReceivableModal({customer,mode,user,onClose,onSaved,initialAmount='',initialMemo='',source='manual'}){
  const [amount,setAmount]=useState(String(initialAmount||''));
  const [date,setDate]=useState(new Date().toLocaleDateString('en-CA'));
  const [method,setMethod]=useState(mode==='payment'?'계좌이체':'외상');
  const [memo,setMemo]=useState(initialMemo||'');
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');

  async function save(){
    const value=Number(String(amount).replace(/,/g,''));
    if(!Number.isFinite(value)||value<=0){setError('금액을 올바르게 입력해주세요.');return}
    if(!date){setError('처리일을 선택해주세요.');return}
    setSaving(true);setError('');
    try{
      await onSaved({
        customer_id:customer.id,
        customer_name:customer.name,
        entry_type:mode,
        amount:value,
        entry_date:date,
        method,
        memo:memo.trim()||null,
        source,
        created_by:user?.id||null
      });
    }catch(e){setError(normalizeError(e))}finally{setSaving(false)}
  }

  const modal=<div className="modal-backdrop" style={{zIndex:2147483647,position:'fixed',inset:0}} onMouseDown={e=>e.target===e.currentTarget&&onClose()}>
    <div className="modal-card" style={{maxWidth:440,position:'relative',zIndex:2147483647}} onMouseDown={e=>e.stopPropagation()}>
      <div className="modal-head"><div><small>{customer.name}</small><h3>{mode==='charge'?'미수금 등록':'입금 처리'}</h3></div><button type="button" onClick={onClose}>×</button></div>
      <div className="form-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
        <Field label="처리일" type="date" value={date} set={setDate}/>
        <Select label={mode==='charge'?'구분':'입금수단'} value={method} set={setMethod} options={mode==='charge'?['외상','추가 미수','기타']:['계좌이체','현금','카드','기타']}/>
        <div style={{gridColumn:'1 / -1'}}><Field label={mode==='charge'?'미수금액':'입금금액'} type="number" value={amount} set={setAmount}/></div>
        <div style={{gridColumn:'1 / -1'}}><Field label="메모" value={memo} set={setMemo}/></div>
        {error&&<div className="error" style={{gridColumn:'1 / -1'}}>{error}</div>}
      </div>
      <div className="modal-actions"><button type="button" onClick={onClose} disabled={saving}>취소</button><button type="button" className="primary" onClick={save} disabled={saving}>{saving?'저장 중…':mode==='charge'?'미수금 등록':'입금 처리'}</button></div>
    </div>
  </div>;
  return typeof document!=='undefined'?createPortal(modal,document.body):modal;
}

function Customers({customers,products,logs,isAdmin,profile,user,onReturnSaved,onAdd,onEdit,onDelete}){
  const [query,setQuery]=useState('');
  const [selectedId,setSelectedId]=useState('');
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [sort,setSort]=useState({key:'name',direction:'asc'});
  const [invoiceLogs,setInvoiceLogs]=useState(null);
  const [returnLog,setReturnLog]=useState(null);
  const [receivableModal,setReceivableModal]=useState(null);
  const [selectedPaymentKeys,setSelectedPaymentKeys]=useState([]);
  const [receivableEntries,setReceivableEntries]=useState([]);
  const [receivableLoading,setReceivableLoading]=useState(false);
  const [receivableError,setReceivableError]=useState('');
  const [legacyCount,setLegacyCount]=useState(()=>readLegacyReceivableEntries().length);
  const [detailCustomer,setDetailCustomer]=useState(null);

  async function loadReceivables({silent=false}={}){
    if(!silent)setReceivableLoading(true);
    setReceivableError('');
    try{
      const {data,error}=await supabase.from('receivable_entries').select('*').order('entry_date',{ascending:false}).order('created_at',{ascending:false});
      if(error)throw error;
      setReceivableEntries((data||[]).map(normalizeReceivableRow));
    }catch(e){setReceivableError(normalizeError(e))}finally{if(!silent)setReceivableLoading(false)}
  }

  useEffect(()=>{
    loadReceivables();
    const channel=supabase.channel(`oto-receivables-${user?.id||'user'}`)
      .on('postgres_changes',{event:'*',schema:'public',table:'receivable_entries'},()=>loadReceivables({silent:true}))
      .subscribe();
    return()=>{supabase.removeChannel(channel)};
  },[user?.id]);

  const isReturnLog=log=>log.movement_type==='in'&&String(log.memo||'').startsWith('[반품]');
  const returnedForLog=log=>logs
    .filter(item=>isReturnLog(item)&&String(item.memo||'').includes(`원출고ID: ${log.id}`))
    .reduce((sum,item)=>sum+Number(item.quantity||0),0);

  function matchedProductForLog(log){
    return products.find(product=>String(product.id)===String(log.product_id))
      ||products.find(product=>String(log.product_name||'').startsWith(product.name));
  }

  async function saveReceivableEntry(entry){
    const {data,error}=await supabase.from('receivable_entries').insert(entry).select('*').single();
    if(error)throw error;
    setReceivableEntries(current=>[normalizeReceivableRow(data),...current]);
    setReceivableModal(null);
    setSelectedPaymentKeys([]);
  }

  async function deleteReceivableEntry(entry){
    if(!window.confirm('이 미수금 내역을 삭제할까요?'))return;
    const {error}=await supabase.from('receivable_entries').delete().eq('id',entry.id);
    if(error){alert('삭제 실패: '+normalizeError(error));return}
    setReceivableEntries(current=>current.filter(item=>item.id!==entry.id));
  }

  async function migrateLegacyReceivables(){
    const legacy=readLegacyReceivableEntries();
    if(!legacy.length)return;
    if(!window.confirm(`이 브라우저에 저장된 미수금·입금 ${legacy.length}건을 Supabase로 옮길까요?`))return;
    const payload=legacy.map(entry=>({
      customer_id:entry.customerId||entry.customer_id,
      customer_name:entry.customerName||entry.customer_name||'',
      entry_type:entry.type==='payment'?'payment':'charge',
      amount:Number(entry.amount||0),
      entry_date:entry.date||new Date().toLocaleDateString('en-CA'),
      method:entry.method||'',
      memo:entry.memo||null,
      source:entry.source||'legacy_local',
      created_by:user?.id||null,
      created_at:entry.createdAt||new Date().toISOString()
    })).filter(entry=>entry.customer_id&&entry.amount>0);
    if(!payload.length){alert('옮길 수 있는 정상 자료가 없습니다.');return}
    const {error}=await supabase.from('receivable_entries').insert(payload);
    if(error){alert('자료 이전 실패: '+normalizeError(error));return}
    localStorage.removeItem(RECEIVABLE_STORAGE_KEY);
    setLegacyCount(0);
    await loadReceivables();
    alert(`${payload.length}건을 Supabase로 옮겼습니다.`);
  }

  const receivableBalanceByCustomer=useMemo(()=>{
    const result={};
    receivableEntries.forEach(entry=>{
      const key=String(entry.customerId||'');
      result[key]=(result[key]||0)+(entry.type==='payment'?-1:1)*Number(entry.amount||0);
    });
    return result;
  },[receivableEntries]);

  const customerStats=useMemo(()=>{
    const stats={};
    customers.forEach(c=>{stats[c.id]={totalOut:0,lastOut:''}});
    logs.forEach(log=>{
      if(log.movement_type!=='out'&&!isReturnLog(log))return;
      const customer=customers.find(c=>log.customer_id===c.id||(!log.customer_id&&log.customer_name===c.name));
      if(!customer)return;
      if(!stats[customer.id])stats[customer.id]={totalOut:0,lastOut:''};
      stats[customer.id].totalOut+=(isReturnLog(log)?-1:1)*Number(log.quantity||0);
      const date=log.created_at||'';
      if(date>stats[customer.id].lastOut)stats[customer.id].lastOut=date;
    });
    return stats;
  },[customers,logs]);

  const rows=useMemo(()=>{
    const filtered=customers.filter(c=>[c.name,c.recipient_name,c.phone,c.address,c.address_detail].join(' ').toLowerCase().includes(query.toLowerCase()));
    return [...filtered].sort((a,b)=>{
      const aStats=customerStats[a.id]||{totalOut:0,lastOut:''};
      const bStats=customerStats[b.id]||{totalOut:0,lastOut:''};
      let av='',bv='';
      if(sort.key==='totalOut'){av=aStats.totalOut;bv=bStats.totalOut}
      else if(sort.key==='lastOut'){av=aStats.lastOut||'';bv=bStats.lastOut||''}
      else{av=(a[sort.key]||'').toString();bv=(b[sort.key]||'').toString()}
      const result=typeof av==='number'?av-bv:av.localeCompare(bv,'ko',{numeric:true,sensitivity:'base'});
      return sort.direction==='asc'?result:-result;
    });
  },[customers,query,sort,customerStats]);

  function changeSort(key){setSort(current=>current.key===key?{key,direction:current.direction==='asc'?'desc':'asc'}:{key,direction:'asc'})}
  function sortMark(key){if(sort.key!==key)return '↕';return sort.direction==='asc'?'▲':'▼'}

  function selectCustomer(customerId){
    setSelectedPaymentKeys([]);
    setSelectedId(current=>String(current)===String(customerId)?'':customerId);
  }

  const selected=customers.find(c=>c.id===selectedId)||null;
  const selectedReceivableEntries=useMemo(()=>{
    if(!selected)return [];
    return receivableEntries
      .filter(entry=>String(entry.customerId)===String(selected.id))
      .sort((a,b)=>String(b.date||'').localeCompare(String(a.date||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')));
  },[receivableEntries,selected]);
  const selectedReceivableBalance=selectedReceivableEntries.reduce((sum,entry)=>sum+(entry.type==='payment'?-1:1)*Number(entry.amount||0),0);

  const customerLogs=useMemo(()=>{
    if(!selected)return [];
    return logs.filter(log=>{
      if(log.movement_type!=='out'&&!isReturnLog(log))return false;
      const matchesCustomer=log.customer_id===selected.id||(!log.customer_id&&log.customer_name===selected.name);
      if(!matchesCustomer)return false;
      const date=new Date(log.created_at).toLocaleDateString('en-CA');
      return (!from||date>=from)&&(!to||date<=to);
    });
  },[logs,selected,from,to]);

  const transactionGroups=useMemo(()=>{
    const groups={};
    customerLogs.forEach(log=>{
      const date=new Date(log.created_at).toLocaleDateString('en-CA');
      const returned=isReturnLog(log);
      // 같은 거래처의 같은 날짜 출고 상품은 주문번호와 관계없이 한 명세표로 묶습니다.
      // 반품은 출고와 합쳐지지 않도록 별도 그룹으로 유지합니다.
      const key=`${returned?'return':'out'}|${date}`;
      if(!groups[key])groups[key]={key,date,returned,logs:[],total:0,orders:new Set()};
      groups[key].logs.push(log);
      groups[key].total+=Number(log.quantity||0);
      const order=String(log.order_number||'').trim();
      if(order)groups[key].orders.add(order);
    });
    return Object.values(groups)
      .map(group=>({...group,orderNumbers:[...group.orders]}))
      .sort((a,b)=>b.date.localeCompare(a.date));
  },[customerLogs]);

  function transactionGroupAmount(group){
    if(!selected||group.returned)return 0;
    return group.logs.reduce((sum,log)=>{
      const product=matchedProductForLog(log);
      const defaultPrice=Number(selected.price_type==='retail'?product?.retail_price:product?.wholesale_price)||0;
      const unitPrice=Number(log.unit_price||defaultPrice)||0;
      const remaining=Math.max(0,Number(log.quantity||0)-returnedForLog(log));
      return sum+(unitPrice*remaining);
    },0);
  }

  const selectedPaymentGroups=transactionGroups.filter(group=>!group.returned&&selectedPaymentKeys.includes(group.key));
  const selectedPaymentAmount=selectedPaymentGroups.reduce((sum,group)=>sum+transactionGroupAmount(group),0);
  const selectedPaymentMemo=selectedPaymentGroups.map(group=>{
    const orderText=group.orderNumbers.length?`주문번호 ${group.orderNumbers.join(', ')}`:'주문번호 없음';
    return `${group.date} ${orderText}`;
  }).join(' / ');

  function togglePaymentGroup(groupKey){
    setSelectedPaymentKeys(current=>current.includes(groupKey)?current.filter(key=>key!==groupKey):[...current,groupKey]);
  }

  function openSelectedPayment(event){
    event?.preventDefault?.();
    event?.stopPropagation?.();

    // 클릭하는 순간의 최신 체크 상태를 기준으로 다시 계산합니다.
    const groups=transactionGroups.filter(group=>
      !group.returned&&selectedPaymentKeys.includes(group.key)
    );
    if(!groups.length){
      window.alert('입금 처리할 출고 거래를 먼저 선택해주세요.');
      return;
    }

    const amount=groups.reduce((sum,group)=>sum+transactionGroupAmount(group),0);
    if(!Number.isFinite(amount)||amount<=0){
      window.alert('선택한 거래의 금액을 계산할 수 없습니다. 상품 단가를 확인해주세요.');
      return;
    }

    const memo=groups.map(group=>{
      const orderText=group.orderNumbers.length
        ?`주문번호 ${group.orderNumbers.join(', ')}`
        :'주문번호 없음';
      return `${group.date} ${orderText}`;
    }).join(' / ');

    setReceivableModal({
      mode:'payment',
      amount:String(amount),
      memo:`선택 거래 입금 · ${memo}`,
      source:'selected_transactions'
    });
  }

  function exportCustomerCsv(){
    if(!selected)return;
    const data=[['처리일','구분','주문번호','거래처','품목','수량'],...transactionGroups.flatMap(group=>group.logs.map(log=>[new Date(log.created_at).toLocaleDateString('en-CA'),group.returned?'반품':'출고',log.order_number||'',selected.name,log.product_name,group.returned?-Number(log.quantity||0):Number(log.quantity||0)]))];
    downloadCsv(data,`${selected.name}_거래내역_${new Date().toISOString().slice(0,10)}.csv`);
  }

  const customerHistoryPanel=selected?<div className="customer-history customer-history-inline">
    <div className="customer-history-head"><div><small>거래처 거래현황</small><h3>{selected.name}</h3></div><div style={{display:'flex',alignItems:'center',gap:6}}><button className="ghost" onClick={()=>setReceivableModal({mode:'charge',customer:selected})}>미수금 등록</button><button className="primary" onClick={()=>setReceivableModal({mode:'payment',customer:selected})}>입금처리</button><button onClick={()=>setSelectedId('')} aria-label="닫기">×</button></div></div>
          <div className="customer-history-filter"><label>시작일<input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label><label>종료일<input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label><div className="customer-history-buttons"><button onClick={exportCustomerCsv}><Download size={16}/>CSV</button></div></div>
          <div className="customer-history-summary"><div><small>거래 건수</small><strong>{transactionGroups.length.toLocaleString()}건</strong></div><div><small>순 출고수량</small><strong>{customerLogs.reduce((s,l)=>s+(isReturnLog(l)?-1:1)*Number(l.quantity||0),0).toLocaleString()}개</strong></div><div><small>품목수</small><strong>{new Set(customerLogs.map(l=>l.product_name)).size.toLocaleString()}종</strong></div><div><small>미수잔액</small><strong style={{color:selectedReceivableBalance>0?'#d92d20':'inherit'}}>{Math.max(0,selectedReceivableBalance).toLocaleString()}원</strong></div></div>
          <div className="receivable-history-block" style={{margin:'14px 0',border:'1px solid #e5e7eb',borderRadius:12,overflow:'hidden'}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 14px',background:'#f8fafc'}}><b>미수금·입금 내역</b><strong>잔액 {Math.max(0,selectedReceivableBalance).toLocaleString()}원</strong></div>{selectedReceivableEntries.length?<div>{selectedReceivableEntries.map(entry=><div key={entry.id} style={{display:'grid',gridTemplateColumns:'92px 70px 1fr auto auto',gap:8,alignItems:'center',padding:'10px 14px',borderTop:'1px solid #eef0f3',fontSize:13}}><span>{entry.date}</span><b style={{color:entry.type==='payment'?'#1570ef':'#d92d20'}}>{entry.type==='payment'?'입금':'미수'}</b><span>{entry.method}{entry.memo?` · ${entry.memo}`:''}</span><strong>{entry.type==='payment'?'-':'+'}{Number(entry.amount||0).toLocaleString()}원</strong><button className="ghost" onClick={()=>deleteReceivableEntry(entry)}>삭제</button></div>)}</div>:<div style={{padding:16,color:'#667085',textAlign:'center'}}>등록된 미수금 내역이 없습니다.</div>}</div>
          <div className="daily-shipments">
            {selectedPaymentGroups.length>0&&<div className="selected-payment-bar"><div><b>선택한 거래 {selectedPaymentGroups.length}건</b><div><strong>{selectedPaymentAmount.toLocaleString()}원</strong> 입금 처리 예정</div></div><button
              type="button"
              className="primary selected-payment-button"
              onMouseDown={e=>{
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={e=>{
                e.preventDefault();
                e.stopPropagation();
                const currentGroups=transactionGroups.filter(group=>!group.returned&&selectedPaymentKeys.includes(group.key));
                const currentAmount=currentGroups.reduce((sum,group)=>sum+transactionGroupAmount(group),0);
                if(!currentGroups.length){
                  window.alert('입금 처리할 출고 거래를 먼저 선택해주세요.');
                  return;
                }
                if(!Number.isFinite(currentAmount)||currentAmount<=0){
                  window.alert('선택한 거래의 금액을 계산할 수 없습니다. 상품 단가를 확인해주세요.');
                  return;
                }
                const currentMemo=currentGroups.map(group=>{
                  const orderText=group.orderNumbers.length?`주문번호 ${group.orderNumbers.join(', ')}`:'주문번호 없음';
                  return `${group.date} ${orderText}`;
                }).join(' / ');
                setReceivableModal({
                  mode:'payment',
                  amount:String(currentAmount),
                  memo:`선택 거래 입금 · ${currentMemo}`,
                  source:'selected_transactions',
                  customer:selected
                });
              }}
            >선택 입금처리</button></div>}
            {transactionGroups.map(group=>{const groupAmount=transactionGroupAmount(group);const isSelected=selectedPaymentKeys.includes(group.key);return <article key={group.key} className={isSelected?'transaction-selected':''} style={{borderLeft:group.returned?'4px solid #d92d20':'4px solid transparent'}}><div className="daily-shipment-head"><div style={{display:'flex',alignItems:'center',gap:9}}>{!group.returned&&<label className="transaction-select-box" title="이 거래를 입금처리 대상으로 선택"><input type="checkbox" checked={isSelected} onChange={()=>togglePaymentGroup(group.key)}/></label>}<div><b>{new Date(group.date+'T00:00:00').toLocaleDateString('ko-KR')}</b><small style={{display:'block',marginTop:4}}>{group.returned?'반품':'출고'} · {group.orderNumbers.length?`주문번호 ${group.orderNumbers.join(', ')}`:'주문번호 없음'}</small>{!group.returned&&<small style={{display:'block',marginTop:3,color:'#475467'}}>거래금액 {groupAmount.toLocaleString()}원</small>}</div></div><div style={{display:'flex',alignItems:'center',gap:8}}><strong>{group.returned?'-':''}{group.total.toLocaleString()}개</strong><button className="invoice-open-button" onClick={()=>setInvoiceLogs(group.logs)}><Printer size={15}/>명세표</button></div></div><div className="daily-items">{group.logs.map(log=>{const returnedQty=group.returned?0:returnedForLog(log);const remaining=Math.max(0,Number(log.quantity||0)-returnedQty);return <div key={log.id} style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) auto auto',alignItems:'center',gap:8}}><span>{group.returned?'[반품] ':''}{log.product_name}{!group.returned&&returnedQty>0?<small style={{display:'block',color:'#d92d20',marginTop:2}}>반품 {returnedQty.toLocaleString()}개 · 잔여 {remaining.toLocaleString()}개</small>:null}</span><b>{group.returned?'-':''}{Number(log.quantity||0).toLocaleString()}개</b>{!group.returned&&<button type="button" className="ghost" disabled={remaining<=0} onClick={()=>setReturnLog(log)} style={{padding:'6px 10px',fontSize:12,whiteSpace:'nowrap'}}>{remaining>0?'반품':'반품완료'}</button>}</div>})}</div></article>})}
            {!transactionGroups.length&&<Empty text="선택한 기간의 거래내역이 없습니다."/>}
          </div>
  </div>:null;

  return <section className="panel customer-panel">
    <div className="tab-intro">
      <div className="tab-intro-text"><h3>거래처 관리</h3><p>거래처 정보와 거래내역, 미수금을 확인하고 관리할 수 있습니다.</p></div>
      <div className="tab-intro-actions">{isAdmin&&<button className="primary" onClick={onAdd}><Plus size={18}/>거래처 등록</button>}</div>
    </div>
    <div className="toolbar"><div className="search"><Search size={18}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="거래처명, 받는 사람, 연락처 검색"/></div><div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{legacyCount>0&&<button className="ghost" onClick={migrateLegacyReceivables}>로컬 미수금 {legacyCount}건 가져오기</button>}<button className="ghost" onClick={()=>loadReceivables()} disabled={receivableLoading}><RefreshCw size={16}/>{receivableLoading?'불러오는 중':'미수금 새로고침'}</button></div></div>
    {receivableError&&<div className="error" style={{marginBottom:12}}>미수금 불러오기 실패: {receivableError}<br/><small>먼저 제공된 Supabase SQL을 실행했는지 확인하세요.</small></div>}
    <div className="customer-layout">
      <div className="customer-list-area">
        <div className="customer-table-wrap"><table className="customer-table"><thead><tr>
          <th><button onClick={()=>changeSort('name')}>거래처명 <span>{sortMark('name')}</span></button></th><th><button onClick={()=>changeSort('recipient_name')}>받는 사람 <span>{sortMark('recipient_name')}</span></button></th><th><button onClick={()=>changeSort('phone')}>연락처 <span>{sortMark('phone')}</span></button></th><th>주소</th><th>단가 구분</th><th><button onClick={()=>changeSort('totalOut')}>누적 출고 <span>{sortMark('totalOut')}</span></button></th><th><button onClick={()=>changeSort('lastOut')}>최근 거래일 <span>{sortMark('lastOut')}</span></button></th><th>미수금</th><th>관리</th>
        </tr></thead><tbody>{rows.map(c=>{const stats=customerStats[c.id]||{totalOut:0,lastOut:''};return <React.Fragment key={c.id}><tr key={c.id} className={selectedId===c.id?'selected':''} onClick={()=>selectCustomer(c.id)}><td><b><span className="customer-expand-arrow">›</span><button type="button" className="customer-name-link" onClick={e=>{e.stopPropagation();setDetailCustomer(c)}}>{c.name}</button></b></td><td>{c.recipient_name||'-'}</td><td className="customer-phone">{c.phone||'-'}</td><td className="customer-address">{[c.address,c.address_detail].filter(Boolean).join(' ')||'주소 없음'}</td><td><span className={'price-type-badge '+(c.price_type==='retail'?'retail':'wholesale')}>{c.price_type==='retail'?'소매':'도매'}</span></td><td><strong>{stats.totalOut.toLocaleString()}개</strong></td><td>{stats.lastOut?new Date(stats.lastOut).toLocaleDateString('ko-KR'):'-'}</td><td><strong style={{color:(receivableBalanceByCustomer[String(c.id)]||0)>0?'#d92d20':'inherit'}}>{Math.max(0,receivableBalanceByCustomer[String(c.id)]||0).toLocaleString()}원</strong></td><td><div className="customer-row-actions"><button onClick={e=>{e.stopPropagation();selectCustomer(c.id)}}>거래내역</button><button className="primary" onClick={e=>{e.stopPropagation();setSelectedId(c.id);setReceivableModal({mode:'payment',customer:c})}}>입금처리</button>{isAdmin&&<button onClick={e=>{e.stopPropagation();onEdit(c)}}>수정</button>}{isAdmin&&<button className="danger-button" onClick={e=>{e.stopPropagation();onDelete(c)}}>삭제</button>}</div></td></tr>{String(selectedId)===String(c.id)&&<tr className="customer-inline-detail-row"><td colSpan="9">{customerHistoryPanel}</td></tr>}</React.Fragment>})}</tbody></table></div>
        <div className="customer-mobile-list">{rows.map(c=>{const stats=customerStats[c.id]||{totalOut:0,lastOut:''};return <React.Fragment key={c.id}><article key={c.id} className={selectedId===c.id?'selected':''} onClick={()=>selectCustomer(c.id)}><div className="customer-card-head"><b><span className="customer-expand-arrow">›</span><button type="button" className="customer-name-link" onClick={e=>{e.stopPropagation();setDetailCustomer(c)}}>{c.name}</button></b><span>미수 {Math.max(0,receivableBalanceByCustomer[String(c.id)]||0).toLocaleString()}원</span></div><small>{c.recipient_name||'-'} · {c.phone||'-'} · {c.price_type==='retail'?'소매가':'도매가'}</small><p>{[c.address,c.address_detail].filter(Boolean).join(' ')||'주소 없음'}</p><div className="customer-card-actions"><button onClick={e=>{e.stopPropagation();selectCustomer(c.id)}}>거래내역</button><button className="primary" onClick={e=>{e.stopPropagation();setSelectedId(c.id);setReceivableModal({mode:'payment',customer:c})}}>입금처리</button>{isAdmin&&<button onClick={e=>{e.stopPropagation();onEdit(c)}}>수정</button>}{isAdmin&&<button className="danger-button" onClick={e=>{e.stopPropagation();onDelete(c)}}>삭제</button>}</div></article>{String(selectedId)===String(c.id)&&<div className="customer-mobile-inline-detail">{customerHistoryPanel}</div>}</React.Fragment>})}</div>
        {!rows.length&&<Empty text={query?'검색 결과가 없습니다.':'등록된 거래처가 없습니다.'}/>} 
      </div>

    </div>
    {returnLog&&selected&&<ReturnFromLogModal log={returnLog} customer={selected} product={matchedProductForLog(returnLog)} alreadyReturned={returnedForLog(returnLog)} profile={profile} user={user} onClose={()=>setReturnLog(null)} onSaved={onReturnSaved}/>}
    {invoiceLogs&&selected&&<InvoiceModal customer={selected} products={products} logs={invoiceLogs} onClose={()=>setInvoiceLogs(null)}/>} 
    {receivableModal&&(receivableModal.customer||selected)&&<ReceivableModal customer={receivableModal.customer||selected} mode={receivableModal.mode} initialAmount={receivableModal.amount||''} initialMemo={receivableModal.memo||''} source={receivableModal.source||'manual'} user={user} onClose={()=>setReceivableModal(null)} onSaved={saveReceivableEntry}/>}
    {detailCustomer&&<CustomerDetailModal customer={detailCustomer} products={products} logs={logs} receivableEntries={receivableEntries} onOpenInvoice={groupLogs=>{setSelectedId(detailCustomer.id);setInvoiceLogs(groupLogs);setDetailCustomer(null)}} onClose={()=>setDetailCustomer(null)}/>}
  </section>;
}

function InvoiceModal({customer,logs,products,onClose}){
  const today=new Date().toLocaleDateString('en-CA');
  const [invoiceCustomer,setInvoiceCustomer]=useState(customer);
  const [customerPrices,setCustomerPrices]=useState({});
  const [priceLoading,setPriceLoading]=useState(false);
  const [loadedArchiveId,setLoadedArchiveId]=useState(null);

  function normalizeProductName(value){
    return String(value||'')
      .trim()
      .toLowerCase()
      .replace(/\s+/g,'')
      .replace(/[\/|·ㆍ_-]/g,'');
  }

  function findMatchedProduct(item,selectedPriceType=priceType){
    const itemId=String(item?.product_id||item?.productId||'');
    const rawItemName=String(item?.product_name||item?.name||'');
    const itemName=normalizeProductName(rawItemName);
    const itemSpec=normalizeProductName(item?.spec||'');

    const exactIdProduct=products.find(product=>
      itemId&&String(product?.id||'')===itemId
    );
    if(exactIdProduct)return exactIdProduct;

    const scored=products
      .map(product=>{
        const productName=normalizeProductName(product?.name||'');
        const productSize=normalizeProductName(product?.size||'');
        const productColor=normalizeProductName(product?.color||'');
        const searchableItem=`${itemName}${itemSpec}`;
        let score=0;

        if(!itemName||!productName)return {product,score:-1};
        if(itemName===productName)score+=100;
        else if(itemName.startsWith(productName))score+=80;
        else if(itemName.includes(productName))score+=60;
        else if(productName.includes(itemName))score+=40;
        else return {product,score:-1};

        if(productSize&&productSize!=='없음'&&searchableItem.includes(productSize))score+=20;
        if(productColor&&productColor!=='없음'&&searchableItem.includes(productColor))score+=20;

        const price=Number(
          selectedPriceType==='retail'
            ? product?.retail_price
            : product?.wholesale_price
        )||0;
        if(price>0)score+=5;

        return {product,score};
      })
      .filter(result=>result.score>=0)
      .sort((a,b)=>b.score-a.score);

    return scored[0]?.product||null;
  }

  const savedSupplier=(()=>{
    try{
      return JSON.parse(
        localStorage.getItem('oto_invoice_supplier')||'null'
      );
    }catch{
      return null;
    }
  })();

  const [supplier,setSupplier]=useState(
    savedSupplier||{
      businessName:'OTO',
      registrationNumber:'',
      representative:'',
      address:'',
      phone:'',
      fax:'',
      manager:'',
      managerPhone:'',
      bankAccount:''
    }
  );

  const [issueDate,setIssueDate]=useState(today);
  const [note,setNote]=useState('');
  const [priceType,setPriceType]=useState(
    invoiceCustomer.price_type||'wholesale'
  );
  const [archiveOpen,setArchiveOpen]=useState(false);
  const invoicePreviewRef=useRef(null);
  const [invoicePreviewScale,setInvoicePreviewScale]=useState(1);

  useEffect(()=>{
    function resizeInvoicePreview(){
      if(typeof window==='undefined')return;

      const viewportWidth=Math.round(
        window.visualViewport?.width||window.innerWidth||document.documentElement.clientWidth||0
      );

      if(viewportWidth>768){
        setInvoicePreviewScale(1);
        return;
      }

      const mobileSidePadding=24;
      const availableWidth=Math.max(240,viewportWidth-mobileSidePadding);
      const a4PreviewWidth=794;
      setInvoicePreviewScale(Math.min(1,availableWidth/a4PreviewWidth));
    }

    resizeInvoicePreview();
    window.addEventListener('resize',resizeInvoicePreview);
    window.addEventListener('orientationchange',resizeInvoicePreview);
    window.visualViewport?.addEventListener('resize',resizeInvoicePreview);

    return()=>{
      window.removeEventListener('resize',resizeInvoicePreview);
      window.removeEventListener('orientationchange',resizeInvoicePreview);
      window.visualViewport?.removeEventListener('resize',resizeInvoicePreview);
    };
  },[]);

  const [savedInvoices,setSavedInvoices]=useState(()=>{
    try{
      return JSON.parse(
        localStorage.getItem('oto_saved_invoices')||'[]'
      );
    }catch{
      return [];
    }
  });

  const [items,setItems]=useState(()=>{
    const grouped={};
    const initialPriceType=customer.price_type||'wholesale';

    logs.forEach(log=>{
      const date=new Date(log.created_at)
        .toLocaleDateString('en-CA');

      const product=findMatchedProduct(log,initialPriceType);

      const spec=[
        product?.size,
        product?.color
      ]
        .filter(value=>value&&value!=='없음')
        .join(' / ');

      const key=[
        date,
        log.product_name,
        spec
      ].join('|');

      const defaultPrice=product
        ? Number(
            initialPriceType==='retail'
              ? product.retail_price
              : product.wholesale_price
          )||0
        : 0;

      const savedLogPrice=Number(log.unit_price||0);
      const isReturn=log.movement_type==='in'&&String(log.memo||'').startsWith('[반품]');

      if(!grouped[key]){
        grouped[key]={
          id:key,
          date,
          name:`${isReturn?'[반품] ':''}${log.product_name||product?.name||''}`,
          spec,
          quantity:0,
          unitPrice:savedLogPrice>0
            ? savedLogPrice
            : defaultPrice,
          taxRate:10,
          productId:product?.id||log.product_id||null
        };
      }

      grouped[key].quantity+=(isReturn?-1:1)*Number(log.quantity||0);
    });

    return Object.values(grouped)
      .sort((a,b)=>a.date.localeCompare(b.date));
  });

  useEffect(()=>{
    let cancelled=false;

    async function loadCustomerPrices(){
      if(!invoiceCustomer?.id){
        setCustomerPrices({});
        return;
      }

      setPriceLoading(true);
      const {data,error}=await supabase
        .from('customer_product_prices')
        .select('product_id,unit_price')
        .eq('customer_id',invoiceCustomer.id);

      if(cancelled)return;
      setPriceLoading(false);

      if(error){
        console.warn('거래처별 단가 불러오기 실패:',error.message);
        setCustomerPrices({});
        return;
      }

      const priceMap=Object.fromEntries(
        (data||[]).map(row=>[String(row.product_id),Number(row.unit_price||0)])
      );
      setCustomerPrices(priceMap);

      // 저장 명세표 재출력 시에는 당시 저장된 단가를 그대로 유지합니다.
      if(loadedArchiveId)return;

      setItems(current=>current.map(item=>{
        const product=findMatchedProduct(item,priceType);
        if(!product)return item;
        const customPrice=Number(priceMap[String(product.id)]||0);
        return customPrice>0
          ? {...item,productId:product.id,unitPrice:customPrice}
          : item;
      }));
    }

    loadCustomerPrices();
    return()=>{cancelled=true};
  },[invoiceCustomer?.id,loadedArchiveId]);

  useEffect(()=>{
    if(!products.length)return;

    setItems(current=>current.map(item=>{
      if(Number(item.unitPrice||0)>0)return item;

      const product=findMatchedProduct(item,priceType);
      if(!product)return item;

      const customPrice=Number(customerPrices[String(product.id)]||0);
      const matchedPrice=customPrice>0
        ? customPrice
        : Number(
            priceType==='retail'
              ? product.retail_price
              : product.wholesale_price
          )||0;

      return matchedPrice>0
        ? {...item,productId:product.id,unitPrice:matchedPrice}
        : item;
    }));
  },[products,priceType,customerPrices]);

  useEffect(()=>{
    const listener=e=>{
      if(e.key==='Escape')onClose();
    };

    window.addEventListener('keydown',listener);

    return()=>{
      window.removeEventListener('keydown',listener);
    };
  },[onClose]);

  function updateSupplier(key,value){
  setSupplier(current=>{
    const nextSupplier={
      ...current,
      [key]:value
    };

    localStorage.setItem(
      'oto_invoice_supplier',
      JSON.stringify(nextSupplier)
    );

    return nextSupplier;
  });
}

  function updateItem(index,key,value){
    setItems(current=>
      current.map((item,i)=>
        i===index
          ? {...item,[key]:value}
          : item
      )
    );
  }

  function addItem(){
    setItems(current=>[
      ...current,
      {
        id:'new-'+Date.now(),
        date:issueDate,
        name:'',
        spec:'',
        quantity:1,
        unitPrice:0,
        taxRate:10,
        productId:null
      }
    ]);
  }

  function applyPriceType(nextType){
    setPriceType(nextType);
    setLoadedArchiveId(null);

    setItems(current=>
      current.map(item=>{
        const product=findMatchedProduct(item);

        if(!product){
          return item;
        }

        const customPrice=Number(customerPrices[String(product.id)]||0);
        const nextPrice=customPrice>0
          ? customPrice
          : Number(
              nextType==='retail'
                ? product.retail_price
                : product.wholesale_price
            )||0;

        return {
          ...item,
          productId:product.id,
          unitPrice:nextPrice
        };
      })
    );
  }
  function saveSupplier(){
    localStorage.setItem(
      'oto_invoice_supplier',
      JSON.stringify(supplier)
    );
    alert('공급자 정보가 이 기기에 저장되었습니다.');
  }

  async function saveCustomerPrices(){
    if(!invoiceCustomer?.id){
      alert('거래처 정보가 없어 단가를 저장할 수 없습니다.');
      return;
    }

    const rows=items
      .map(item=>{
        const product=findMatchedProduct(item,priceType);
        const productId=item.productId||product?.id;
        const unitPrice=Number(item.unitPrice||0);
        return productId&&unitPrice>0
          ? {customer_id:String(invoiceCustomer.id),product_id:String(productId),unit_price:unitPrice,updated_at:new Date().toISOString()}
          : null;
      })
      .filter(Boolean);

    if(!rows.length){
      alert('저장할 상품 단가가 없습니다.');
      return;
    }

    const {error}=await supabase
      .from('customer_product_prices')
      .upsert(rows,{onConflict:'customer_id,product_id'});

    if(error){
      alert('거래처별 단가 저장에 실패했습니다. Supabase SQL 설정을 먼저 확인해주세요.\n'+error.message);
      return;
    }

    setCustomerPrices(current=>({
      ...current,
      ...Object.fromEntries(rows.map(row=>[String(row.product_id),Number(row.unit_price)]))
    }));
    alert(`${invoiceCustomer.name||'거래처'}의 상품별 단가를 저장했습니다.`);
  }

  function saveInvoice(){
    const invoice={id:'invoice-'+Date.now(),issueDate,note,supplier,customer:invoiceCustomer,items,priceType,createdAt:new Date().toISOString()};
    const next=[invoice,...savedInvoices].slice(0,100);setSavedInvoices(next);localStorage.setItem('oto_saved_invoices',JSON.stringify(next));alert('거래명세표를 저장했습니다.');
  }
  function loadInvoice(invoice){
    setLoadedArchiveId(invoice.id);
    setInvoiceCustomer(invoice.customer||customer);
    setIssueDate(invoice.issueDate||today);
    setNote(invoice.note||'');
    setSupplier(invoice.supplier||supplier);
    setPriceType(invoice.priceType||invoice.customer?.price_type||customer.price_type||'wholesale');
    setItems((invoice.items||[]).map((item,index)=>({...item,id:item.id||'saved-'+index+'-'+Date.now()})));
    setArchiveOpen(false);
  }
  function deleteInvoice(id){if(!confirm('저장된 거래명세표를 삭제할까요?'))return;const next=savedInvoices.filter(invoice=>invoice.id!==id);setSavedInvoices(next);localStorage.setItem('oto_saved_invoices',JSON.stringify(next))}
  const supplyTotal=items.reduce((sum,item)=>sum+Number(item.quantity||0)*Number(item.unitPrice||0),0);
  const taxTotal=items.reduce((sum,item)=>sum+Math.round(Number(item.quantity||0)*Number(item.unitPrice||0)*Number(item.taxRate||0)/100),0);
  const grandTotal=supplyTotal+taxTotal;
  const fmt=value=>Number(value||0).toLocaleString('ko-KR');
  const parseMoney=value=>String(value??'').replace(/[^0-9.-]/g,'');

  function renderStatementCopy({copyLabel,editable=false}){
    const readOnly=!editable;
    const inputProps=(value,onChange,extra={})=>({
      value:value??'',
      readOnly,
      tabIndex:readOnly?-1:undefined,
      onChange:editable?onChange:undefined,
      ...extra
    });

    return <section className="statement-copy">
      <div className="invoice-title-row"><h1>거 래 명 세 표</h1><span>({copyLabel})</span></div>
      <table className="invoice-parties"><colgroup>
        <col className="party-customer-vertical"/><col className="party-customer-label"/><col className="party-customer-data"/><col className="party-customer-label-sub"/><col className="party-customer-data-sub"/>
        <col className="party-supplier-vertical"/><col className="party-supplier-label"/><col className="party-supplier-data"/><col className="party-supplier-label-sub"/><col className="party-supplier-data-sub"/>
      </colgroup><tbody><tr>
        <th className="vertical-label" rowSpan="4">공급받는자</th><th>상호</th><td colSpan="3">{invoiceCustomer.name||''}</td>
        <th className="vertical-label" rowSpan="4">공급자</th><th>등록번호</th><td colSpan="3"><input {...inputProps(supplier.registrationNumber,e=>updateSupplier('registrationNumber',e.target.value))}/></td>
      </tr><tr><th>성명</th><td colSpan="3">{invoiceCustomer.recipient_name||''}</td><th>상호</th><td><input {...inputProps(supplier.businessName,e=>updateSupplier('businessName',e.target.value))}/></td><th>성명</th><td><input {...inputProps(supplier.representative,e=>updateSupplier('representative',e.target.value))}/></td></tr>
      <tr><th>주소</th><td colSpan="3">{[invoiceCustomer.address,invoiceCustomer.address_detail].filter(Boolean).join(' ')}</td><th>주소</th><td colSpan="3"><input {...inputProps(supplier.address,e=>updateSupplier('address',e.target.value))}/></td></tr>
      <tr><th>전화</th><td colSpan="3">{invoiceCustomer.phone||''}</td><th>전화</th><td><input {...inputProps(supplier.phone,e=>updateSupplier('phone',e.target.value))}/></td><th>팩스</th><td><input {...inputProps(supplier.fax||'',e=>updateSupplier('fax',e.target.value))}/></td></tr></tbody></table>
      <div className="statement-summary"><b>합계금액(VAT 포함)</b><strong>{fmt(grandTotal)} 원</strong></div>
      <table className="invoice-items"><colgroup><col className="invoice-col-month"/><col className="invoice-col-day"/><col className="invoice-col-item"/><col className="invoice-col-qty"/><col className="invoice-col-unit"/><col className="invoice-col-supply"/><col className="invoice-col-tax"/></colgroup><thead><tr><th>월</th><th>일</th><th>품목</th><th>수량</th><th>단가</th><th>공급가액</th><th>세액</th></tr></thead><tbody>
      {items.map((item,index)=>{const d=(item.date||issueDate).split('-');const supply=Number(item.quantity||0)*Number(item.unitPrice||0);const tax=Math.round(supply*Number(item.taxRate||0)/100);return <tr key={item.id}>
        <td><input {...inputProps(d[1]||'',e=>updateItem(index,'date',`${d[0]||issueDate.slice(0,4)}-${String(e.target.value).padStart(2,'0')}-${d[2]||'01'}`))}/></td>
        <td><input {...inputProps(d[2]||'',e=>updateItem(index,'date',`${d[0]||issueDate.slice(0,4)}-${d[1]||'01'}-${String(e.target.value).padStart(2,'0')}`))}/></td>
        <td style={{position:'relative'}}><input style={{paddingRight:24}} {...inputProps(item.name,e=>updateItem(index,'name',e.target.value))}/>{editable&&<button type="button" className="invoice-delete no-print" title="이 품목 삭제" aria-label="이 품목 삭제" style={{position:'absolute',right:3,top:'50%',transform:'translateY(-50%)',width:24,height:24,padding:0,border:'none',background:'transparent',display:'inline-flex',alignItems:'center',justifyContent:'center',cursor:'pointer'}} onClick={()=>{if(items.length<=1){window.alert('거래명세표에는 품목이 최소 1개 필요합니다.');return;}setItems(current=>current.filter((_,i)=>i!==index));}}><Trash2 size={15}/></button>}</td>
        <td><input type="number" min="0" {...inputProps(item.quantity,e=>updateItem(index,'quantity',e.target.value))}/></td>
        <td><input className="money-input" inputMode="numeric" {...inputProps(fmt(item.unitPrice),e=>updateItem(index,'unitPrice',parseMoney(e.target.value)))}/></td>
        <td className="money">{fmt(supply)}</td><td className="money">{fmt(tax)}</td>
      </tr>})}
      {Array.from({length:Math.max(0,6-items.length)}).map((_,i)=><tr className="invoice-empty-row" key={'empty-'+i}><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>)}
      </tbody><tfoot><tr><th className="total-label" colSpan="5">합계</th><td className="money total-money">{fmt(supplyTotal)}</td><td className="money total-money">{fmt(taxTotal)}</td></tr></tfoot></table>
      <div className="invoice-note"><b>비고</b><textarea placeholder={editable?'비고 내용을 입력하세요':''} {...inputProps(note,e=>setNote(e.target.value))}/></div>
      <div className="invoice-account"><b>입금계좌</b><input placeholder={editable?'예: 국민은행 000000-00-000000 예금주 OTO':''} {...inputProps(supplier.bankAccount||'',e=>updateSupplier('bankAccount',e.target.value))}/></div>
      <table className="invoice-sign"><tbody><tr><th>인수자</th><td>인</td><th>납품자</th><td>인</td><th>미수금</th><td></td></tr></tbody></table>
    </section>
  }
 return (
  <div
    className="invoice-overlay"
    onMouseDown={e => e.target === e.currentTarget && onClose()}
  >
    <div className="invoice-window">

      {/* 거래명세표 상단 툴바 */}
 <div className="invoice-editor-bar">

        <div className="invoice-toolbar-title">
          <b>거래명세표 미리보기</b>

          <small>
            A4 세로 한 장에 상·하 보관용이 함께 출력됩니다.
          </small>
        </div>

        <div className="invoice-toolbar-actions">

          <div className="invoice-toolbar-group invoice-price-group">
            <span className="invoice-toolbar-group-title">
              단가 설정
            </span>

            <label className="price-type-control">
              <span>단가</span>

              <select
                value={priceType}
                onChange={e => applyPriceType(e.target.value)}
              >
                <option value="wholesale">도매가</option>
                <option value="retail">소매가</option>
              </select>
            </label>
          </div>

          <div className="invoice-toolbar-group">
            <span className="invoice-toolbar-group-title">
              명세표 편집
            </span>

            <div className="invoice-toolbar-buttons">
              <button
                type="button"
                onClick={saveSupplier}
              >
                공급자 정보 저장
              </button>

              <button
                type="button"
                onClick={addItem}
              >
                <Plus size={15} />
                품목 추가
              </button>

              <button
                type="button"
                onClick={saveCustomerPrices}
                disabled={priceLoading}
              >
                {priceLoading
                  ? '단가 불러오는 중'
                  : '거래처 단가 저장'}
              </button>
            </div>
          </div>

          <div className="invoice-toolbar-group">
            <span className="invoice-toolbar-group-title">
              저장 관리
            </span>

            <div className="invoice-toolbar-buttons">
              <button
                type="button"
                onClick={saveInvoice}
              >
                명세표 저장
              </button>

              <button
                type="button"
                onClick={() => setArchiveOpen(v => !v)}
              >
                저장내역

                <span className="invoice-save-count">
                  {savedInvoices.length}
                </span>
              </button>
            </div>
          </div>

          <div className="invoice-toolbar-group invoice-toolbar-final">
            <span className="invoice-toolbar-group-title">
              출력
            </span>

            <div className="invoice-toolbar-buttons">
              <button
                type="button"
                className="primary invoice-print-button"
                onClick={() => window.print()}
              >
                <Printer size={16} />
                인쇄 / PDF
              </button>

              <button
                type="button"
                className="invoice-close-button"
                onClick={onClose}
              >
                닫기
              </button>
            </div>
          </div>

        </div>
      </div>
    {archiveOpen&&<div className="invoice-archive no-print"><div className="invoice-archive-head"><b>저장된 거래명세표</b><button onClick={()=>setArchiveOpen(false)}>닫기</button></div>{savedInvoices.length?savedInvoices.map(invoice=><article key={invoice.id}><button className="invoice-archive-main" onClick={()=>loadInvoice(invoice)}><b>{invoice.customer?.name||'거래명세표'}</b><span>{invoice.issueDate||''}</span></button><button onClick={()=>{loadInvoice(invoice);setTimeout(()=>window.print(),80)}}><Printer size={14}/>재출력</button><button className="danger-button" onClick={()=>deleteInvoice(invoice.id)}>삭제</button></article>):<p>저장된 거래명세표가 없습니다.</p>}</div>}
    <div
      className="invoice-preview-viewport"
      style={{
        '--invoice-preview-scale':invoicePreviewScale,
        '--invoice-preview-height':`${1123*invoicePreviewScale}px`
      }}
    >
      <div ref={invoicePreviewRef} className="invoice-sheet portrait-double">
        {renderStatementCopy({copyLabel:'공급받는자 보관용',editable:true})}
        <div className="cut-line" aria-hidden="true"></div>
        {renderStatementCopy({copyLabel:'공급자 보관용'})}
      </div>
    </div>
  </div></div>;
}

function EmployeeManagement({session,currentUserId}){
  const [employees,setEmployees]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [createOpen,setCreateOpen]=useState(false);
  const [busyId,setBusyId]=useState('');

  async function api(action,payload={}){
    let response;
    try{
      response=await fetch('/api/admin-users',{
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          'Authorization':`Bearer ${session.access_token}`
        },
        body:JSON.stringify({action,...payload})
      });
    }catch{
      throw new Error('직원관리 서버에 연결하지 못했습니다. Netlify Functions 배포 상태를 확인하세요.');
    }

    const raw=await response.text();
    let data={};
    try{data=raw?JSON.parse(raw):{}}catch{}

    if(!response.ok){
      if(response.status===404){
        throw new Error('직원관리 서버 함수가 배포되지 않았습니다. GitHub 전체 프로젝트로 다시 배포하세요.');
      }
      if(response.status===500&&String(data.error||'').includes('환경변수')){
        throw new Error(data.error);
      }
      throw new Error(data.error||`직원 관리 요청 실패 (${response.status})`);
    }
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

  async function deleteEmployee(employee){
    if(employee.id===currentUserId){
      window.alert('현재 로그인한 자신의 계정은 삭제할 수 없습니다.');
      return;
    }
    if(!window.confirm(`${employee.name}님의 계정을 완전히 삭제할까요?\n이 작업은 되돌릴 수 없습니다.`))return;
    const typed=window.prompt(`삭제 확인을 위해 로그인 아이디 "${employee.login_id}"를 그대로 입력하세요.`);
    if(typed!==employee.login_id){
      if(typed!==null)window.alert('아이디가 일치하지 않아 삭제하지 않았습니다.');
      return;
    }
    setBusyId(employee.id);
    setError('');
    try{
      await api('delete_user',{user_id:employee.id});
      await load();
      window.alert('직원 계정이 삭제되었습니다.');
    }catch(e){setError(normalizeError(e))}
    finally{setBusyId('')}
  }

  return <section className="panel employee-panel">
    <div className="tab-intro">
      <div className="tab-intro-text">
        <h3 className="employee-title">직원 계정 관리</h3>
        <p className="employee-subtitle">직원 생성, 권한 변경, 계정 중지와 비밀번호 변경을 관리합니다.</p>
      </div>
      <div className="tab-intro-actions"><button className="primary" onClick={()=>setCreateOpen(true)}><Plus size={18}/>직원 추가</button></div>
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
            <button className="danger-button" disabled={busyId===employee.id||employee.id===currentUserId} onClick={()=>deleteEmployee(employee)}>
              삭제
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

function Logs({logs,products,customers,isAdmin,onMove,onDelete}){
  const [selectedProductId,setSelectedProductId]=useState('');
  const [detailProduct,setDetailProduct]=useState(null);
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

  const selectedProduct=products.find(product=>product.id===selectedProductId)||null;

  return <section className="panel">
    <div className="movement-entry">
      <div>
        <h3 className="panel-title">입출고 등록</h3>
        <p>상품을 선택한 뒤 입고 또는 출고 내용을 입력하세요.</p>
      </div>
      <div className="movement-entry-controls">
        <select value={selectedProductId} onChange={event=>setSelectedProductId(event.target.value)}>
          <option value="">상품 선택</option>
          {products.map(product=>
            <option key={product.id} value={product.id}>
              {product.name} · {product.size||'사이즈 없음'} · {product.color||'색상 없음'} · 재고 {formatNumber(product.quantity)}
            </option>
          )}
        </select>
        <button
          className="primary"
          disabled={!selectedProduct}
          onClick={()=>selectedProduct&&onMove(selectedProduct)}
        >
          <Plus size={18}/>입출고 등록
        </button>
      </div>
    </div>
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
        <div><button type="button" className="log-product-link" title="입출고 상세보기" aria-label={`${log.product_name} 입출고 상세보기`} onClick={()=>{const product=products.find(item=>String(item.id)===String(log.product_id))||products.find(item=>String(log.product_name||'').startsWith(item.name));setDetailProduct(product||{id:log.product_id,name:log.product_name,quantity:0})}}>{log.product_name}</button><small>{new Date(log.created_at).toLocaleString('ko-KR')} · {log.staff_name}</small>{log.movement_type==='out'&&<p>{[log.customer_name,log.recipient_name,[log.destination,log.destination_detail].filter(Boolean).join(' '),log.tracking_number].filter(Boolean).join(' · ')}</p>}</div>
        <strong>{log.movement_type==='in'?'+':'-'}{formatNumber(log.quantity)}</strong>
        {isAdmin&&<button className="log-delete-button" onClick={()=>onDelete(log)}>삭제</button>}
      </article>)}
      {!rows.length&&<Empty text="조건에 맞는 입출고 기록이 없습니다."/>}
    </div>
    {detailProduct&&<ProductHistoryModal product={detailProduct} logs={logs} customers={customers} onClose={()=>setDetailProduct(null)}/>}
  </section>;
}

function ImageViewerModal({image,onClose}){
  return <Modal title={image.name||'상품 사진'} onClose={onClose}>
    <div className="image-viewer"><img src={image.url} alt={image.name||'상품 사진'}/></div>
  </Modal>;
}

function ProductHistoryModal({product,logs,customers,onClose}){
  const productLogs=useMemo(()=>logs.filter(log=>
    String(log.product_id||'')===String(product.id||'')||String(log.product_name||'').startsWith(product.name||'')
  ).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))),[logs,product]);
  const recent=productLogs.slice(0,20);
  const lastIn=productLogs.find(log=>log.movement_type==='in');
  const lastOut=productLogs.find(log=>log.movement_type==='out');
  const recentCustomer=productLogs.find(log=>log.customer_name)?.customer_name||'-';
  const totalIn=productLogs.filter(log=>log.movement_type==='in').reduce((sum,log)=>sum+Number(log.quantity||0),0);
  const totalOut=productLogs.filter(log=>log.movement_type==='out').reduce((sum,log)=>sum+Number(log.quantity||0),0);
  const spec=[product.size,product.color].filter(value=>value&&value!=='없음').join(' / ')||'규격 없음';
  return <Modal title="상품 입출고 상세" onClose={onClose}>
    <div className="detail-hero">
      {product.image_url?<img src={product.image_url} alt={product.name}/>:<div className="detail-image-empty">사진 없음</div>}
      <div><small>{product.category||'상품'}</small><h3>{product.name}</h3><p>{spec}</p></div>
      <div className="detail-stock"><small>현재 재고</small><strong>{formatQty(product.quantity)}</strong></div>
    </div>
    <div className="detail-stat-grid">
      <div><small>누적 입고</small><strong>{formatQty(totalIn)}</strong></div>
      <div><small>누적 출고</small><strong>{formatQty(totalOut)}</strong></div>
      <div><small>마지막 입고</small><strong>{lastIn?new Date(lastIn.created_at).toLocaleDateString('ko-KR'):'-'}</strong></div>
      <div><small>마지막 출고</small><strong>{lastOut?new Date(lastOut.created_at).toLocaleDateString('ko-KR'):'-'}</strong></div>
      <div><small>전체 기록</small><strong>{formatNumber(productLogs.length)}건</strong></div>
      <div><small>최근 거래처</small><strong>{recentCustomer}</strong></div>
    </div>
    <div className="detail-section-title">최근 입출고 20건</div>
    <div className="detail-history-list">
      {recent.map(log=><article key={log.id}><span className={log.movement_type}>{log.movement_type==='in'?'입고':'출고'}</span><div><b>{new Date(log.created_at).toLocaleString('ko-KR')}</b><small>{[log.customer_name,log.staff_name,log.memo].filter(Boolean).join(' · ')||'추가 정보 없음'}</small></div><strong>{log.movement_type==='in'?'+':'-'}{formatQty(log.quantity)}</strong></article>)}
      {!recent.length&&<Empty text="입출고 내역이 없습니다."/>}
    </div>
  </Modal>;
}

function CustomerDetailModal({customer,products,logs,receivableEntries,onOpenInvoice,onClose}){
  const isReturn=log=>log.movement_type==='in'&&String(log.memo||'').startsWith('[반품]');
  const customerLogs=useMemo(()=>logs.filter(log=>
    (log.movement_type==='out'||isReturn(log))&&
    (String(log.customer_id||'')===String(customer.id)||(!log.customer_id&&log.customer_name===customer.name))
  ).sort((a,b)=>String(b.created_at||'').localeCompare(String(a.created_at||''))),[logs,customer]);
  const productFor=log=>products.find(product=>String(product.id)===String(log.product_id))||products.find(product=>String(log.product_name||'').startsWith(product.name));
  const amountFor=log=>{
    const product=productFor(log);
    const fallback=Number(customer.price_type==='retail'?product?.retail_price:product?.wholesale_price)||0;
    return Number(log.quantity||0)*(Number(log.unit_price||fallback)||0)*(isReturn(log)?-1:1);
  };
  const totalAmount=customerLogs.reduce((sum,log)=>sum+amountFor(log),0);
  const balance=(receivableEntries||[]).filter(entry=>String(entry.customerId||entry.customer_id||'')===String(customer.id)).reduce((sum,entry)=>sum+(entry.type==='payment'||entry.entry_type==='payment'?-1:1)*Number(entry.amount||0),0);
  const groups=useMemo(()=>{
    const map={};
    customerLogs.forEach(log=>{const date=new Date(log.created_at).toLocaleDateString('en-CA');const returned=isReturn(log);const key=`${returned?'return':'out'}|${date}`;(map[key]??={key,date,returned,logs:[],amount:0}).logs.push(log);map[key].amount+=amountFor(log)});
    return Object.values(map).sort((a,b)=>b.date.localeCompare(a.date));
  },[customerLogs]);
  return <Modal title="거래처 상세보기" onClose={onClose}>
    <div className="customer-detail-head"><div><small>{customer.price_type==='retail'?'소매 단가 거래처':'도매 단가 거래처'}</small><h3>{customer.name}</h3><p>{customer.memo||'등록된 메모가 없습니다.'}</p></div></div>
    <div className="customer-contact-grid"><div><small>받는 사람</small><strong>{customer.recipient_name||'-'}</strong></div><div><small>연락처</small><strong>{customer.phone||'-'}</strong></div><div className="wide"><small>주소</small><strong>{[customer.postal_code&&`(${customer.postal_code})`,customer.address,customer.address_detail].filter(Boolean).join(' ')||'-'}</strong></div></div>
    <div className="detail-stat-grid customer-detail-stats"><div><small>총 거래금액</small><strong>{formatWon(totalAmount)}</strong></div><div><small>거래 건수</small><strong>{formatNumber(groups.length)}건</strong></div><div><small>최근 거래일</small><strong>{customerLogs[0]?new Date(customerLogs[0].created_at).toLocaleDateString('ko-KR'):'-'}</strong></div><div><small>미수금</small><strong className={balance>0?'danger-text':''}>{formatWon(Math.max(0,balance))}</strong></div></div>
    <div className="detail-section-title">최근 거래명세표</div>
    <div className="customer-invoice-list">{groups.slice(0,10).map(group=><article key={group.key}><div><b>{new Date(group.date+'T00:00:00').toLocaleDateString('ko-KR')}</b><small>{group.returned?'반품':'출고'} · {formatNumber(group.logs.length)}개 품목 · {formatWon(group.amount)}</small></div><button type="button" onClick={()=>onOpenInvoice(group.logs)}><Printer size={15}/>명세표</button></article>)}{!groups.length&&<Empty text="거래내역이 없습니다."/>}</div>
  </Modal>;
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


/* v6.5 상세 모달 및 숫자 UI */
if(typeof document!=='undefined'&&!document.getElementById('oto-v65-detail-ui')){
  const style=document.createElement('style');
  style.id='oto-v65-detail-ui';
  style.textContent=`
  .product-thumb-button{display:block;width:50px;height:50px;flex:0 0 50px;margin:0;padding:0;border:0;border-radius:8px;background:transparent;overflow:hidden;cursor:zoom-in}
  .product-thumb-button .product-thumb{width:100%!important;height:100%!important}
  .log-product-link,.customer-name-link{margin:0;padding:0;border:0;background:transparent;color:#155eef;font:inherit;font-weight:800;line-height:1.35;text-align:left;cursor:pointer;text-decoration:none}
  .log-product-link:hover,.customer-name-link:hover{text-decoration:underline}
  .image-viewer{display:grid;place-items:center;min-height:300px;padding:10px;background:#f8fafc;border-radius:12px}
  .image-viewer img{display:block;max-width:100%;max-height:72vh;object-fit:contain;border-radius:10px}
  .detail-hero{display:grid;grid-template-columns:84px minmax(0,1fr) auto;align-items:center;gap:16px;padding:16px;border:1px solid #e4e7ec;border-radius:14px;background:#fff}
  .detail-hero>img,.detail-image-empty{width:84px;height:84px;border-radius:12px;object-fit:cover;border:1px solid #e4e7ec;background:#f8fafc}
  .detail-image-empty{display:grid;place-items:center;color:#98a2b3;font-size:12px}
  .detail-hero h3,.customer-detail-head h3{margin:3px 0 4px;font-size:21px;color:#101828}
  .detail-hero p,.customer-detail-head p{margin:0;color:#667085;font-size:13px}
  .detail-stock{text-align:right}.detail-stock small{display:block;color:#667085}.detail-stock strong{display:block;margin-top:5px;font-size:24px;color:#155eef}
  .detail-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px}
  .detail-stat-grid>div,.customer-contact-grid>div{padding:13px;border:1px solid #e4e7ec;border-radius:11px;background:#fff;min-width:0}
  .detail-stat-grid small,.customer-contact-grid small{display:block;color:#667085;font-size:11px}.detail-stat-grid strong,.customer-contact-grid strong{display:block;margin-top:6px;color:#101828;font-size:14px;word-break:break-word}
  .detail-section-title{margin:18px 0 9px;font-size:14px;font-weight:800;color:#101828}
  .detail-history-list,.customer-invoice-list{border:1px solid #e4e7ec;border-radius:12px;overflow:hidden;background:#fff;max-height:390px;overflow-y:auto}
  .detail-history-list article{display:grid;grid-template-columns:54px minmax(0,1fr) auto;align-items:center;gap:10px;padding:11px 13px;border-bottom:1px solid #eef1f5}
  .detail-history-list article:last-child,.customer-invoice-list article:last-child{border-bottom:0}
  .detail-history-list article>span{display:inline-grid;place-items:center;height:25px;border-radius:999px;font-size:11px;font-weight:800}.detail-history-list article>span.in{background:#ecfdf3;color:#067647}.detail-history-list article>span.out{background:#fff4ed;color:#c4320a}
  .detail-history-list b{font-size:12px}.detail-history-list small{display:block;margin-top:3px;color:#667085;font-size:11px}.detail-history-list article>strong{font-variant-numeric:tabular-nums}
  .customer-detail-head{padding:2px 2px 12px}.customer-contact-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.customer-contact-grid .wide{grid-column:1/-1}.danger-text{color:#d92d20!important}
  .customer-invoice-list article{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 13px;border-bottom:1px solid #eef1f5}.customer-invoice-list small{display:block;margin-top:4px;color:#667085;font-size:11px}.customer-invoice-list button{display:inline-flex;align-items:center;gap:5px;white-space:nowrap}
  @media(max-width:700px){.detail-hero{grid-template-columns:68px minmax(0,1fr)}.detail-hero>img,.detail-image-empty{width:68px;height:68px}.detail-stock{grid-column:1/-1;text-align:left}.detail-stat-grid{grid-template-columns:1fr 1fr}.customer-contact-grid{grid-template-columns:1fr}.customer-contact-grid .wide{grid-column:auto}.detail-history-list article{grid-template-columns:48px minmax(0,1fr)}.detail-history-list article>strong{grid-column:2;text-align:left}}
  `;
  document.head.appendChild(style);
}

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


/* v6.4.3 거래명세표 인쇄 전용 레이아웃 복구
   화면 UI 스타일과 완전히 분리하여 A4 첫 페이지의 좌측 상단부터 출력합니다. */
if(typeof document!=='undefined'&&!document.getElementById('oto-v643-invoice-print-reset')){
  const invoicePrintStyle=document.createElement('style');
  invoicePrintStyle.id='oto-v643-invoice-print-reset';
  invoicePrintStyle.textContent=`
  @media print{
    @page{size:A4 portrait;margin:0!important;}

    html,body,#root{
      width:210mm!important;
      height:297mm!important;
      min-width:210mm!important;
      min-height:297mm!important;
      margin:0!important;
      padding:0!important;
      overflow:visible!important;
      background:#fff!important;
    }

    /* 앱 화면은 인쇄에서 제외하고 명세표 포털만 표시 */
    body *{visibility:hidden!important;}
    .invoice-overlay,
    .invoice-overlay *{visibility:visible!important;}

    .invoice-overlay{
      display:block!important;
      position:fixed!important;
      inset:0!important;
      top:0!important;
      left:0!important;
      right:auto!important;
      bottom:auto!important;
      width:210mm!important;
      height:297mm!important;
      min-width:210mm!important;
      min-height:297mm!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      border-radius:0!important;
      background:#fff!important;
      overflow:hidden!important;
      transform:none!important;
      z-index:2147483647!important;
    }

    .invoice-window{
      display:block!important;
      position:absolute!important;
      inset:0!important;
      top:0!important;
      left:0!important;
      width:210mm!important;
      height:297mm!important;
      min-width:210mm!important;
      min-height:297mm!important;
      max-width:none!important;
      max-height:none!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      border-radius:0!important;
      box-shadow:none!important;
      background:#fff!important;
      overflow:hidden!important;
      transform:none!important;
    }

    .invoice-toolbar,
    .invoice-archive,
    .no-print{display:none!important;}

    .invoice-sheet.portrait-double{
      display:grid!important;
      grid-template-rows:148.5mm 148.5mm!important;
      position:absolute!important;
      inset:0!important;
      top:0!important;
      left:0!important;
      width:210mm!important;
      height:297mm!important;
      min-width:210mm!important;
      min-height:297mm!important;
      max-width:210mm!important;
      max-height:297mm!important;
      margin:0!important;
      padding:0!important;
      gap:0!important;
      border:0!important;
      border-radius:0!important;
      box-shadow:none!important;
      background:#fff!important;
      overflow:hidden!important;
      transform:none!important;
      break-before:avoid-page!important;
      break-after:avoid-page!important;
      page-break-before:avoid!important;
      page-break-after:avoid!important;
    }

    .invoice-sheet.portrait-double>.statement-copy{
      width:210mm!important;
      height:148.5mm!important;
      min-height:148.5mm!important;
      max-height:148.5mm!important;
      margin:0!important;
      padding:8mm!important;
      box-sizing:border-box!important;
      overflow:hidden!important;
      break-inside:avoid!important;
      page-break-inside:avoid!important;
    }

    .invoice-sheet.portrait-double>.cut-line{
      display:block!important;
      visibility:visible!important;
      position:absolute!important;
      left:8mm!important;
      right:8mm!important;
      top:148.5mm!important;
      width:auto!important;
      height:0!important;
      margin:0!important;
      padding:0!important;
      border:0!important;
      border-top:1px dashed #777!important;
      transform:translateY(-0.5px)!important;
    }
  }`;
  document.head.appendChild(invoicePrintStyle);
}
