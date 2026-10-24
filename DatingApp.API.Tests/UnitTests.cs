using DatingApp.API.Data;
using DatingApp.API.Helpers;

namespace DatingApp.API.Tests;

public class UnitTests
{
    [Theory]
    [InlineData("2000-06-15", "2026-06-14", 25)]
    [InlineData("2000-06-15", "2026-06-15", 26)]
    [InlineData("2000-02-29", "2026-02-27", 25)]
    [InlineData("2000-02-29", "2026-03-01", 26)]
    public void CalculateAge_HandlesBirthdays(string dob, string today, int expected)
    {
        Assert.Equal(expected, DateTime.Parse(dob).CalculateAge(DateTime.Parse(today)));
    }

    [Fact]
    public void PasswordHasher_VerifiesCorrectPasswordOnly()
    {
        var (hash, salt) = PasswordHasher.Hash("correct horse");

        Assert.True(PasswordHasher.Verify("correct horse", hash, salt));
        Assert.False(PasswordHasher.Verify("wrong horse", hash, salt));
        Assert.False(PasswordHasher.Verify("correct horse", null, salt));
    }

    [Fact]
    public void PasswordHasher_UsesRandomSalt()
    {
        var (hash1, salt1) = PasswordHasher.Hash("same");
        var (hash2, salt2) = PasswordHasher.Hash("same");

        Assert.NotEqual(salt1, salt2);
        Assert.NotEqual(hash1, hash2);
    }
}
