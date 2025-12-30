document.addEventListener('DOMContentLoaded', function() {
	var ctx = document.getElementById('nhankhauBarChart');
	if (!ctx || !window.barChartData) return;
	var dataByYear = window.barChartData.data_by_year;
	var years = window.barChartData.years;
	var yearFilter = document.getElementById('yearFilter');
	var chart = null;

	function render(year) {
		var data = dataByYear[year] || [];
		if (chart) chart.destroy();
		chart = new Chart(ctx, {
			type: 'bar',
			data: {
				labels: Array.from({length: 12}, (_, i) => 'Tháng ' + (i+1)),
				datasets: [{
					label: 'Năm ' + year,
					data: data,
					backgroundColor: 'rgba(54, 162, 235, 0.7)'
				}]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false, // Thu nhỏ chiều cao
				plugins: {
					legend: { position: 'top' },
					title: { display: true, text: 'Số nhân khẩu theo từng tháng năm ' + year }
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: {
							stepSize: 1,
							callback: function(value) { return Number.isInteger(value) ? value : null; }
						}
					}
				}
			}
		});
	}

	// Thu nhỏ canvas
	ctx.style.maxWidth = '1300px';
	ctx.style.maxHeight = '300px';

	if (yearFilter) {
        // Lấy giá trị thực tế đang được chọn (đã được Django set selected)
        const defaultYear = yearFilter.value; 
        render(defaultYear);
    }
	yearFilter.addEventListener('change', function() {
		render(this.value);
	});
});
