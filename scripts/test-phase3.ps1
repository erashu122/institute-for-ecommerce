param([string]$PostgresBin = 'C:\Program Files\PostgreSQL\18\bin')
& "$PSScriptRoot/test-phase2.ps1" -PostgresBin $PostgresBin -Cms
