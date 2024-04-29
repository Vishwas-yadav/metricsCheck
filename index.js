const express = require('express');
const { exec } = require('child_process');
const os = require('os');

const app = express();

// Function to fetch CPU utilization (returns percentage)
function getCpuUsage() {
  return os.loadavg()[0] * 100; // Multiply by 100 to get percentage
}

// Function to fetch memory utilization (returns percentage)
function getMemoryUsage() {
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;
  const memoryUsagePercent = (usedMemory / totalMemory) * 100; // Convert to percentage
  return memoryUsagePercent;
}

// Route to get metrics
app.get('/get-metrics', (req, res) => {
  // Fetch CPU usage
  const cpuUsage = getCpuUsage().toFixed(2);

  // Fetch memory usage
  const memoryUsage = getMemoryUsage().toFixed(2);

  // Fetch total incoming connections
  exec('netstat -an | grep "ESTABLISHED" | grep -c ":80\\|:443"', (error, stdout, stderr) => {
    if (error) {
      console.error('Error fetching incoming connections:', error);
      res.status(500).json({ error: 'Unable to fetch total incoming connections' });
      return;
    }

    const incomingConnections = parseInt(stdout.trim());

    // Prepare response
    const responseData = {
      cpuUsage: `${cpuUsage}%`,
      memoryUsage: `${memoryUsage}%`,
      activeConnections: incomingConnections
    };

    // Send response
    res.json(responseData);
  });
});

// Start server on port 8000
const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
