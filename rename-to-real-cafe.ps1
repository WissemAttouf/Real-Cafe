# ============================================================
# Renommage : "Grain & Cendre" -> "Real Cafe"
#              "\u0642\u0647\u0648\u0629" -> "\u0631\u064a\u0627\u0644 \u0643\u0627\u0641\u064a"
#              "grain-et-cendre" -> "real-cafe"
# ============================================================

$ErrorActionPreference = 'Stop'

# Le caractere arabe "qahwa" = U+0642 U+0647 U+0648 U+0629
$ARABIC_OLD = [char]0x0642 + [char]0x0647 + [char]0x0648 + [char]0x0629

# "riyal kafi" = U+0631 U+064a U+0627 U+0644 (espace) U+0643 U+0627 U+0641 U+064a
$ARABIC_NEW = [char]0x0631 + [char]0x064a + [char]0x0627 + [char]0x0644 + ' ' + [char]0x0643 + [char]0x0627 + [char]0x0641 + [char]0x064a

$files = @(
  'index.html',
  'manifest.webmanifest',
  'sw.js',
  'vercel.json',
  'package.json',
  'README.md',
  'robots.txt',
  'sitemap.xml'
)

$folders = @('locales', 'data', 'js', 'api', 'lib', 'admin', 'tests')

function Process-Content {
  param([string]$text)
  $text = $text.Replace('grain-et-cendre', 'real-cafe')
  $text = $text.Replace('grainetcendre', 'realcafe')
  $text = $text.Replace('Grain &amp; Cendre', 'Real Cafe')
  $text = $text.Replace('Grain & Cendre', 'Real Cafe')
  $text = $text.Replace('Grain et Cendre', 'Real Cafe')
  $text = $text.Replace('grain & cendre', 'real cafe')
  $text = $text.Replace('Grain&Cendre', 'RealCafe')
  $text = $text.Replace($ARABIC_OLD, $ARABIC_NEW)
  return $text
}

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "Traitement : $file" -ForegroundColor Cyan
    $content = Get-Content $file -Raw -Encoding UTF8
    $content = Process-Content $content
    Set-Content $file -Value $content -Encoding UTF8 -NoNewline
  }
}

foreach ($folder in $folders) {
  if (Test-Path $folder) {
    Get-ChildItem -Path $folder -Recurse -File | ForEach-Object {
      $ext = $_.Extension.ToLower()
      if ($ext -in '.js', '.json', '.html', '.css', '.md', '.txt', '.xml') {
        Write-Host "Traitement : $($_.FullName)" -ForegroundColor Cyan
        $content = Get-Content $_.FullName -Raw -Encoding UTF8
        $content = Process-Content $content
        Set-Content $_.FullName -Value $content -Encoding UTF8 -NoNewline
      }
    }
  }
}

Write-Host ''
Write-Host 'Renommage termine.' -ForegroundColor Green