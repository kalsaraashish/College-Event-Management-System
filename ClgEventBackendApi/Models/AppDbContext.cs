using Microsoft.EntityFrameworkCore;

namespace ClgEventBackendApi.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        public DbSet<Student> Students { get; set; }

        public DbSet<Event> Events { get; set; }

        //public DbSet<Registration> Registrations { get; set; }

        public DbSet<Attendance> Attendances { get; set; }

        public DbSet<Category> Categories { get; set; }

        public DbSet<Department> Departments { get; set; }

        public DbSet<Notification> Notifications { get; set; }

        public DbSet<EventRegistration> EventRegistration { get; set; }
    }
}