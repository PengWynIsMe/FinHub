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

            // 1. Lấy tất cả ví của User lên RAM để giải mã số dư
            var userWallets = await _context.Wallets
                .Where(w => w.OwnerUserId == userId && !w.IsArchived)
                .ToListAsync();

            var totalWalletBalance = userWallets.Sum(w => w.CurrentBalance);
            var walletIds = userWallets.Select(w => w.WalletId).ToList();

            // 2. Lấy tất cả Budget thuộc các ví này
            var budgets = await _context.Budgets
                .Include(b => b.Category)
                .Where(b => walletIds.Contains(b.WalletId ?? Guid.Empty))
                .ToListAsync();

            var totalAllocated = budgets.Sum(b => b.AmountLimit);

            // 3. Tính Monthly Spending (Chi tiêu trong tháng)
            var firstDayOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
            var monthlyTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                         && t.Type == "Expense"
                         && t.CreatedAt >= firstDayOfMonth)
                .ToListAsync();

            var monthlySpending = monthlyTransactions.Sum(t => t.Amount);

            // 4. Phân loại Budgets theo BudgetType (mandatory / non-recurring)
            var mandatoryList = budgets
                .Where(b => b.BudgetType != null && b.BudgetType.ToLower() == "mandatory")
                .Select(b => new BudgetDetailDto
                {
                    BudgetId = b.BudgetId,
                    Name = b.Category?.Name ?? "Mandatory Budget",
                    Icon = b.Category?.Icon ?? "💼",
                    Allocated = b.AmountLimit,
                    Spent = 0, // Tạm gán 0, sau này viết logic join bảng Transactions để tính Spent
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
                    Spent = 0,
                    Color = "#FFAF2A"
                }).ToList();

            // 5. Tính Unallocated Money (Đảm bảo không bị âm)
            var unallocated = totalWalletBalance - totalAllocated;
            if (unallocated < 0) unallocated = 0;

            return Ok(new HomeSummaryResponse
            {
                UnallocatedMoney = unallocated,
                MonthlySpending = monthlySpending,
                Mandatory = mandatoryList,
                NonRecurring = nonRecurringList
            });
        }

        // 🆕 ĐOẠN CODE MỚI THÊM VÀO ĐÂY: API TẠO NGÂN SÁCH (BUDGET)
        [HttpPost]
        public async Task<IActionResult> CreateBudget([FromBody] CreateBudgetRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // Kiểm tra xem Ví (Wallet) có thuộc về User này không để chống hack
            var walletExists = await _context.Wallets
                .AnyAsync(w => w.WalletId == request.WalletId && w.OwnerUserId == userId);

            if (!walletExists) return BadRequest("Ví không tồn tại hoặc bạn không có quyền truy cập.");

            // Ép kiểu thời gian về UTC để PostgreSQL không báo lỗi 500
            var newBudget = new Budget
            {
                BudgetId = Guid.NewGuid(),
                Name = request.Name,
                WalletId = request.WalletId,
                CategoryId = request.CategoryId,
                AmountLimit = request.AmountLimit,
                BudgetType = request.BudgetType.ToLower(), // Chuẩn hóa về chữ thường
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
    }
}