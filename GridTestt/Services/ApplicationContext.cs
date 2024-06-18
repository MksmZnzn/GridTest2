using Microsoft.EntityFrameworkCore;
using GridTestt.Models;

namespace GridTestt.Services;

public class ApplicationContext : DbContext
{
 
    public ApplicationContext()
    {
    }
 
    public ApplicationContext(DbContextOptions<ApplicationContext> options)
        : base(options)
    {
    }
 
    public virtual DbSet<Person> Persons { get; set; }
 
    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseMySql("server=localhost;user=root;password=root;database=grid;", 
            new MySqlServerVersion(new Version(8, 0, 25)));
}