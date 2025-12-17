// Sample data - hộ khẩu để tách
const sampleHouseholds = {
    1: {
        id: 1,
        code: "HK-001",
        headName: "Nguyễn Văn An",
        address: "Số 123, Đường Láng, Phường Láng Thượng, Quận Đống Đa, Hà Nội",
        members: [
            {
                id: 1,
                name: "Nguyễn Văn An",
                isHead: true,
                relationship: "Chủ hộ"
            },
            {
                id: 2,
                name: "Trần Thị Bình",
                isHead: false,
                relationship: "Vợ"
            },
            {
                id: 3,
                name: "Nguyễn Văn Cường",
                isHead: false,
                relationship: "Con trai"
            },
            {
                id: 4,
                name: "Nguyễn Thị Dung",
                isHead: false,
                relationship: "Con gái"
            },
            {
                id: 5,
                name: "Nguyễn Văn Em",
                isHead: false,
                relationship: "Con trai"
            },
            {
                id: 6,
                name: "Hoàng Thị Phương",
                isHead: false,
                relationship: "Mẹ vợ"
            }
        ]
    },
    2: {
        id: 2,
        code: "HK-002",
        headName: "Lê Văn Minh",
        address: "Số 456, Đường Giải Phóng, Phường Đồng Tâm, Quận Hai Bà Trưng, Hà Nội",
        members: [
            {
                id: 7,
                name: "Lê Văn Minh",
                isHead: true,
                relationship: "Chủ hộ"
            },
            {
                id: 8,
                name: "Trần Thị Nga",
                isHead: false,
                relationship: "Vợ"
            },
            {
                id: 9,
                name: "Lê Văn Oanh",
                isHead: false,
                relationship: "Con trai"
            }
        ]
    }
};

// State management
let selectedMembers = [];
let newHeadId = null;
let memberRelationships = {};

// Load household data
function loadHouseholdData(householdId) {
    const household = sampleHouseholds[householdId];
    
    if (!household) {
        alert('Không tìm thấy thông tin hộ khẩu!');
        window.location.href = '/qlhk_nk/hokhau/';
        return;
    }

    // Load basic info
    document.getElementById('originalHouseholdCode').value = household.code;
    document.getElementById('originalHeadName').value = household.headName;
    document.getElementById('originalAddress').value = household.address;

    // Render members table
    renderMembersTable(household.members);

    // Set default split date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('splitDate').value = today;
}

