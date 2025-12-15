document.addEventListener('DOMContentLoaded', function() {
    // Sample data - sẽ được thay thế bằng API calls
    let households = [
        { 
            id: 'HK-001', 
            code: 'HK-001',
            head_name: 'Nguyễn Văn A', 
            address: 'Số 12, Đường X, La Khê',
            member_count: 4,
            created_at: '2025-01-15'
        },
        { 
            id: 'HK-002', 
            code: 'HK-002',
            head_name: 'Trần Thị B', 
            address: 'Số 34, Ngõ Y, La Khê',
            member_count: 3,
            created_at: '2025-01-20'
        },
        { 
            id: 'HK-003', 
            code: 'HK-003',
            head_name: 'Lê Văn C', 
            address: 'Số 56, Phố Z, La Khê',
            member_count: 5,
            created_at: '2025-02-01'
        }
    ];

    let filteredHouseholds = [...households];

    // DOM elements
    const searchInput = document.getElementById('searchHousehold');
    const advancedSearchBtn = document.getElementById('advancedSearchBtn');
    const advancedSearch = document.getElementById('advancedSearch');
    const addHouseholdBtn = document.getElementById('addHouseholdBtn');
    const householdModal = document.getElementById('householdModal');
    const personModal = document.getElementById('personModal');
    const householdList = document.getElementById('householdList');
    const householdCount = document.getElementById('householdCount');

    // Initialize
    updateHouseholdList();
    updateHouseholdCount();

    // Event listeners
    searchInput.addEventListener('input', handleSearch);
    advancedSearchBtn.addEventListener('click', toggleAdvancedSearch);
    addHouseholdBtn.addEventListener('click', showAddHouseholdForm);
    
    // Filter inputs
    document.getElementById('applyFilters').addEventListener('click', applyAdvancedFilters);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);

    function handleSearch() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        
        if (searchTerm === '') {
            filteredHouseholds = [...households];
        } else {
            filteredHouseholds = households.filter(household =>
                household.code.toLowerCase().includes(searchTerm) ||
                household.head_name.toLowerCase().includes(searchTerm) ||
                household.address.toLowerCase().includes(searchTerm)
            );
        }
        
        updateHouseholdList();
        updateHouseholdCount();
    }

    function toggleAdvancedSearch() {
        const isVisible = advancedSearch.style.display !== 'none';
        advancedSearch.style.display = isVisible ? 'none' : 'block';
        advancedSearchBtn.innerHTML = isVisible ? 
            '<i class="fas fa-filter"></i> Tìm kiếm nâng cao' : 
            '<i class="fas fa-times"></i> Đóng tìm kiếm';
    }

    function applyAdvancedFilters() {
        const codeFilter = document.getElementById('filterCode').value.toLowerCase();
        const nameFilter = document.getElementById('filterHeadName').value.toLowerCase();
        const addressFilter = document.getElementById('filterAddress').value.toLowerCase();

        filteredHouseholds = households.filter(household => {
            return (!codeFilter || household.code.toLowerCase().includes(codeFilter)) &&
                   (!nameFilter || household.head_name.toLowerCase().includes(nameFilter)) &&
                   (!addressFilter || household.address.toLowerCase().includes(addressFilter));
        });

        updateHouseholdList();
        updateHouseholdCount();
    }

    function clearFilters() {
        document.getElementById('filterCode').value = '';
        document.getElementById('filterHeadName').value = '';
        document.getElementById('filterAddress').value = '';
        searchInput.value = '';
        filteredHouseholds = [...households];
        updateHouseholdList();
        updateHouseholdCount();
    }

    function updateHouseholdList() {
        householdList.innerHTML = '';
        
        filteredHouseholds.forEach(household => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${household.code}</strong></td>
                <td>${household.head_name}</td>
                <td>${household.address}</td>
                <td>
                    <button class="btn-sm" onclick="viewHousehold('${household.code}')">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn-sm" onclick="editHousehold('${household.code}')">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                </td>
            `;
            householdList.appendChild(row);
        });

        if (filteredHouseholds.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="4" style="text-align: center; color: #6b7280; padding: 20px;">
                    <i class="fas fa-search"></i> Không tìm thấy hộ khẩu nào
                </td>
            `;
            householdList.appendChild(row);
        }
    }

    function updateHouseholdCount() {
        householdCount.textContent = filteredHouseholds.length;
    }

    // Modal functions
    window.showAddHouseholdForm = function() {
        document.getElementById('modalTitle').textContent = 'Tạo hộ khẩu mới';
        document.getElementById('householdForm').reset();
        // Set default values
        document.getElementById('creationDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('districtName').value = 'Hà Đông';
        document.getElementById('provinceName').value = 'Hà Nội';
        document.getElementById('headEthnicity').value = 'Kinh';
        householdModal.style.display = 'flex';
    }

    window.showAddPersonForm = function() {
        personModal.style.display = 'flex';
    }

    window.showSplitHouseholdForm = function() {
        const splitModal = document.getElementById('splitHouseholdModal');
        document.getElementById('splitHouseholdForm').reset();
        document.getElementById('splitDate').value = new Date().toISOString().split('T')[0];
        document.getElementById('newDistrictName').value = 'Hà Đông';
        splitModal.style.display = 'flex';
    }

    window.closeHouseholdModal = function() {
        householdModal.style.display = 'none';
    }

    window.closePersonModal = function() {
        personModal.style.display = 'none';
    }

    window.closeSplitModal = function() {
        document.getElementById('splitHouseholdModal').style.display = 'none';
    }

    // Legacy function for backward compatibility
    window.closeModal = function() {
        closeHouseholdModal();
    }

    window.saveHousehold = function() {
        // Get form data
        let code = document.getElementById('householdCode').value.trim();
        const creationDate = document.getElementById('creationDate').value;
        const creationReason = document.getElementById('creationReason').value;
        const houseNumber = document.getElementById('houseNumber').value.trim();
        const streetName = document.getElementById('streetName').value.trim();
        const wardName = document.getElementById('wardName').value;
        const headFullName = document.getElementById('headFullName').value.trim();
        const headDob = document.getElementById('headDob').value;
        const headGender = document.getElementById('headGender').value;
        const headIdNumber = document.getElementById('headIdNumber').value.trim();

        // Validation
        if (!creationDate || !creationReason || !houseNumber || !streetName || 
            !wardName || !headFullName || !headDob || !headGender || !headIdNumber) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (*)!');
            return;
        }

        // Auto-generate code if empty
        if (!code) {
            const nextNumber = households.length + 1;
            code = `HK-${nextNumber.toString().padStart(3, '0')}`;
            document.getElementById('householdCode').value = code;
        }

        // Check if code already exists (for new households)
        if (document.getElementById('modalTitle').textContent === 'Tạo hộ khẩu mới' &&
            households.find(h => h.code === code)) {
            alert('Mã hộ khẩu đã tồn tại!');
            return;
        }

        // Build full address
        const fullAddress = `${houseNumber}, ${streetName}, ${wardName}`;

        // Create or update household
        const householdData = {
            id: code,
            code: code,
            head_name: headFullName,
            address: fullAddress,
            member_count: 1, // Chủ hộ
            created_at: creationDate,
            creation_reason: creationReason,
            head_dob: headDob,
            head_gender: headGender,
            head_id_number: headIdNumber,
            head_occupation: document.getElementById('headOccupation').value,
            head_ethnicity: document.getElementById('headEthnicity').value,
            head_religion: document.getElementById('headReligion').value,
            head_education: document.getElementById('headEducation').value,
            notes: document.getElementById('householdNotes').value
        };

        if (document.getElementById('modalTitle').textContent === 'Tạo hộ khẩu mới') {
            households.push(householdData);
            showSuccessMessage('Tạo hộ khẩu thành công!');
        } else {
            // Update existing household
            const index = households.findIndex(h => h.code === code);
            if (index !== -1) {
                households[index] = { ...households[index], ...householdData };
                showSuccessMessage('Cập nhật hộ khẩu thành công!');
            }
        }

        filteredHouseholds = [...households];
        updateHouseholdList();
        updateHouseholdCount();
        closeHouseholdModal();
    }

    window.savePerson = function() {
        const householdId = document.getElementById('personHousehold').value;
        const fullName = document.getElementById('personFullName').value;
        const dob = document.getElementById('personDob').value;
        const gender = document.getElementById('personGender').value;

        if (!householdId || !fullName || !dob || !gender) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        // Update member count
        const household = households.find(h => h.code === householdId);
        if (household) {
            household.member_count++;
        }

        filteredHouseholds = [...households];
        updateHouseholdList();
        closePersonModal();

        // Show success message
        showSuccessMessage('Thêm nhân khẩu thành công!');
    }

    window.viewHousehold = function(code) {
        const household = households.find(h => h.code === code);
        if (household) {
            alert(`Xem chi tiết hộ khẩu: ${household.code}\nChủ hộ: ${household.head_name}\nĐịa chỉ: ${household.address}\nSố nhân khẩu: ${household.member_count}`);
        }
    }

    window.editHousehold = function(code) {
        // Navigate to the household edit page
        window.location.href = `/taohokhau/${code}/`;
    }

    window.exportHouseholds = function() {
        // Simple CSV export
        let csv = 'Mã hộ khẩu,Chủ hộ,Địa chỉ,Số nhân khẩu,Ngày tạo\n';
        filteredHouseholds.forEach(household => {
            csv += `${household.code},"${household.head_name}","${household.address}",${household.member_count},${household.created_at}\n`;
        });

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'danh_sach_ho_khau.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function showSuccessMessage(message) {
        // Simple alert for now - có thể thay thế bằng toast notification
        alert(message);
    }

    // Sample household members data with detailed information
    const householdMembers = {
        'HK-001': [
            { 
                id: 1, 
                name: 'Nguyễn Văn A', 
                relation: 'Chủ hộ', 
                isHead: true,
                dob: '15/03/1985',
                idNumber: '012345678901',
                occupation: 'Kỹ sư xây dựng'
            },
            { 
                id: 2, 
                name: 'Trần Thị Lan', 
                relation: 'Vợ/Chồng', 
                isHead: false,
                dob: '22/07/1988',
                idNumber: '012345678902',
                occupation: 'Y tá'
            },
            { 
                id: 3, 
                name: 'Nguyễn Văn Nam', 
                relation: 'Con', 
                isHead: false,
                dob: '10/12/2010',
                idNumber: '',
                occupation: 'Học sinh'
            },
            { 
                id: 4, 
                name: 'Nguyễn Thị Hoa', 
                relation: 'Con', 
                isHead: false,
                dob: '15/05/2015',
                idNumber: '',
                occupation: 'Học sinh'
            }
        ],
        'HK-002': [
            { 
                id: 5, 
                name: 'Trần Thị B', 
                relation: 'Chủ hộ', 
                isHead: true,
                dob: '08/11/1975',
                idNumber: '012345678903',
                occupation: 'Giáo viên'
            },
            { 
                id: 6, 
                name: 'Lê Văn Minh', 
                relation: 'Con', 
                isHead: false,
                dob: '03/09/2005',
                idNumber: '',
                occupation: 'Học sinh'
            },
            { 
                id: 7, 
                name: 'Trần Thị Mai', 
                relation: 'Con', 
                isHead: false,
                dob: '12/04/2008',
                idNumber: '',
                occupation: 'Học sinh'
            }
        ],
        'HK-003': [
            { 
                id: 8, 
                name: 'Lê Văn C', 
                relation: 'Chủ hộ', 
                isHead: true,
                dob: '25/01/1980',
                idNumber: '012345678904',
                occupation: 'Nhân viên văn phòng'
            },
            { 
                id: 9, 
                name: 'Phạm Thị Dung', 
                relation: 'Vợ/Chồng', 
                isHead: false,
                dob: '14/06/1983',
                idNumber: '012345678905',
                occupation: 'Kế toán'
            },
            { 
                id: 10, 
                name: 'Lê Văn Tuấn', 
                relation: 'Con', 
                isHead: false,
                dob: '20/08/2007',
                idNumber: '',
                occupation: 'Học sinh'
            },
            { 
                id: 11, 
                name: 'Lê Thị Linh', 
                relation: 'Con', 
                isHead: false,
                dob: '18/03/2012',
                idNumber: '',
                occupation: 'Học sinh'
            },
            { 
                id: 12, 
                name: 'Lê Văn Đức', 
                relation: 'Con', 
                isHead: false,
                dob: '05/11/2016',
                idNumber: '',
                occupation: 'Mầm non'
            }
        ]
    };

    // Change household head functions
    window.changeHouseholdHead = function(code) {
        const changeHeadModal = document.getElementById('changeHeadModal');
        const householdSelect = document.getElementById('changeHeadHousehold');
        
        // Set the household in the dropdown
        householdSelect.value = code;
        
        // Update the current head and available members
        updateCurrentHead(code);
        updateNewHeadOptions(code);
        
        // Set default date to today
        document.getElementById('changeHeadDate').value = new Date().toISOString().split('T')[0];
        
        changeHeadModal.style.display = 'flex';
    }

    window.showChangeHeadModal = function() {
        const changeHeadModal = document.getElementById('changeHeadModal');
        
        // Reset form
        document.getElementById('changeHeadForm').reset();
        document.getElementById('changeHeadDate').value = new Date().toISOString().split('T')[0];
        
        changeHeadModal.style.display = 'flex';
    }

    window.closeChangeHeadModal = function() {
        const changeHeadModal = document.getElementById('changeHeadModal');
        changeHeadModal.style.display = 'none';
        
        // Reset form
        document.getElementById('changeHeadForm').reset();
        resetFormDisplays();
    }

    function resetFormDisplays() {
        document.getElementById('householdAddress').innerHTML = `
            <div class="info-card">
                <i class="fas fa-map-marker-alt"></i>
                <span>Chọn hộ khẩu để hiển thị địa chỉ</span>
            </div>
        `;
        document.getElementById('currentHead').innerHTML = `
            <div class="info-card">
                <i class="fas fa-user"></i>
                <span>Chọn hộ khẩu để hiển thị chủ hộ hiện tại</span>
            </div>
        `;
        document.getElementById('currentHeadDob').innerHTML = `
            <div class="info-card">
                <i class="fas fa-calendar"></i>
                <span>--/--/----</span>
            </div>
        `;
        document.getElementById('currentHeadId').innerHTML = `
            <div class="info-card">
                <i class="fas fa-id-card"></i>
                <span>Chưa có thông tin</span>
            </div>
        `;
        document.getElementById('currentHeadJob').innerHTML = `
            <div class="info-card">
                <i class="fas fa-briefcase"></i>
                <span>Chưa có thông tin</span>
            </div>
        `;
        document.getElementById('newHeadRelation').innerHTML = `
            <div class="info-card">
                <i class="fas fa-users"></i>
                <span>Chọn thành viên để hiển thị quan hệ</span>
            </div>
        `;
        document.getElementById('newHeadDob').innerHTML = `
            <div class="info-card">
                <i class="fas fa-calendar"></i>
                <span>--/--/----</span>
            </div>
        `;
        document.getElementById('newHeadId').innerHTML = `
            <div class="info-card">
                <i class="fas fa-id-card"></i>
                <span>Chưa có thông tin</span>
            </div>
        `;
        document.getElementById('newHead').innerHTML = '<option value="">-- Chọn chủ hộ mới --</option>';
    }

    window.previewChangeHead = function() {
        const householdCode = document.getElementById('changeHeadHousehold').value;
        const newHeadId = document.getElementById('newHead').value;
        const changeDate = document.getElementById('changeHeadDate').value;
        const reason = document.getElementById('changeHeadReason').value;
        const performer = document.getElementById('changeHeadPerformer').value;
        const confirmCheck = document.getElementById('confirmChange').checked;

        if (!householdCode || !newHeadId || !changeDate || !reason || !performer) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc trước khi xem trước!');
            return;
        }

        if (!confirmCheck) {
            alert('Vui lòng xác nhận đã kiểm tra thông tin và giấy tờ!');
            return;
        }

        // Get household and member info
        const household = households.find(h => h.code === householdCode);
        const members = householdMembers[householdCode] || [];
        const currentHead = members.find(m => m.isHead);
        const newHead = members.find(m => m.id == newHeadId);

        const previewHTML = `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h3 style="text-align: center; color: #1565c0; margin-bottom: 20px;">
                    📋 XEM TRƯỚC THÔNG TIN THAY ĐỔI CHỦ HỘ
                </h3>
                
                <div style="border: 2px solid #e0e0e0; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                    <h4 style="color: #333; margin-top: 0;">🏠 Thông tin hộ khẩu</h4>
                    <p><strong>Mã hộ khẩu:</strong> ${householdCode}</p>
                    <p><strong>Địa chỉ:</strong> ${household?.address || 'Chưa có thông tin'}</p>
                </div>

                <div style="display: flex; gap: 15px; margin-bottom: 15px;">
                    <div style="flex: 1; border: 2px solid #ffcdd2; border-radius: 8px; padding: 15px;">
                        <h4 style="color: #d32f2f; margin-top: 0;">👤 Chủ hộ hiện tại</h4>
                        <p><strong>Họ tên:</strong> ${currentHead?.name || 'Không xác định'}</p>
                        <p><strong>Ngày sinh:</strong> ${currentHead?.dob || '--/--/----'}</p>
                        <p><strong>CMND/CCCD:</strong> ${currentHead?.idNumber || 'Chưa có'}</p>
                        <p><strong>Nghề nghiệp:</strong> ${currentHead?.occupation || 'Chưa có'}</p>
                    </div>
                    
                    <div style="flex: 1; border: 2px solid #c8e6c9; border-radius: 8px; padding: 15px;">
                        <h4 style="color: #388e3c; margin-top: 0;">👑 Chủ hộ mới</h4>
                        <p><strong>Họ tên:</strong> ${newHead?.name || 'Không xác định'}</p>
                        <p><strong>Ngày sinh:</strong> ${newHead?.dob || '--/--/----'}</p>
                        <p><strong>CMND/CCCD:</strong> ${newHead?.idNumber || 'Chưa có'}</p>
                        <p><strong>Quan hệ với chủ hộ cũ:</strong> ${newHead?.relation || 'Không xác định'}</p>
                    </div>
                </div>

                <div style="border: 2px solid #e1f5fe; border-radius: 8px; padding: 15px;">
                    <h4 style="color: #0277bd; margin-top: 0;">📝 Chi tiết thay đổi</h4>
                    <p><strong>Ngày thay đổi:</strong> ${new Date(changeDate).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Lý do:</strong> ${document.querySelector('#changeHeadReason option:checked')?.text || reason}</p>
                    <p><strong>Người thực hiện:</strong> ${performer}</p>
                    <p><strong>Số quyết định:</strong> ${document.getElementById('changeHeadApproval').value || 'Không có'}</p>
                    <p><strong>Ghi chú:</strong> ${document.getElementById('changeHeadNote').value || 'Không có ghi chú thêm'}</p>
                </div>
            </div>
        `;

        // Show preview in a new modal or alert
        const previewModal = document.createElement('div');
        previewModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        previewModal.innerHTML = `
            <div style="background: white; max-width: 800px; max-height: 90vh; overflow-y: auto; border-radius: 12px; padding: 20px;">
                ${previewHTML}
                <div style="text-align: center; margin-top: 20px;">
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                            style="background: #1565c0; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
                        Đóng xem trước
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(previewModal);
    }

    window.saveChangeHead = function() {
        const householdCode = document.getElementById('changeHeadHousehold').value;
        const newHeadId = document.getElementById('newHead').value;
        const changeDate = document.getElementById('changeHeadDate').value;
        const reason = document.getElementById('changeHeadReason').value;
        const performer = document.getElementById('changeHeadPerformer').value;
        const approval = document.getElementById('changeHeadApproval').value;
        const note = document.getElementById('changeHeadNote').value;
        const confirmCheck = document.getElementById('confirmChange').checked;

        // Validation
        if (!householdCode || !newHeadId || !changeDate || !reason || !performer) {
            alert('Vui lòng điền đầy đủ thông tin bắt buộc (có dấu *)!');
            return;
        }

        if (!confirmCheck) {
            alert('Vui lòng xác nhận đã kiểm tra thông tin và giấy tờ!');
            return;
        }

        // Get new head info
        const members = householdMembers[householdCode] || [];
        const newHead = members.find(m => m.id == newHeadId);
        const currentHead = members.find(m => m.isHead);
        
        if (!newHead) {
            alert('Không tìm thấy thành viên được chọn!');
            return;
        }

        // Confirm action
        const confirmMsg = `Xác nhận thay đổi chủ hộ?\n\n` +
                          `Hộ khẩu: ${householdCode}\n` +
                          `Từ: ${currentHead?.name || 'Không xác định'}\n` +
                          `Thành: ${newHead.name}\n` +
                          `Ngày: ${new Date(changeDate).toLocaleDateString('vi-VN')}\n` +
                          `Lý do: ${document.querySelector('#changeHeadReason option:checked')?.text || reason}`;
        
        if (!confirm(confirmMsg)) {
            return;
        }

        // Update household data
        const householdIndex = households.findIndex(h => h.code === householdCode);
        if (householdIndex !== -1) {
            // Update current head in members
            members.forEach(member => {
                if (member.isHead) {
                    member.isHead = false;
                    member.relation = member.relation === 'Chủ hộ' ? 'Thành viên' : member.relation;
                }
                if (member.id == newHeadId) {
                    member.isHead = true;
                    member.relation = 'Chủ hộ';
                }
            });
            
            // Update household head name
            households[householdIndex].head_name = newHead.name;
        }

        // Create change record (for future history tracking)
        const changeRecord = {
            householdCode,
            oldHead: currentHead?.name,
            newHead: newHead.name,
            changeDate,
            reason,
            performer,
            approval,
            note,
            timestamp: new Date().toISOString()
        };

        // Update the household list display
        updateHouseholdList();
        closeChangeHeadModal();

        // Show success message
        showSuccessMessage(
            `✅ Đã thay đổi chủ hộ thành công!\n\n` +
            `📋 Hộ khẩu: ${householdCode}\n` +
            `👑 Chủ hộ mới: ${newHead.name}\n` +
            `📅 Ngày thay đổi: ${new Date(changeDate).toLocaleDateString('vi-VN')}\n` +
            `👤 Người thực hiện: ${performer}`
        );
    }

    function updateCurrentHead(householdCode) {
        const currentHeadDiv = document.getElementById('currentHead');
        const members = householdMembers[householdCode] || [];
        const currentHead = members.find(m => m.isHead);
        
        if (currentHead) {
            currentHeadDiv.innerHTML = `
                <div class="info-card">
                    <i class="fas fa-crown"></i>
                    <span><strong>${currentHead.name}</strong> (${currentHead.relation})</span>
                </div>
            `;
        } else {
            currentHeadDiv.innerHTML = `
                <div class="info-card">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Không tìm thấy chủ hộ hiện tại</span>
                </div>
            `;
        }
    }

    function updateNewHeadOptions(householdCode) {
        const newHeadSelect = document.getElementById('newHead');
        const members = householdMembers[householdCode] || [];
        
        // Clear current options
        newHeadSelect.innerHTML = '<option value="">-- Chọn chủ hộ mới --</option>';
        
        // Add members who are not current head
        members.forEach(member => {
            if (!member.isHead) {
                const option = document.createElement('option');
                option.value = member.id;
                option.textContent = `${member.name} (${member.relation})`;
                newHeadSelect.appendChild(option);
            }
        });
    }

    // Event listener for household selection change
    document.getElementById('changeHeadHousehold').addEventListener('change', function() {
        const selectedHousehold = this.value;
        if (selectedHousehold) {
            updateCurrentHead(selectedHousehold);
            updateNewHeadOptions(selectedHousehold);
        } else {
            document.getElementById('currentHead').innerHTML = `
                <div class="info-card">
                    <i class="fas fa-user"></i>
                    <span>Chọn hộ khẩu để hiển thị chủ hộ hiện tại</span>
                </div>
            `;
            document.getElementById('newHead').innerHTML = '<option value="">-- Chọn chủ hộ mới --</option>';
        }
    });

    // Close modals when clicking outside
    window.onclick = function(event) {
        const changeHeadModal = document.getElementById('changeHeadModal');
        
        if (event.target === householdModal) {
            closeModal();
        }
        if (event.target === personModal) {
            closePersonModal();
        }
        if (event.target === changeHeadModal) {
            closeChangeHeadModal();
        }
    }
});