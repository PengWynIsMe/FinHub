namespace Finhub.API.DTOs.Requests
{
    public class CreateGroupRequest
    {
        public string Name { get; set; } = null!;
        public string? Currency { get; set; }
        public string? Description { get; set; }
        public string? ImageUri { get; set; }
    }

    public class CreateSharedWalletRequest
    {
        public string Name { get; set; } = null!;
        public string? Icon { get; set; }
        public string? Color { get; set; }
    }
}
