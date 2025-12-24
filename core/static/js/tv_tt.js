// Sample data for tạm vắng
const tamVangData = [
    { 
        id: 1, 
        name: 'Nguyễn Văn A', 
        dob: '15/03/1985',
        startDate: '01/10/2025',
        endDate: '15/10/2025',
        completed: true,
        reason: 'Công tác'
    },
    { 
        id: 2, 
        name: 'Trần Thị B', 
        dob: '22/08/1990',
        startDate: '05/10/2025',
        endDate: '12/10/2025',
        completed: false,
        reason: 'Du lịch'
    }
];

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

// Global function to toggle tạm vắng status (similar to handleFeeAction in thuphi.js)
function toggleStatus(id, isCompleting) {
    const record = tamVangData.find(r => r.id === id);
    if (!record) return;
    
    // Toggle completed status
    record.completed = !record.completed;
    
    // Find the row
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;
    
    const statusCell = row.querySelector('.status-badge');
    const actionBtn = row.querySelector('.btn-action');
    
    // Update status badge
    if (record.completed) {
        statusCell.classList.remove('status-active', 'status-overdue');
        statusCell.classList.add('status-completed');
        statusCell.textContent = 'Đã kết thúc';
        actionBtn.innerHTML = '<i class="fas fa-undo"></i> Hoàn tác';
        actionBtn.setAttribute('onclick', `toggleStatus(${id}, false)`);
        row.classList.remove('overdue-row');
    } else {
        statusCell.classList.remove('status-completed');
        statusCell.classList.add('status-active');
        statusCell.textContent = 'Chưa kết thúc';
        actionBtn.innerHTML = '<i class="fas fa-check"></i> Kết thúc';
        actionBtn.setAttribute('onclick', `toggleStatus(${id}, true)`);
        
        // Check if overdue
        const today = new Date();
        const endDate = parseDate(record.endDate);
        if (endDate < today) {
            statusCell.classList.add('status-overdue');
            statusCell.textContent = 'Quá hạn';
            row.classList.add('overdue-row');
        }
    }
    
    // Visual feedback (like thuphi)
    statusCell.style.transform = 'scale(1.1)';
    setTimeout(() => {
        statusCell.style.transform = 'scale(1)';
    }, 150);
}

// Helper function for date parsing
function parseDate(dateStr) {
    const parts = dateStr.split('/');
    return new Date(parts[2], parts[1] - 1, parts[0]);
}

// Sample data for tạm trú
const tamTruData = [
    { 
        id: 1, 
        name: 'Nguyễn Văn C', 
        dob: '12/05/2001',
        householdCode: 'HK-001',
        startDate: '01/11/2025',
        endDate: '15/11/2025',
        completed: true
    },
    { 
        id: 2, 
        name: 'Lê Thị D', 
        dob: '08/09/1995',
        householdCode: 'HK-002',
        startDate: '10/11/2025',
        endDate: '20/11/2025',
        completed: false
    }
];

// Global function to toggle tạm trú status (similar to toggleStatus for tạm vắng)
function toggleTamTruStatus(id) {
    const record = tamTruData.find(r => r.id === id);
    if (!record) return;
    
    // Toggle completed status
    record.completed = !record.completed;
    
    // Find the row
    const row = document.querySelector(`tr[data-id="${id}"]`);
    if (!row) return;
    
    const statusCell = row.querySelector('.status-badge');
    const actionBtn = row.querySelector('.btn-action');
    
    // Update status badge
    if (record.completed) {
        statusCell.classList.remove('status-active', 'status-overdue');
        statusCell.classList.add('status-completed');
        statusCell.textContent = 'Đã kết thúc';
        actionBtn.innerHTML = '<i class="fas fa-undo"></i> Hoàn tác';
        row.classList.remove('overdue-row');
    } else {
        statusCell.classList.remove('status-completed');
        statusCell.classList.add('status-active');
        statusCell.textContent = 'Chưa kết thúc';
        actionBtn.innerHTML = '<i class="fas fa-check"></i> Kết thúc';
        
        // Check if overdue
        const today = new Date();
        const endDate = parseDate(record.endDate);
        if (endDate < today) {
            statusCell.classList.add('status-overdue');
            statusCell.textContent = 'Quá hạn';
            row.classList.add('overdue-row');
        }
    }
    
    // Visual feedback
    statusCell.style.transform = 'scale(1.1)';
    setTimeout(() => {
        statusCell.style.transform = 'scale(1)';
    }, 150);
}