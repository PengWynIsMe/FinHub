namespace Finhub.API.DTOs.Requests
{
    public class ContributeRequest
    {
        public Guid SourceWalletId { get; set; }
        public Guid DestinationWalletId { get; set; }
        public decimal Amount { get; set; }
        public string Note { get; set; }
    }
}