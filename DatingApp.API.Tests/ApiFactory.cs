using DatingApp.API.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace DatingApp.API.Tests;

/// <summary>Runs the API against a throwaway SQLite file with fake photo storage.</summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"datingapp-test-{Guid.NewGuid():N}.db");

    public FakePhotoStorage Storage { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.UseSetting("ConnectionStrings:DefaultConnection", $"Data Source={_dbPath}");
        builder.ConfigureServices(services =>
        {
            services.RemoveAll<IPhotoStorage>();
            services.AddSingleton<IPhotoStorage>(Storage);
        });
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        Microsoft.Data.Sqlite.SqliteConnection.ClearAllPools();
        if (File.Exists(_dbPath)) File.Delete(_dbPath);
    }
}

public class FakePhotoStorage : IPhotoStorage
{
    private int _next;
    public List<string> Deleted { get; } = [];

    public Task<PhotoUploadResult> UploadAsync(IFormFile file)
    {
        var id = $"fake-{Interlocked.Increment(ref _next)}";
        return Task.FromResult(new PhotoUploadResult($"https://example.test/{id}.jpg", id, null));
    }

    public Task<bool> DeleteAsync(string publicId)
    {
        Deleted.Add(publicId);
        return Task.FromResult(true);
    }
}