// Render members table
function renderMembersTable(members) {
    const tbody = document.getElementById('membersTableBody');
    
    if (!members || members.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <p>Không có nhân khẩu nào</p>
                </td>
            </tr>
        `;
        return;
    }

    // Lọc bỏ chủ hộ hiện tại khỏi danh sách
    const filteredMembers = members.filter(member => !member.isHead);
    
    if (filteredMembers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-state">
                    <p>Không có nhân khẩu nào để tách</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredMembers.map(member => {
        return `
            <tr data-member-id="${member.id}">
                <td>
                    ${member.name}
                </td>
                <td class="text-center">
                    <input 
                        type="checkbox" 
                        class="member-checkbox" 
                        data-member-id="${member.id}"
                        onchange="handleMemberSelection(${member.id}, this.checked)"
                    >
                </td>
                <td class="text-center">
                    <input 
                        type="radio" 
                        name="newHead" 
                        class="new-head-radio"
                        data-member-id="${member.id}"
                        onchange="handleNewHeadSelection(${member.id})"
                    >
                </td>
                <td>
                    <input 
                        type="text" 
                        class="relationship-input"
                        data-member-id="${member.id}"
                        placeholder="VD: con"
                        disabled
                    >
                </td>
            </tr>
        `;
    }).join('');
}

// Handle member selection for splitting
function handleMemberSelection(memberId, isSelected) {
    const row = document.querySelector(`tr[data-member-id="${memberId}"]`);
    
    if (isSelected) {
        if (!selectedMembers.includes(memberId)) {
            selectedMembers.push(memberId);
            row.classList.add('selected-for-split');
        }
    } else {
        selectedMembers = selectedMembers.filter(id => id !== memberId);
        row.classList.remove('selected-for-split');
        
        // If this was the new head, unselect it
        if (newHeadId === memberId) {
            newHeadId = null;
            const radio = row.querySelector('.new-head-radio');
            if (radio) radio.checked = false;
        }
    }
    
    updateFormState();
    validateSelection();
}

// Handle new head selection
function handleNewHeadSelection(memberId) {
    newHeadId = memberId;
    
    // Auto-select this member for splitting if not already selected
    const checkbox = document.querySelector(`.member-checkbox[data-member-id="${memberId}"]`);
    if (checkbox && !checkbox.checked) {
        checkbox.checked = true;
        handleMemberSelection(memberId, true);
    }
    
    updateRelationshipInputs();
    validateSelection();
}

// Update relationship inputs based on selections
function updateRelationshipInputs() {
    const allInputs = document.querySelectorAll('.relationship-input');
    
    allInputs.forEach(input => {
        const memberId = parseInt(input.dataset.memberId);
        const isSelected = selectedMembers.includes(memberId);
        const isNewHead = memberId === newHeadId;
        
        // Enable input for selected members who are not the new head
        input.disabled = !isSelected || isNewHead;
        
        // Clear value if disabled
        if (input.disabled) {
            input.value = '';
        }
    });
}

// Update form state
function updateFormState() {
    const newHouseholdSection = document.getElementById('newHouseholdSection');
    
    if (selectedMembers.length > 0) {
        newHouseholdSection.style.display = 'block';
    } else {
        newHouseholdSection.style.display = 'none';
    }
    
    updateRelationshipInputs();
}

// Validate selection
function validateSelection() {
    const validationDiv = document.getElementById('validationMessages');
    const errors = [];
    const warnings = [];
    
    // Check if any members selected
    if (selectedMembers.length === 0) {
        validationDiv.style.display = 'none';
        return true;
    }
    
    // Check if new head is selected
    if (!newHeadId) {
        errors.push('Chưa chọn chủ hộ mới');
    }
    
    // Check if relationships are filled for non-head members
    selectedMembers.forEach(memberId => {
        if (memberId !== newHeadId) {
            const input = document.querySelector(`.relationship-input[data-member-id="${memberId}"]`);
            if (input && !input.value.trim()) {
                warnings.push(`Chưa điền quan hệ với chủ hộ mới cho thành viên có ID ${memberId}`);
            }
        }
    });
    
    // Display validation messages
    if (errors.length > 0 || warnings.length > 0) {
        let messageClass = errors.length > 0 ? 'error' : 'warning';
        let messageIcon = errors.length > 0 ? 'fa-exclamation-circle' : 'fa-exclamation-triangle';
        let messageTitle = errors.length > 0 ? 'Lỗi:' : 'Cảnh báo:';
        
        let html = `
            <h5><i class="fas ${messageIcon}"></i> ${messageTitle}</h5>
            <ul>
        `;
        
        errors.forEach(error => {
            html += `<li>${error}</li>`;
        });
        
        warnings.forEach(warning => {
            html += `<li>${warning}</li>`;
        });
        
        html += '</ul>';
        
        validationDiv.className = `validation-messages ${messageClass}`;
        validationDiv.innerHTML = html;
        validationDiv.style.display = 'block';
        
        return errors.length === 0;
    } else {
        validationDiv.style.display = 'none';
        return true;
    }
}

// Handle form submission
document.getElementById('splitHouseholdForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validate
    if (selectedMembers.length === 0) {
        alert('Vui lòng chọn ít nhất một nhân khẩu để tách!');
        return;
    }
    
    if (!newHeadId) {
        alert('Vui lòng chọn chủ hộ mới!');
        return;
    }
    
    // Collect relationship data
    memberRelationships = {};
    selectedMembers.forEach(memberId => {
        if (memberId !== newHeadId) {
            const input = document.querySelector(`.relationship-input[data-member-id="${memberId}"]`);
            if (input) {
                memberRelationships[memberId] = input.value.trim();
            }
        }
    });
    
    // Check if all relationships are filled
    const missingRelationships = selectedMembers.filter(id => 
        id !== newHeadId && !memberRelationships[id]
    );
    
    if (missingRelationships.length > 0) {
        alert('Vui lòng điền đầy đủ quan hệ với chủ hộ mới cho tất cả thành viên!');
        return;
    }
    
    // Get form data
    const formData = {
        originalHouseholdId: HOUSEHOLD_ID,
        selectedMembers: selectedMembers,
        newHeadId: newHeadId,
        memberRelationships: memberRelationships,
        newAddress: document.getElementById('newAddress').value.trim(),
        splitDate: document.getElementById('splitDate').value,
        splitReason: document.getElementById('splitReason').value.trim()
    };
    
    // Validate required fields
    if (!formData.newAddress) {
        alert('Vui lòng nhập địa chỉ hộ khẩu mới!');
        return;
    }
    
    if (!formData.splitDate) {
        alert('Vui lòng chọn ngày tách hộ!');
        return;
    }
    
    // Confirmation
    const household = sampleHouseholds[HOUSEHOLD_ID];
    const newHeadMember = household.members.find(m => m.id === newHeadId);
    
    const confirmMessage = `
Xác nhận tách hộ?

Hộ khẩu gốc: ${household.code}
Số nhân khẩu tách ra: ${selectedMembers.length} người
Chủ hộ mới: ${newHeadMember ? newHeadMember.name : 'N/A'}
Địa chỉ mới: ${formData.newAddress}

Bạn có chắc chắn muốn thực hiện?
    `.trim();
    
    if (confirm(confirmMessage)) {
        console.log('Form data to submit:', formData);
        
        // TODO: Send to backend API
        alert('Tách hộ thành công! (Demo - chưa kết nối API)');
        
        // Redirect back to household list
        setTimeout(() => {
            window.location.href = '/qlhk_nk/hokhau/';
        }, 1000);
    }
});

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (HOUSEHOLD_ID) {
        loadHouseholdData(HOUSEHOLD_ID);
    } else {
        alert('Không tìm thấy mã hộ khẩu!');
        window.location.href = '/qlhk_nk/hokhau/';
    }
});

// Auto-generate new household code based on original
document.getElementById('originalHouseholdCode').addEventListener('input', function() {
    const originalCode = this.value;
    if (originalCode) {
        // Simple auto-generation: append -T1, -T2, etc.
        document.getElementById('newHouseholdCode').value = `${originalCode}-T1`;
    }
});
