


document.addEventListener('DOMContentLoaded', function(){
    const households = Array.isArray(window.householdsData)? window.householdsData: [];
    const unit = 6000; // 6.000đ / người / năm

    const feeList = document.getElementById('feeList');

    function formatVnd(n){ return n.toLocaleString('vi-VN') + 'đ'; }
    
    // Populate year dropdowns
    function populateYearDropdowns() {
        const currentYear = new Date().getFullYear();
        const feeYearSelect = document.getElementById('feeYear');
        const filterYearSelect = document.getElementById('filterYear');
        
        if (feeYearSelect) {
            // Add years from current-1 back to 2020
            for (let year = currentYear; year >= 2020; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                feeYearSelect.appendChild(option);
            }
        }
        
        if (filterYearSelect) {
            // Add years for filter (including current year)
            for (let year = currentYear; year >= 2020; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                filterYearSelect.appendChild(option);
            }
            
            // Auto-select the most recent year with data
            const latestYear = getLatestFeeYear();
            if (latestYear) {
                filterYearSelect.value = latestYear;
                filterFeeList(latestYear);
            }
        }
    }
    
    // Get the latest year with fee data
    function getLatestFeeYear() {
        let maxYear = 0;
        households.forEach(h => {
            if (h.fees && h.fees.length > 0) {
                h.fees.forEach(f => {
                    if (f.year > maxYear) maxYear = f.year;
                });
            }
        });
        return maxYear || null;
    }
    
    // Filter fee list by year
    function filterFeeList(year) {
        renderFeeList(year);
    }
    
    // Render fee list with sorting (unpaid first)
    function renderFeeList(filterYear = '') {
        if (!feeList) return;
        
        feeList.innerHTML = '';
        
        // Collect all fee records
        let feeRecords = [];
        households.forEach(h => {
            if (h.fees && h.fees.length > 0) {
                h.fees.forEach(f => {
                    if (!filterYear || f.year == filterYear) {
                        feeRecords.push({
                            id: h.id,
                            chu: h.chu,
                            members: h.members,
                            year: f.year,
                            //paid: f.paid,
                            amount: f.amount,
                        });
                    }
                });
            }
        });
        
        // Sort: unpaid first, then paid
        feeRecords.sort((a, b) => {
            if (a.paid === b.paid) return b.year - a.year; // Same status: newer year first
            return a.paid ? 1 : -1; // Unpaid first
        });
        
        // Render rows
        feeRecords.forEach(record => {
            const total = record.amount;
            const tr = document.createElement('tr');
            tr.innerHTML = `<td>${record.id}</td>
                            <td>${record.chu}</td>
                            <td>${record.year}</td>
                            <td>${formatVnd(total)}</td>
                            <td><span class="status ${record.paid ? 'paid' : 'unpaid'}">${record.paid ? 'Đã thu' : 'Chưa thu'}</span></td>
                            <td><button class="btn-action" onclick="handleFeeAction(this, '${record.id}', ${record.year})">${record.paid ? 'Hoàn tác' : 'Thu phí'}</button></td>`;
            feeList.appendChild(tr);
        });
    }
    
    // Initialize page
    populateYearDropdowns();
    renderFeeList();
    
    // Initialize household dropdown
    function initializeHouseholdDropdown() {
        const householdSelect = document.getElementById('donationHousehold');
        if (!householdSelect) return;
        
        // Clear existing options except the first one
        while (householdSelect.children.length > 1) {
            householdSelect.removeChild(householdSelect.lastChild);
        }
        
        // Add households from data
        householdsData.forEach(h => {
            const option = document.createElement('option');
            option.value = h.id;
            option.textContent = `${h.id}`;
            householdSelect.appendChild(option);
        });
    }
    
    // Initialize dropdown on page load
    initializeHouseholdDropdown();

    // Tab switching functionality
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.fee-panel').forEach(p => p.classList.remove('active'));
            const tab = btn.dataset.tab;
            const el = document.getElementById('tab-' + tab);
            if (el) el.classList.add('active');
        });
    });

    // Generate fee receipts for all households
    const addFeeBtn = document.getElementById('addFee');
    if (addFeeBtn) {
        addFeeBtn.addEventListener('click', function(){
            const yearSelect = document.getElementById('feeYear');
            const selectedYear = yearSelect ? parseInt(yearSelect.value) : null;
            
            if (!selectedYear) {
                alert('Vui lòng chọn năm lập phiếu thu!');
                return;
            }
            
            // Check if year already exists for any household
            const yearExists = households.some(h => 
                h.fees && h.fees.some(f => f.year === selectedYear)
            );
            
            if (yearExists) {
                alert(`Đã có phiếu thu cho năm ${selectedYear}. Vui lòng chọn năm khác!`);
                return;
            }
            
            if (!confirm(`Tạo phiếu thu cho năm ${selectedYear} cho tất cả hộ gia đình?`)) return;

            const formData = new FormData();
            formData.append("action", "create_hygiene_fee"); // 👈 ACTION Ở ĐÂY
            formData.append("year", feeYearSelect);

            fetch("/thuphi/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                alert(data.message || "Đã tạo phiếu thu");
                location.reload();
            })
            .catch(err => {
                console.error(err);
                alert("Có lỗi xảy ra");
            });

            
            households.forEach(h => {
                if (!h.fees) h.fees = [];
                h.fees.push({ year: selectedYear, paid: false });
            });
            
            // Reset year selector
            yearSelect.value = '';
            
            // Re-render list and update filter
            renderFeeList();
            
            // Update filter dropdown and auto-select new year
            const filterYear = document.getElementById('filterYear');
            if (filterYear) {
                filterYear.value = selectedYear;
                filterFeeList(selectedYear);
            }
            
            alert(`Đã tạo phiếu thu cho năm ${selectedYear} cho tất cả hộ gia đình!`);
            console.log(action)
        });
    }
    
    // Filter year change handler
    const filterYearSelect = document.getElementById('filterYear');
    if (filterYearSelect) {
        filterYearSelect.addEventListener('change', function() {
            filterFeeList(this.value);
        });
    }

    // Donation functionality placeholder
    // 1. CHỈ giữ lại logic Tab và Modal. 
