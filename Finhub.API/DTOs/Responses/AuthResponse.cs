namespace Finhub.API.DTOs.Responses
{
    public class AuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string? AvatarUrl { get; set; }
    }
}