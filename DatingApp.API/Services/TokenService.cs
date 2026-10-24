using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using DatingApp.API.Models;
using Microsoft.IdentityModel.Tokens;

namespace DatingApp.API.Services
{
    public class TokenService
    {
        /// <summary>HMAC-SHA512 needs a key of at least 512 bits.</summary>
        public const int MinKeyBytes = 64;

        public SymmetricSecurityKey SigningKey { get; }

        public TokenService(IConfiguration config)
        {
            var key = config["AppSettings:Token"];
            if (string.IsNullOrWhiteSpace(key) || Encoding.UTF8.GetByteCount(key) < MinKeyBytes)
            {
                throw new InvalidOperationException(
                    $"AppSettings:Token must be at least {MinKeyBytes} characters. " +
                    "Set it with user-secrets or the AppSettings__Token environment variable.");
            }
            SigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
        }

        public string CreateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
            };

            var descriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddDays(1),
                SigningCredentials = new SigningCredentials(SigningKey, SecurityAlgorithms.HmacSha512Signature),
            };

            var handler = new JwtSecurityTokenHandler();
            return handler.WriteToken(handler.CreateToken(descriptor));
        }
    }
}
