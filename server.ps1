$ErrorActionPreference = 'Stop'
$port = 5500
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://localhost:$port/index.html"

$server = New-Object System.Net.Sockets.TcpListener([System.Net.IPAddress]::Loopback, $port)
try {
    $server.Start()
} catch {
    Write-Host "ERROR: Cannot start localhost on port $port." -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "Close any old monitor window and try again." -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "Twitch Chat Monitor is running." -ForegroundColor Green
Write-Host $url -ForegroundColor Cyan
Write-Host "KEEP THIS WINDOW OPEN." -ForegroundColor Yellow
Start-Process $url

$mime = @{
    '.html' = 'text/html; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.png'  = 'image/png'
    '.jpg'  = 'image/jpeg'
    '.jpeg' = 'image/jpeg'
    '.svg'  = 'image/svg+xml'
    '.ico'  = 'image/x-icon'
}

while ($true) {
    $client = $null
    $stream = $null
    try {
        $client = $server.AcceptTcpClient()
        $stream = $client.GetStream()
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::ASCII, $false, 4096, $true)
        $requestLine = $reader.ReadLine()
        if ([string]::IsNullOrWhiteSpace($requestLine)) {
            $client.Close()
            continue
        }

        while ($true) {
            $line = $reader.ReadLine()
            if ([string]::IsNullOrEmpty($line)) { break }
        }

        $parts = $requestLine.Split(' ')
        $requestPath = '/'
        if ($parts.Length -ge 2) { $requestPath = $parts[1] }
        $requestPath = $requestPath.Split('?')[0]
        $requestPath = [Uri]::UnescapeDataString($requestPath.TrimStart('/'))
        if ([string]::IsNullOrWhiteSpace($requestPath)) { $requestPath = 'index.html' }

        $rootFull = [IO.Path]::GetFullPath($root + [IO.Path]::DirectorySeparatorChar)
        $full = [IO.Path]::GetFullPath((Join-Path $root $requestPath))
        $ok = $full.StartsWith($rootFull, [StringComparison]::OrdinalIgnoreCase) -and (Test-Path $full -PathType Leaf)

        if ($ok) {
            $body = [IO.File]::ReadAllBytes($full)
            $ext = [IO.Path]::GetExtension($full).ToLowerInvariant()
            $contentType = 'application/octet-stream'
            if ($mime.ContainsKey($ext)) { $contentType = $mime[$ext] }
            $header = "HTTP/1.1 200 OK`r`nContent-Type: $contentType`r`nContent-Length: $($body.Length)`r`nConnection: close`r`nCache-Control: no-store`r`n`r`n"
        } else {
            $body = [Text.Encoding]::UTF8.GetBytes('404 Not Found')
            $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain; charset=utf-8`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
        }

        $headerBytes = [Text.Encoding]::ASCII.GetBytes($header)
        $stream.Write($headerBytes, 0, $headerBytes.Length)
        $stream.Write($body, 0, $body.Length)
        $stream.Flush()
    } catch {
        Write-Host ("Request error: " + $_.Exception.Message) -ForegroundColor DarkYellow
    } finally {
        if ($stream) { $stream.Dispose() }
        if ($client) { $client.Close() }
    }
}
