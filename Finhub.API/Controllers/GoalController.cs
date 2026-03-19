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
    public class GoalController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public GoalController(FinhubDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out var userId);
            return userId;
        }

        // ─── DTOs CHO REQUEST ───
        public class MemberTargetDto
        {
            public Guid UserId { get; set; }
            public decimal Target { get; set; }
        }

        // ─── THÊM CLASS DTO NÀY XUỐNG DƯỚI CÁC CLASS REQUEST KHÁC ───
        public class ContributeToGoalRequest
        {
            public decimal Amount { get; set; }
            public Guid SourceWalletId { get; set; }
            public string? Note { get; set; }
        }

        public class CreateGoalRequest
        {
            public Guid GroupId { get; set; }
            public string Name { get; set; }
            public string Icon { get; set; } = "🎯";
            public string GoalType { get; set; } // "Flexible" or "Split"
            public decimal TargetAmount { get; set; }
            public List<MemberTargetDto> Members { get; set; } = new List<MemberTargetDto>();
        }

        public class UpdateGoalSettingsRequest
        {
            public decimal TargetAmount { get; set; }
            public List<MemberTargetDto> Members { get; set; } = new List<MemberTargetDto>();
        }

        // 1. LẤY CHI TIẾT 1 QUỸ VÀ TIẾN ĐỘ CỦA TỪNG NGƯỜI
        [HttpGet("{goalId}")]
        public async Task<IActionResult> GetGoalDetail(Guid goalId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var goal = await _context.Goals
                .Include(g => g.GoalMembers).ThenInclude(m => m.User)
                .FirstOrDefaultAsync(g => g.GoalId == goalId);

            if (goal == null) return NotFound(new { Message = "Không tìm thấy quỹ mục tiêu này!" });

            var membersList = goal.GoalMembers.Select(m => new
            {
                id = m.UserId.ToString(),
                name = m.User?.FullName ?? "Unknown",
                avatar = m.User?.AvatarUrl ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(m.User?.FullName ?? "U")}&background=15476C&color=fff",
                target = m.TargetAmount,
                contributed = m.ContributedAmount
            }).ToList();

            return Ok(new
            {
                id = goal.GoalId,
                name = goal.Name,
                icon = goal.Icon,
                totalTarget = goal.TargetAmount,
                totalSaved = goal.CurrentAmount,
                goalType = goal.Type,
                status = goal.Status,
                members = membersList
            });
        }

        // 2. TẠO QUỸ CHUNG (Lưu luôn định mức từng người nếu có)
        [HttpPost]
        public async Task<IActionResult> CreateGoal([FromBody] CreateGoalRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var newGoal = new Goal
            {
                GoalId = Guid.NewGuid(),
                GroupId = request.GroupId,
                Name = request.Name,
                Icon = request.Icon,
                Type = request.GoalType,
                Status = "On Track",
                CurrentAmount = 0,
                TargetAmount = request.GoalType == "Split" ? request.Members.Sum(m => m.Target) : request.TargetAmount,
            };

            _context.Goals.Add(newGoal);

            // Add danh sách thành viên và định mức cho split
            if (request.Members != null && request.Members.Any())
            {
                foreach (var mem in request.Members)
                {
                    _context.GoalMembers.Add(new GoalMember
                    {
                        GoalMemberId = Guid.NewGuid(),
                        GoalId = newGoal.GoalId,
                        UserId = mem.UserId,
                        TargetAmount = mem.Target,
                        ContributedAmount = 0
                    });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Tạo mục tiêu thành công!", GoalId = newGoal.GoalId });
        }

        // 3. CẬP NHẬT ĐỊNH MỨC QUỸ
        [HttpPut("{goalId}/settings")]
        public async Task<IActionResult> UpdateGoalSettings(Guid goalId, [FromBody] UpdateGoalSettingsRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var goal = await _context.Goals
                .Include(g => g.GoalMembers)
                .FirstOrDefaultAsync(g => g.GoalId == goalId);

            if (goal == null) return NotFound(new { Message = "Không tìm thấy quỹ mục tiêu này!" });

            if (goal.Type == "Flexible")
            {
                goal.TargetAmount = request.TargetAmount;
            }
            else if (goal.Type == "Split")
            {
                foreach (var reqMem in request.Members)
                {
                    var existingMem = goal.GoalMembers.FirstOrDefault(m => m.UserId == reqMem.UserId);
                    if (existingMem != null)
                    {
                        existingMem.TargetAmount = reqMem.Target;
                    }
                    else
                    {
                        // khi có thành viên mới được thêm
                        _context.GoalMembers.Add(new GoalMember
                        {
                            GoalMemberId = Guid.NewGuid(),
                            GoalId = goalId,
                            UserId = reqMem.UserId,
                            TargetAmount = reqMem.Target,
                            ContributedAmount = 0
                        });
                    }
                }

                // Tính lại tổng quỹ 
                goal.TargetAmount = goal.GoalMembers.Sum(m => m.TargetAmount) +
                                    request.Members.Where(m => goal.GoalMembers.All(gm => gm.UserId != m.UserId)).Sum(m => m.Target);
            }

            await _context.SaveChangesAsync();
            return Ok(new { Message = "Cập nhật định mức thành công!" });
        }

        // 4. LẤY DANH SÁCH QUỸ MỤC TIÊU CỦA 1 NHÓM
        [HttpGet("group/{groupId}")]
        public async Task<IActionResult> GetGroupGoals(Guid groupId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var goals = await _context.Goals
                .Where(g => g.GroupId == groupId)
                .OrderByDescending(g => g.GoalId)
                .ToListAsync();

            var result = goals.Select(g => new
            {
                id = g.GoalId.ToString(),
                name = g.Name,
                icon = g.Icon ?? "🎯",
                allocated = g.TargetAmount,
                spent = g.CurrentAmount,
                color = g.CurrentAmount >= g.TargetAmount ? "#10B981" : "#3B82F6",
                status = g.Status
            }).ToList();

            return Ok(result);
        }

        // 5. API ĐÓNG GÓP TIỀN TỪ VÍ CÁ NHÂN VÀO QUỸ
        [HttpPost("{goalId}/contribute")]
        public async Task<IActionResult> ContributeToGoal(Guid goalId, [FromBody] ContributeToGoalRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            if (request.Amount <= 0) return BadRequest(new { Message = "Số tiền đóng góp phải lớn hơn 0." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // 1. KIỂM TRA & TRỪ TIỀN VÍ Pesonal
                var sourceWallet = await _context.Wallets.FirstOrDefaultAsync(w => w.WalletId == request.SourceWalletId && w.OwnerUserId == userId);
                if (sourceWallet == null) return BadRequest(new { Message = "Không tìm thấy ví nguồn." });
                if (sourceWallet.CurrentBalance < request.Amount) return BadRequest(new { Message = "Số dư trong ví không đủ để góp quỹ!" });

                sourceWallet.CurrentBalance -= request.Amount;

                // History transaction 
                _context.Transactions.Add(new Transaction
                {
                    TransactionId = Guid.NewGuid(),
                    WalletId = sourceWallet.WalletId,
                    UserId = userId,
                    Amount = request.Amount,
                    Type = "Expense",
                    Note = request.Note ?? "Đóng góp vào quỹ nhóm",
                    Status = "Completed",
                    TransactionDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                });

                // 2. CỘNG TIỀN VÀO QUỸ MỤC TIÊU
                var goal = await _context.Goals.Include(g => g.GoalMembers).FirstOrDefaultAsync(g => g.GoalId == goalId);
                if (goal == null) return NotFound(new { Message = "Không tìm thấy quỹ mục tiêu." });

                goal.CurrentAmount += request.Amount;

                var member = goal.GoalMembers.FirstOrDefault(m => m.UserId == userId);
                if (member != null)
                {
                    member.ContributedAmount += request.Amount;
                }
                else
                {
                    // Nếu quỹ Flexible cho phép người lạ góp
                    _context.GoalMembers.Add(new GoalMember
                    {
                        GoalMemberId = Guid.NewGuid(),
                        GoalId = goalId,
                        UserId = userId,
                        TargetAmount = 0,
                        ContributedAmount = request.Amount
                    });
                }

                // 3. LỊCH SỬ ĐÓNG GÓP NẾU BẠN ĐÃ TẠO BẢNG (tương lai update history trấnction cho goal)

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new { Message = "Đóng góp thành công!" });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "Lỗi hệ thống khi nạp tiền.", Error = ex.Message });
            }
        }

        // 6. KẾT THÚC MỤC TIÊU VÀ CHUYỂN THÀNH VÍ CHUNG MỚI
        [HttpPost("{goalId}/end")]
        public async Task<IActionResult> EndGoalAndConvertToWallet(Guid goalId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var goal = await _context.Goals
                .Include(g => g.Group)
                .FirstOrDefaultAsync(g => g.GoalId == goalId);

            if (goal == null) return NotFound(new { Message = "Không tìm thấy quỹ mục tiêu!" });

            if (goal.Status == "Completed")
                return BadRequest(new { Message = "Quỹ mục tiêu này đã được kết thúc trước đó." });

            if (goal.Group.OwnerId != userId)
                return StatusCode(403, new { Message = "Chỉ Trưởng nhóm (Admin) mới có quyền kết thúc quỹ này." });

            if (goal.CurrentAmount <= 0)
                return BadRequest(new { Message = "Quỹ chưa có tiền, không thể chuyển thành ví chung." });

            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Tạo Shared Wallet mới cho nhóm
                var newWallet = new Wallet
                {
                    WalletId = Guid.NewGuid(),
                    OwnerUserId = userId,
                    GroupId = goal.GroupId,
                    Name = $"[Budget] {goal.Name}", 
                    CurrentBalance = goal.CurrentAmount,
                    Type = "Shared",
                    Currency = "VND",
                    IsArchived = false,
                    IsDefaultAccount = false
                };
                _context.Wallets.Add(newWallet);

                // log Transaction
                var incomeTx = new Transaction
                {
                    TransactionId = Guid.NewGuid(),
                    WalletId = newWallet.WalletId,
                    UserId = userId,
                    Amount = goal.CurrentAmount,
                    Type = "Income",
                    Note = $"Giải ngân từ quỹ mục tiêu: {goal.Name}",
                    Status = "Completed",
                    TransactionDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Transactions.Add(incomeTx);

                // 5. update trạng thái Goal
                goal.Status = "Completed";
                
                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                return Ok(new
                {
                    Message = "Đã kết thúc mục tiêu và chuyển thành Ví chung!",
                    NewWalletId = newWallet.WalletId
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, new { Message = "Lỗi hệ thống khi kết thúc quỹ.", Error = ex.Message });
            }
        }
    }
}