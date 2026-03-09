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

            var activeWallets = await _context.Wallets
                .Where(w => w.OwnerUserId == userId && !w.IsArchived)
                .ToListAsync();

            var totalBalance = activeWallets.Sum(w => w.CurrentBalance);

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
                .Where(w => w.OwnerUserId == userId && !w.IsArchived && w.GroupId == null)
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

        //  API TẠO VÍ MỚI (CÁ NHÂN)
        [HttpPost]
        public async Task<IActionResult> CreateWallet([FromBody] CreateWalletRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var newWallet = new Wallet
            {
                WalletId = Guid.NewGuid(),
                OwnerUserId = userId,
                Name = request.Name,
                Type = request.Type,
                Currency = request.Currency,
                CurrentBalance = request.InitialBalance,
                IsDefaultAccount = false,
                IsArchived = false
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

        [HttpPatch("{id}/set-default")]
        public async Task<IActionResult> SetDefaultWallet(Guid id)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var wallets = await _context.Wallets
                .Where(w => w.OwnerUserId == userId && !w.IsArchived)
                .ToListAsync();

            foreach (var w in wallets)
                w.IsDefaultAccount = (w.WalletId == id);

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã cập nhật ví mặc định!" });
        }


        //  API LẤY CHI TIẾT VÍ CHUNG (SHARED WALLET)
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWalletById(Guid id)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var wallet = await _context.Wallets
                .Include(w => w.Transactions) // 👈 Lấy giao dịch trực tiếp của ví (Nạp tiền)
                .Include(w => w.Budgets).ThenInclude(b => b.Transactions) // Lấy giao dịch chi tiêu
                .Include(w => w.Group).ThenInclude(g => g.GroupMembers).ThenInclude(gm => gm.User)
                .Include(w => w.Group).ThenInclude(g => g.Owner)
                .FirstOrDefaultAsync(w => w.WalletId == id);

            if (wallet == null) return NotFound(new { Message = "Không tìm thấy ví!" });

            // Tính toán Allocated và Spent (Giữ nguyên logic kế toán)
            var allocated = wallet.Budgets != null ? wallet.Budgets.Sum(b => b.AmountLimit) : 0;
            var spent = wallet.Budgets != null ? wallet.Budgets.SelectMany(b => b.Transactions ?? new List<Transaction>()).Where(t => t.Type == "Expense").Sum(t => t.Amount) : 0;

            // Danh sách thành viên
            var membersList = new List<object>();
            if (wallet.Group != null)
            {
                membersList.Add(new
                {
                    id = wallet.Group.OwnerId.ToString(),
                    name = wallet.Group.Owner?.FullName ?? "Admin",
                    avatar = wallet.Group.Owner?.AvatarUrl
                });

                foreach (var gm in wallet.Group.GroupMembers)
                {
                    if (gm.UserId != wallet.Group.OwnerId)
                    {
                        membersList.Add(new
                        {
                            id = gm.UserId.ToString(),
                            name = gm.User?.FullName ?? "Member",
                            avatar = gm.User?.AvatarUrl
                        });
                    }
                }
            }

            // 💡 1. TẠO RỔ CHỨA TẤT CẢ GIAO DỊCH
            var allTransactions = new List<Transaction>();

            // Nhặt giao dịch Nạp tiền bỏ vào rổ
            if (wallet.Transactions != null)
                allTransactions.AddRange(wallet.Transactions);

            // Nhặt giao dịch Chi tiêu (từ các Budget) bỏ vào rổ
            if (wallet.Budgets != null)
                allTransactions.AddRange(wallet.Budgets.SelectMany(b => b.Transactions ?? new List<Transaction>()));

            // 💡 2. SẮP XẾP VÀ TRẢ VỀ FRONTEND
            var transactionsList = allTransactions
                .OrderByDescending(t => t.CreatedAt)
                .Take(10)
                .Select(t => new
                {
                    id = t.TransactionId,
                    amount = t.Amount,
                    type = t.Type, // Trả về Type để Frontend tô màu (Xanh/Đỏ)
                    note = t.Note ?? (t.Type == "Income" ? "Nạp quỹ" : "Chi tiêu"),
                    date = t.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                    userName = t.Type == "Income" ? "Hệ thống" : "Thành viên",
                    userAvatar = t.Type == "Income" ? "https://ui-avatars.com/api/?name=In&background=10B981&color=fff" : "https://i.pravatar.cc/100"
                }).ToList();

            return Ok(new
            {
                id = wallet.WalletId.ToString(),
                name = wallet.Name,
                color = wallet.Group?.ThemeColor ?? "#15476C",
                icon = "💼",
                allocated = allocated,
                spent = spent,
                balance = wallet.CurrentBalance,
                transactions = transactionsList, // 👈 Truyền rổ giao dịch xuống
                members = membersList
            });
        }

        [HttpPost("contribute")]
        public async Task<IActionResult> Contribute([FromBody] ContributeRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // Dùng Transaction của Database để đảm bảo: Nếu lỗi thì không bị mất tiền oan
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. Kiểm tra và trừ tiền Ví Cá Nhân (Nguồn)
                var sourceWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == request.SourceWalletId && w.OwnerUserId == userId);
                if (sourceWallet == null) return BadRequest(new { Message = "Không tìm thấy ví nguồn hoặc bạn không có quyền." });
                if (sourceWallet.CurrentBalance < request.Amount) return BadRequest(new { Message = "Số dư ví không đủ để nạp quỹ." });

                sourceWallet.CurrentBalance -= request.Amount; 

                var expenseTx = new Transaction
                {
                    TransactionId = Guid.NewGuid(),
                    WalletId = sourceWallet.WalletId,
                    UserId = userId,
                    Amount = request.Amount,
                    Type = "Expense",
                    Note = request.Note ?? "Nạp tiền vào quỹ nhóm",
                    //Date = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Transactions.Add(expenseTx);

                // 2. Kiểm tra và cộng tiền Ví Chung (Đích)
                var destWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == request.DestinationWalletId);
                if (destWallet == null) return BadRequest(new { Message = "Không tìm thấy ví nhóm." });

                destWallet.CurrentBalance += request.Amount; 

                // Ghi lại lịch sử nhận tiền cho Ví Chung
                var incomeTx = new Transaction
                {
                    TransactionId = Guid.NewGuid(),
                    WalletId = destWallet.WalletId,
                    UserId = userId,
                    Amount = request.Amount,
                    Type = "Income",
                    Note = request.Note ?? "Thành viên nạp quỹ",
                    //Date = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Transactions.Add(incomeTx);

                // 3. Lưu tất cả thay đổi
                await _context.SaveChangesAsync();
                await transaction.CommitAsync(); 

                return Ok(new { Message = "Nạp tiền vào quỹ thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); // Nếu lỗi thì Rollback
                return StatusCode(500, new { Message = "Lỗi hệ thống khi nạp tiền", Error = ex.Message });
            }
        }

    }

}