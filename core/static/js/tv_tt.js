document.addEventListener('DOMContentLoaded', function(){
    // tabs
    document.querySelectorAll('.tab-btn').forEach(btn=>{
        btn.addEventListener('click', ()=> {
            document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
            btn.classList.add('active');
            const tab = btn.dataset.tab;
            document.querySelectorAll('.tvtt-panel').forEach(p=>p.classList.remove('active'));
            document.getElementById('tab-' + tab).classList.add('active');
        });
    });

    // helpers to append list item
    function appendList(listEl, html) {
        const li = document.createElement('li');
        li.innerHTML = html;
        listEl.prepend(li);
    }

    // add tạm vắng
    const addTvBtn = document.getElementById('addTv');
    if(addTvBtn){
        addTvBtn.addEventListener('click', function(){
            const person = document.getElementById('tv_person').value.trim() || '—';
            const ngayDi = document.getElementById('tv_ngay_bat_dau').value || '—';
            const han = document.getElementById('tv_ngay_ket_thuc').value || '—';
            const lyDo = document.getElementById('tv_ly_do').value.trim() || '';
            const html = `<strong>${person}</strong> — ${ngayDi} → ${han} — ${lyDo? '— ' + lyDo : ''}`;
            appendList(document.getElementById('tvList'), html);
            // clear minimal
            document.getElementById('formTv').reset();
        });
    }

    // add tạm trú
    const addTtBtn = document.getElementById('addTt');
    if(addTtBtn){
        addTtBtn.addEventListener('click', function(){
            const ten = document.getElementById('tt_ho_ten').value.trim() || '—';
            const ns = document.getElementById('tt_ngay_sinh').value || '—';
            const cmnd = document.getElementById('tt_cmnd').value.trim() || '';
            const diaChi = document.getElementById('tt_dia_chi').value.trim() || '—';
            const ngayDen = document.getElementById('tt_ngay_den').value || '—';
            const han = document.getElementById('tt_han').value || '—';
            const html = `${ten} — ${ns} ${cmnd? '— CCCD: ' + cmnd : ''} — Địa chỉ: ${diaChi} — ${ngayDen} → ${han}`;
            appendList(document.getElementById('ttList'), html);
            document.getElementById('formTt').reset();
        });
    }

    // simple search filter
    function bindSearch(inputId, listId) {
        const inp = document.getElementById(inputId);
        const list = document.getElementById(listId);
        if(!inp || !list) return;
        inp.addEventListener('input', function(){
            const q = this.value.trim().toLowerCase();
            Array.from(list.children).forEach(li=>{
                li.style.display = (!q || li.textContent.toLowerCase().includes(q)) ? '' : 'none';
            });
        });
    }
    bindSearch('searchTv','tvList');
    bindSearch('searchTt','ttList');

    // print handlers: print the selected panel content (simple)
    const printTvBtn = document.getElementById('printTv');
    if(printTvBtn){
        printTvBtn.addEventListener('click', function(){
            const win = window.open('', '_blank');
            win.document.write('<h3>Giấy tạm vắng</h3>' + document.getElementById('tab-tv').innerHTML);
            win.print(); win.close();
        });
    }
    const printTtBtn = document.getElementById('printTt');
    if(printTtBtn){
        printTtBtn.addEventListener('click', function(){
            const win = window.open('', '_blank');
            win.document.write('<h3>Giấy tạm trú</h3>' + document.getElementById('tab-tt').innerHTML);
            win.print(); win.close();
        });
    }
});