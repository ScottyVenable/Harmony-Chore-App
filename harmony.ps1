# Harmony Hub - Interactive Developer Dashboard
# Version: 1.1.0

$ErrorActionPreference = "Continue"
[console]::OutputEncoding = [System.Text.Encoding]::UTF8

# --- Configuration & Colors ---
$C_VIOLET = "`e[38;5;141m"
$C_BLUE = "`e[38;5;75m"
$C_EMERALD = "`e[38;5;85m"
$C_ROSE = "`e[38;5;210m"
$C_AMBER = "`e[38;5;214m"
$C_GRAY = "`e[38;5;244m"
$C_CYAN = "`e[38;5;86m"
$C_RESET = "`e[0m"
$C_BOLD = "`e[1m"

# --- UI Helpers ---
function Show-Header {
    Clear-Host
    $ascii = @"
$C_VIOLET
  _   _   _   _   _   _   _  
 / \ / \ / \ / \ / \ / \ / \ 
( H | A | R | M | O | N | Y )
 \_/ \_/ \_/ \_/ \_/ \_/ \_/ 
$C_GRAY
      C H O R E   A P P
$C_RESET
"@
    Write-Host $ascii
    Write-Host "$C_GRAY  Built with Vite & Capacitor | v1.1.0$C_RESET`n"
}

function Show-ProgressBar {
    param([int]$Percent, [string]$Label)
    $width = 30
    $filled = [Math]::Floor($Percent / 100 * $width)
    $unfilled = $width - $filled
    $bar = "Γûê" * $filled + "Γûæ" * $unfilled
    Write-Host -NoNewline "`r  $Label [$C_VIOLET$bar$C_RESET] $Percent%  "
}

