document.addEventListener('DOMContentLoaded', function() {
    const viewModal = document.getElementById('viewPersonModal');
    const viewContent = document.getElementById('viewPersonContent');

    window.viewPerson = function(maNK) {
        const btn = event.currentTarget;
        const row = btn.closest('tr');
        
        // Trích xuất dữ liệu từ các cột td
        const hoTen = row.cells[0].innerText;
        const ngaySinh = row.cells[1].innerText;
        const gioiTinh = row.cells[2].innerText;
        const cccd = row.cells[3].innerText;
        const maHK = row.cells[4].innerText;
        const quanHe = row.cells[5].innerText;
        const ngheNghiep = row.cells[6].innerText;

        viewContent.innerHTML = `
            <div class="person-details" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="grid-column: span 2; border-bottom: 2px solid #2563eb; padding-bottom: 8px; margin-bottom: 10px;">
                    <h4 style="margin:0; color: #1e3a8a; font-size: 1.2rem;">${hoTen}</h4>
                    <p style="margin: 5px 0 0 0; font-size: 0.8rem; color: #666;">Mã nhân khẩu: ${maNK}</p>
                </div>
                <div><strong>Ngày sinh:</strong> ${ngaySinh}</div>
                <div><strong>Giới tính:</strong> ${gioiTinh}</div>
                <div><strong>CMND/CCCD:</strong> ${cccd}</div>
                <div><strong>Mã hộ khẩu:</strong> <span class="badge" style="background:#e0e7ff; color:#1e40af; padding: 2px 6px;">${maHK}</span></div>
                <div><strong>Quan hệ:</strong> ${quanHe}</div>
                <div><strong>Nghề nghiệp:</strong> ${ngheNghiep}</div>
            </div>
        `;

        if (viewModal) viewModal.style.display = 'flex';
    };

    window.closeViewModal = function() {
        if (viewModal) viewModal.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target === viewModal) closeViewModal();
    };
});