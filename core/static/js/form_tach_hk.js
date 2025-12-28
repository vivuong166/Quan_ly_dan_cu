let selectedMembers = [];
let newHeadId = null;
let memberRelationships = {};

function loadHouseholdData() {
    if (!window.HOUSEHOLD) {
        alert('Không tìm thấy thông tin hộ khẩu!');
        window.location.href = '/qlhk_nk/hokhau/';
        return;
    }
    document.getElementById('originalHouseholdCode').value = HOUSEHOLD.ma_ho_khau || '';
    document.getElementById('originalHeadName').value = HOUSEHOLD.ten_chu_ho || '';
    document.getElementById('originalAddress').value = 
        (HOUSEHOLD.so_nha || '') + ', ' + 
        (HOUSEHOLD.duong_pho || '') + ', ' + 
        (HOUSEHOLD.phuong || '') + ', ' + 
        (HOUSEHOLD.quan || '');
    renderMembersTable(window.PERSONS || []);
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('splitDate').value = today;
}

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
    tbody.innerHTML = members.map(member => {
        return `
            <tr data-member-id="${member.ma_nhan_khau}">
                <td>
                    ${member.ho_ten}
                </td>
                <td class="text-center">
                    <input 
                        type="checkbox" 
                        class="member-checkbox" 
                        data-member-id="${member.ma_nhan_khau}"
                        onchange="handleMemberSelection(${member.ma_nhan_khau}, this.checked)"
                    >
                </td>
                <td class="text-center">
                    <input 
                        type="radio" 
                        name="newHead" 
                        class="new-head-radio"
                        data-member-id="${member.ma_nhan_khau}"
                        onchange="handleNewHeadSelection(${member.ma_nhan_khau})"
                    >
                </td>
                <td>
                    <input 
                        type="text" 
                        class="relationship-input"
                        data-member-id="${member.ma_nhan_khau}"
                        placeholder="VD: con"
                        disabled
                    >
                </td>
            </tr>
        `;
    }).join('');
}

// ...giữ nguyên các hàm handleMemberSelection, handleNewHeadSelection, updateRelationshipInputs, updateFormState, validateSelection, form submit...

document.addEventListener('DOMContentLoaded', function() {
    loadHouseholdData();
});

document.getElementById('originalHouseholdCode').addEventListener('input', function() {
    const originalCode = this.value;
    if (originalCode) {
        document.getElementById('newHouseholdCode').value = `${originalCode}-T1`;
    }
});

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
