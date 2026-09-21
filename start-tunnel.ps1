while ($true) {
    Write-Host "[Tunnel] Connecting to serveo.net..."
    ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=4 -R 80:localhost:5000 serveo.net
    Write-Host "[Tunnel] Disconnected. Reconnecting in 2 seconds..."
    Start-Sleep -Seconds 2
}