// 2. XÓA HOẶC COMMENT hàm initializeHouseholdDropdown().
// 3. SỬA logic nút Ghi nhận như sau:

    const addDonationBtn = document.getElementById('addDonation');
    if (addDonationBtn) {
        addDonationBtn.addEventListener('click', function(e) {
            // Lấy form bao quanh nút này
            const form = this.closest('form');
            
            const donationType = document.getElementById('donationType').value;
            const donationHousehold = document.getElementById('donationHousehold').value;
            const donationAmount = document.getElementById('donationAmount').value;

            // Kiểm tra nhanh trước khi gửi
            if (!donationType || !donationHousehold || !donationAmount) {
                e.preventDefault(); // Chặn gửi nếu thiếu dữ liệu
                alert('Vui lòng điền đầy đủ thông tin trước khi ghi nhận!');
                return;
            }

            // Nếu mọi thứ OK, để Form tự gửi (không dùng e.preventDefault() ở đây)
            console.log("Đang gửi dữ liệu về Server...");
        });
        
        const saveBtn = document.getElementById("saveFeeList");

if (saveBtn) {
    saveBtn.addEventListener("click", async function () {
        try {
            // 1. Lấy năm đang lọc
            const yearSelect = document.getElementById("filterYear");
            const selectedYear = yearSelect.value;

            if (!selectedYear) {
                alert("⚠️ Vui lòng chọn năm cần lưu!");
                return;
            }

            // 2. Gom dữ liệu đúng năm
            const payload = [];

            householdsData.forEach(h => {
                if (!h.fees) return;

                h.fees.forEach(f => {
                    if (String(f.year) === String(selectedYear)) {
                        payload.push({
                            ma_ho_khau: h.id,
                            trang_thai: f.paid === true
                        });
                    }
                });
            });

            if (payload.length === 0) {
                alert("⚠️ Không có dữ liệu để lưu");
                return;
            }

            // 3. Chuẩn bị FormData
            const formData = new FormData();
            formData.append("action", "save_hygiene_fee");
            formData.append("year", selectedYear);
            formData.append("fees", JSON.stringify(payload));

            // 4. Gửi về Django
            const res = await fetch("/thuphi/", {
                method: "POST",
                headers: {
                    "X-CSRFToken": document.querySelector('[name=csrfmiddlewaretoken]').value
                },
                body: formData
            });

            if (!res.ok) {
                throw new Error("Server error");
            }

            alert("✅ Đã lưu trạng thái thu phí thành công!");
            location.reload();

        } catch (err) {
            console.error(err);
            alert("❌ Lưu thất bại");
        }
    });
}


    }   

});

