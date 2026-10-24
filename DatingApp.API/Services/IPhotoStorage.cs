namespace DatingApp.API.Services
{
    public record PhotoUploadResult(string Url, string PublicId, string Error);

    /// <summary>Stores member photos. Cloudinary in production; replaceable in tests.</summary>
    public interface IPhotoStorage
    {
        Task<PhotoUploadResult> UploadAsync(IFormFile file);
        Task<bool> DeleteAsync(string publicId);
    }
}
