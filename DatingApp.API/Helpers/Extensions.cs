using System.Security.Claims;

namespace DatingApp.API.Helpers
{
    public static class Extensions
    {
        public static int CalculateAge(this DateTime dateOfBirth) => dateOfBirth.CalculateAge(DateTime.Today);

        public static int CalculateAge(this DateTime dateOfBirth, DateTime today)
        {
            var age = today.Year - dateOfBirth.Year;
            if (dateOfBirth.Date.AddYears(age) > today.Date)
            {
                age--;
            }
            return age;
        }

        /// <summary>Id of the authenticated user, or 0 if the claim is missing.</summary>
        public static int GetUserId(this ClaimsPrincipal user) =>
            int.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var id) ? id : 0;
    }
}
