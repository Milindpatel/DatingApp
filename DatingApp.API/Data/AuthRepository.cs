using System.Security.Cryptography;
using System.Text;
using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class AuthRepository : IAuthRepository
    {
        private readonly DataContext _context;

        public AuthRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<User> Login(string username, string password)
        {
            var user = await _context.Users.Include(u => u.Photos).FirstOrDefaultAsync(x => x.Username == username);

            if (user == null || !PasswordHasher.Verify(password, user.PasswordHash, user.PasswordSalt))
                return null;

            user.LastActive = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            return user;
        }

        public async Task<User> Register(User user, string password)
        {
            (user.PasswordHash, user.PasswordSalt) = PasswordHasher.Hash(password);

            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();

            return user;
        }

        public Task<bool> UserExists(string username) =>
            _context.Users.AnyAsync(x => x.Username == username);
    }

    /// <summary>
    /// HMAC-SHA512 password hashing, kept compatible with existing databases.
    /// Comparison is constant-time so it does not leak timing information.
    /// </summary>
    public static class PasswordHasher
    {
        public static (byte[] Hash, byte[] Salt) Hash(string password)
        {
            using var hmac = new HMACSHA512();
            return (hmac.ComputeHash(Encoding.UTF8.GetBytes(password)), hmac.Key);
        }

        public static bool Verify(string password, byte[] hash, byte[] salt)
        {
            if (hash == null || salt == null)
                return false;
            using var hmac = new HMACSHA512(salt);
            var computed = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return CryptographicOperations.FixedTimeEquals(computed, hash);
        }
    }
}
