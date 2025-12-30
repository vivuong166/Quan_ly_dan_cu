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

// Handle member selection (checkbox)
function handleMemberSelection(memberId, checked) {
    memberId = parseInt(memberId);
    if (checked) {
        if (!selectedMembers.includes(memberId)) {
            selectedMembers.push(memberId);
        }
    } else {
        selectedMembers = selectedMembers.filter(id => id !== memberId);
        // If the unchecked member was the new head, reset newHeadId
        if (newHeadId === memberId) {
            newHeadId = null;
            // Uncheck the radio button as well
            const radio = document.querySelector(`.new-head-radio[data-member-id="${memberId}"]`);
            if (radio) radio.checked = false;
        }
    }
    updateFormState();
    validateSelection();
}

// Attach event listeners to checkboxes and radios after rendering table
function attachMemberEventListeners() {
    document.querySelectorAll('.member-checkbox').forEach(cb => {
        cb.addEventListener('change', function() {
            handleMemberSelection(this.dataset.memberId, this.checked);
        });
    });
    document.querySelectorAll('.new-head-radio').forEach(rb => {
        rb.addEventListener('change', function() {
            handleNewHeadSelection(parseInt(this.dataset.memberId));
        });
    });
}

// Patch renderMembersTable to call attachMemberEventListeners
const _renderMembersTable = renderMembersTable;
renderMembersTable = function(members) {
    _renderMembersTable(members);
    attachMemberEventListeners();
};

document.addEventListener('DOMContentLoaded', function() {
    loadHouseholdData();
});

document.getElementById('originalHouseholdCode').addEventListener('input', function() {
    // Bỏ tự động sinh mã hộ khẩu mới
    // const originalCode = this.value;
    // if (originalCode) {
    //     document.getElementById('newHouseholdCode').value = `${originalCode}-T1`;
    // }
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
        // Always enable for selected members except new head
        input.disabled = !isSelected || isNewHead;
        if (input.disabled) {
            input.value = '';
        }
    });
}

// Update form state
function updateFormState() {
    const newHouseholdSection = document.getElementById('newHouseholdSection');
    if (selectedMembers.length > 0 && newHeadId) {
        newHouseholdSection.style.display = 'block';
        // Không tự động gợi ý mã hộ khẩu mới nữa
        const newHead = window.PERSONS.find(m => m.ma_nhan_khau === newHeadId);
        if (newHead) {
            const newHeadNameInput = document.getElementById('newHeadName');
            if (newHeadNameInput) {
                newHeadNameInput.value = newHead.ho_ten;
            }
        }
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
                warnings.push(`Chưa điền quan hệ với chủ hộ mới`);
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
    const newHouseholdCode = document.getElementById('newHouseholdCode').value.trim();
    // Check mã hộ khẩu định dạng HK-XXX
    if (!/^HK-\d{3}$/.test(newHouseholdCode)) {
        alert('Mã hộ khẩu mới phải theo định dạng HK-XXX');
        return;
    }
    const formData = {
        originalHouseholdId: window.HOUSEHOLD.ma_ho_khau,
        selectedMembers: selectedMembers,
        newHeadId: newHeadId,
        memberRelationships: memberRelationships,
        newHouseholdCode: newHouseholdCode,
        newSoNha: document.getElementById('newSoNha').value.trim(),
        newDuongPho: document.getElementById('newDuongPho').value.trim()
    };
    if (!formData.newHouseholdCode || !formData.newSoNha || !formData.newDuongPho) {
        alert('Vui lòng nhập đầy đủ thông tin hộ khẩu mới!');
        return;
    }
    // Confirmation
    let confirmMessage = `Xác nhận tách hộ?\n\nHộ khẩu gốc: ${formData.originalHouseholdId}\nSố nhân khẩu tách ra: ${selectedMembers.length} người\nChủ hộ mới: ${window.PERSONS.find(m => m.ma_nhan_khau === newHeadId)?.ho_ten || 'N/A'}`;
    // Nếu có địa chỉ mới thì hiển thị, không thì bỏ qua dòng này
    if (formData.newSoNha || formData.newDuongPho) {
        let diaChi = '';
        if (formData.newSoNha) diaChi += formData.newSoNha;
        if (formData.newDuongPho) diaChi += (diaChi ? ', ' : '') + formData.newDuongPho;
        confirmMessage += `\nĐịa chỉ mới: ${diaChi}`;
    }
    confirmMessage += `\n\nBạn có chắc chắn muốn thực hiện?`;
    if (confirm(confirmMessage)) {
        // Send to backend via AJAX
        fetch(window.location.pathname, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                alert('Tách hộ thành công!');
                window.location.href = '/qlhk_nk/hokhau/';
            } else {
                alert(data.message || 'Có lỗi xảy ra!');
            }
        })
        .catch(err => {
            alert('Có lỗi xảy ra khi gửi dữ liệu!');
        });
    }
});

// Helper to get CSRF token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (window.HOUSEHOLD && typeof window.HOUSEHOLD === 'object' && Object.keys(window.HOUSEHOLD).length > 0) {
        loadHouseholdData();
    } else {
        alert('Không tìm thấy thông tin hộ khẩu!');
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
