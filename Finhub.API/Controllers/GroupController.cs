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
                var balance = g.Wallets.Sum(w => w.CurrentBalance);

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
            var group = await _context.Groups
                .Include(g => g.GroupMembers).ThenInclude(gm => gm.User)
                .Include(g => g.Owner)
                .Include(g => g.Wallets)
                    .ThenInclude(w => w.Budgets)
                        .ThenInclude(b => b.Transactions)
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

            // 4. Map dữ liệu ví (Wallets) sang định dạng Frontend cần
            var result = group.Wallets.Where(w => !w.IsArchived).Select(w =>
            {
                // Tính toán số tiền đã phân bổ và đã chi tiêu từ Budgets
                var allocated = w.Budgets?.Sum(b => b.AmountLimit) ?? 0;
                var spent = w.Budgets?.SelectMany(b => b.Transactions ?? new List<Transaction>())
                                     .Where(t => t.Type == "Expense")
                                     .Sum(t => t.Amount) ?? 0;

                return new
                {
                    id = w.WalletId.ToString(),
                    name = w.Name,
                    icon = "💼", // Mặc định vì Entity Wallet không có cột Icon
                    color = group.ThemeColor ?? "#15476C", // Lấy màu của Group làm màu ví
                    allocated = allocated,
                    spent = spent,
                    members = membersList,
                    myRole = myRole // Trả về Role để hiện badge Admin/Member
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
    }
}