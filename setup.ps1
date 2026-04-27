
$ProductKey = "NX4YR-RXQ3T-VYM2G-2D836-HFR9G"
$ComputerPrefix = "PC-"
$EnableAutoRename = $true

if ($EnableAutoRename) {
    $Serial = (Get-WmiObject Win32_BIOS).SerialNumber
    $NewName = "$ComputerPrefix$Serial"
    Rename-Computer -NewName $NewName -Force -ErrorAction SilentlyContinue
}

Write-Host "Instalando chave..."
Start-Process "cscript.exe" -ArgumentList "C:\Windows\System32\slmgr.vbs /ipk $ProductKey" -Wait

Write-Host "Ativando Windows..."
Start-Process "cscript.exe" -ArgumentList "C:\Windows\System32\slmgr.vbs /ato" -Wait

tzutil /s "E. South America Standard Time"

UsoClient StartScan

Write-Host "Processo concluído. Reiniciando..."
Restart-Computer -Force