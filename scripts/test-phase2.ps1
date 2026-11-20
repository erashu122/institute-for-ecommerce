param([string]$PostgresBin = 'C:\Program Files\PostgreSQL\18\bin', [switch]$Cms)
$ErrorActionPreference='Stop'
$repo=Split-Path -Parent $PSScriptRoot
Push-Location -LiteralPath $repo
$root=Join-Path ([IO.Path]::GetTempPath()) ('institute-course-test-'+[guid]::NewGuid())
$data=Join-Path $root data
$pwfile=Join-Path $root password
$pw=[guid]::NewGuid().ToString('N')
$envNames=@('PGPASSWORD','DATABASE_URL','INSTITUTE_TEST_DATABASE','AUTH_SECRET','AUTH_GOOGLE_ID','AUTH_GOOGLE_SECRET','AUTH_URL','AUTH_TRUST_HOST','INSTITUTE_TEST_CMS','MEDIA_STORAGE_DIR','UPGRADE_HASH_FILE')
$savedEnvironment=@{}
foreach($name in $envNames){$savedEnvironment[$name]=[Environment]::GetEnvironmentVariable($name,'Process')}
New-Item -ItemType Directory -Path $root | Out-Null
try {
 Set-Content -LiteralPath $pwfile -Value $pw
 & "$PostgresBin\initdb.exe" -D $data -U institute_test --auth=scram-sha-256 --pwfile=$pwfile --encoding=UTF8 --locale=C
 if($LASTEXITCODE){throw 'initdb failed'}
 Remove-Item -LiteralPath $pwfile
 & "$PostgresBin\pg_ctl.exe" start -D $data -l (Join-Path $root postgres.log) -o '-h 127.0.0.1 -p 55432' -w
 if($LASTEXITCODE){throw 'pg_ctl start failed'}
 $env:PGPASSWORD=$pw
 & "$PostgresBin\createdb.exe" -h 127.0.0.1 -p 55432 -U institute_test institute_courses_test
 if($LASTEXITCODE){throw 'createdb failed'}
 $env:DATABASE_URL='postgresql://institute_test:'+$pw+'@127.0.0.1:55432/institute_courses_test?schema=public'
 $env:INSTITUTE_TEST_DATABASE='1'
 $env:AUTH_SECRET=[guid]::NewGuid().ToString('N')+[guid]::NewGuid().ToString('N')
 $env:AUTH_GOOGLE_ID='test-only-google-client'
 $env:AUTH_GOOGLE_SECRET='test-only-google-secret'
 $env:AUTH_URL='http://127.0.0.1:3100'
 $env:AUTH_TRUST_HOST='true'
 $env:MEDIA_STORAGE_DIR=Join-Path $root media
 $env:INSTITUTE_TEST_CMS=if($Cms){'1'}else{'0'}
 if($Cms){
   $before=Join-Path $root before
   New-Item -ItemType Directory -Path $before | Out-Null
   Copy-Item -LiteralPath 'prisma/migrations/0001_baseline','prisma/migrations/0002_courses','prisma/migrations/migration_lock.toml' -Destination $before -Recurse
   $config=Join-Path $repo ('.next/upgrade-'+[guid]::NewGuid()+'.config.ts')
   New-Item -ItemType Directory -Path (Split-Path -Parent $config) -Force | Out-Null
   $schemaPath=(Join-Path $repo 'prisma/schema.prisma').Replace('\','/')
   $migrationPath=$before.Replace('\','/')
   $configText="import { defineConfig } from 'prisma/config'; export default defineConfig({ schema: '$schemaPath', migrations: { path: '$migrationPath' }, datasource: { url: process.env.DATABASE_URL } });"
   Set-Content -LiteralPath $config -Value $configText
   try {
     & node node_modules/prisma/build/index.js migrate deploy --config $config
     if($LASTEXITCODE){throw 'Phase 2 fixture migrations failed'}
   } finally { Remove-Item -LiteralPath $config }
   $env:UPGRADE_HASH_FILE=Join-Path $root course-hash
   & node scripts/check-course-upgrade.mjs before
   if($LASTEXITCODE){throw 'Course upgrade fixture failed'}
 }
 foreach($check in @('db:migrate','db:status','db:seed')){
   npm.cmd run $check
   if($LASTEXITCODE){throw "$check failed"}
 }
 if($Cms){
   & node scripts/check-course-upgrade.mjs after
   if($LASTEXITCODE){throw 'Course preservation check failed'}
 }
 npm.cmd run staff:provision -- admin@example.test ADMIN
 if($LASTEXITCODE){throw 'Test staff provisioning failed'}
 foreach($check in @('lint','typecheck','test','test:integration','build','test:e2e')){
   if($Cms -and $check -eq 'build'){
     npm.cmd run db:seed:content
     if($LASTEXITCODE){throw 'CMS seed failed'}
   }
   npm.cmd run $check
   if($LASTEXITCODE){throw "$check failed"}
 }
} finally {
 if(Test-Path -LiteralPath (Join-Path $data postmaster.pid)){ & "$PostgresBin\pg_ctl.exe" stop -D $data -m fast -w }
 $abs=(Resolve-Path -LiteralPath $root).Path
 $temp=(Resolve-Path -LiteralPath ([IO.Path]::GetTempPath())).Path.TrimEnd('\')+'\'
 if($abs.StartsWith($temp+'institute-course-test-', [StringComparison]::OrdinalIgnoreCase) -and -not (Test-Path -LiteralPath (Join-Path $data postmaster.pid))){ Remove-Item -LiteralPath $abs -Recurse -Force }
 foreach($name in $envNames){[Environment]::SetEnvironmentVariable($name,$savedEnvironment[$name],'Process')}
 Pop-Location
}

