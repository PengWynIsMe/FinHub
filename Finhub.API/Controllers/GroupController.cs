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
    public class GroupController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public GroupController(FinhubDbContext context)
        {
            _context = context;
        }

        private Guid GetUserId()
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            Guid.TryParse(userIdString, out var userId);
            return userId;
        }

        [HttpGet]
        public async Task<IActionResult> GetMyGroups()
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var groups = await _context.Groups
                .Include(g => g.Owner)
                .Include(g => g.GroupMembers)
                    .ThenInclude(gm => gm.User)
                .Include(g => g.Wallets)
                .Where(g => g.OwnerId == userId || g.GroupMembers.Any(gm => gm.UserId == userId))
                .OrderByDescending(g => g.CreatedAt)
                .ToListAsync();

            var result = groups.Select(g => {
                // 1. Xác định Role
                var role = g.OwnerId == userId ? "Admin" :
                           g.GroupMembers.FirstOrDefault(gm => gm.UserId == userId)?.Role ?? "Member";

                // 2. Tính số dư chung (Tổng tiền các ví trong nhóm)
                // Tổng Remaining (= allocated - spent) của các ví active
                var balance = g.Wallets
                    .Where(w => !w.IsArchived)
                    .Sum(w => {
                        var spent = (w.Transactions ?? new List<Transaction>())
                            .Where(t => t.Type == "Expense" && t.Status == "Completed")
                            .Sum(t => t.Amount);
                        return w.CurrentBalance - spent;
                    });

                // 3. Gom danh sách Avatar (Chủ nhóm + Các thành viên)
                var membersList = new List<dynamic>
                {
                    new { id = g.OwnerId.ToString(), avatar = g.Owner?.AvatarUrl }
                };

                foreach (var gm in g.GroupMembers)
                {
                    if (gm.UserId != g.OwnerId)
                    {
                        membersList.Add(new { id = gm.UserId.ToString(), avatar = gm.User?.AvatarUrl });
                    }
                }

                return new
                {
                    id = g.GroupId.ToString(),
                    name = g.Name,
                    role = role,
                    balance = balance.ToString("N0"),
                    coverImage = "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=200&auto=format&fit=crop", // Dùng ảnh mặc định vì DB chưa có CoverImage
                    members = membersList
                };
            }).ToList();

            return Ok(result);
        }

        [HttpGet("{groupId}/wallets")]
        public async Task<IActionResult> GetGroupWallets(Guid groupId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // 1. Lấy Group kèm theo Members và Wallets
            // 💡 QUAN TRỌNG: Kéo thêm `Transactions` của Ví để tính toán
            var group = await _context.Groups
                .Include(g => g.GroupMembers).ThenInclude(gm => gm.User)
                .Include(g => g.Owner)
                .Include(g => g.Wallets)
                    .ThenInclude(w => w.Transactions) // 👈 Kéo các giao dịch trực tiếp của ví nhóm
                .FirstOrDefaultAsync(g => g.GroupId == groupId);

            if (group == null) return NotFound(new { Message = "Không tìm thấy nhóm!" });

            // 2. Xác định Role của User hiện tại trong nhóm
            var myRole = group.OwnerId == userId ? "Admin" :
                         group.GroupMembers.FirstOrDefault(gm => gm.UserId == userId)?.Role ?? "Member";

            // 3. Gom danh sách Avatar thành viên nhóm
            var membersList = new List<object>
            {
                new { id = group.OwnerId.ToString(), avatar = group.Owner?.AvatarUrl }
            };
            foreach (var gm in group.GroupMembers)
            {
                if (gm.UserId != group.OwnerId)
                    membersList.Add(new { id = gm.UserId.ToString(), avatar = gm.User?.AvatarUrl });
            }

            // 4. Map dữ liệu
            var walletsToProcess = group.Wallets ?? new List<Wallet>();
            var result = walletsToProcess.Where(w => !w.IsArchived).Select(w =>
            {
                var txs = w.Transactions ?? new List<Transaction>();

                // ✅ Dùng CurrentBalance làm Allocated — luôn đúng với cả ví tạo thủ công lẫn ví từ Goal
                // Ví tạo thủ công: không có Income tx → dùng CurrentBalance
                // Ví từ Goal: CurrentBalance = goal.CurrentAmount (set lúc EndGoal)
                var allocated = w.CurrentBalance;

                // ✅ Spent = tổng Expense đã Completed
                var spent = txs.Where(t => t.Type != null
                                        && t.Type.Equals("Expense", StringComparison.OrdinalIgnoreCase)
                                        && t.Status == "Completed").Sum(t => t.Amount);

                return new
                {
                    id = w.WalletId.ToString(),
                    name = w.Name ?? "Unnamed Wallet",
                    icon = "💼",
                    color = group.ThemeColor ?? "#15476C",
                    allocated = allocated,
                    spent = spent,
                    members = membersList,
                    myRole = myRole
                };
            }).ToList();

            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> CreateGroup([FromBody] CreateGroupRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // 1. Tạo Group mới
            var newGroup = new Group
            {
                GroupId = Guid.NewGuid(),
                Name = request.Name,
                Type = request.Currency ?? "VND",
                OwnerId = userId,
                ThemeColor = request.ImageUri,
                CreatedAt = DateTime.UtcNow
            };

            _context.Groups.Add(newGroup);

            // 2. Tự động thêm Người tạo vào làm Admin của nhóm
            var newMember = new GroupMember
            {
                MemberId = Guid.NewGuid(),
                GroupId = newGroup.GroupId,
                UserId = userId,
                Role = "Admin",
                JoinedAt = DateTime.UtcNow
            };

            _context.GroupMembers.Add(newMember);

            // Lưu cả 2 bảng cùng 1 lúc
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Tạo nhóm thành công!",
                GroupId = newGroup.GroupId
            });
        }

        [HttpPost("{groupId}/wallets")]
        public async Task<IActionResult> CreateSharedWallet(Guid groupId, [FromBody] CreateSharedWalletRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            try
            {
                // 1. Kiểm tra quyền
                var isMember = await _context.GroupMembers
                    .AnyAsync(gm => gm.GroupId == groupId && gm.UserId == userId);

                var isOwner = await _context.Groups
                    .AnyAsync(g => g.GroupId == groupId && g.OwnerId == userId);

                if (!isMember && !isOwner)
                {
                    return StatusCode(403, new { Message = "Bạn không có quyền tạo ví trong nhóm này." });
                }

                // 2. Khởi tạo Ví chung
                var newWallet = new Wallet
                {
                    WalletId = Guid.NewGuid(),
                    OwnerUserId = userId,
                    GroupId = groupId,
                    Name = request.Name,
                    CurrentBalance = 0,
                    IsArchived = false,
                    CreatedAt = DateTime.UtcNow,

                    // 💡 THÊM 2 DÒNG NÀY ĐỂ ĐỀ PHÒNG DB BẮT BUỘC (Required):
                    Currency = "VND",
                    Type = "Shared"
                };

                _context.Wallets.Add(newWallet);
                await _context.SaveChangesAsync();

                return Ok(new
                {
                    Message = "Tạo ví chung thành công!",
                    WalletId = newWallet.WalletId
                });
            }
            catch (Exception ex)
            {
                // 💡 ĐOẠN NÀY LÀ "MÁY X-QUANG" ĐỂ SOI LỖI DB:
                var errorDetail = ex.InnerException != null ? ex.InnerException.Message : ex.Message;
                Console.WriteLine("=== LỖI TẠO VÍ CHUNG ===: " + errorDetail);

                // Trả thẳng lỗi chi tiết về cho Mobile để ta biết thiếu cột gì
                return StatusCode(500, new { Message = "Lỗi lưu Database", Error = errorDetail });
            }
        }

        // 🆕 API XÓA HOẶC RỜI NHÓM (CÓ HOÀN TIỀN)
        [HttpDelete("{groupId}/leave")]
        public async Task<IActionResult> LeaveOrDeleteGroup(Guid groupId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // Mở Transaction để đảm bảo tính toàn vẹn dữ liệu khi hoàn tiền
            using var dbTransaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // 1. Lấy thông tin nhóm kèm theo thành viên và các ví của nhóm
                var group = await _context.Groups
                    .Include(g => g.GroupMembers)
                    .Include(g => g.Wallets)
                    .FirstOrDefaultAsync(g => g.GroupId == groupId);

                if (group == null)
                    return NotFound(new { Message = "Không tìm thấy nhóm này!" });

                // =============================================================
                // TRƯỜNG HỢP 1: USER LÀ TRƯỞNG NHÓM -> GIẢI TÁN NHÓM & HOÀN TIỀN
                // =============================================================
                if (group.OwnerId == userId)
                {
                    // Tính tổng tiền còn lại của tất cả các ví trong nhóm
                    var totalBalance = group.Wallets.Sum(w => w.CurrentBalance);
                    var memberCount = group.GroupMembers.Count;

                    // Nếu quỹ nhóm còn tiền và có thành viên, tiến hành chia đều
                    if (totalBalance > 0 && memberCount > 0)
                    {
                        var splitAmount = totalBalance / memberCount;

                        // 1.1 Hoàn tiền cho từng thành viên
                        foreach (var member in group.GroupMembers)
                        {
                            // Tìm ví cá nhân ưu tiên của thành viên để nhận tiền 
                            // (Lấy ví mặc định hoặc ví cá nhân đầu tiên tìm thấy)
                            var personalWallet = await _context.Wallets
                                .Where(w => w.OwnerUserId == member.UserId && w.GroupId == null && !w.IsArchived)
                                .OrderByDescending(w => w.IsDefaultAccount)
                                .FirstOrDefaultAsync();

                            if (personalWallet != null)
                            {
                                personalWallet.CurrentBalance += splitAmount;

                                // Lưu lịch sử nhận tiền cho ví cá nhân
                                _context.Transactions.Add(new Transaction
                                {
                                    TransactionId = Guid.NewGuid(),
                                    UserId = member.UserId,
                                    WalletId = personalWallet.WalletId,
                                    Amount = splitAmount,
                                    Type = "Income",
                                    Note = $"Hoàn tiền từ việc giải tán nhóm: {group.Name}",
                                    Status = "Completed",
                                    TransactionDate = DateTime.UtcNow,
                                    CreatedAt = DateTime.UtcNow
                                });
                            }
                        }

                        // 1.2 Rút sạch tiền khỏi các ví chung và đánh dấu lưu trữ (Archive)
                        foreach (var wallet in group.Wallets)
                        {
                            if (wallet.CurrentBalance > 0)
                            {
                                // Tạo giao dịch trừ tiền ở ví nhóm cho khớp sổ sách
                                _context.Transactions.Add(new Transaction
                                {
                                    TransactionId = Guid.NewGuid(),
                                    UserId = userId,
                                    WalletId = wallet.WalletId,
                                    Amount = wallet.CurrentBalance,
                                    Type = "Expense",
                                    Note = "Giải tán quỹ, chia đều cho các thành viên",
                                    Status = "Completed",
                                    TransactionDate = DateTime.UtcNow,
                                    CreatedAt = DateTime.UtcNow
                                });
                                wallet.CurrentBalance = 0;
                            }
                            wallet.IsArchived = true;
                        }
                    }
                    else
                    {
                        // Nếu quỹ bằng 0 thì chỉ cần lưu trữ các ví chung
                        foreach (var wallet in group.Wallets)
                        {
                            wallet.IsArchived = true;
                        }
                    }

                    // 1.3 Xóa nhóm (EF Core sẽ tự động xóa các dòng GroupMembers liên quan do Cascade Delete)
                    _context.Groups.Remove(group);

                    await _context.SaveChangesAsync();
                    await dbTransaction.CommitAsync(); // Xác nhận lưu vĩnh viễn

                    return Ok(new { Message = "Đã giải tán nhóm và hoàn tiền thành công!" });
                }

                // =============================================================
                // TRƯỜNG HỢP 2: USER LÀ THÀNH VIÊN -> RỜI KHỎI NHÓM
                // =============================================================
                else
                {
                    var memberRecord = group.GroupMembers.FirstOrDefault(m => m.UserId == userId);
                    if (memberRecord == null)
                        return BadRequest(new { Message = "Bạn không phải là thành viên của nhóm này." });

                    // Thành viên rời nhóm thì không được chia tiền (hoặc nếu muốn chia thì bạn có thể áp dụng logic chia ở trên)
                    // Thông thường rời nhóm sẽ để lại tiền quỹ cho nhóm.
                    _context.GroupMembers.Remove(memberRecord);

                    await _context.SaveChangesAsync();
                    await dbTransaction.CommitAsync();

                    return Ok(new { Message = "Đã rời khỏi nhóm!" });
                }
            }
            catch (Exception ex)
            {
                // Nếu có bất kỳ lỗi nào xảy ra trong quá trình hoàn tiền -> Hủy bỏ tất cả, tiền không bị mất
                await dbTransaction.RollbackAsync();
                return StatusCode(500, new { Message = "Lỗi hệ thống khi xử lý rời/xóa nhóm.", Error = ex.Message });
            }
        }

        // 1. 🆕 API LẤY DANH SÁCH THÀNH VIÊN CỦA 1 NHÓM
        [HttpGet("{groupId}/members")]
        public async Task<IActionResult> GetGroupMembers(Guid groupId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var group = await _context.Groups
                .Include(g => g.Owner)
                .Include(g => g.GroupMembers)
                    .ThenInclude(gm => gm.User)
                .FirstOrDefaultAsync(g => g.GroupId == groupId);

            if (group == null) return NotFound(new { Message = "Không tìm thấy nhóm!" });

            // Danh sách chứa thành viên để trả về
            var membersList = new List<object>();

            // Thêm Admin (Owner) lên đầu danh sách
            membersList.Add(new
            {
                id = group.OwnerId.ToString(),
                name = group.Owner?.FullName ?? "Admin",
                role = "Admin",
                avatar = group.Owner?.AvatarUrl ?? $"https://ui-avatars.com/api/?name=Admin&background=15476C&color=fff",
                canViewAll = true
            });

            // Lặp qua các thành viên còn lại
            foreach (var gm in group.GroupMembers.Where(m => m.UserId != group.OwnerId))
            {
                membersList.Add(new
                {
                    id = gm.UserId.ToString(),
                    name = gm.User?.FullName ?? "Member",
                    role = gm.Role ?? "Member",
                    avatar = gm.User?.AvatarUrl ?? $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(gm.User?.FullName ?? "M")}&background=AFAEE1&color=fff",
                    canViewAll = false
                });
            }

            var myRoleInGroup = group.OwnerId == userId ? "Admin" :
                                  group.GroupMembers.FirstOrDefault(gm => gm.UserId == userId)?.Role ?? "Member";

            return Ok(new
            {
                groupId = group.GroupId,
                groupName = group.Name,
                inviteCode = group.GroupId.ToString(),
                myRole = myRoleInGroup, // ✅ Trả về role của user hiện tại để frontend ẩn/hiện nút xóa
                members = membersList
            });
        }

        public class JoinGroupRequest { public string InviteCode { get; set; } }

        // 2. 🆕 API THAM GIA NHÓM BẰNG MÃ (INVITE CODE)

        // ==========================================================
        // ADMIN XÓA THÀNH VIÊN KHỎI NHÓM
        // ==========================================================
        [HttpDelete("{groupId}/members/{memberId}")]
        public async Task<IActionResult> RemoveMember(Guid groupId, Guid memberId)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            var group = await _context.Groups
                .Include(g => g.GroupMembers)
                .FirstOrDefaultAsync(g => g.GroupId == groupId);

            if (group == null)
                return NotFound(new { Message = "Không tìm thấy nhóm!" });

            // Chỉ Admin (chủ nhóm) mới có quyền xóa thành viên
            if (group.OwnerId != userId)
                return StatusCode(403, new { Message = "Chỉ Trưởng nhóm mới có quyền xóa thành viên." });

            // Không cho phép Admin tự xóa chính mình qua API này
            if (memberId == userId)
                return BadRequest(new { Message = "Bạn không thể tự xóa chính mình. Hãy dùng chức năng 'Leave Group'." });

            var memberRecord = group.GroupMembers.FirstOrDefault(m => m.UserId == memberId);
            if (memberRecord == null)
                return NotFound(new { Message = "Không tìm thấy thành viên này trong nhóm." });

            _context.GroupMembers.Remove(memberRecord);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Đã xóa thành viên khỏi nhóm thành công!" });
        }
        [HttpPost("join")]
        public async Task<IActionResult> JoinGroup([FromBody] JoinGroupRequest request)
        {
            var userId = GetUserId();
            if (userId == Guid.Empty) return Unauthorized();

            // Chuyển mã Code thành Guid
            if (!Guid.TryParse(request.InviteCode, out Guid groupId))
                return BadRequest(new { Message = "Mã mời không hợp lệ." });

            var group = await _context.Groups.FirstOrDefaultAsync(g => g.GroupId == groupId);
            if (group == null) return NotFound(new { Message = "Mã mời không đúng hoặc nhóm không tồn tại." });

            // Kiểm tra xem đã trong nhóm chưa
            var isAlreadyMember = await _context.GroupMembers.AnyAsync(gm => gm.GroupId == groupId && gm.UserId == userId);
            if (isAlreadyMember) return BadRequest(new { Message = "Bạn đã là thành viên của nhóm này rồi." });

            // Thêm vào nhóm
            var newMember = new GroupMember
            {
                MemberId = Guid.NewGuid(),
                GroupId = groupId,
                UserId = userId,
                Role = "Member", // Mặc định vào bằng code là Member
                JoinedAt = DateTime.UtcNow
            };

            _context.GroupMembers.Add(newMember);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Tham gia nhóm thành công!", GroupId = groupId });
        }
    }

}