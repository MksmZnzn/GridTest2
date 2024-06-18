using Microsoft.EntityFrameworkCore;

namespace GridTestt.Models
{
    /// <summary>
    /// Модель данных для таблицы Person.
    /// </summary>
    public class Person
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public int Age { get; set; }
        public DateTime BirthDay { get; set; }
    }
    
    /// <summary>
    /// Контекст базы данных.
    /// </summary>
    public class MyDbContext : DbContext
    {
        public MyDbContext(DbContextOptions<MyDbContext> options) : base(options)
        {
        }

        public DbSet<Person> Person { get; set; } // DbSet для таблицы Person

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            optionsBuilder.UseMySql("server=localhost;port=3306;database=grid;uid=root;pwd=root;", new MySqlServerVersion(new Version(8, 0, 25)));
        }
    }
}