display:inline-flex!important;align-items:center!important;justify-content:center!important;
      box-sizing:border-box!important;position:static!important;flex:0 0 auto!important;
      width:auto!important;min-width:44px!important;height:26px!important;min-height:26px!important;
      margin:0!important;padding:0 10px!important;border:1px solid #fda29b!important;
      border-radius:6px!important;background:#fff!important;color:#d92d20!important;
      font-size:11px!important;font-weight:700!important;line-height:1!important;
      box-shadow:none!important;white-space:nowrap!important;
    }
    html body #root .app .customer-table .customer-row-actions > button.oto-unified-edit:hover,
    html body #root .app .customer-card-actions > button.oto-unified-edit:hover{background:#eef4ff!important;}
    html body #root .app .customer-table .customer-row-actions > button.oto-unified-delete:hover,
    html body #root .app .customer-card-actions > button.oto-unified-delete:hover{background:#fff1f0!important;}
    html body #root .app .customer-row-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;flex-wrap:nowrap!important;}
    html body #root .app .customer-card-actions{display:flex!important;align-items:center!important;gap:6px!important;}
  `;
  document.head.appendChild(actionStyle);
}

/* v6.6.18 - 목록 표 디자인 공통 보정 (기존 기능 변경 없음) */
if(typeof document!=='undefined'&&!document.getElementById('oto-v6618-table-unify')){
  const style=document.createElement('style');
  style.id='oto-v6618-table-unify';
  style.textContent='/* v6.6.18: 재고 탭을 기준으로 목록 헤더/행의 시각적 규격 통일. 정렬 로직과 열 구성은 유지 */\n.app .table-wrap > table,\n.app .customer-table-wrap > table.customer-table,\n.app .oto-compact-log-wrap > table.oto-compact-log-table {\n  border-collapse:separate!important;\n  border-spacing:0!important;\n  width:100%!important;\n}\n.app .table-wrap > table > thead > tr > th,\n.app .customer-table > thead > tr > th,\n.app .oto-compact-log-table > thead > tr > th {\n  height:42px!important;\n  min-height:42px!important;\n  padding:0 12px!important;\n  background:#f8fafc!important;\n  color:#475467!important;\n  border-top:1px solid #e4e7ec!important;\n  border-bottom:1px solid #e4e7ec!important;\n  font-size:12px!important;\n  font-weight:700!important;\n  line-height:1.3!important;\n  vertical-align:middle!important;\n  white-space:nowrap!important;\n}\n.app .table-wrap > table > thead > tr > th:first-child,\n.app .customer-table > thead > tr > th:first-child,\n.app .oto-compact-log-table > thead > tr > th:first-child {\n  border-left:1px solid #e4e7ec!important;\n  border-top-left-radius:8px!important;\n}\n.app .table-wrap > table > thead > tr > th:last-child,\n.app .customer-table > thead > tr > th:last-child,\n.app .oto-compact-log-table > thead > tr > th:last-child {\n  border-right:1px solid #e4e7ec!important;\n  border-top-right-radius:8px!important;\n}\n.app .table-wrap > table > tbody > tr > td,\n.app .customer-table > tbody > tr:not(.customer-inline-detail-row) > td,\n.app .oto-compact-log-table > tbody > tr:not(.oto-log-detail-row) > td {\n  border-bottom:1px solid #edf0f4!important;\n  padding-top:9px!important;\n  padding-bottom:9px!important;\n  vertical-align:middle!important;\n}\n.app .customer-table > thead button,\n.app .oto-compact-log-table > thead button.oto-log-sort-button,\n.app .table-wrap > table > thead button {\n  font-size:inherit!important;\n  font-weight:inherit!important;\n  line-height:inherit!important;\n  color:inherit!important;\n  white-space:nowrap!important;\n}\n.app .customer-table .customer-row-actions {display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:6px!important;flex-wrap:nowrap!important;}\n.app .customer-table .customer-row-actions > button.oto-unified-edit,\n.app .customer-table .customer-row-actions > button.oto-unified-delete {\n  display:inline-flex!important;align-items:center!important;justify-content:center!important;\n  min-width:44px!important;width:44px!important;height:27px!important;min-height:27px!important;\n  padding:0 7px!important;border-radius:6px!important;background:#fff!important;\n  font-size:11px!important;font-weight:700!important;white-space:nowrap!important;\n}\n.app .customer-table .customer-row-actions > button.oto-unified-edit {border:1px solid #b2ccff!important;color:#155eef!important;}\n.app .customer-table .customer-row-actions > button.oto-unified-delete {border:1px solid #fda29b!important;color:#d92d20!important;}\n';
  document.head.appendChild(style);
}


/* v6.6.19: 재고 탭과 동일한 목록 표 좌우 여백 (기능 변경 없음) */
if(typeof document!=='undefined'&&!document.getElementById('oto-v6619-table-gutters')){
  const gutterStyle=document.createElement('style');
  gutterStyle.id='oto-v6619-table-gutters';
  gutterStyle.textContent=`
    /* 재고·도매처·개인고객·입출고 목록의 좌우 시작/끝 위치 통일 */
    .app .table-wrap,
    .app .customer-table-wrap,
    .app .oto-compact-log-wrap {
      padding-left:12px!important;
      padding-right:12px!important;
      box-sizing:border-box!important;
      width:100%!important;
    }
    .app .customer-table-wrap > .customer-table,
    .app .oto-compact-log-wrap > .oto-compact-log-table {
      width:100%!important;
      border:1px solid #e4e7ec!important;
      border-radius:10px!important;
      border-collapse:separate!important;
      border-spacing:0!important;
      box-sizing:border-box!important;
    }
    /* 좌우 여백은 표의 바깥에만 부여하고 셀 간격은 유지 */
    @media(max-width:700px){
      .app .table-wrap,
      .app .customer-table-wrap,
      .app .oto-compact-log-wrap {
        padding-left:8px!important;
        padding-right:8px!important;
      }
    }
  `;
  document.head.appendChild(gutterStyle);
}


/* v6.6.24: 도매처/개인고객 표 정렬 제목의 흰색 버튼 배경 제거 */
if(typeof document!=='undefined'&&!document.getElementById('oto-v6624-customer-header-flat')){
  const headerStyle=document.createElement('style');
  headerStyle.id='oto-v6624-customer-header-flat';
  headerStyle.textContent=`
    .app .customer-table > thead > tr > th {
      background:#f8fafc!important;
    }
    .app .customer-table > thead > tr > th > button {
      display:inline-flex!important;
      align-items:center!important;
      justify-content:flex-start!important;
      width:100%!important;
      min-width:0!important;
      height:100%!important;
      min-height:0!important;
      margin:0!important;
      padding:0!important;
      background:transparent!important;
      background-image:none!important;
      border:0!important;
      border-radius:0!important;
      box-shadow:none!important;
      color:inherit!important;
      font:inherit!important;
      text-align:left!important;
      white-space:nowrap!important;
      cursor:pointer!important;
    }
    .app .customer-table > thead > tr > th > button:hover,
    .app .customer-table > thead > tr > th > button:focus,
    .app .customer-table > thead > tr > th > button:active {
      background:transparent!important;
      background-image:none!important;
      border:0!important;
      box-shadow:none!important;
    }
    .app .customer-table > thead > tr > th > button:focus-visible {
      outline:2px solid #8fb2ff!important;
      outline-offset:2px!important;
    }
  `;
  document.head.appendChild(headerStyle);
}

/* v6.6.25: 거래명세표 품목 자동 페이지 분할 (A4 상하 2부 유지) */
if(typeof document!=='undefined'&&!document.getElementById('oto-invoice-multipage')){
 const st=document.createElement('style');st.id='oto-invoice-multipage';st.textContent=`
 @media screen{
  .invoice-pages{display:flex;flex-direction:column;align-items:center;gap:18px;padding-bottom:24px;}
  .invoice-pages .invoice-preview-viewport{flex:none;}
 }
 @media print{
  @page{size:A4 portrait;margin:0;}
  html,body,#root{height:auto!important;min-height:0!important;overflow:visible!important;}
  .invoice-overlay{position:absolute!important;inset:auto!important;top:0!important;left:0!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;}
  .invoice-window{position:static!important;inset:auto!important;height:auto!important;min-height:0!important;max-height:none!important;overflow:visible!important;}
  .invoice-pages{display:block!important;position:static!important;width:210mm!important;height:auto!important;overflow:visible!important;}
  .invoice-pages .invoice-preview-viewport{display:block!important;position:relative!important;width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;margin:0!important;padding:0!important;overflow:hidden!important;break-after:page!important;page-break-after:always!important;break-inside:avoid!important;page-break-inside:avoid!important;}
  .invoice-pages .invoice-preview-viewport:last-child{break-after:auto!important;page-break-after:auto!important;}
  .invoice-pages .invoice-sheet.portrait-double{position:relative!important;inset:auto!important;top:auto!important;left:auto!important;display:grid!important;grid-template-rows:148.5mm 148.5mm!important;width:210mm!important;height:297mm!important;min-height:297mm!important;max-height:297mm!important;transform:none!important;overflow:hidden!important;}
  .invoice-pages .invoice-sheet.portrait-double>.statement-copy{height:148.5mm!important;min-height:148.5mm!important;max-height:148.5mm!important;overflow:hidden!important;}
  .invoice-pages .invoice-sheet.portrait-double>.cut-line{top:148.5mm!important;}
  .invoice-toolbar-spacer{display:none!important;}
