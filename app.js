async function loadPortfolioData() {
    const response = await fetch('data/data.json');
    const data = await response.json();
    return data;
}

function formatCurrency(num) {
    return '$' + num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2});
}

function formatPercent(num) {
    return(num >= 0 ? '+' : '') + num.toFixed(2) + '%';
}

function renderSummary(latest) {
    document.getElementById('total-value').textContent = formatCurrency(latest.total_value);
    document.getElementById('total-cost').textContent = formatCurrency(latest.total_cost);

    const gainEl = document.getElementById('total-gain');
    gainEl.textContent = formatCurrency(latest.total_gain);
    gainEl.classList.add(latest.total_gain >= 0 ? 'positive' : 'negative');

    const gainPctEl = document.getElementById('total-gain-pct');
    gainPctEl.textContent = formatPercent(latest.total_gain_pct);
    gainPctEl.classList.add(latest.total_gain_pct >= 0 ? 'positive' : 'negative');

    const updatedDate = new Date(latest.timestamp);
    document.getElementById('last-updated').textContent = updatedDate.toLocaleString();
}

function renderHoldingsTable(holdings) {
    const tbody = document.getElementById('holdings-body');
    tbody.innerHTML = '';

    holdings.forEach(h => {
        const row = document.createElement('tr');
        const gainClass = h.gain >= 0 ? 'postive' : "negative";

        row.innerHTML = `
          <td>${h.ticker}</td>
          <td>${h.shares}</td>
          <td>${formatCurrency(h.current_price)}</td>
          <td>${formatCurrency(h.cost_basis)}</td>
          <td>${formatCurrency(h.value)}</td>
          <td class="${gainClass}">${formatCurrency(h.gain)}</td>
          <td class="${gainClass}">${formatCurrency(h.gain_pct)}</td>
          `;
          tbody.appendChild(row);
    });
    
}

function renderChart(history) {
    const labels = history.map(entry => new Date(entry.timestamp).toLocaleDateString());
    const values = history.map(entry => entry.total_value);

    const ctx = document.getElementById('history-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Portfolio Value',
                data: values,
                borderColor: '#4ade80',
                backgroundColor: 'rgba(74, 222, 128, 0.1)',
                fill: true,
                tension: 0.3,
                pointRadius: 3,
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    ticks: { color: '#999'},
                    grid: { color: '#2a2e37'}
                },
                x: {
                    ticks: { color: '#999'},
                    grid: { color: '#2a2e37'}
                }
            }
        }
    });
}

async function init() {
    const data = await loadPortfolioData();
    const history = data.history;
    const latest = history[history.length -1];

    renderSummary(latest);
    renderHoldingsTable(latest.holdings);
    renderChart(history);
}

init();