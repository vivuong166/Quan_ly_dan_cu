// Sample data for tạm vắng
// const tamVangData = [
//     { 
//         id: 1, 
//         name: 'Nguyễn Văn A', 
//         dob: '15/03/1985',
//         startDate: '01/10/2025',
//         endDate: '15/10/2025',
//         completed: true,
//         reason: 'Công tác'
//     },
//     { 
//         id: 2, 
//         name: 'Trần Thị B', 
//         dob: '22/08/1990',
//         startDate: '05/10/2025',
//         endDate: '12/10/2025',
//         completed: false,
//         reason: 'Du lịch'
//     }
// ];
const tamVangData = window.tamvangRecords;
const tamTruData = window.tamtruRecords;

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
        addTvBtn.addEventListener('click', async function(){
            const ten = document.getElementById('tv_ho_ten').value.trim();
            const ns = document.getElementById('tv_ngay_sinh').value;
            const cmnd = document.getElementById('tv_cmnd').value.trim();
            //const cccd = document.getElementById('tv_cmnd').value.trim();
            const ngayDi = document.getElementById('tv_ngay_bat_dau').value;
            const han = document.getElementById('tv_ngay_ket_thuc').value;
            const lyDo = document.getElementById('tv_ly_do').value.trim();
            //const html = `<strong>${person}</strong> — ${ngayDi} → ${han} — ${lyDo? '— ' + lyDo : ''}`;
            //appendList(document.getElementById('tvList'), html);
            // clear minimal
            //document.getElementById('formTv').reset();

            if(!ten || !ns || !cmnd || !ngayDi || !han || !lyDo){
                alert('Vui lòng điền đầy đủ thông tin tạm vắng.');
                return;
            }

            const dataForm = new FormData;
            dataForm.append("ten", ten);
            dataForm.append("ns", ns);
            dataForm.append("cmnd", cmnd);
            dataForm.append("ngayDi", ngayDi);
            dataForm.append("han", han);
            dataForm.append("lyDo", lyDo);

            try{
                const response = await fetch('/tamvang/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: dataForm
                });
                if(response.ok){
                    alert('Dang ky tam vang thanh cong!');
                    document.getElementById('formTv').reset();
                }else{
                    console.log(response);
                    console.log(error)
                    alert('Dang ky tam vang that bai!');
                }
                //appendList(document.getElementById('tvList'), html);
                // clear minimal
                
            } catch{
                alert('Co loi xay ra khi dang ky tam vang.');
            }
        });
    }

    // add tạm trú
    const addTtBtn = document.getElementById('addTt');
    if(addTtBtn){
        addTtBtn.addEventListener('click', async function(){
            const ma_ho_khau = document.getElementById('tt_ma_hk').value;
            const ten = document.getElementById('tt_ho_ten').value.trim();
            const ns = document.getElementById('tt_ngay_sinh').value;
            const cmnd = document.getElementById('tt_cmnd').value.trim();
            const ngheNghiep = document.getElementById('tt_nghe_nghiep').value.trim();
            const ngayDen = document.getElementById('tt_ngay_den').value;
            const han = document.getElementById('tt_han').value;
            //const html = `${ten} — ${ns} ${cmnd? '— CCCD: ' + cmnd : ''} — Nghề nghiệp: ${ngheNghiep} — ${ngayDen} → ${han}`;
            // appendList(document.getElementById('ttList'), html);
            // document.getElementById('formTt').reset();

            if(!ma_ho_khau || !ten || !ns || !cmnd || !ngheNghiep || !ngayDen || !han){
                alert('Vui lòng điền đầy đủ thông tin tạm trú.');
                return;
            }

            const dataForm = new FormData;
            dataForm.append("ma_ho_khau", ma_ho_khau);
            dataForm.append("ten", ten);
            dataForm.append("ns", ns);
            dataForm.append("cmnd", cmnd);
            dataForm.append("ngheNghiep", ngheNghiep);
            dataForm.append("ngayDen", ngayDen);
            dataForm.append("han", han);


            try{
                const response = await fetch('/tamtru/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken'),
                    },
                    body: dataForm
                });

                if(response.ok){
                    alert('Dang li tam tru thanh cong!');
                }else{
                    alert('Dang ky tam tru that bai!');
                }
                appendList(document.getElementById('ttList'), html);
                // clear minimal
                document.getElementById('formTt').reset();
            } catch{
                alert('Co loi xay ra khi dang ky tam tru.');

            }
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
// const tamTruData = [
//     { 
//         id: 1, 
//         name: 'Nguyễn Văn C', 
//         dob: '12/05/2001',
//         householdCode: 'HK-001',
//         startDate: '01/11/2025',
//         endDate: '15/11/2025',
//         completed: true
//     },
//     { 
//         id: 2, 
//         name: 'Lê Thị D', 
//         dob: '08/09/1995',
//         householdCode: 'HK-002',
//         startDate: '10/11/2025',
//         endDate: '20/11/2025',
//         completed: false
//     }
// ];

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

