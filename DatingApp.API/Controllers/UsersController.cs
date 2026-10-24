using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IDatingRepository _repo;

        public UsersController(IDatingRepository repo)
        {
            _repo = repo;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _repo.GetUsers();
            return Ok(users.Select(u => u.ToListDto()));
        }

        [HttpGet("{id:int}", Name = "GetUser")]
        public async Task<IActionResult> GetUser(int id)
        {
            var user = await _repo.GetUser(id);
            if (user == null)
                return NotFound();

            return Ok(user.ToDetailedDto());
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateUser(int id, UserForUpdateDto dto)
        {
            if (id != User.GetUserId())
                return Unauthorized();

            var user = await _repo.GetUser(id);
            if (user == null)
                return NotFound();

            dto.ApplyTo(user);
            await _repo.SaveAll();
            return NoContent();
        }
    }
}
