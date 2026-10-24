using DatingApp.API.Dtos;
using DatingApp.API.Models;

namespace DatingApp.API.Helpers
{
    /// <summary>Hand-written mappings between entities and DTOs.</summary>
    public static class Mappings
    {
        private static string MainPhotoUrl(User user) =>
            user.Photos?.FirstOrDefault(p => p.IsMain)?.Url;

        public static UserForListDto ToListDto(this User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            Gender = user.Gender,
            Age = user.DateOfBirth.CalculateAge(),
            KnownAs = user.KnownAs,
            Created = user.Created,
            LastActive = user.LastActive,
            City = user.City,
            Country = user.Country,
            PhotoUrl = MainPhotoUrl(user),
        };

        public static UserForDetailedDto ToDetailedDto(this User user) => new()
        {
            Id = user.Id,
            Username = user.Username,
            Gender = user.Gender,
            Age = user.DateOfBirth.CalculateAge(),
            KnownAs = user.KnownAs,
            Created = user.Created,
            LastActive = user.LastActive,
            Introduction = user.Introduction,
            LookingFor = user.LookingFor,
            Interests = user.Interests,
            City = user.City,
            Country = user.Country,
            PhotoUrl = MainPhotoUrl(user),
            Photos = (user.Photos ?? []).Select(p => new PhotosForDetailedDto
            {
                Id = p.Id,
                Url = p.Url,
                Description = p.Description,
                DateAdded = p.DateAdded,
                IsMain = p.IsMain,
            }).ToList(),
        };

        public static PhotoForReturnDto ToReturnDto(this Photo photo) => new()
        {
            Id = photo.Id,
            Url = photo.Url,
            Description = photo.Description,
            DateAdded = photo.DateAdded,
            IsMain = photo.IsMain,
            PublicId = photo.PublicId,
        };

        public static User ToUser(this UserForRegisterDto dto) => new()
        {
            Username = dto.Username.Trim().ToLowerInvariant(),
            Gender = dto.Gender,
            KnownAs = dto.KnownAs,
            DateOfBirth = dto.DateOfBirth,
            City = dto.City,
            Country = dto.Country,
            Created = DateTime.UtcNow,
            LastActive = DateTime.UtcNow,
        };

        public static void ApplyTo(this UserForUpdateDto dto, User user)
        {
            user.Introduction = dto.Introduction;
            user.LookingFor = dto.LookingFor;
            user.Interests = dto.Interests;
            user.City = dto.City;
            user.Country = dto.Country;
        }
    }
}
