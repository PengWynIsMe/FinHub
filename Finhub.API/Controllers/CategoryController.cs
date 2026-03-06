using Finhub.API.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Finhub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public CategoryController(FinhubDbContext context)
        {
            _context = context;
        }

        // 1. API Tạo nhanh 15 danh mục chuẩn
        [HttpPost("seed-defaults")]
        public async Task<IActionResult> SeedDefaultCategories()
        {
            // Kiểm tra xem đã có danh mục nào chưa, có rồi thì bỏ qua để khỏi bị tạo đúp
            var count = await _context.Categories.CountAsync();
            if (count > 0)
            {
                return BadRequest(new { Message = $"Đã có {count} danh mục trong Database. Bỏ qua seed." });
            }

            // Danh sách 15 Danh mục cơ bản dùng Icon của Feather
            var defaultCategories = new List<Category>
            {
                // ==== EXPENSE (CHI TIÊU) ====
                new Category { CategoryId = Guid.NewGuid(), Name = "Ăn uống", Type = "Expense", Icon = "coffee" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Đi chợ / Siêu thị", Type = "Expense", Icon = "shopping-cart" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Di chuyển", Type = "Expense", Icon = "navigation" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Tiền nhà / Điện nước", Type = "Expense", Icon = "home" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Mua sắm", Type = "Expense", Icon = "shopping-bag" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Giải trí", Type = "Expense", Icon = "film" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Sức khỏe", Type = "Expense", Icon = "heart" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Giáo dục", Type = "Expense", Icon = "book" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Du lịch", Type = "Expense", Icon = "map" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Quà tặng", Type = "Expense", Icon = "gift" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Thú cưng", Type = "Expense", Icon = "github" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Hóa đơn / Phí", Type = "Expense", Icon = "file-text" },

                // ==== INCOME (THU NHẬP) ====
                new Category { CategoryId = Guid.NewGuid(), Name = "Lương", Type = "Income", Icon = "dollar-sign" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Đầu tư", Type = "Income", Icon = "trending-up" },
                new Category { CategoryId = Guid.NewGuid(), Name = "Thu nhập khác", Type = "Income", Icon = "plus-circle" }
            };

            _context.Categories.AddRange(defaultCategories);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã khởi tạo 15 danh mục mặc định thành công!" });
        }

        // 2. API Lấy danh sách danh mục (Để lát nữa Mobile App gọi lên)
        [HttpGet]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _context.Categories
                .Select(c => new
                {
                    c.CategoryId,
                    c.Name,
                    c.Type,
                    c.Icon
                })
                .OrderBy(c => c.Type) // Sắp xếp theo Thu/Chi
                .ThenBy(c => c.Name)  // Sắp xếp theo tên
                .ToListAsync();

            return Ok(categories);
        }
    }
}