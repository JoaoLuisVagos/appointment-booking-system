FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY back-end.csproj ./
RUN dotnet restore back-end.csproj

COPY . .
RUN dotnet publish back-end.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

ENV ASPNETCORE_URLS=http://+:5000
EXPOSE 5000

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "back-end.dll"]
