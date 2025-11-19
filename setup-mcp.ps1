# Blocktopia MCP Setup Helper Script
# This script helps you set up MCP for Supabase

Write-Host "🚀 Blocktopia MCP Setup Helper" -ForegroundColor Cyan
Write-Host ""

# Determine MCP config location
$mcpConfigPath = "$env:APPDATA\Cursor\User\globalStorage\mcp.json"

Write-Host "📍 Your MCP config location:" -ForegroundColor Yellow
Write-Host $mcpConfigPath
Write-Host ""

# Check if MCP config exists
if (Test-Path $mcpConfigPath) {
    Write-Host "✅ MCP config file already exists!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Current contents:" -ForegroundColor Yellow
    Get-Content $mcpConfigPath
    Write-Host ""
    Write-Host "⚠️  To add Supabase, merge the contents from 'mcp-config-template.json'" -ForegroundColor Yellow
} else {
    Write-Host "❌ MCP config file doesn't exist yet." -ForegroundColor Red
    Write-Host ""
    
    # Create directory if it doesn't exist
    $mcpDir = Split-Path -Parent $mcpConfigPath
    if (!(Test-Path $mcpDir)) {
        Write-Host "📁 Creating directory: $mcpDir" -ForegroundColor Cyan
        New-Item -ItemType Directory -Force -Path $mcpDir | Out-Null
    }
    
    Write-Host "Would you like to create it now? (Y/N): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    
    if ($response -eq "Y" -or $response -eq "y") {
        # Copy template
        Copy-Item "mcp-config-template.json" $mcpConfigPath
        Write-Host ""
        Write-Host "✅ MCP config created!" -ForegroundColor Green
        Write-Host ""
        Write-Host "⚠️  IMPORTANT: You must edit the file and replace 'YOUR_DATABASE_PASSWORD_HERE' with your actual Supabase database password!" -ForegroundColor Red
        Write-Host ""
        Write-Host "Opening the file for you..." -ForegroundColor Cyan
        Start-Sleep -Seconds 2
        notepad $mcpConfigPath
    }
}

Write-Host ""
Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Get your database password from Supabase Dashboard → Settings → Database"
Write-Host "2. Edit the MCP config file and replace 'YOUR_DATABASE_PASSWORD_HERE'"
Write-Host "3. Restart Cursor completely"
Write-Host ""
Write-Host "Need help? Check '.cursorrules-mcp-setup.md' for detailed instructions!" -ForegroundColor Green
Write-Host ""

