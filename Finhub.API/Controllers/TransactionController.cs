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
    public class TransactionController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public TransactionController(FinhubDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out var userId);
            return userId;
        }

        [HttpPost]
        public async Task<IActionResult> CreateTransaction([FromBody] CreateTransactionRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // 1. Tìm cái ví (Wallet) mà người dùng muốn trừ tiền
            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == request.WalletId && w.OwnerUserId == userId);
            if (wallet == null) return BadRequest(new { Message = "Không tìm thấy ví này!" });

            // 2. Trừ tiền trực tiếp vào số dư của Ví (Wallet)
            if (request.Type.ToLower() == "expense")
            {
                wallet.CurrentBalance -= request.Amount;
            }
            else if (request.Type.ToLower() == "income")
            {
                wallet.CurrentBalance += request.Amount;
            }

            // 3. Tạo Giao dịch mới
            // 3. Tạo Giao dịch mới (ĐÃ FIX LỖI BUILD)
            var newTransaction = new Transaction
            {
                TransactionId = Guid.NewGuid(),
                UserId = userId,
                WalletId = request.WalletId,
                BudgetId = request.BudgetId,
                CategoryId = request.CategoryId,
                Amount = request.Amount,
                Type = request.Type, // "Expense" hoặc "Income"
                Note = request.Note,
                Evaluation = request.Evaluation, // "Need" hoặc "Want"

                // 🆕 Cập nhật 3 trường này cho khớp với Transaction.cs
                TransactionDate = DateTime.UtcNow,
                Status = "Completed", // Mặc định giao dịch là đã hoàn thành
                CreatedAt = DateTime.UtcNow

                // (Đã xóa dòng UpdatedAt gây lỗi)
            };

            _context.Transactions.Add(newTransaction);

            // Lưu cả thay đổi của Ví và Giao dịch mới cùng 1 lúc
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tạo giao dịch thành công!",
                TransactionId = newTransaction.TransactionId,
                NewBalance = wallet.CurrentBalance
            });
        }
    }

    // DTO Hứng dữ liệu từ React Native gửi lên
    public class CreateTransactionRequest
    {
        public Guid WalletId { get; set; }
        public Guid? BudgetId { get; set; }
        public Guid? CategoryId { get; set; }
        public decimal Amount { get; set; }
        public string Type { get; set; } = "Expense";
        public string? Note { get; set; }
        public string? Evaluation { get; set; } // "Need" hoặc "Want"
    }
}