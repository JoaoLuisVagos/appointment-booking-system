using Microsoft.EntityFrameworkCore;
using back_end.Models;

namespace back_end.Data;

public class BookingContext : DbContext
{
    public BookingContext(DbContextOptions<BookingContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Products> Products { get; set; }
    public DbSet<Horarios> Horarios { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
    }
}