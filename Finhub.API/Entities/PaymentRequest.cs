using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Finhub.API.Entities
{
    public partial class PaymentRequest
    {
        [Key]
        public Guid RequestId { get; set; }

        public Guid GroupId { get; set; }
        public Guid RequesterId { get; set; }
        public Guid ApproverId { get; set; }

        [Column(TypeName = "decimal(19, 4)")]
        public decimal Amount { get; set; }

        public string? MerchantInfo { get; set; }
        public string? Note { get; set; }

        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected, Paid
        public string RequestType { get; set; } = "PayForMe"; // PayForMe (Trả hộ) hoặc ApproveForMe (Xin duyệt)

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        // Navigation properties
        [ForeignKey("GroupId")]
        public virtual Group Group { get; set; } = null!;

        [ForeignKey("RequesterId")]
        public virtual User Requester { get; set; } = null!;

        [ForeignKey("ApproverId")]
        public virtual User Approver { get; set; } = null!;
    }
}