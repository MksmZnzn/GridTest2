// using Microsoft.EntityFrameworkCore;
// using GridTestt.Models;
//
// namespace GridTestt.Services;
//
// public class MyDbContext : DbContext
// {
//     public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
//     {
//     }
//
//     public DbSet<Person> Person { get; set; }
//
//     protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//     {
//         optionsBuilder.UseMySql("server=localhost;port=3306;database=grid;uid=root;pwd=root;", new MySqlServerVersion(new Version(8, 0, 25)));
//     }
// }