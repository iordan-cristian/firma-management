@echo off
rem Convenience runner: creates the firma_management database, then loads
rem the schema and the seed data. Requires `psql` on PATH.
rem
rem Usage:   setup.bat
rem Env:     PGUSER (default: postgres), PGPASSWORD, PGHOST, PGPORT

setlocal
set SCRIPT_DIR=%~dp0
if "%PGUSER%"=="" set PGUSER=postgres
if "%PGHOST%"=="" set PGHOST=localhost
if "%PGPORT%"=="" set PGPORT=5432

echo ==^> Creating database firma_management
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d postgres -f "%SCRIPT_DIR%00_create_database.sql"
if errorlevel 1 goto :error

echo ==^> Applying schema
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d firma_management -f "%SCRIPT_DIR%01_schema.sql"
if errorlevel 1 goto :error

echo ==^> Seeding sample data
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d firma_management -f "%SCRIPT_DIR%02_seed.sql"
if errorlevel 1 goto :error

echo ==^> Done.
exit /b 0

:error
echo Setup failed.
exit /b 1
