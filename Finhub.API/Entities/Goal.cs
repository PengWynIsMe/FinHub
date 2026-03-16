using System;
using System.Collections.Generic;

namespace Finhub.API.Entities;

public partial class Goal
{
    public Guid GoalId { get; set; }
    public Guid GroupId { get; set; }
    public string Name { get; set; } = null!;
    public decimal TargetAmount { get; set; }
    public decimal CurrentAmount { get; set; }
    public DateTime? Deadline { get; set; }
    public string Status { get; set; } = null!;

    // 🆕 THÊM 2 CỘT NÀY CHO UI
    public string Icon { get; set; } = "🎯";
    public string Type { get; set; } = "Flexible"; // "Flexible" hoặc "Split"

    public virtual Group Group { get; set; } = null!;

    // 🆕 THÊM LIÊN KẾT VỚI BẢNG THÀNH VIÊN QUỸ
    public virtual ICollection<GoalMember> GoalMembers { get; set; } = new List<GoalMember>();
}