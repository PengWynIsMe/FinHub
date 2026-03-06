namespace Finhub.API.DTOs.Responses
{
    public class BudgetDetailDto
    {
        public Guid BudgetId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public decimal Allocated { get; set; }
        public decimal Spent { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class HomeSummaryResponse
    {
        public decimal UnallocatedMoney { get; set; }
        public decimal MonthlySpending { get; set; }
        public List<BudgetDetailDto> Mandatory { get; set; } = new();
        public List<BudgetDetailDto> NonRecurring { get; set; } = new();
    }
}