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

            // 1. Tìm ví (kèm Group để check quyền)
            var wallet = await _context.Wallets
                .Include(w => w.Group).ThenInclude(g => g.GroupMembers)
                .FirstOrDefaultAsync(w => w.WalletId == request.WalletId);

            if (wallet == null) return BadRequest(new { Message = "Không tìm thấy ví này!" });

            bool hasAccess = wallet.GroupId == null
                ? wallet.OwnerUserId == userId
                : (wallet.OwnerUserId == userId || wallet.Group.OwnerId == userId || wallet.Group.GroupMembers.Any(gm => gm.UserId == userId));

            if (!hasAccess) return BadRequest(new { Message = "Bạn không có quyền tạo giao dịch trên ví này!" });

            // 2. 💡 SMART APPROVAL WORKFLOW: Kiểm tra giới hạn chi tiêu (Chỉ áp dụng cho Expense)
            bool isPending = false;

            if (request.Type.Equals("Expense", StringComparison.OrdinalIgnoreCase))
            {
                // Tìm xem User này có bị giới hạn (Permission) trên ví này không
                var permission = await _context.AccountPermissions
                    .FirstOrDefaultAsync(p => p.WalletId == request.WalletId && p.GranteeUserId == userId);

                // Nếu có luật giới hạn VÀ số tiền vượt mức
                if (permission != null && permission.RequireRequestForOverLimit)
                {
                    if (permission.MaxAmountPerTransaction.HasValue && request.Amount > permission.MaxAmountPerTransaction.Value)
                    {
                        isPending = true; // Bật cờ chờ duyệt!
                    }
                }
            }

            // 3. Trừ/Cộng tiền trực tiếp vào số dư của Ví (NẾU KHÔNG BỊ PENDING)
            if (!isPending)
            {
                if (request.Type.Equals("Expense", StringComparison.OrdinalIgnoreCase))
                    wallet.CurrentBalance -= request.Amount;
                else if (request.Type.Equals("Income", StringComparison.OrdinalIgnoreCase))
                    wallet.CurrentBalance += request.Amount;
            }

            // 4. Tạo Giao dịch mới
            var newTransaction = new Transaction
            {
                TransactionId = Guid.NewGuid(),
                UserId = userId,
                WalletId = request.WalletId,
                BudgetId = request.BudgetId,
                CategoryId = request.CategoryId,
                Amount = request.Amount,
                Type = request.Type,
                Note = request.Note,
                Evaluation = request.Evaluation,
                TransactionDate = DateTime.UtcNow,
                Status = isPending ? "Pending" : "Completed", // 💡 Nếu vượt mức thì trạng thái là Pending
                CreatedAt = DateTime.UtcNow
            };
            _context.Transactions.Add(newTransaction);

            // 5. 💡 NẾU PENDING: Tạo thông báo gửi cho Chủ ví (Admin)
            // 5. 💡 NẾU PENDING: Tạo thông báo gửi cho Chủ nhóm (Admin) hoặc Chủ ví
            if (isPending)
            {
                // 💡 FIX LỖI ÉP KIỂU & LOGIC: Nếu là ví nhóm -> Gửi cho Chủ nhóm. Nếu ví cá nhân -> Gửi cho Chủ ví.
                Guid recipientId = wallet.GroupId != null && wallet.Group != null
                                   ? wallet.Group.OwnerId
                                   : (wallet.OwnerUserId ?? Guid.Empty);

                var notification = new Notification
                {
                    NotificationId = Guid.NewGuid(),
                    RecipientUserId = recipientId, // Đã hết bị lỗi đỏ!
                    SenderUserId = userId,                // Người xin phép
                    RelatedEntityId = newTransaction.TransactionId, // Gắn ID giao dịch vào đây
                    EntityType = "ExpenseRequest",
                    Title = "Yêu cầu chi tiêu",
                    Message = $"Yêu cầu chi tiêu {request.Amount:N0} VNĐ vượt quá hạn mức cho phép.",
                    Status = "Unread",
                    CreatedAt = DateTime.UtcNow
                };
                _context.Notifications.Add(notification);
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = isPending ? "Giao dịch vượt hạn mức, đã gửi yêu cầu xin phép Admin!" : "Tạo giao dịch thành công!",
                TransactionId = newTransaction.TransactionId,
                NewBalance = wallet.CurrentBalance,
                IsPending = isPending
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