$body = @{ firstName = 'PShellTest'; email = 'pshell+test@example.com'; password = 'secret123' } | ConvertTo-Json
try {
  $res = Invoke-RestMethod -Method Post -Uri 'http://localhost:5000/api/auth/register' -Body $body -ContentType 'application/json'
  Write-Output "RESPONSE:`n$res | Out-String"
} catch {
  Write-Output "ERROR:`n$($_.Exception | Out-String)"
  if ($_.Exception.Response) { $_.Exception.Response.GetResponseStream() | % { [System.IO.StreamReader]::new($_).ReadToEnd() } }
}
