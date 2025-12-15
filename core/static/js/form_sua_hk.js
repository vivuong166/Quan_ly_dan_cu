// Sample household data
const sampleHouseholds = {
    1: {
        id: 1,
        code: 'HK-001',
        head_name: 'Nguyễn Văn A',
        address: 'Số 12, Đường X, La Khê',
        house_number: 'Số 12',
        street_name: 'Đường X',
        members: [
            { id: 1, full_name: 'Nguyễn Văn A', is_head: true, relation: 'Chủ hộ', status: 'active' },
            { id: 2, full_name: 'Phạm Thị B', is_head: false, relation: 'Vợ/Chồng', status: 'active' },
            { id: 3, full_name: 'Lê Văn C', is_head: false, relation: 'Con', status: 'temp_away' }
        ]
    },
    2: {
        id: 2,
        code: 'HK-002',
        head_name: 'Trần Thị D',
        address: 'Số 34, Ngõ Y, La Khê',
        house_number: 'Số 34',
        street_name: 'Ngõ Y',
        members: [
            { id: 4, full_name: 'Trần Thị D', is_head: true, relation: 'Chủ hộ', status: 'active' },
            { id: 5, full_name: 'Hoàng Văn E', is_head: false, relation: 'Con', status: 'active' }
        ]
    }
};

// Load household data
function loadHouseholdData(householdId) {
    const household = sampleHouseholds[householdId];
    
    if (!household) {
        alert('Không tìm thấy thông tin hộ khẩu!');
        window.location.href = '/qlhk_nk/hokhau/';
        return;
    }
    
    // Populate current info
    document.getElementById('currentCode').textContent = household.code;
    document.getElementById('currentHead').textContent = household.head_name;
    document.getElementById('currentAddress').textContent = household.address;
    document.getElementById('currentMembers').textContent = household.members.length + ' người';
    
    // Populate address fields
    document.getElementById('houseNumber').value = household.house_number;
    document.getElementById('streetName').value = household.street_name;
    
    // Populate members table
    renderMembersTable(household.members);
}

// Render members table
function renderMembersTable(members) {
    const tbody = document.getElementById('membersList');
    tbody.innerHTML = '';
    
    members.forEach((member, index) => {
        const row = document.createElement('tr');
        // Don't show radio button for current head
        const radioHtml = member.is_head ? '' : `
            <input type="radio" name="new_head" value="${member.id}" id="member${member.id}" 
                   onchange="handleHeadSelection(${member.id})">
        `;
        
        row.innerHTML = `
            <td>
                ${radioHtml}
            </td>
            <td>
                ${member.is_head ? `<strong>${member.full_name}</strong>` : `
                    <label for="member${member.id}" style="cursor: pointer; margin: 0;">
                        <strong>${member.full_name}</strong>
                    </label>
                `}
            </td>
            <td>
                ${member.is_head ? '<span class="badge badge-primary">Chủ hộ hiện tại</span>' : '-'}
            </td>
            <td>${member.relation}</td>
            <td>
                <span class="status-badge ${member.status === 'active' ? 'status-active' : 'status-temp-away'}">
                    ${member.status === 'active' ? 'Thường trú' : 'Tạm vắng'}
                </span>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Handle edit type change
function handleEditTypeChange() {
    const editType = document.querySelector('input[name="edit_type"]:checked');
    const addressSection = document.getElementById('addressSection');
    const headSection = document.getElementById('headSection');
    
    if (!editType) {
        addressSection.style.display = 'none';
        headSection.style.display = 'none';
        return;
    }
    
    if (editType.value === 'address') {
        addressSection.style.display = 'block';
        headSection.style.display = 'none';
        // Set address fields as required
        document.getElementById('houseNumber').required = true;
        document.getElementById('streetName').required = true;
    } else if (editType.value === 'head') {
        addressSection.style.display = 'none';
        headSection.style.display = 'block';
        // Remove address required
        document.getElementById('houseNumber').required = false;
        document.getElementById('streetName').required = false;
    }
}

// Handle head selection
function handleHeadSelection(memberId) {
    const relationshipSection = document.getElementById('relationshipSection');
    const relationshipInputs = document.getElementById('relationshipInputs');
    
    // Get current household data
    const householdId = HOUSEHOLD_ID || 1;
    const household = sampleHouseholds[householdId];
    
    if (!household) return;
    
    // Find selected member
    const selectedMember = household.members.find(m => m.id === memberId);
    
    if (!selectedMember) return;
    
    // If selecting current head, hide relationship section
    if (selectedMember.is_head) {
        relationshipSection.style.display = 'none';
        return;
    }
    
    // Show relationship section and populate inputs for other members (excluding old head)
    relationshipSection.style.display = 'block';
    relationshipInputs.innerHTML = '';
    
    household.members.forEach(member => {
        // Don't show input for new head and old head (keep their relationship empty)
        if (member.id !== memberId && !member.is_head) {
            const div = document.createElement('div');
            div.className = 'relationship-item';
            div.innerHTML = `
                <label>${member.full_name}:</label>
                <input type="text" name="relation_${member.id}" class="form-input" 
                       placeholder="Nhập quan hệ với chủ hộ mới" required>
            `;
            relationshipInputs.appendChild(div);
        }
    });
}

// Form submission
document.getElementById('editHouseholdForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const editType = document.querySelector('input[name="edit_type"]:checked');
    
    if (!editType) {
        alert('Vui lòng chọn loại thay đổi!');
        return;
    }
    
    if (editType.value === 'address') {
        const houseNumber = document.getElementById('houseNumber').value;
        const streetName = document.getElementById('streetName').value;
        
        if (!houseNumber || !streetName) {
            alert('Vui lòng nhập đầy đủ thông tin địa chỉ!');
            return;
        }
    } else if (editType.value === 'head') {
        const newHead = document.querySelector('input[name="new_head"]:checked');
        
        if (!newHead) {
            alert('Vui lòng chọn chủ hộ mới!');
            return;
        }
        
        // Check if relationship inputs are filled (if visible)
        const relationshipSection = document.getElementById('relationshipSection');
        if (relationshipSection.style.display !== 'none') {
            const relationInputs = document.querySelectorAll('#relationshipInputs input[required]');
            let allFilled = true;
            
            relationInputs.forEach(input => {
                if (!input.value.trim()) {
                    allFilled = false;
                }
            });
            
            if (!allFilled) {
                alert('Vui lòng ghi rõ quan hệ của các thành viên với chủ hộ mới!');
                return;
            }
        }
    }
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'flex';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide message after 3 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
        // Redirect to household list
        // window.location.href = '/qlhk_nk/hokhau/';
    }, 3000);
    
    console.log('Form submitted successfully');
    console.log('Edit type:', editType.value);
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load household data if HOUSEHOLD_ID is available
    if (typeof HOUSEHOLD_ID !== 'undefined' && HOUSEHOLD_ID && HOUSEHOLD_ID !== 0) {
        loadHouseholdData(HOUSEHOLD_ID);
    }
});
