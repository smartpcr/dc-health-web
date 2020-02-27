# Data Center Health

UI for data center device health

## Run the app locally (without docker)

### VSCode

- Open this folder in VS Code.
- Run with `Ctrl+F5`
- In case of errors about missing packages:
  - `cd src/ClientApp`
  - `rm -r -fo node_modules`
  - `npm i`

### PowerShell

1. `dotnet build`
2. `dotnet run --project .\web\src\DataCenterHealth.Web.csproj`
3. You will now be able to access the app at https://localhost.default.svc.cluster.local:4001

## Run the app locally (with docker)
