$ErrorActionPreference = "Stop"

Write-Host "=== Harmony Chore App Packager ===" -ForegroundColor Cyan

# 1. Build Web App
Write-Host "`n[1/3] Building Web App..." -ForegroundColor Green
npm run build
if ($LASTEXITCODE -ne 0) { throw "Web build failed." }

# 2. Sync Capacitor
Write-Host "`n[2/3] Syncing Capacitor..." -ForegroundColor Green
if (!(Test-Path "android")) {
    Write-Host "Android platform missing. Adding it..."
    npx cap add android
}
npx cap sync
if ($LASTEXITCODE -ne 0) { throw "Capacitor sync failed." }

# 3. Build Android APK
Write-Host "`n[3/3] Building Android APK..." -ForegroundColor Green
if (Test-Path "android") {
    Push-Location android
    try {
        if ($IsWindows) {
            ./gradlew.bat assembleDebug
        } else {
            ./gradlew assembleDebug
        }
    } finally {
        Pop-Location
    }
    
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
    if (Test-Path $apkPath) {
        Write-Host "`nSUCCESS! APK created at:" -ForegroundColor Cyan
        Write-Host (Resolve-Path $apkPath) -ForegroundColor Yellow
    } else {
        Write-Warning "APK build might have failed or output path differs."
    }
} else {
    Write-Warning "Android folder not found."
}

Write-Host "`nNote: For iOS, you must strictly run this on macOS with Xcode installed." -ForegroundColor Gray
Write-Host "To open Android Studio project: npx cap open android" -ForegroundColor Gray
