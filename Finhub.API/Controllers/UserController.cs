using Finhub.API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Finhub.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Yêu cầu phải có Token hợp lệ
    public class UserController : ControllerBase
    {
        private readonly FinhubDbContext _context;

        public UserController(FinhubDbContext context)
        {
            _context = context;
        }

        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile()
        {
            // Lấy ID từ Subject (Sub) trong Claim của Token
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Invalid token format.");
            }

            var user = await _context.Users
                .AsNoTracking()
                .Select(u => new 
                {
                    u.UserId,
                    u.Email,
                    u.FullName,
                    u.Nickname,
                    u.AvatarUrl,
                    u.CreatedAt,
                    PrimaryWalletId = u.Wallets
                        .Where(w => !w.IsArchived)
                        .Select(w => w.WalletId)
                        .FirstOrDefault()
                }) 
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return NotFound("User not found.");

            return Ok(user);
        }
    }
}
