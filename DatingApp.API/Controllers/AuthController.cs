using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthRepository _repo;
        private readonly TokenService _tokens;

        public AuthController(IAuthRepository repo, TokenService tokens)
        {
            _repo = repo;
            _tokens = tokens;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserForRegisterDto dto)
        {
            var user = dto.ToUser();

            if (await _repo.UserExists(user.Username))
                return BadRequest("Username already exists");

            var createdUser = await _repo.Register(user, dto.Password);

            return CreatedAtRoute("GetUser", new { controller = "Users", id = createdUser.Id }, createdUser.ToDetailedDto());
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserForLoginDto dto)
        {
            var user = await _repo.Login(dto.Username.Trim().ToLowerInvariant(), dto.Password);

            if (user == null)
                return Unauthorized();

            return Ok(new
            {
                token = _tokens.CreateToken(user),
                user = user.ToListDto(),
            });
        }
    }
}
