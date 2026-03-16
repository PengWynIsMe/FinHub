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
    public class PaymentRequestController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public PaymentRequestController(FinhubDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out var userId);
            return userId;
        }

        // ─── CLASS DTO ĐÃ UPDATE: CHỈ CẦN TRUYỀN WALLET ID ───
        public class CreatePaymentReqDto
        {
            public Guid WalletId { get; set; } // Thay thế GroupId và ApproverId
            public decimal Amount { get; set; }
            public string? MerchantInfo { get; set; }
            public string? Note { get; set; }
            public string RequestType { get; set; } = "PayForMe";
        }

        // ==========================================================
        // 1. API TẠO YÊU CẦU THANH TOÁN (MÁY CON GỌI)
        // ==========================================================
        [HttpPost]
        public async Task<IActionResult> CreateRequest([FromBody] CreatePaymentReqDto request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // 1. Tìm Ví mà Đứa con muốn dùng để thanh toán
            var wallet = await _context.Wallets
                .Include(w => w.Group)
                .FirstOrDefaultAsync(w => w.WalletId == request.WalletId);

            if (wallet == null)
                return BadRequest(new { Message = "Không tìm thấy ví này." });

            if (wallet.GroupId == null || wallet.Group == null)
                return BadRequest(new { Message = "Đây không phải là ví nhóm hợp lệ để xin thanh toán hộ." });

            // 2. Tự động lấy ID của Trưởng Nhóm (Bố/Mẹ) làm Người duyệt
            var approverId = wallet.Group.OwnerId;

            // 3. Tạo yêu cầu thanh toán
            var newReq = new PaymentRequest
            {
                RequestId = Guid.NewGuid(),
                GroupId = wallet.GroupId.Value, // Tự động lấy GroupId từ Ví
                RequesterId = userId,
                ApproverId = approverId,        // Tự động chuyển cho Admin
                Amount = request.Amount,
                MerchantInfo = request.MerchantInfo,
                Note = request.Note,
                RequestType = request.RequestType,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.PaymentRequests.Add(newReq);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Đã gửi yêu cầu thành công! Vui lòng chờ Bố/Mẹ phê duyệt.",
                RequestId = newReq.RequestId
            });
        }

        // ==========================================================
        // 2. LẤY DANH SÁCH YÊU CẦU ĐANG CHỜ DUYỆT (DÀNH CHO BỐ/MẸ)
        // ==========================================================
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var requests = await _context.PaymentRequests
                .Include(pr => pr.Requester)
                .Include(pr => pr.Group)
                .Where(pr => pr.ApproverId == userId && pr.Status == "Pending")
                .OrderByDescending(pr => pr.CreatedAt)
                .Select(pr => new
                {
                    id = pr.RequestId,
                    requesterName = pr.Requester.FullName ?? "Thành viên",
                    requesterAvatar = pr.Requester.AvatarUrl ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(pr.Requester.FullName ?? "U")}&background=15476C&color=fff",
                    groupName = pr.Group != null ? pr.Group.Name : "Nhóm gia đình",
                    amount = pr.Amount,
                    merchantInfo = pr.MerchantInfo,
                    note = pr.Note,
                    requestType = pr.RequestType,
                    date = pr.CreatedAt.ToString("dd/MM/yyyy HH:mm")
                }).ToListAsync();

            return Ok(requests);
        }

        // ==========================================================
        // 3. BỐ/MẸ XÁC NHẬN ĐÃ THANH TOÁN (DUYỆT)
        // ==========================================================
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveRequest(Guid id)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var req = await _context.PaymentRequests.FirstOrDefaultAsync(r => r.RequestId == id && r.ApproverId == userId);
                if (req == null || req.Status != "Pending")
                    return BadRequest(new { Message = "Yêu cầu không hợp lệ hoặc đã được xử lý." });

                // 1. Cập nhật trạng thái
                req.Status = "Paid";
                req.UpdatedAt = DateTime.UtcNow;

                // 2. Trừ tiền ảo trong Quỹ Nhóm (Shared Wallet)
                var groupWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.GroupId == req.GroupId && !w.IsArchived);

                if (groupWallet != null)
                {
                    groupWallet.CurrentBalance -= req.Amount;

                    // Ghi lại lịch sử giao dịch (Transaction)
                    _context.Transactions.Add(new Transaction
                    {
                        TransactionId = Guid.NewGuid(),
                        WalletId = groupWallet.WalletId,
                        UserId = req.RequesterId, // Ghi nhận là đứa con đã tiêu
                        Amount = req.Amount,
                        Type = "Expense",
                        Note = req.Note ?? "Thanh toán QR hộ thành viên",
                        Status = "Completed",
                        CreatedAt = DateTime.UtcNow
                    });
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Đã ghi nhận thanh toán thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "Lỗi hệ thống", Error = ex.Message });
            }
        }

        // ==========================================================
        // 4. BỐ/MẸ TỪ CHỐI YÊU CẦU
        // ==========================================================
        [HttpDelete("{id}/reject")]
        public async Task<IActionResult> RejectRequest(Guid id)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var req = await _context.PaymentRequests.FirstOrDefaultAsync(r => r.RequestId == id && r.ApproverId == userId);
            if (req == null) return NotFound(new { Message = "Không tìm thấy yêu cầu." });

            req.Status = "Rejected";
            req.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã từ chối yêu cầu thanh toán." });
        }
    }
}