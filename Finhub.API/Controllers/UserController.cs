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
            // Lấy ID trong Token
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

        [HttpPut("me")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
        {
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
                return Unauthorized("Invalid token format.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserId == userId);
            if (user == null) return NotFound("User not found.");

            if (!string.IsNullOrWhiteSpace(request.FullName))
                user.FullName = request.FullName;

            if (!string.IsNullOrWhiteSpace(request.Nickname))
                user.Nickname = request.Nickname;

            await _context.SaveChangesAsync();

            return Ok(new
            {
                userId = user.UserId,
                fullName = user.FullName,
                nickname = user.Nickname,
                avatarUrl = user.AvatarUrl
            });
        }
    }
}
