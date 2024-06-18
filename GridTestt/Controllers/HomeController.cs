using Microsoft.AspNetCore.Mvc;
using GridTestt.Models;
using Microsoft.Extensions.Caching.Memory;
using CustomDataGrid;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace GridTestt.Controllers
{
    /// <summary>
    /// Контроллер для обработки запросов на главной странице.
    /// </summary>
    public class HomeController : Controller
    {
        private readonly MyDbContext _context;
        private readonly IMemoryCache _cache;
        private readonly ILogger<HomeController> _logger;

        /// <summary>
        /// Инициализирует новый экземпляр класса <see cref="HomeController"/>.
        /// </summary>
        /// <param name="context">Контекст базы данных.</param>
        /// <param name="cache">Кэш памяти.</param>
        /// <param name="logger">Логгер.</param>
        public HomeController(MyDbContext context, IMemoryCache cache, ILogger<HomeController> logger)
        {
            _context = context;
            _cache = cache;
            _logger = logger;
        }

        [HttpGet]
        public async Task<JsonResult> GetUniqueValues(string column)
        {
            try
            {
                _logger.LogInformation($"GetUniqueValues called with column: {column}");
                var query = _context.Person.AsQueryable();
                var uniqueValues = await query.Select(p => EF.Property<object>(p, column))
                    .Distinct()
                    .ToListAsync();
                return Json(new { success = true, values = uniqueValues });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetUniqueValues");
                return Json(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Отображает главную страницу.
        /// </summary>
        /// <returns>Возвращает представление главной страницы.</returns>
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// Асинхронно получает данные для таблицы в формате JSON с применением сортировки, фильтрации и постраничного вывода.
        /// </summary>
        /// <param name="sortColumn">Столбец для сортировки.</param>
        /// <param name="ascending">Порядок сортировки (по возрастанию или по убыванию).</param>
        /// <param name="filterColumn">Столбец для фильтрации.</param>
        /// <param name="filterValue">Значение фильтрации.</param>
        /// <param name="filterMethod">Метод фильтрации.</param>
        /// <param name="page">Номер страницы.</param>
        /// <param name="pageSize">Количество записей на странице.</param>
        /// <param name="filterArrays">Массив фильтров для множественного выбора.</param>
        /// <returns>Возвращает данные в формате JSON.</returns>
        public async Task<JsonResult> GetGridData(string sortColumn, bool ascending = true, string filterColumn = null, string filterMethod = null, string filterValue = null, int page = 1, int pageSize = 3, string filterArrays = null)
        {
            try
            {
                _logger.LogInformation($"Received filterArrays JSON: {filterArrays}");
                // Генерация ключа для кэша на основе параметров запроса
                var cacheKey = $"{sortColumn}_{ascending}_{filterColumn}_{filterMethod}_{filterValue}_{page}_{pageSize}_{filterArrays}";

                // Проверка наличия данных в кэше
                if (!_cache.TryGetValue(cacheKey, out GridResponse response))
                {
                    var query = _context.Person.AsQueryable();
                    var grid = new Grid<Person>(query);
                    var filterMethods = filterMethod?.Split(',');
                    
                    // Применение фильтрации для одиночных фильтров
                    if (!string.IsNullOrEmpty(filterColumn)
                        && !string.IsNullOrEmpty(filterValue) 
                        && !string.IsNullOrEmpty(filterMethod))
                    {
                        var filterColumns = filterColumn.Split(',');
                        var filterValues = filterValue.Split(','); 
                         
                        for (int i = 0; i < filterColumns.Length; i++)
                        {
                            grid = grid.ApplyFiltering(filterColumns[i], filterValues[i], filterMethods[i]);
                        }
                    }

                    // Применение фильтрации для множественных фильтров
                    if (!string.IsNullOrEmpty(filterArrays))
                    {
                        var filterArraysList = JsonConvert.DeserializeObject<List<Dictionary<string, Filter>>>(filterArrays);

                        foreach (var filters in filterArraysList)
                        {
                            foreach (var filter in filters)
                            {
                                grid = grid.ApplyFiltering(filter.Key, string.Join(",", filter.Value.Value), filter.Value.Method);
                            }
                        }
                    }

                    var filteredQuery = grid.GetQuery();
                    var totalCount = await filteredQuery.CountAsync();

                    // Применение сортировки и постраничного вывода
                    grid = grid.ApplySorting(sortColumn, ascending).ApplyPaging(page, pageSize);
                    var result = await grid.GetQuery().ToListAsync();

                    // Вычисление среднего возраста
                    double? averageAge = null;
                    if (result.Any())
                    {
                        averageAge = result.Average(p => p.Age);
                    }

                    // Формирование ответа
                    response = new GridResponse
                    {
                        Data = result,
                        TotalCount = totalCount,
                        AverageAge = averageAge
                    };

                    // Настройки кэша
                    var cacheEntryOptions = new MemoryCacheEntryOptions()
                        .SetSlidingExpiration(TimeSpan.FromMinutes(2));

                    // Сохранение данных в кэше
                    _cache.Set(cacheKey, response, cacheEntryOptions);
                }

                // Возвращение данных в формате JSON
                return Json(new { data = response.Data, totalCount = response.TotalCount, averageAge = response.AverageAge });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetGridData");
                return Json(new { success = false, message = ex.Message });
            }
        }

        /// <summary>
        /// Класс для хранения ответа с данными таблицы.
        /// </summary>
        private class GridResponse
        {
            public List<Person> Data { get; set; }
            public int TotalCount { get; set; }
            public double? AverageAge { get; set; }
        }

        /// <summary>
        /// Класс для хранения фильтра.
        /// </summary>
        private class Filter
        {
            public string[] Value { get; set; }
            public string Method { get; set; }
        }
    }
}
