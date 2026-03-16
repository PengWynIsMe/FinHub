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
    public class NotificationController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public NotificationController(FinhubDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out var userId);
            return userId;
        }

        // 1. LẤY DANH SÁCH YÊU CẦU CHI TIÊU (Dùng cho tab Expense Request)
        [HttpGet("requests")]
        public async Task<IActionResult> GetExpenseRequests()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // Query join giữa Notification, Transaction, Wallet và User
            var requests = await (from n in _context.Notifications
                                  join t in _context.Transactions on n.RelatedEntityId equals t.TransactionId
                                  join w in _context.Wallets on t.WalletId equals w.WalletId
                                  join c in _context.Categories on t.CategoryId equals c.CategoryId into tc
                                  from cat in tc.DefaultIfEmpty() // Left join category (đề phòng ko có)
                                  where n.RecipientUserId == userId
                                     && n.EntityType == "ExpenseRequest"
                                     && n.Status == "Unread"
                                     && t.Status == "Pending"
                                  orderby n.CreatedAt descending
                                  select new
                                  {
                                      id = n.NotificationId.ToString(), // ID của Notification dùng để Accept/Reject
                                      transactionId = t.TransactionId,
                                      userName = n.SenderUser != null ? n.SenderUser.FullName : "Member",
                                      userAvatar = n.SenderUser != null && !string.IsNullOrEmpty(n.SenderUser.AvatarUrl)
                                                    ? n.SenderUser.AvatarUrl
                                                    : $"https://ui-avatars.com/api/?name=Member&background=15476C&color=fff",
                                      title = !string.IsNullOrEmpty(t.Note) ? t.Note : "Giao dịch",
                                      category = cat != null ? cat.Name : "Chưa phân loại",
                                      date = t.TransactionDate.ToString("dd/MM/yyyy"),
                                      amount = -t.Amount, // 💡 UI của bạn cần số âm để hiện màu đỏ
                                      walletName = w.Name
                                  }).ToListAsync();

            return Ok(requests);
        }

        // 2. ADMIN BẤM "ACCEPT" ĐỂ CHẤP NHẬN YÊU CẦU CHI TIÊU
        [HttpPut("{notificationId}/accept")]
        public async Task<IActionResult> AcceptExpenseRequest(Guid notificationId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.RecipientUserId == userId);
            if (notification == null) return NotFound(new { Message = "Không tìm thấy yêu cầu này." });

            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.TransactionId == notification.RelatedEntityId);
            if (transaction == null || transaction.Status != "Pending")
                return BadRequest(new { Message = "Giao dịch này không tồn tại hoặc đã được xử lý." });

            var wallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == transaction.WalletId);
            if (wallet == null) return BadRequest(new { Message = "Không tìm thấy ví nguồn." });

            // THỰC THI CHÍNH THỨC: Trừ tiền ví và đổi status
            wallet.CurrentBalance -= transaction.Amount;
            transaction.Status = "Completed";
            notification.Status = "Read"; // Đánh dấu đã xử lý

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã duyệt giao dịch thành công!" });
        }

        // 3. ADMIN BẤM "NÚT X" ĐỂ TỪ CHỐI GIAO DỊCH
        [HttpDelete("{notificationId}/reject")]
        public async Task<IActionResult> RejectExpenseRequest(Guid notificationId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var notification = await _context.Notifications.FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.RecipientUserId == userId);
            if (notification == null) return NotFound(new { Message = "Không tìm thấy yêu cầu này." });

            var transaction = await _context.Transactions.FirstOrDefaultAsync(t => t.TransactionId == notification.RelatedEntityId);
            if (transaction != null && transaction.Status == "Pending")
            {
                transaction.Status = "Rejected"; // Hủy bỏ, tiền không bị trừ
            }

            notification.Status = "Read"; // Ẩn khỏi UI

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã từ chối yêu cầu chi tiêu." });
        }
    }
}