using DatingApp.API.Data;
using DatingApp.API.Dtos;
using DatingApp.API.Helpers;
using DatingApp.API.Models;
using DatingApp.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace DatingApp.API.Controllers
{
    [Authorize]
    [Route("api/users/{userId:int}/photos")]
    [ApiController]
    public class PhotosController : ControllerBase
    {
        public const long MaxFileBytes = 10 * 1024 * 1024;

        private readonly IDatingRepository _repo;
        private readonly IPhotoStorage _storage;

        public PhotosController(IDatingRepository repo, IPhotoStorage storage)
        {
            _repo = repo;
            _storage = storage;
        }

        [HttpGet("{id:int}", Name = "GetPhoto")]
        public async Task<IActionResult> GetPhoto(int userId, int id)
        {
            var photo = await _repo.GetPhoto(id);
            if (photo == null || photo.UserId != userId)
                return NotFound();

            return Ok(photo.ToReturnDto());
        }

        [HttpPost]
        [RequestSizeLimit(MaxFileBytes + 64 * 1024)]
        public async Task<IActionResult> AddPhotoForUser(int userId, [FromForm] PhotoForCreationDto dto)
        {
            if (userId != User.GetUserId())
                return Unauthorized();

            var file = dto.File;
            if (file == null || file.Length == 0)
                return BadRequest("No file was uploaded");
            if (file.Length > MaxFileBytes)
                return BadRequest("Photos must be 10 MB or smaller");
            if (string.IsNullOrEmpty(file.ContentType) || !file.ContentType.StartsWith("image/"))
                return BadRequest("Only image files can be uploaded");

            var user = await _repo.GetUser(userId);
            if (user == null)
                return NotFound();

            var upload = await _storage.UploadAsync(file);
            if (upload.Error != null)
                return BadRequest(upload.Error);

            var photo = new Photo
            {
                Url = upload.Url,
                PublicId = upload.PublicId,
                Description = dto.Description,
                DateAdded = DateTime.UtcNow,
                IsMain = !user.Photos.Any(p => p.IsMain),
            };
            user.Photos.Add(photo);

            if (await _repo.SaveAll())
                return CreatedAtRoute("GetPhoto", new { userId, id = photo.Id }, photo.ToReturnDto());

            return BadRequest("Could not add the photo");
        }

        [HttpPost("{id:int}/setMain")]
        public async Task<IActionResult> SetMainPhoto(int userId, int id)
        {
            if (userId != User.GetUserId())
                return Unauthorized();

            var user = await _repo.GetUser(userId);
            var photo = user?.Photos.FirstOrDefault(p => p.Id == id);
            if (photo == null)
                return NotFound();

            if (photo.IsMain)
                return BadRequest("This is already the main photo");

            foreach (var p in user.Photos)
                p.IsMain = p.Id == id;

            if (await _repo.SaveAll())
                return NoContent();

            return BadRequest("Could not set photo to main");
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeletePhoto(int userId, int id)
        {
            if (userId != User.GetUserId())
                return Unauthorized();

            var user = await _repo.GetUser(userId);
            var photo = user?.Photos.FirstOrDefault(p => p.Id == id);
            if (photo == null)
                return NotFound();

            if (photo.IsMain)
                return BadRequest("You cannot delete your main photo");

            if (photo.PublicId != null && !await _storage.DeleteAsync(photo.PublicId))
                return BadRequest("Failed to delete the photo from storage");

            _repo.Delete(photo);

            if (await _repo.SaveAll())
                return Ok();

            return BadRequest("Failed to delete the photo");
        }
    }
}
