namespace Finhub.API.DTOs.Requests
{
    public class CreateBudgetRequest
    {
        public string Name { get; set; } = null!;
        public string? Icon { get; set; }
        public string? Color { get; set; }
        public Guid WalletId { get; set; }
        public Guid? CategoryId { get; set; }
        public Guid? GroupId { get; set; }
        public decimal AmountLimit { get; set; }
        public string BudgetType { get; set; } = "mandatory";
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public bool IsRolling { get; set; }
    }
}