using DatingApp.API.Models;
using Microsoft.EntityFrameworkCore;

namespace DatingApp.API.Data
{
    public class DatingRepository : IDatingRepository
    {
        private readonly DataContext _context;

        public DatingRepository(DataContext context)
        {
            _context = context;
        }

        public void Add<T>(T entity) where T : class => _context.Add(entity);

        public void Delete<T>(T entity) where T : class => _context.Remove(entity);

        public Task<Photo> GetMainPhotoForUser(int userId) =>
            _context.Photos.FirstOrDefaultAsync(p => p.UserId == userId && p.IsMain);

        public Task<Photo> GetPhoto(int id) =>
            _context.Photos.FirstOrDefaultAsync(p => p.Id == id);

        public Task<User> GetUser(int id) =>
            _context.Users.Include(u => u.Photos).FirstOrDefaultAsync(u => u.Id == id);

        public async Task<IEnumerable<User>> GetUsers() =>
            await _context.Users.Include(u => u.Photos).AsNoTracking().ToListAsync();

        public async Task<bool> SaveAll() => await _context.SaveChangesAsync() > 0;
    }
}
