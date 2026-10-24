using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DatingApp.API.Helpers;
using Microsoft.Extensions.Options;

namespace DatingApp.API.Services
{
    public class CloudinaryPhotoStorage : IPhotoStorage
    {
        private readonly Lazy<Cloudinary> _cloudinary;

        public CloudinaryPhotoStorage(IOptions<CloudinarySettings> options)
        {
            var settings = options.Value;
            _cloudinary = new Lazy<Cloudinary>(() =>
            {
                if (string.IsNullOrWhiteSpace(settings.CloudName) ||
                    string.IsNullOrWhiteSpace(settings.ApiKey) ||
                    string.IsNullOrWhiteSpace(settings.ApiSecret))
                {
                    throw new InvalidOperationException(
                        "Cloudinary is not configured. Set CloudinarySettings:CloudName, ApiKey and ApiSecret " +
                        "with user-secrets or environment variables.");
                }
                return new Cloudinary(new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret));
            });
        }

        public async Task<PhotoUploadResult> UploadAsync(IFormFile file)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Transformation = new Transformation().Width(500).Height(500).Crop("fill").Gravity("face"),
            };

            var result = await _cloudinary.Value.UploadAsync(uploadParams);
            return result.Error != null
                ? new PhotoUploadResult(null, null, result.Error.Message)
                : new PhotoUploadResult(result.SecureUrl.ToString(), result.PublicId, null);
        }

        public async Task<bool> DeleteAsync(string publicId)
        {
            var result = await _cloudinary.Value.DestroyAsync(new DeletionParams(publicId));
            return result.Result is "ok" or "not found";
        }
    }
}
