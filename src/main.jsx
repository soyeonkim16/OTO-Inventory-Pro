      }

      .invoice-editor-bar button,
      .invoice-editor-bar .price-type-control{
        font-size:11px!important;
      }
    }

    @media print{
      .invoice-editor-bar{
        display:none!important;
      }

      .invoice-window{
        padding:0!important;
      }
    }
  `;
  document.head.appendChild(fixedToolbarStyle);
}

/* OTO 거래명세표 포털 툴바 */
if(typeof document!=='undefined'&&!document.getElementById('oto-invoice-portal-toolbar-style')){
  const portalToolbarStyle=document.createElement('style');
  portalToolbarStyle.id='oto-invoice-portal-toolbar-style';
  portalToolbarStyle.textContent=`
    @media screen{
      .invoice-editor-portal{
        position:fixed!important;
        top:0!important;
        left:0!important;
        right:0!important;
        width:100%!important;
        display:grid!important;
        z-index:2147483647!important;
        visibility:visible!important;
        opacity:1!important;
        pointer-events:auto!important;
        background:#fff!important;
      }
      .invoice-toolbar-spacer{
        display:block!important;
        width:100%!important;
        height:142px!important;
        flex:0 0 142px!important;
      }
    }
    @media screen and (max-width:820px){
      .invoice-toolbar-spacer{
        height:258px!important;
        flex-basis:258px!important;
      }
    }
    @media screen and (max-width:520px){
      .invoice-toolbar-spacer{
        height:254px!important;
        flex-basis:254px!important;
      }
    }
    @media print{
      .invoice-editor-portal,
      .invoice-toolbar-spacer{
        display:none!important;
      }
    }
  `;
  document.head.appendChild(portalToolbarStyle);
}


// 거래처별 판매 달력 레이아웃: 기존 공통 버튼/그리드 스타일 충돌 방지
if(typeof document!=='undefined'&&!document.getElementById('oto-sales-calendar-layout-fix')){
  const calendarFix=document.createElement('style');
  calendarFix.id='oto-sales-calendar-layout-fix';
  calendarFix.textContent=`
    .customer-history-inline .customer-history-filter.oto-calendar-filter{
      display:flex!important;flex-direction:column!important;align-items:stretch!important;
      gap:10px!important;min-width:0!important;width:100%!important;
      box-sizing:border-box!important;padding:12px!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-heading{
      display:grid!important;grid-template-columns:30px 30px minmax(0,1fr) 30px 30px!important;
      align-items:center!important;gap:4px!important;width:100%!important;margin:0!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-heading strong{
      text-align:center!important;min-width:0!important;font-size:13px!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-heading button{
      display:flex!important;align-items:center!important;justify-content:center!important;
      width:30px!important;min-width:30px!important;max-width:30px!important;
      height:30px!important;min-height:30px!important;padding:0!important;
      border:1px solid #d0d5dd!important;border-radius:6px!important;background:#fff!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-grid{
      display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr))!important;
      gap:3px!important;width:100%!important;min-width:0!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-grid>b{
      display:block!important;min-width:0!important;text-align:center!important;
      font-size:11px!important;padding:6px 0!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-grid>span{min-width:0!important;}
    .customer-history-inline .oto-calendar-filter .oto-calendar-grid>button{
      display:flex!important;flex-direction:column!important;align-items:center!important;
      justify-content:flex-start!important;gap:3px!important;
      width:100%!important;min-width:0!important;max-width:100%!important;
      height:59px!important;min-height:59px!important;margin:0!important;
      padding:5px 1px!important;box-sizing:border-box!important;
      border:1px solid #e4e7ec!important;border-radius:6px!important;
      background:#f8fafc!important;color:#101828!important;line-height:1.2!important;
      white-space:normal!important;overflow:hidden!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-grid>button.oto-calendar-selected{
      border:2px solid #155eef!important;background:#e5efff!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-grid>button>span{font-size:11px!important;}
    .customer-history-inline .oto-calendar-filter .oto-calendar-grid>button>small{
      display:block!important;width:100%!important;font-size:10px!important;
      font-weight:700!important;letter-spacing:-.15px!important;line-height:1.15!important;
      text-align:center!important;overflow-wrap:normal!important;white-space:nowrap!important;
      overflow:hidden!important;text-overflow:clip!important;
    }
    .customer-history-inline .oto-calendar-filter .oto-calendar-selection{font-size:11px!important;}
    .customer-history-inline .oto-calendar-filter .customer-history-buttons{
      display:flex!important;flex-wrap:wrap!important;gap:6px!important;width:100%!important;
    }
    .customer-history-inline .oto-calendar-filter .customer-history-buttons button{
      width:auto!important;min-width:0!important;padding:6px 10px!important;
