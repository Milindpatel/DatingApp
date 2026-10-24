# Dating App

A full-stack dating app: an ASP.NET Core Web API with an Angular front end. Members can register, log in, browse matches, edit their profile and manage photos (stored on Cloudinary).

![CI](https://github.com/Milindpatel/DatingApp/actions/workflows/ci.yml/badge.svg)

## Tech stack

| Part | Stack |
| --- | --- |
| API (`DatingApp.API`) | .NET 10, ASP.NET Core controllers, EF Core 10 + SQLite, JWT bearer auth, Cloudinary |
| SPA (`DatingApp-SPA`) | Angular 22 (standalone, zoneless, signals), Bootstrap 5 (Bootswatch United), Font Awesome, Alertify |
| Tests | xUnit v3 + `WebApplicationFactory` integration tests, Vitest for the SPA |

## Getting started

Prerequisites: [.NET 10 SDK](https://dotnet.microsoft.com/download) and Node.js 22.22.3+ or 24+.

### 1. Configure secrets

The API needs a JWT signing key (64+ characters) and Cloudinary credentials. In development the signing key comes from `appsettings.Development.json`. For Cloudinary, use user-secrets so nothing sensitive is committed:

```bash
cd DatingApp.API
dotnet user-secrets set "CloudinarySettings:CloudName" "<cloud name>"
dotnet user-secrets set "CloudinarySettings:ApiKey" "<api key>"
dotnet user-secrets set "CloudinarySettings:ApiSecret" "<api secret>"
```

In production set `AppSettings__Token`, `CloudinarySettings__CloudName`, `CloudinarySettings__ApiKey` and `CloudinarySettings__ApiSecret` as environment variables.

### 2. Run the API

```bash
cd DatingApp.API
dotnet run            # http://localhost:5000
```

The SQLite database is created and seeded with demo members on first run. Every demo member's password is `password` (for example log in as `lola`).

### 3. Run the SPA

```bash
cd DatingApp-SPA
npm install
npm start             # http://localhost:4200, talks to the API on :5000
```

### Production build

`npm run build` in `DatingApp-SPA` writes the app into `DatingApp.API/wwwroot`, so the API serves the front end and API from one origin.

## Tests

```bash
dotnet test --solution DatingApp.slnx # API unit + integration tests
cd DatingApp-SPA && npm test        # SPA unit tests
```

## API overview

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | – | Create an account |
| POST | `/api/auth/login` | – | Returns a JWT and the user |
| GET | `/api/users` | ✓ | List members |
| GET | `/api/users/{id}` | ✓ | Member details with photos |
| PUT | `/api/users/{id}` | ✓ (own profile) | Update profile |
| POST | `/api/users/{id}/photos` | ✓ (own) | Upload a photo (multipart `file`, images up to 10 MB) |
| POST | `/api/users/{id}/photos/{photoId}/setMain` | ✓ (own) | Set main photo |
| DELETE | `/api/users/{id}/photos/{photoId}` | ✓ (own) | Delete a non-main photo |