function Invoke-WithSpinner {
    param([scriptblock]$Script, [string]$Message)
    $timer = [System.Diagnostics.Stopwatch]::StartNew()
    
    # Start task in background
    $job = Start-Job -ScriptBlock $Script -ArgumentList $PSScriptRoot
    
    # Run spinner
    $spinChars = @('|', '/', '-', '\')
    $i = 0
    Write-Host -NoNewline "  $C_CYAN$Message$C_RESET "
    while ((Get-Job -Id $job.Id).State -eq "Running") {
        Write-Host -NoNewline "`b$($spinChars[$i % 4])"
        Start-Sleep -Milliseconds 100
        $i++
    }
    
    $timer.Stop()
    Write-Host "`b$C_EMERALDΓ£ô$C_RESET Done! ($([Math]::Round($timer.Elapsed.TotalSeconds, 1))s)"
    
    # Output results
    $results = Receive-Job -Job $job -Wait
    $results | ForEach-Object { Write-Host "  $C_GRAY$_$C_RESET" }
    Remove-Job -Job $job
}

function Show-Menu {
    Write-Host "$C_VIOLET  [1]$C_RESET  Build Web App           $C_GRAY(Production)$C_RESET"
    Write-Host "$C_VIOLET  [2]$C_RESET  Build Android APK       $C_GRAY(Debug)$C_RESET"
    Write-Host "$C_VIOLET  [3]$C_RESET  Run Unit Tests          $C_GRAY(Vitest)$C_RESET"
    Write-Host "$C_VIOLET  [4]$C_RESET  Run Linting             $C_GRAY(ESLint)$C_RESET"
    Write-Host "$C_VIOLET  [5]$C_RESET  Open Android Studio     $C_GRAY(Capacitor)$C_RESET"
    Write-Host "$C_VIOLET  [6]$C_RESET  Inspect Data            $C_GRAY(Constants)$C_RESET"
    Write-Host "$C_VIOLET  [7]$C_RESET  View Build Logs"
    Write-Host "$C_VIOLET  [8]$C_RESET  Run on Android Device   $C_GRAY(Deploy)$C_RESET"
    Write-Host "$C_VIOLET  [9]$C_RESET  Check Device Connection $C_GRAY(ADB)$C_RESET"
    Write-Host "$C_ROSE  [Q]$C_RESET  Exit Harmony Hub"
    Write-Host "`n  $C_BOLD$C_VIOLET»$C_RESET " -NoNewline
}

# --- Action Hub ---
function Invoke-BuildWeb {
    Show-Header
    Invoke-WithSpinner -Message "Building Web Assets..." -Script {
        param($path) Set-Location $path; npm run build
    }
    Wait-ForMenu
}

function Invoke-BuildAndroid {
    Show-Header
    Write-Host "$C_EMERALD[STATUS]$C_RESET Starting APK Build Process..."
    for ($i = 0; $i -le 100; $i += 10) {
        Show-ProgressBar -Percent $i -Label "Preparing"
        Start-Sleep -Milliseconds 100
    }
    Write-Host "`n"
    ./package_app.ps1
    Wait-ForMenu
}

function Invoke-Tests {
    Show-Header
    Invoke-WithSpinner -Message "Executing Vitest Suite..." -Script {
        param($path) Set-Location $path; npm test -- --run
    }
    Wait-ForMenu
}

function Invoke-Lint {
    Show-Header
    Invoke-WithSpinner -Message "Running ESLint Checks..." -Script {
        param($path) Set-Location $path; npm run lint
    }
    Wait-ForMenu
}

function Invoke-CapOpen {
    Show-Header
    Write-Host "$C_BLUE[STATUS]$C_RESET Opening Android Studio..."
    npx cap open android
    Wait-ForMenu
}

function Invoke-InspectData {
    Show-Header
    Write-Host "$C_VIOLET[DATA]$C_RESET Application Constants (src/constants.js):`n"
    if (Test-Path "src/constants.js") {
        $constants = Get-Content "src/constants.js"
        $constants | Select-Object -First 25 | ForEach-Object { Write-Host "  $C_GRAY$_$C_RESET" }
        Write-Host "`n  ... (See src/constants.js for more)"
    }
    else {
        Write-Host "$C_ROSE[ERROR]$C_RESET Constants file not found."
    }
    Wait-ForMenu
}

function Invoke-ViewLogs {
    Show-Header
    if (Test-Path "build_log.txt") {
        Write-Host "$C_GRAY[LOGS] Last Build Output:$C_RESET`n"
        Get-Content "build_log.txt" -Tail 20 | ForEach-Object { Write-Host "  $_" }
    }
    else {
        Write-Host "$C_AMBER[WARN]$C_RESET No build logs found."
    }
    Wait-ForMenu
}

function Invoke-RunAndroid {
    Show-Header
    Write-Host "$C_EMERALD[STATUS]$C_RESET Initializing Android Deployment..."
    
    # List devices first
    Write-Host "$C_CYAN[INFO]$C_RESET Checking for connected devices..."
    try {
        npx cap run android --list
    }
    catch {
        Write-Host "$C_ROSE[ERROR]$C_RESET Failed to list devices. Is Capacitor installed?"
    }

    Write-Host "`n$C_AMBER[TIP]$C_RESET Ensure your device is connected via USB with Debugging Enabled."
    Write-Host "$C_AMBER[TIP]$C_RESET If you see no devices, check your cable and developer settings."
    Write-Host "$C_GRAY[NOTE]$C_RESET This command will build the app and deploy it to your selected device.`n"
    
    if ($host.UI.RawUI.KeyAvailable) { $null = $host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") }
    Write-Host "$C_VIOLETPress any key to proceed with deployment (or Ctrl+C to cancel)...$C_RESET"
    [void]$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

    # Run interactive deployment
    Write-Host "`n$C_EMERALD[STATUS]$C_RESET Building latest web assets..."
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "$C_EMERALD[STATUS]$C_RESET Syncing with Capacitor..."
        npx cap sync
        
        Write-Host "$C_EMERALD[STATUS]$C_RESET Deploying to device..."
        npx cap run android
    }
    else {
        Write-Host "$C_ROSE[ERROR]$C_RESET Web build failed. Aborting deployment."
    }

    Wait-ForMenu
}

function Invoke-CheckConnections {
    Show-Header
    Write-Host "$C_CYAN[INFO]$C_RESET Checking for connected Android devices via ADB/Capacitor...`n"
    
    # Try npx cap run android --list which is robust for Capacitor projects
    try {
        Invoke-WithSpinner -Message "Scanning devices..." -Script {
            npx cap run android --list
        }
    }
    catch {
        Write-Host "$C_ROSE[ERROR]$C_RESET Failed to scan devices."
        Write-Host "Ensure Android SDK is in your PATH or run through Capacitor."
    }
    
    # Also try direct ADB if available for more detail
    if (Get-Command adb -ErrorAction SilentlyContinue) {
        Write-Host "`n$C_GRAY[ADB Output]$C_RESET"
        adb devices -l
    }
    else {
        Write-Host "`n$C_AMBER[WARN]$C_RESET 'adb' command not found in global PATH (using Capacitor wrapper only)."
    }

    Write-Host "`n$C_AMBER[TIP]$C_RESET If your device is missing:"
    Write-Host "  1. Enable Developer Options & USB Debugging on phone."
    Write-Host "  2. Connect via USB (Check cable)."
    Write-Host "  3. Accept 'Allow USB Debugging' prompt on phone screen."
    
    Wait-ForMenu
}

function Wait-ForMenu {
    Write-Host "`n  $C_GRAY(Press any key to return to Hub)$C_RESET" -NoNewline
    [void]$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# --- Main Loop ---
do {
    Show-Header
    Show-Menu
    $selection = Read-Host
    
    switch ($selection.ToUpper()) {
        "1" { Invoke-BuildWeb }
        "2" { Invoke-BuildAndroid }
        "3" { Invoke-Tests }
        "4" { Invoke-Lint }
        "5" { Invoke-CapOpen }
        "6" { Invoke-InspectData }
        "7" { Invoke-ViewLogs }
        "8" { Invoke-RunAndroid }
        "9" { Invoke-CheckConnections }
        "Q" { Write-Host "`n  $C_VIOLET Stay Harmonious! Goodbye.$C_RESET`n"; exit }
        default { 
            Write-Host "  $C_ROSE[!]$C_RESET Invalid selection." -NoNewline
            Start-Sleep -Seconds 1
        }
    }
} while ($true)
