using Finhub.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.Domain.Entities
{
    public class Category
    {
        [Key]
        public Guid CategoryId { get; set; } = Guid.NewGuid();

        public Guid? GroupId { get; set; } // Null = Danh mục hệ thống

        public Guid? ParentId { get; set; } // Đệ quy

        [Required]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public TransactionType Type { get; set; } // Expense/Income

        public string? Icon { get; set; }

        // Quan hệ
        public Group? Group { get; set; }

        [ForeignKey("ParentId")]
        public Category? ParentCategory { get; set; }
        public ICollection<Category> SubCategories { get; set; } = new List<Category>();
    }
}