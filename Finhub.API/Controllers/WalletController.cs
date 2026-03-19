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


        //  chi tiết ví chung
        [HttpGet("{id}")]
        public async Task<IActionResult> GetWalletById(Guid id)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var wallet = await _context.Wallets
                .Include(w => w.Transactions).ThenInclude(t => t.User) // 👈 Lấy giao dịch + User
                .Include(w => w.Budgets).ThenInclude(b => b.Transactions).ThenInclude(t => t.User) // Lấy giao dịch chi tiêu + User
                .Include(w => w.Group).ThenInclude(g => g.GroupMembers).ThenInclude(gm => gm.User)
                .Include(w => w.Group).ThenInclude(g => g.Owner)
                .FirstOrDefaultAsync(w => w.WalletId == id);

            if (wallet == null) return NotFound(new { Message = "Không tìm thấy ví!" });

            // Tính toán Allocated và Spent
            var allocated = wallet.Budgets != null ? wallet.Budgets.Sum(b => b.AmountLimit) : 0;
            var spent = wallet.Budgets != null ? wallet.Budgets.SelectMany(b => b.Transactions ?? new List<Transaction>()).Where(t => t.Type == "Expense").Sum(t => t.Amount) : 0;

            // list thành viên
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

            var allTransactions = new List<Transaction>();

            if (wallet.Transactions != null)
                allTransactions.AddRange(wallet.Transactions);

            if (wallet.Budgets != null)
                allTransactions.AddRange(wallet.Budgets.SelectMany(b => b.Transactions ?? new List<Transaction>()));

            var transactionsList = allTransactions
                .OrderByDescending(t => t.CreatedAt)
                .Take(10)
                .Select(t => new
                {
                    id = t.TransactionId,
                    amount = t.Amount,
                    type = t.Type, 
                    note = t.Note ?? (t.Type == "Income" ? "Nạp quỹ" : "Chi tiêu"),
                    date = t.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                    userName = t.User?.FullName ?? (t.Type == "Income" ? "Hệ thống" : "Thành viên"),
                    userAvatar = t.User != null
                        ? (t.User.AvatarUrl ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(t.User.FullName)}&background=15476C&color=fff")
                        : (t.Type == "Income" ? "https://ui-avatars.com/api/?name=System&background=10B981&color=fff" : "https://ui-avatars.com/api/?name=User&background=9CA3AF&color=fff")
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
                transactions = transactionsList,
                members = membersList
            });
        }

        [HttpPost("contribute")]
        public async Task<IActionResult> Contribute([FromBody] ContributeRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

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

                // 2. Kiểm tra và cộng tiền Ví Chung 
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

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Nạp tiền vào quỹ thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync(); 
                return StatusCode(500, new { Message = "Lỗi hệ thống khi nạp tiền", Error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteWallet(Guid id)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var wallet = await _context.Wallets
                .FirstOrDefaultAsync(w => w.WalletId == id && w.OwnerUserId == userId);

            if (wallet == null) return NotFound(new { Message = "Không tìm thấy ví!" });

            if (wallet.IsDefaultAccount)
                return BadRequest(new { Message = "Không thể xóa ví mặc định." });

            using var dbTransaction = await _context.Database.BeginTransactionAsync();
            try
            {
                if (wallet.CurrentBalance > 0)
                {
                    var defaultWallet = await _context.Wallets
                        .FirstOrDefaultAsync(w => w.OwnerUserId == userId
                                               && w.IsDefaultAccount
                                               && !w.IsArchived
                                               && w.GroupId == null);

                    if (defaultWallet == null)
                        return BadRequest(new { Message = "Không tìm thấy ví mặc định để hoàn tiền." });

                    var refundAmount = wallet.CurrentBalance;
                    defaultWallet.CurrentBalance += refundAmount;

                    _context.Transactions.Add(new Transaction
                    {
                        TransactionId = Guid.NewGuid(),
                        WalletId = defaultWallet.WalletId,
                        UserId = userId,
                        Amount = refundAmount,
                        Type = "Income",
                        Note = $"Hoàn tiền từ ví đã xóa: {wallet.Name}",
                        Status = "Completed",
                        TransactionDate = DateTime.UtcNow,
                        CreatedAt = DateTime.UtcNow
                    });
                }

                wallet.IsArchived = true;
                wallet.CurrentBalance = 0;

                await _context.SaveChangesAsync();
                await dbTransaction.CommitAsync();

                return Ok(new { Message = "Đã xóa ví và hoàn tiền về ví mặc định thành công!" });
            }
            catch (Exception ex)
            {
                await dbTransaction.RollbackAsync();
                return StatusCode(500, new { Message = "Lỗi hệ thống khi xóa ví.", Error = ex.Message });
            }
        }

        [HttpGet("{walletId}/settings")]
        public async Task<IActionResult> GetWalletSettings(Guid walletId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var wallet = await _context.Wallets
                .Include(w => w.Transactions)
                .FirstOrDefaultAsync(w => w.WalletId == walletId);

            if (wallet == null) return NotFound(new { Message = "Không tìm thấy ví!" });

            var permission = await _context.AccountPermissions
                .FirstOrDefaultAsync(p => p.WalletId == walletId && p.GranteeUserId != userId);

            // 💡 Tính Tổng tiền nạp vào (Income) làm mốc
            var totalFunds = wallet.Transactions != null
                ? wallet.Transactions.Where(t => t.Type == "Income").Sum(t => t.Amount)
                : 0;

            // Nếu ví cá nhân không có Income, lấy CurrentBalance làm mốc
            if (totalFunds == 0) totalFunds = wallet.CurrentBalance;

            return Ok(new
            {
                alertEnabled = permission?.RequireRequestForOverLimit ?? false,
                maxAmount = permission?.MaxAmountPerTransaction ?? 0,
                totalFunds = totalFunds 
            });
        }

        // 2. LƯU CÀI ĐẶT MỚI (Giữ nguyên như cũ)
        [HttpPut("{walletId}/settings")]
        public async Task<IActionResult> UpdateWalletSettings(Guid walletId, [FromBody] UpdateWalletSettingsRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var wallet = await _context.Wallets
                .Include(w => w.Group).ThenInclude(g => g.GroupMembers)
                .FirstOrDefaultAsync(w => w.WalletId == walletId);

            if (wallet == null) return NotFound(new { Message = "Không tìm thấy ví!" });

            // Cập nhật cho tất cả thành viên (trừ chủ ví)
            var members = wallet.Group?.GroupMembers.Where(m => m.UserId != wallet.OwnerUserId).ToList() ?? new List<GroupMember>();

            foreach (var member in members)
            {
                var perm = await _context.AccountPermissions
                    .FirstOrDefaultAsync(p => p.WalletId == walletId && p.GranteeUserId == member.UserId);

                if (perm == null)
                {
                    perm = new AccountPermission
                    {
                        PermissionId = Guid.NewGuid(),
                        WalletId = walletId,
                        GranteeUserId = member.UserId,
                        AccessLevel = "Member",
                        RequireRequestForOverLimit = request.AlertEnabled,
                        MaxAmountPerTransaction = request.MaxAmount
                    };
                    _context.AccountPermissions.Add(perm);
                }
                else
                {
                    perm.RequireRequestForOverLimit = request.AlertEnabled;
                    perm.MaxAmountPerTransaction = request.MaxAmount;
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Đã lưu cài đặt thành công!" });
        }

        public class UpdateWalletSettingsRequest
        {
            public bool AlertEnabled { get; set; }
            public decimal MaxAmount { get; set; }
        }

    }

}