namespace Finhub.API.DTOs.Responses
{
    public class BudgetResponse
    {
        public Guid BudgetId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Icon { get; set; } = string.Empty;
        public decimal Allocated { get; set; }
        public decimal Spent { get; set; }
        public string Color { get; set; } = string.Empty;
    }

    public class BudgetGroupResponse
    {
        public List<BudgetResponse> Mandatory { get; set; } = new();
        public List<BudgetResponse> NonRecurring { get; set; } = new();
    }
}
