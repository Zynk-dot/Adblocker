document.addEventListener('DOMContentLoaded', () => {
    const logTable = document.getElementById('logTable');
    const clearBtn = document.getElementById('clearLogsBtn');
  
    const renderLogs = () => {
      chrome.storage.local.get('logEvents', data => {
        const logs = (data.logEvents || []).slice().reverse();
        logTable.innerHTML = '';
  
        logs.forEach(log => {
          const row = document.createElement('tr');
          const time = new Date(log.time).toLocaleTimeString();
          row.innerHTML = `
            <td>${time}</td>
            <td>${log.type}</td>
            <td>${log.detail}</td>
            <td><span class="module">${log.module}</span></td>
          `;
          logTable.appendChild(row);
        });
      });
    };
  
    clearBtn?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all logs?')) {
        chrome.storage.local.set({ logEvents: [] }, renderLogs);
      }
    });
  
    renderLogs();
  });
  