using Finhub.API.DTOs.Responses;
using Finhub.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Finhub.API.DTOs.Requests;

namespace Finhub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class BudgetController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public BudgetController(FinhubDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out var userId);
            return userId;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetHomeSummary()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // 1. Lấy tất cả ví của User
            var userWallets = await _context.Wallets
                .Where(w => w.OwnerUserId == userId && !w.IsArchived)
                .ToListAsync();

            var totalWalletBalance = userWallets.Sum(w => w.CurrentBalance);
            var walletIds = userWallets.Select(w => w.WalletId).ToList();

            // 2. 🆕 Kéo Budget kèm Category và cả Transactions để tính tiền đã tiêu
            var budgets = await _context.Budgets
                .Include(b => b.Category)
                .Include(b => b.Transactions) // Bắt buộc phải thêm dòng này
                .Where(b => walletIds.Contains(b.WalletId ?? Guid.Empty))
                .ToListAsync();

            var totalAllocated = budgets.Sum(b => b.AmountLimit);

            // 3. Tính Monthly Spending
            var firstDayOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthlyTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                         && t.Type == "Expense"
                         && t.CreatedAt >= firstDayOfMonth)
                .ToListAsync();

            var monthlySpending = monthlyTransactions.Sum(t => t.Amount);

            // 4. Phân loại Budgets (Tính kèm Spent Amount)
            var mandatoryList = budgets
                .Where(b => b.BudgetType != null && b.BudgetType.ToLower() == "mandatory")
                .Select(b => new BudgetDetailDto
                {
                    BudgetId = b.BudgetId,
                    Name = !string.IsNullOrWhiteSpace(b.Name) ? b.Name : (b.Category?.Name ?? "Unnamed Budget"),
                    Icon = b.Category?.Icon ?? "💼",
                    Allocated = b.AmountLimit,
                    // 🆕 Tự động tính tổng tiền các Transaction nằm trong Budget này
                    Spent = b.Transactions != null ? b.Transactions.Sum(t => t.Amount) : 0,
                    Color = "#FF5F55"
                }).ToList();

            var nonRecurringList = budgets
                .Where(b => b.BudgetType != null && b.BudgetType.ToLower() == "non-recurring")
                .Select(b => new BudgetDetailDto
                {
                    BudgetId = b.BudgetId,
                    Name = b.Category?.Name ?? "Non-Recurring Budget",
                    Icon = b.Category?.Icon ?? "🛒",
                    Allocated = b.AmountLimit,
                    // 🆕 Tính tổng tiền đã tiêu
                    Spent = b.Transactions != null ? b.Transactions.Sum(t => t.Amount) : 0,
                    Color = "#FFAF2A"
                }).ToList();

            // 5. Tính Unallocated Money
            decimal totalLockedInBudgets = 0;
            foreach (var b in budgets)
            {
                var spent = b.Transactions != null ? b.Transactions.Sum(t => t.Amount) : 0;
                var remaining = b.AmountLimit - spent;

                // Nếu hũ còn tiền (remaining > 0), chúng ta "khóa" phần tiền đó lại không cho vào Unallocated.
                // Nếu hũ bị âm (tiêu lố), remaining <= 0, chúng ta không khóa đồng nào cả. 
                // Khi đó, vì CurrentBalance của ví đã bị trừ đi lúc tạo giao dịch, nên Unallocated sẽ tự giảm theo.
                if (remaining > 0)
                {
                    totalLockedInBudgets += remaining;
                }
            }

            var unallocated = totalWalletBalance - totalLockedInBudgets;
            if (unallocated < 0) unallocated = 0;

            return Ok(new HomeSummaryResponse
            {
                UnallocatedMoney = unallocated,
                MonthlySpending = monthlySpending,
                Mandatory = mandatoryList,
                NonRecurring = nonRecurringList
            });
        }


        // 🆕 LẤY CHI TIẾT 1 NGÂN SÁCH THEO ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBudgetById(Guid id)
        {
            var budget = await _context.Budgets
                .Include(b => b.Category)
                .Include(b => b.Transactions)
                    .ThenInclude(t => t.User) // ✅ Lấy kèm User để hiển thị tên + avatar
                .FirstOrDefaultAsync(b => b.BudgetId == id);

            if (budget == null)
                return NotFound(new { Message = "Không tìm thấy ngân sách này!" });

            var spent = budget.Transactions != null ? budget.Transactions.Sum(t => t.Amount) : 0;

            var defaultIcon = budget.BudgetType == "mandatory" ? "💼" : "🛒";
            var finalIcon = !string.IsNullOrWhiteSpace(budget.Icon)
                ? budget.Icon
                : (budget.Category?.Icon ?? defaultIcon);

            // ✅ Map transactions ra danh sách đơn giản cho Mobile
            var transactions = budget.Transactions?
                .OrderByDescending(t => t.TransactionDate)
                .Select(t => new
                {
                    id = t.TransactionId,
                    amount = t.Amount,
                    type = t.Type,
                    note = t.Note,
                    date = t.TransactionDate.ToString("dd/MM/yyyy"),
                    userName = t.User?.FullName ?? "Unknown",
                    userAvatar = t.User != null
                        ? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(t.User.FullName)}&background=15476C&color=fff"
                        : null,
                    categoryName = t.Category?.Name,
                    evaluation = t.Evaluation
                })
                .ToList();

            return Ok(new
            {
                id = budget.BudgetId,
                name = !string.IsNullOrWhiteSpace(budget.Name) ? budget.Name : (budget.Category?.Name ?? "Unnamed Budget"),
                icon = finalIcon,
                color = budget.Color,
                allocated = budget.AmountLimit,
                spent = spent,
                transactions = transactions  // ✅ Thêm mới
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var walletExists = await _context.Wallets
                .AnyAsync(w => w.WalletId == request.WalletId && w.OwnerUserId == userId);

            if (!walletExists) return BadRequest("Ví không tồn tại hoặc bạn không có quyền truy cập.");

            var newBudget = new Budget
            {
                BudgetId = Guid.NewGuid(),
                Name = request.Name,
                WalletId = request.WalletId,
                CategoryId = request.CategoryId,
                AmountLimit = request.AmountLimit,
                BudgetType = request.BudgetType.ToLower(),
                StartDate = request.StartDate.ToUniversalTime(),
                EndDate = request.EndDate.ToUniversalTime(),
                IsRolling = request.IsRolling,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Budgets.Add(newBudget);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Tạo ngân sách thành công!", BudgetId = newBudget.BudgetId });
        }

        // 🆕 Đừng quên API Xóa này, nếu không Mobile báo lỗi 404 đó!
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(Guid id)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var budget = await _context.Budgets
                .Include(b => b.Transactions)
                .FirstOrDefaultAsync(b => b.BudgetId == id);

            if (budget == null)
                return NotFound(new { Message = "Không tìm thấy ngân sách này!" });

            // ✅ Null hóa BudgetId ở tầng application — không cần thay đổi DB schema
            foreach (var transaction in budget.Transactions)
            {
                transaction.BudgetId = null;
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync(); // EF tự UPDATE transactions trước, rồi DELETE budget

            return Ok(new { Message = "Đã xóa ngân sách thành công!" });
        }
    }
}