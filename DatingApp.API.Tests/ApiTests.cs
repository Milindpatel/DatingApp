using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;

namespace DatingApp.API.Tests;

public class ApiTests : IClassFixture<ApiFactory>
{
    private readonly ApiFactory _factory;

    public ApiTests(ApiFactory factory)
    {
        _factory = factory;
    }

    private record LoginResponse(string Token, UserDto User);
    private record UserDto(int Id, string Username, string KnownAs, string City, string PhotoUrl, List<PhotoDto> Photos);
    private record PhotoDto(int Id, string Url, bool IsMain);

    private async Task<(HttpClient Client, UserDto User)> LoginAsync(string username, string password = "password")
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/auth/login", new { username, password }, TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        return (client, body.User);
    }

    private static object NewUser(string username, string password = "longenough") => new
    {
        username,
        password,
        gender = "female",
        knownAs = "Test",
        dateOfBirth = "1990-01-01",
        city = "Toronto",
        country = "Canada",
    };

    [Fact]
    public async Task Users_RequireAuthentication()
    {
        var response = await _factory.CreateClient().GetAsync("/api/users", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithSeededUser_ReturnsTokenThatWorks()
    {
        var (client, user) = await LoginAsync("Lola");
        Assert.Equal("lola", user.Username);

        var users = await client.GetFromJsonAsync<List<UserDto>>("/api/users", TestContext.Current.CancellationToken);
        Assert.NotEmpty(users!);
    }

    [Fact]
    public async Task Login_WithWrongPassword_IsRejected()
    {
        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new { username = "lola", password = "nope" }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Register_CreatesUser_AndRejectsDuplicates()
    {
        var client = _factory.CreateClient();
        var created = await client.PostAsJsonAsync("/api/auth/register", NewUser("NewPerson"), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);

        var duplicate = await client.PostAsJsonAsync("/api/auth/register", NewUser("newperson"), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
    }

    [Fact]
    public async Task Register_RejectsShortPasswords()
    {
        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/api/auth/register", NewUser("shortpw", "short"), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GetUser_ReturnsNotFoundForMissingUser()
    {
        var (client, _) = await LoginAsync("lola");
        var response = await client.GetAsync("/api/users/999999", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task UpdateUser_OnlyAllowsYourOwnProfile()
    {
        var (client, me) = await LoginAsync("lola");
        var update = new { introduction = "Hi", lookingFor = "Fun", interests = "Hiking", city = "Paris", country = "France" };

        var own = await client.PutAsJsonAsync($"/api/users/{me.Id}", update, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NoContent, own.StatusCode);
        var reloaded = await client.GetFromJsonAsync<UserDto>($"/api/users/{me.Id}", TestContext.Current.CancellationToken);
        Assert.Equal("Paris", reloaded!.City);

        var other = await client.PutAsJsonAsync($"/api/users/{me.Id + 1}", update, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, other.StatusCode);
    }

    [Fact]
    public async Task Photos_UploadSetMainAndDelete()
    {
        var register = await _factory.CreateClient()
            .PostAsJsonAsync("/api/auth/register", NewUser("photographer"), TestContext.Current.CancellationToken);
        register.EnsureSuccessStatusCode();
        var (client, me) = await LoginAsync("photographer", "longenough");

        async Task<PhotoDto> Upload()
        {
            using var form = new MultipartFormDataContent();
            var file = new ByteArrayContent([1, 2, 3]);
            file.Headers.ContentType = new MediaTypeHeaderValue("image/jpeg");
            form.Add(file, "file", "me.jpg");
            var response = await client.PostAsync($"/api/users/{me.Id}/photos", form, TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            return (await response.Content.ReadFromJsonAsync<PhotoDto>(TestContext.Current.CancellationToken))!;
        }

        var first = await Upload();
        var second = await Upload();
        Assert.True(first.IsMain);
        Assert.False(second.IsMain);

        // Main photo cannot be deleted.
        var deleteMain = await client.DeleteAsync($"/api/users/{me.Id}/photos/{first.Id}", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, deleteMain.StatusCode);

        var setMain = await client.PostAsync($"/api/users/{me.Id}/photos/{second.Id}/setMain", null, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NoContent, setMain.StatusCode);

        var deleteOld = await client.DeleteAsync($"/api/users/{me.Id}/photos/{first.Id}", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, deleteOld.StatusCode);
        Assert.Contains("fake-1", _factory.Storage.Deleted);

        var user = await client.GetFromJsonAsync<UserDto>($"/api/users/{me.Id}", TestContext.Current.CancellationToken);
        Assert.Single(user!.Photos);
        Assert.Equal(second.Url, user.PhotoUrl);
    }

    [Fact]
    public async Task Photos_RejectNonImages()
    {
        var (client, me) = await LoginAsync("lola");
        using var form = new MultipartFormDataContent();
        var file = new ByteArrayContent([1, 2, 3]);
        file.Headers.ContentType = new MediaTypeHeaderValue("text/plain");
        form.Add(file, "file", "notes.txt");

        var response = await client.PostAsync($"/api/users/{me.Id}/photos", form, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
