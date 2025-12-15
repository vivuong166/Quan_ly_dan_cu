// Sample data
const sampleHouseholds = {
    1: {
        id: 1,
        code: "HK001",
        address: "Số 123, Đường Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội",
        headName: "Nguyễn Văn A",
        members: [
            {
                id: 1,
                name: "Nguyễn Văn A",
                birthDate: "1975-05-15",
                gender: "Nam",
                idCard: "001075012345",
                phone: "0912345678",
                relationship: "Chủ hộ",
                occupation: "Kỹ sư",
                workplace: "Công ty ABC",
                status: "Thường trú",
                isHead: true
            },
            {
                id: 2,
                name: "Trần Thị B",
                birthDate: "1978-08-20",
                gender: "Nữ",
                idCard: "001078023456",
                phone: "0987654321",
                relationship: "Vợ",
                occupation: "Giáo viên",
                workplace: "Trường THPT XYZ",
                status: "Thường trú",
                isHead: false
            },
            {
                id: 3,
                name: "Nguyễn Văn C",
                birthDate: "2005-03-10",
                gender: "Nam",
                idCard: "001005034567",
                phone: "0901234567",
                relationship: "Con",
                occupation: "Học sinh",
                workplace: "Trường THPT ABC",
                status: "Thường trú",
                isHead: false
            },
            {
                id: 4,
                name: "Nguyễn Thị D",
                birthDate: "2010-11-25",
                gender: "Nữ",
                idCard: "",
                phone: "",
                relationship: "Con",
                occupation: "Học sinh",
                workplace: "Trường THCS XYZ",
                status: "Tạm vắng",
                isHead: false
            }
        ],
        personChanges: [
            {
                id: 1,
                date: "2023-05-15",
                name: "Nguyễn Thị E",
                birthDate: "2023-05-15",
                changeType: "Mới sinh"
            },
            {
                id: 2,
                date: "2023-08-20",
                name: "Phạm Văn F",
                birthDate: "1985-03-10",
                changeType: "Chuyển đến"
            },
            {
                id: 3,
                date: "2023-11-10",
                name: "Lê Thị G",
                birthDate: "1980-07-15",
                changeType: "Chuyển đi"
            },
            {
                id: 4,
                date: "2023-12-01",
                name: "Hoàng Văn H",
                birthDate: "1945-02-20",
                changeType: "Qua đời"
            }
        ],
        householdChanges: [
            {
                id: 1,
                date: "2023-03-15",
                field: "Số nhà",
                content: "Thay đổi từ 'Số 121' thành 'Số 123'"
            },
            {
                id: 2,
                date: "2023-06-20",
                field: "Đường phố",
                content: "Thay đổi từ 'Đường Láng Hạ' thành 'Đường Láng'"
            },
            {
                id: 3,
                date: "2023-09-10",
                field: "Chủ hộ",
                content: "Thay đổi từ 'Nguyễn Văn Z' thành 'Nguyễn Văn A'"
            }
        ],
        temporaryResidents: [
            {
                id: 1,
                name: "Võ Thị I",
                birthDate: "1995-04-12",
                startDate: "2023-10-01",
                endDate: "2024-01-01",
                status: "Hoàn thành"
            },
            {
                id: 2,
                name: "Đặng Văn K",
                birthDate: "1992-09-25",
                startDate: "2023-11-15",
                endDate: "2023-12-10",
                status: "Hoàn thành"
            },
            {
                id: 3,
                name: "Bùi Thị L",
                birthDate: "1998-06-08",
                startDate: "2023-12-01",
                endDate: "2024-03-01",
                status: "Hoàn thành"
            }
        ]
    },
    2: {
        id: 2,
        code: "HK002",
        address: "Số 456, Đường Giải Phóng, Phường Đồng Tâm, Quận Hai Bà Trưng, Hà Nội",
        headName: "Lê Văn M",
        members: [
            {
                id: 5,
                name: "Lê Văn M",
                birthDate: "1980-02-28",
                gender: "Nam",
                idCard: "001080045678",
                phone: "0923456789",
                relationship: "Chủ hộ",
                occupation: "Bác sĩ",
                workplace: "Bệnh viện Đa khoa",
                status: "Thường trú",
                isHead: true
            }
        ],
        personChanges: [],
        householdChanges: [],
        temporaryResidents: []
    }
};

// Hàm format ngày tháng
function formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

// Hàm kiểm tra hết hạn tạm trú
function isExpired(endDate, status) {
    if (status !== "Hoàn thành") return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);
    return end < today;
}

// Hàm load thông tin cơ bản
function loadBasicInfo(household) {
    document.getElementById('householdCode').textContent = household.code || "-";
    document.getElementById('householdAddress').textContent = household.address || "-";
    document.getElementById('householdHead').textContent = household.headName || "-";
}

