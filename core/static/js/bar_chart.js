document.addEventListener('DOMContentLoaded', function () {
    const ctx = document.getElementById('nhankhauBarChart');
    if (!ctx || !window.barChartData) return;

    const dataByYear = window.barChartData.data_by_year;
    let chart = null;

    function getLast12Months() {
        const result = [];
        const now = new Date();

        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push({
                year: d.getFullYear(),
                month: d.getMonth() + 1, // 1–12
                label: `${d.getMonth() + 1}/${d.getFullYear()}`
            });
        }
        return result;
    }

    function renderLast12Months() {
        const months = getLast12Months();

        const labels = [];
        const data = [];

        months.forEach(m => {
            labels.push(m.label);

            const yearData = dataByYear[m.year];
            if (yearData && yearData[m.month - 1] !== undefined) {
                data.push(yearData[m.month - 1]);
            } else {
                data.push(0); // không có dữ liệu
            }
        });

        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Số nhân khẩu trong tháng',
                    data: data,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
						position: 'bottom'
					},
					title: {
						display: false
					}
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            callback: value => Number.isInteger(value) ? value : null
                        }
                    }
                }
            }
        });
    }

    // Kích thước canvas
    ctx.style.maxWidth = '1300px';
    ctx.style.maxHeight = '400px';

    // Render ngay khi load
    renderLast12Months();
});
