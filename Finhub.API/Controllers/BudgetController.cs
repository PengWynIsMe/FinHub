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
                .Where(w => w.OwnerUserId == userId && !w.IsArchived && w.GroupId == null) 
                .ToListAsync();

            var totalWalletBalance = userWallets.Sum(w => w.CurrentBalance);
            var walletIds = userWallets.Select(w => w.WalletId).ToList();

            // 2. Kéo Budget kèm Category và cả Transactions để tính tiền đã tiêu
            var budgets = await _context.Budgets
                .Include(b => b.Category)
                .Include(b => b.Transactions) 
                .Where(b => walletIds.Contains(b.WalletId ?? Guid.Empty))
                .ToListAsync();

            var totalAllocated = budgets.Sum(b => b.AmountLimit);

            // 3. Monthly Spending
            var firstDayOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthlyTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                         && t.Type == "Expense"
                         && t.CreatedAt >= firstDayOfMonth)
                .ToListAsync();

            var monthlySpending = monthlyTransactions.Sum(t => t.Amount);

            // 4. Phân loại Budgets (kèm Spent Amount)
            var mandatoryList = budgets
                .Where(b => b.BudgetType != null && b.BudgetType.ToLower() == "mandatory")
                .Select(b => new BudgetDetailDto
                {
                    BudgetId = b.BudgetId,
                    Name = !string.IsNullOrWhiteSpace(b.Name) ? b.Name : (b.Category?.Name ?? "Unnamed Budget"),
                    Icon = b.Category?.Icon ?? "💼",
                    Allocated = b.AmountLimit,
                    // Tổng các Transaction nằm trong Budget 
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
                    // Tổng tiền đã tiêu
                    Spent = b.Transactions != null ? b.Transactions.Sum(t => t.Amount) : 0,
                    Color = "#FFAF2A"
                }).ToList();

            // 5. Unallocated Money
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


        // LẤY 1 NGÂN SÁCH THEO ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetBudgetById(Guid id)
        {
            var budget = await _context.Budgets
                .Include(b => b.Category)
                .Include(b => b.Transactions)
                    .ThenInclude(t => t.User) 
                .FirstOrDefaultAsync(b => b.BudgetId == id);

            if (budget == null)
                return NotFound(new { Message = "Không tìm thấy ngân sách này!" });

            var spent = budget.Transactions != null ? budget.Transactions.Sum(t => t.Amount) : 0;

            var defaultIcon = budget.BudgetType == "mandatory" ? "💼" : "🛒";
            var finalIcon = !string.IsNullOrWhiteSpace(budget.Icon)
                ? budget.Icon
                : (budget.Category?.Icon ?? defaultIcon);

            // Map transactions ra danh sách
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
                transactions = transactions 
            });
        }

        // LẤY TẤT CẢ BUDGET (CÁ NHÂN) + VÍ CHUNG (NHÓM)
        [HttpGet("all-accessible")]
        public async Task<IActionResult> GetAllAccessibleBudgets()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // 1. LẤY CÁC NGÂN SÁCH CÁ NHÂN
            var personalBudgets = await _context.Budgets
                .Include(b => b.Wallet)
                .Include(b => b.Category)
                .Include(b => b.Transactions)
                .Where(b => !b.Wallet.IsArchived && b.Wallet.OwnerUserId == userId && b.Wallet.GroupId == null)
                .Select(b => new
                {
                    id = b.BudgetId.ToString(), 
                    name = b.Name ?? b.Category.Name ?? "Cá nhân",
                    icon = b.Icon ?? b.Category.Icon ?? "💰",
                    color = b.Color ?? "#15476C",
                    allocated = b.AmountLimit,
                    spent = b.Transactions != null ? b.Transactions.Where(t => t.Type == "Expense").Sum(t => t.Amount) : 0,
                    walletId = b.WalletId.ToString(),
                    isGroupWallet = false
                })
                .ToListAsync();

            // 2. LẤY CÁC VÍ CHUNG CỦA NHÓM 
            var sharedWallets = await _context.Wallets
                .Include(w => w.Group).ThenInclude(g => g.GroupMembers)
                .Include(w => w.Transactions)
                .Where(w => !w.IsArchived && w.GroupId != null &&
                            (w.OwnerUserId == userId || w.Group.OwnerId == userId || w.Group.GroupMembers.Any(gm => gm.UserId == userId)))
                .Select(w => new
                {
                    id = w.WalletId.ToString(),
                    name = $"{w.Name}",
                    icon = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(w.Name)}&background=10B981&color=fff",
                    color = w.Group.ThemeColor ?? "#10B981",

                    // Chỉ tính Income đã Completed
                    allocated = w.Transactions != null ? w.Transactions.Where(t => t.Type == "Income" && t.Status == "Completed").Sum(t => t.Amount) : 0,

                    // Chỉ tính Expense đã Completed
                    spent = w.Transactions != null ? w.Transactions.Where(t => t.Type == "Expense" && t.Status == "Completed").Sum(t => t.Amount) : 0,

                    walletId = w.WalletId.ToString(),
                    isGroupWallet = true
                })
                .ToListAsync();

            // 3. GỘP 2 DANH SÁCH
            var allAccessible = personalBudgets.Concat(sharedWallets).ToList();

            return Ok(allAccessible);
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

            foreach (var transaction in budget.Transactions)
            {
                transaction.BudgetId = null;
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa ngân sách thành công!" });
        }
    }
}