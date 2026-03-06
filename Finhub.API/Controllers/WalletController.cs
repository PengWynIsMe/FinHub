using Finhub.API.DTOs.Responses;
using Finhub.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Finhub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class WalletController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public WalletController(FinhubDbContext context)
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
        public async Task<IActionResult> GetBudgetSummary()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // 1. Unallocated Money: Lấy danh sách ví lên RAM trước để giải mã, sau đó mới tính tổng
            var activeWallets = await _context.Wallets
                .Where(w => w.OwnerUserId == userId && !w.IsArchived)
                .ToListAsync();

            var totalBalance = activeWallets.Sum(w => w.CurrentBalance);

            // 2. Monthly Spending: Lấy transaction tháng này lên RAM trước
            var firstDayOfMonth = new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);

            var monthlyTransactions = await _context.Transactions
                .Where(t => t.UserId == userId
                         && t.Type == "Expense"
                         && t.CreatedAt >= firstDayOfMonth)
                .ToListAsync();

            var monthlySpending = monthlyTransactions.Sum(t => t.Amount);

            return Ok(new BudgetSummaryResponse
            {
                UnallocatedMoney = totalBalance,
                MonthlySpending = monthlySpending
            });
        }

        [HttpGet]
        public async Task<IActionResult> GetMyWallets()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var wallets = await _context.Wallets
                .Where(w => w.OwnerUserId == userId && !w.IsArchived)
                .Select(w => new
                {
                    w.WalletId,
                    w.Name,
                    w.Type,
                    w.Currency,
                    w.CurrentBalance,
                    w.IsDefaultAccount
                })
                .ToListAsync();

            return Ok(wallets);
        }

        // ==========================================
        // 🆕 ĐOẠN CODE MỚI THÊM VÀO: API TẠO VÍ MỚI
        // ==========================================
        [HttpPost]
        public async Task<IActionResult> CreateWallet([FromBody] CreateWalletRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var newWallet = new Wallet
            {
                WalletId = Guid.NewGuid(),
                OwnerUserId = userId, // Gắn chặt ví này cho User đang đăng nhập
                Name = request.Name,
                Type = request.Type,
                Currency = request.Currency,
                CurrentBalance = request.InitialBalance,
                IsDefaultAccount = false,
                IsArchived = false
                // Bỏ CreatedAt/UpdatedAt để tránh lỗi giống bảng Budget lúc nãy
            };

            _context.Wallets.Add(newWallet);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tạo ví thành công!",
                WalletId = newWallet.WalletId,
                Name = newWallet.Name,
                Balance = newWallet.CurrentBalance
            });
        }
    }

    // 🆕 DTO hứng dữ liệu từ Mobile/Swagger gửi lên
    public class CreateWalletRequest
    {
        public string Name { get; set; } = "Ví tiền mặt";
        public decimal InitialBalance { get; set; }
        public string Type { get; set; } = "Cash";
        public string Currency { get; set; } = "VND";
    }
}