// Hàm render danh sách nhân khẩu
function renderMembersTable(members) {
    const tbody = document.getElementById('membersTableBody');
    
    if (!members || members.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Không có dữ liệu</td></tr>';
        return;
    }

    // Sắp xếp: chủ hộ lên đầu
    const sortedMembers = [...members].sort((a, b) => {
        if (a.isHead) return -1;
        if (b.isHead) return 1;
        return 0;
    });

    tbody.innerHTML = sortedMembers.map((member, index) => {
        const statusClass = member.status === "Thường trú" ? "status-active" : 
                           member.status === "Tạm vắng" ? "status-temporary-absent" :
                           member.status === "Chuyển đi" ? "status-moved" : "status-deceased";
        
        return `
            <tr onclick="showPersonPopup(${member.id})">
                <td>${index + 1}</td>
                <td>${member.name}</td>
                <td>${formatDate(member.birthDate)}</td>
                <td>${member.relationship}</td>
                <td><span class="status-badge ${statusClass}">${member.status}</span></td>
            </tr>
        `;
    }).join('');
}

// Hàm render danh sách thay đổi nhân khẩu
function renderPersonChangesTable(changes) {
    const tbody = document.getElementById('personChangesTableBody');
    
    if (!changes || changes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = changes.map((change, index) => {
        const changeClass = change.changeType === "Mới sinh" ? "change-birth" :
                           change.changeType === "Chuyển đến" ? "change-move-in" :
                           change.changeType === "Chuyển đi" ? "change-move-out" : "change-deceased";
        
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(change.date)}</td>
                <td>${change.name}</td>
                <td>${formatDate(change.birthDate)}</td>
                <td><span class="change-type-badge ${changeClass}">${change.changeType}</span></td>
            </tr>
        `;
    }).join('');
}

// Hàm render danh sách thay đổi hộ khẩu
function renderHouseholdChangesTable(changes) {
    const tbody = document.getElementById('householdChangesTableBody');
    
    if (!changes || changes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = changes.map((change, index) => {
        return `
            <tr>
                <td>${index + 1}</td>
                <td>${formatDate(change.date)}</td>
                <td><span class="field-change-badge">${change.field}</span></td>
                <td>${change.content}</td>
            </tr>
        `;
    }).join('');
}

// Hàm render danh sách tạm trú
function renderTemporaryResidentsTable(residents) {
    const tbody = document.getElementById('temporaryResidentsTableBody');
    
    if (!residents || residents.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">Không có dữ liệu</td></tr>';
        return;
    }

    tbody.innerHTML = residents.map((resident, index) => {
        const expired = isExpired(resident.endDate, resident.status);
        const rowClass = expired ? 'class="expired-row"' : '';
        
        return `
            <tr ${rowClass}>
                <td>${index + 1}</td>
                <td>${resident.name}</td>
                <td>${formatDate(resident.birthDate)}</td>
                <td>${formatDate(resident.startDate)}</td>
                <td>${formatDate(resident.endDate)}</td>
            </tr>
        `;
    }).join('');
}

// Hàm hiển thị popup thông tin nhân khẩu
function showPersonPopup(personId) {
    const household = sampleHouseholds[HOUSEHOLD_ID];
    if (!household) return;

    const person = household.members.find(m => m.id === personId);
    if (!person) return;

    document.getElementById('popupName').textContent = person.name || "-";
    document.getElementById('popupBirthDate').textContent = formatDate(person.birthDate);
    document.getElementById('popupGender').textContent = person.gender || "-";
    document.getElementById('popupIdCard').textContent = person.idCard || "-";
    document.getElementById('popupPhone').textContent = person.phone || "-";
    document.getElementById('popupRelationship').textContent = person.relationship || "-";
    document.getElementById('popupOccupation').textContent = person.occupation || "-";
    document.getElementById('popupWorkplace').textContent = person.workplace || "-";
    
    const statusClass = person.status === "Thường trú" ? "status-active" : 
                       person.status === "Tạm vắng" ? "status-temporary-absent" :
                       person.status === "Chuyển đi" ? "status-moved" : "status-deceased";
    document.getElementById('popupStatus').innerHTML = `<span class="status-badge ${statusClass}">${person.status}</span>`;

    document.getElementById('personInfoPopup').classList.add('active');
}

// Hàm đóng popup
function closePersonPopup() {
    document.getElementById('personInfoPopup').classList.remove('active');
}

// Đóng popup khi click bên ngoài
document.getElementById('personInfoPopup').addEventListener('click', function(e) {
    if (e.target === this) {
        closePersonPopup();
    }
});

// Load dữ liệu khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
    const household = sampleHouseholds[HOUSEHOLD_ID];
    
    if (household) {
        loadBasicInfo(household);
        renderMembersTable(household.members);
        renderPersonChangesTable(household.personChanges);
        renderHouseholdChangesTable(household.householdChanges);
        renderTemporaryResidentsTable(household.temporaryResidents);
    } else {
        alert('Không tìm thấy thông tin hộ khẩu!');
        window.location.href = '/qlhk_nk/hokhau/';
    }
});
