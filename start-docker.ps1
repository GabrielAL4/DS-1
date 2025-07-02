# Controle de Sala FEMASS - Docker PowerShell Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "    Controle de Sala FEMASS - Docker" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Escolha uma opcao:" -ForegroundColor Yellow
    Write-Host "1. Verificar Docker Desktop" -ForegroundColor White
    Write-Host "2. Construir e iniciar containers" -ForegroundColor White
    Write-Host "3. Parar containers" -ForegroundColor White
    Write-Host "4. Remover containers" -ForegroundColor White
    Write-Host "5. Ver logs do backend" -ForegroundColor White
    Write-Host "6. Ver logs do frontend" -ForegroundColor White
    Write-Host "7. Ver status dos containers" -ForegroundColor White
    Write-Host "8. Sair" -ForegroundColor White
    Write-Host ""
}

function Check-Docker {
    Write-Host "Verificando Docker Desktop..." -ForegroundColor Yellow
    try {
        docker info | Out-Null
        Write-Host "Docker Desktop esta rodando!" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "Docker Desktop nao esta rodando." -ForegroundColor Red
        Write-Host "Tentando iniciar o Docker Desktop..." -ForegroundColor Yellow
        Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
        Write-Host "Aguarde alguns segundos para o Docker Desktop inicializar..." -ForegroundColor Yellow
        return $false
    }
}

function Start-Containers {
    if (Check-Docker) {
        Write-Host "Construindo e iniciando containers..." -ForegroundColor Yellow
        docker-compose up --build -d
        Write-Host ""
        Write-Host "Containers iniciados!" -ForegroundColor Green
        Write-Host "Backend: http://localhost:8080" -ForegroundColor Cyan
        Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
    }
}

function Stop-Containers {
    Write-Host "Parando containers..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "Containers parados!" -ForegroundColor Green
}

function Remove-Containers {
    Write-Host "Removendo containers..." -ForegroundColor Yellow
    docker-compose down --rmi all --volumes --remove-orphans
    Write-Host "Containers removidos!" -ForegroundColor Green
}

function Show-Logs {
    param($service)
    Write-Host "Logs do $service:" -ForegroundColor Yellow
    docker-compose logs -f $service
}

function Show-Status {
    Write-Host "Status dos containers:" -ForegroundColor Yellow
    docker-compose ps
}

do {
    Show-Menu
    $choice = Read-Host "Digite sua escolha (1-8)"
    
    switch ($choice) {
        "1" { Check-Docker }
        "2" { Start-Containers }
        "3" { Stop-Containers }
        "4" { Remove-Containers }
        "5" { Show-Logs "backend" }
        "6" { Show-Logs "frontend" }
        "7" { Show-Status }
        "8" { 
            Write-Host "Saindo..." -ForegroundColor Yellow
            exit 
        }
        default { Write-Host "Opcao invalida!" -ForegroundColor Red }
    }
    
    if ($choice -ne "8") {
        Write-Host ""
        Read-Host "Pressione Enter para continuar"
        Clear-Host
    }
} while ($choice -ne "8") 