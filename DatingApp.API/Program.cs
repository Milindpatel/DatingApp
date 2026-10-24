using DatingApp.API.Data;
using DatingApp.API.Helpers;
using DatingApp.API.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);
var config = builder.Configuration;

builder.Services.AddDbContext<DataContext>(o => o.UseSqlite(config.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddCors();
builder.Services.Configure<CloudinarySettings>(config.GetSection("CloudinarySettings"));
builder.Services.AddSingleton<IPhotoStorage, CloudinaryPhotoStorage>();
builder.Services.AddSingleton<TokenService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IDatingRepository, DatingRepository>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();
builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<TokenService>((options, tokens) =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = tokens.SigningKey,
            ValidateIssuer = false,
            ValidateAudience = false,
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

// Fail fast if the JWT signing key is missing or too short.
app.Services.GetRequiredService<TokenService>();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();
}

var allowedOrigins = config.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
app.UseCors(p => p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod());

// Serves the built Angular app from wwwroot (see README).
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<DataContext>();
        context.Database.Migrate();
        Seed.SeedUsers(context, Path.Combine(app.Environment.ContentRootPath, "Data", "UserSeedData.json"));
    }
    catch (Exception ex)
    {
        services.GetRequiredService<ILogger<Program>>().LogError(ex, "An error occurred during migration");
        throw;
    }
}

app.Run();

public partial class Program;
