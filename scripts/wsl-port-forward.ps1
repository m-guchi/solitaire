# WSL2: forward Windows :8080 -> WSL dev server (run in elevated PowerShell)
$ErrorActionPreference = 'Stop'
$port = 8080

$wslIp = (wsl.exe -e python3 -c @"
import socket
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(('8.8.8.8', 80))
print(s.getsockname()[0])
s.close()
"@).Trim()

if (-not $wslIp) {
    Write-Error 'Could not detect WSL IP address.'
}

netsh interface portproxy delete v4tov4 listenport=$port listenaddress=0.0.0.0 2>$null
netsh interface portproxy add v4tov4 listenport=$port listenaddress=0.0.0.0 connectport=$port connectaddress=$wslIp

$ruleName = 'WSL Solitaire Dev 8080'
if (-not (Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue)) {
    New-NetFirewallRule -DisplayName $ruleName -Direction Inbound -Action Allow -Protocol TCP -LocalPort $port | Out-Null
}

$lanIp = (Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object { $_.PrefixOrigin -eq 'Dhcp' -and $_.IPAddress -notmatch '^169\.' } |
    Select-Object -First 1 -ExpandProperty IPAddress)

Write-Host ''
Write-Host 'Port forwarding updated.'
Write-Host "  WSL:  http://${wslIp}:${port}/"
if ($lanIp) {
    Write-Host "  Phone: http://${lanIp}:${port}/  (same Wi-Fi as this PC)"
}
Write-Host ''
netsh interface portproxy show all
