// Đọc dữ liệu thực từ Script Tags trong HTML
const members = JSON.parse(document.getElementById('members-data').textContent);
const personChanges = JSON.parse(document.getElementById('person-changes-data').textContent);
const householdChanges = JSON.parse(document.getElementById('household-changes-data').textContent);
const tempResidents = JSON.parse(document.getElementById('temp-residents-data').textContent);

function formatDate(dateString) {
    if (!dateString || dateString === "None") return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

// Render Danh sách nhân khẩu
function renderMembers() {
    const tbody = document.getElementById('membersTableBody');
    tbody.innerHTML = members.map((m, index) => `
        <tr onclick="showPersonPopup(${m.id})">
            <td>${index + 1}</td>
            <td>**${m.name}**</td>
            <td>${formatDate(m.birthDate)}</td>
            <td>${m.relationship}</td>
            <td><span class="status-badge ${m.status === 'Thường trú' ? 'status-active' : 'status-moved'}">${m.status}</span></td>
        </tr>
    `).join('');
}

// Render Thay đổi nhân khẩu
function renderPersonChanges() {
    const tbody = document.getElementById('personChangesTableBody');
    tbody.innerHTML = personChanges.map((c, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatDate(c.date)}</td>
            <td>NK-${c.id}</td>
            <td><span class="change-type-badge">${c.type}</span></td>
            <td>${c.note}</td>
        </tr>
    `).join('') || '<tr><td colspan="5">Không có lịch sử thay đổi</td></tr>';
}

// Render Thay đổi hộ khẩu
function renderHouseholdChanges() {
    const tbody = document.getElementById('householdChangesTableBody');
    tbody.innerHTML = householdChanges.map((c, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${formatDate(c.date)}</td>
            <td><span class="field-change-badge">${c.field}</span></td>
            <td>${c.content}</td>
        </tr>
    `).join('') || '<tr><td colspan="4">Không có thay đổi hộ khẩu</td></tr>';
}

// Render Tạm trú
function renderTempResidents() {
    const tbody = document.getElementById('temporaryResidentsTableBody');
    tbody.innerHTML = tempResidents.map((r, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${r.name}</td>
            <td>${r.cccd}</td>
            <td>${formatDate(r.start)}</td>
            <td>${formatDate(r.end)}</td>
        </tr>
    `).join('') || '<tr><td colspan="5">Không có người tạm trú</td></tr>';
}

function showPersonPopup(id) {
    const person = members.find(m => m.id === id);
    if (!person) return;

    const popupBody = document.getElementById('popupBodyContent');
    popupBody.innerHTML = `
        <div class="info-grid">
            <div class="info-item"><span class="info-label">Họ tên:</span> <span class="info-value">${person.name}</span></div>
            <div class="info-item"><span class="info-label">Giới tính:</span> <span class="info-value">${person.gender}</span></div>
            <div class="info-item"><span class="info-label">CCCD:</span> <span class="info-value">${person.idCard}</span></div>
            <div class="info-item"><span class="info-label">Quan hệ:</span> <span class="info-value">${person.relationship}</span></div>
            <div class="info-item"><span class="info-label">Nghề nghiệp:</span> <span class="info-value">${person.occupation}</span></div>
            <div class="info-item"><span class="info-label">Nơi làm việc:</span> <span class="info-value">${person.workplace}</span></div>
        </div>
    `;
    document.getElementById('personInfoPopup').classList.add('active');
}

function closePersonPopup() {
    document.getElementById('personInfoPopup').classList.remove('active');
}

// Khởi chạy khi load trang
document.addEventListener('DOMContentLoaded', () => {
    renderMembers();
    renderPersonChanges();
    renderHouseholdChanges();
    renderTempResidents();
});