// Global function for fee action (Thu phí/Hoàn tác)
function handleFeeAction(btn, householdId, year) {
    const household = householdsData.find(h => h.id === householdId);
    if (!household) return;
    
    const feeRecord = household.fees.find(f => f.year === year);
    if (!feeRecord) return;
    
    // Toggle paid status
    feeRecord.paid = !feeRecord.paid;
    
    // Update UI
    const row = btn.closest('tr');
    const statusCell = row.querySelector('.status');
    
    if (feeRecord.paid) {
        statusCell.classList.remove('unpaid');
        statusCell.classList.add('paid');
        statusCell.textContent = 'Đã thu';
        btn.textContent = 'Hoàn tác';
    } else {
        statusCell.classList.remove('paid');
        statusCell.classList.add('unpaid');
        statusCell.textContent = 'Chưa thu';
        btn.textContent = 'Thu phí';
    }
    
    // Visual feedback
    statusCell.style.transform = 'scale(1.1)';
    setTimeout(() => {
        statusCell.style.transform = 'scale(1)';
    }, 150);
}

// Modal functions
function showCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.style.display = 'block';
        // Set default dates
        const today = new Date().toISOString().split('T')[0];
        const nextWeek = new Date(Date.now() + 7*24*60*60*1000).toISOString().split('T')[0];
        
        document.getElementById('startDate').value = today;
        document.getElementById('endDate').value = nextWeek;
    }
}

function closeCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('createCampaignForm').reset();
    }
}

// Initialize modal event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Show modal button
    const showModalBtn = document.getElementById('showCreateCampaignForm');
    if (showModalBtn) {
        showModalBtn.addEventListener('click', showCreateCampaignModal);
    }
    
    // Close modal when clicking X
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeCreateCampaignModal);
    }
    
    // Close modal when clicking outside
    const modal = document.getElementById('createCampaignModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeCreateCampaignModal();
            }
        });
    }
});
    
    // Handle form submission
    // Hàm này để nút "Tạo đợt đóng góp" gọi tới
function validateAndSubmit() {
    const form = document.getElementById('createCampaignForm');
    if (!form) return;

    const formData = new FormData(form);
    const campaignData = {};
    
    for (let [key, value] of formData.entries()) {
        campaignData[key] = value;
    }
    
    // 1. Kiểm tra các trường bắt buộc
    if (!campaignData.ten_dot_dong_gop || !campaignData.ngay_bat_dau || !campaignData.ngay_ket_thuc) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }

    // 2. Logic kiểm tra ngày tháng
    const startDate = new Date(campaignData.ngay_bat_dau);
    const endDate = new Date(campaignData.ngay_ket_thuc);
                
    if (endDate <= startDate) {
        alert('Ngày kết thúc phải sau ngày bắt đầu!');
        return;
    }
    
    // 3. Nếu mọi thứ hợp lệ, tiến hành gửi form
    form.submit(); 
}

// Hàm đóng modal
function closeCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) modal.style.display = 'none';
}

// Hàm mở modal (nếu bạn cần dùng cho nút "Thêm mới" ở ngoài)
function openCreateCampaignModal() {
    const modal = document.getElementById('createCampaignModal');
    if (modal) modal.style.display = 'block';
}
function validateAndSubmit() {
    const form = document.getElementById('createCampaignForm');
    const name = document.getElementById('campaignName').value;
    const start = document.getElementById('startDate').value;
    const end = document.getElementById('endDate').value;

    if (!name || !start || !end) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    if (new Date(end) <= new Date(start)) {
        alert("Ngày kết thúc phải sau ngày bắt đầu!");
        return;
    }

    form.submit(); // Gửi về Django để check trùng trong DB
}