function getCookie(name){
    let cookieValue = null;
    if (document.cookie && document.cookie !== ''){
        const cookies = document.cookie.split(';'); 
        for (let i = 0; i < cookies.length; i++){
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')){
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
//Nhan xu ly reload danh sach tam tru
document.addEventListener('DOMContentLoaded', function(){
    const reloadBtn = document.getElementById('reloadTamTruList');

if (reloadBtn) {
    reloadBtn.addEventListener('click', async function () {
        try {
            const response = await fetch('/tamtru/', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            const data = await response.json();
            const tbody = document.getElementById('ttList');
            tbody.innerHTML = '';

            data.forEach(item => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td><strong>${item.ho_ten}</strong></td>
                    <td>${item.ngay_sinh}</td>
                    <td>${item.ma_ho_khau}</td>
                    <td>${item.ngay_bat_dau}</td>
                    <td>${item.ngay_ket_thuc}</td>
                    <td>
                        ${item.trang_thai
                            ? '<span class="status-badge status-completed">Đã kết thúc</span>'
                            : '<span class="status-badge status-active">Chưa kết thúc</span>'}
                    </td>
                    <td>
                        <button class="btn-sm btn-action" onclick="toggleTamTruStatus(${item.id}, ${item.trang_thai})">
                            ${item.trang_thai ? 'Hoàn tác' : 'Kết thúc'}
                        </button>
                    </td>
                `;
                tbody.appendChild(tr);
            });

        } catch (err) {
            alert("Không thể reload danh sách");

        }
    });
}

});

//Nhan xu ly reload danh sach tam vang
document.addEventListener('DOMContentLoaded', function(){
    const reloadBtn = document.getElementById('reloadTamVangList');
    if (reloadBtn) {
        reloadBtn.addEventListener('click', async function () {
            try {
                const response = await fetch('/tamvang/', {
                    method: 'GET',
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                const data = await response.json();
                const tbody = document.getElementById('tvList');
                tbody.innerHTML = '';

                data.forEach(item => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td><strong>${item.ho_ten}</strong></td>
                        <td>${item.ngay_sinh}</td>
                        <td>${item.ngay_bat_dau}</td>
                        <td>${item.ngay_ket_thuc}</td>
                        <td>
                            ${item.trang_thai
                                ? '<span class="status-badge status-completed">Đã kết thúc</span>'
                                : '<span class="status-badge status-active">Chưa kết thúc</span>'}
                        </td>
                        <td>
                            <button class="btn-sm btn-action" onclick="toggleStatus(${item.id}, ${item.trang_thai})">
                                ${item.trang_thai ? 'Hoàn tác' : 'Kết thúc'}
                            </button>
                        </td>`;
                    tbody.appendChild(tr);
                });

            } catch (err) {
                alert("Không thể reload danh sách");        
            }
        });
    }
});
