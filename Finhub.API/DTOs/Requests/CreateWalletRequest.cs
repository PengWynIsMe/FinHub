namespace Finhub.API.DTOs.Requests
{
    public class CreateWalletRequest
    {
        public string Name { get; set; } = "Ví tiền mặt";
        public decimal InitialBalance { get; set; }
        public string Type { get; set; } = "Cash";
        public string Currency { get; set; } = "VND";
    }
}
