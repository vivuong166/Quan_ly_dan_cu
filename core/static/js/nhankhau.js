document.addEventListener('DOMContentLoaded', function() {
    const viewModal = document.getElementById('viewPersonModal');
    const viewContent = document.getElementById('viewPersonContent');

    window.viewPerson = function (btn) {
        const row = btn.closest('tr');
        console.log(row.dataset);
        const hoTen = row.dataset.hoTen;
        const maHK = row.dataset.maHk;
        const ngaySinh = row.dataset.ngaySinh;
        const gioiTinh = row.dataset.gioiTinh;
        const cccd = row.dataset.cccd;
        const quanHe = row.dataset.quanHe;
        const ngheNghiep = row.dataset.ngheNghiep;
        const noiSinh = row.dataset.noiSinh;
        const nguyenQuan = row.dataset.nguyenQuan;
        const danToc = row.dataset.danToc;
        const noiLamViec = row.dataset.noiLamViec;
        const ngayCapCCCD = row.dataset.ngayCapCccd;
        const noiCapCCCD = row.dataset.noiCapCccd;
        const ngayDKThuongTru = row.dataset.ngayDkThuongTru;
        const diaChiTruocChuyen = row.dataset.diaChiTruocChuyen;
        const trangThai = row.dataset.trangThai;

        viewContent.innerHTML = `
            <div class="person-details" style="display:grid;grid-template-columns:1fr 1fr;gap:15px;">
                <div style="grid-column:span 2;border-bottom:2px solid #2563eb;padding-bottom:8px;margin-bottom:10px;">
                    <h4 style="margin:0;color:#1e3a8a;font-size:1.2rem;">${hoTen}</h4>
                    <p style="margin:5px 0 0;font-size:0.8rem;color:#666;">Mã hộ khẩu: ${maHK}</p>
                </div>
                <div><strong>Ngày sinh:</strong> ${ngaySinh}</div>
                <div><strong>Giới tính:</strong> ${gioiTinh}</div>
                <div><strong>Quan hệ với chủ hộ:</strong> ${quanHe}</div>
                <div><strong>Ngày đăng ký thường trú:</strong> ${ngayDKThuongTru}</div>
                <div><strong>Nghề nghiệp:</strong> ${ngheNghiep}</div>
                <div><strong>Nơi sinh:</strong> ${noiSinh}</div>
                <div><strong>Quê quán:</strong> ${nguyenQuan}</div>
                <div><strong>Dân tộc:</strong> ${danToc}</div>
                <div style="grid-column:span 2;"><strong>Nơi làm việc:</strong> ${noiLamViec}</div>
                <div><strong>CMND/CCCD:</strong> ${cccd}</div>
                <div><strong>Ngày cấp CCCD:</strong> ${ngayCapCCCD}</div>
                <div style="grid-column:span 2;"><strong>Nơi cấp CCCD:</strong> ${noiCapCCCD}</div>
                <div style="grid-column:span 2;"><strong>Địa chỉ trước khi chuyển:</strong> ${diaChiTruocChuyen}</div>
                <div style="grid-column:span 2;"><strong>Trạng thái:</strong> ${trangThai}</div>
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