using System.Text.Json;
using DatingApp.API.Models;

namespace DatingApp.API.Data
{
    public static class Seed
    {
        /// <summary>Adds demo users (password: "password") to an empty database.</summary>
        public static void SeedUsers(DataContext context, string seedFile)
        {
            if (context.Users.Any())
                return;

            var options = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            var users = JsonSerializer.Deserialize<List<User>>(File.ReadAllText(seedFile), options) ?? [];

            foreach (var user in users)
            {
                (user.PasswordHash, user.PasswordSalt) = PasswordHasher.Hash("password");
                user.Username = user.Username.ToLowerInvariant();
                context.Users.Add(user);
            }

            context.SaveChanges();
        }
    }
}
