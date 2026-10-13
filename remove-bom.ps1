# ============================================================
# Retire le BOM UTF-8 de tous les fichiers texte
# ============================================================

$rootFiles = @(
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'vercel.json',
  'package.json',
  'README.md',
  'robots.txt',
  'sitemap.xml',
  'styles.css'
)

$folders = @('locales', 'data', 'js', 'api', 'lib', 'admin', 'tests')

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$count = 0

function Remove-Bom {
  param([string]$path)
  $bytes = [System.IO.File]::ReadAllBytes($path)
  if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF){
    $text = [System.Text.Encoding]::UTF8.GetString($bytes, 3, $bytes.Length - 3)
    [System.IO.File]::WriteAllText($path, $text, $utf8NoBom)
    Write-Host "BOM retire : $path" -ForegroundColor Green
    $script:count++
  }
}

foreach ($f in $rootFiles) {
  if (Test-Path $f) { Remove-Bom $f }
}

foreach ($folder in $folders) {
  if (Test-Path $folder) {
    Get-ChildItem -Path $folder -Recurse -File | ForEach-Object {
      $ext = $_.Extension.ToLower()
      if ($ext -in '.js', '.json', '.html', '.css', '.md', '.txt', '.xml', '.webmanifest') {
        Remove-Bom $_.FullName
      }
    }
  }
}

Write-Host ''
Write-Host "$count fichier(s) nettoye(s)." -ForegroundColor Green