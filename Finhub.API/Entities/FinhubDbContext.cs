using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Finhub.API.Security;

namespace Finhub.API.Entities;

public partial class FinhubDbContext : DbContext
{
    public FinhubDbContext()
    {
    }

    public FinhubDbContext(DbContextOptions<FinhubDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AccountPermission> AccountPermissions { get; set; }

    public virtual DbSet<Budget> Budgets { get; set; }

    public virtual DbSet<Category> Categories { get; set; }

    public virtual DbSet<Goal> Goals { get; set; }

    public virtual DbSet<GoalMember> GoalMembers { get; set; }

    public virtual DbSet<Group> Groups { get; set; }

    public virtual DbSet<GroupMember> GroupMembers { get; set; }

    public virtual DbSet<PaymentRequest> PaymentRequests { get; set; }


    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<RecurringTransaction> RecurringTransactions { get; set; }

    public virtual DbSet<Transaction> Transactions { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<Wallet> Wallets { get; set; }

    public virtual DbSet<WalletBalanceHistory> WalletBalanceHistories { get; set; }

    public virtual DbSet<WalletMember> WalletMembers { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseNpgsql("Host=localhost;Port=5432;Database=FinhubDB;Username=postgres");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var balanceConverter = new ValueConverter<decimal, string>(
            v => EncryptionHelper.EncryptDecimal(v),    
            v => EncryptionHelper.DecryptToDecimal(v)   
        );

        modelBuilder.Entity<AccountPermission>(entity =>
        {
            entity.HasKey(e => e.PermissionId);

            entity.HasIndex(e => e.GranteeUserId, "IX_AccountPermissions_GranteeUserId");

            entity.HasIndex(e => e.WalletId, "IX_AccountPermissions_WalletId");

            entity.Property(e => e.PermissionId).ValueGeneratedNever();
            entity.Property(e => e.DailySpendLimit).HasPrecision(19, 4);
            entity.Property(e => e.MaxAmountPerTransaction).HasPrecision(19, 4);

            entity.HasOne(d => d.GranteeUser).WithMany(p => p.AccountPermissions).HasForeignKey(d => d.GranteeUserId);

            entity.HasOne(d => d.Wallet).WithMany(p => p.AccountPermissions).HasForeignKey(d => d.WalletId);
        });

        modelBuilder.Entity<Budget>(entity =>
        {
            entity.HasIndex(e => e.CategoryId, "IX_Budgets_CategoryId");

            entity.HasIndex(e => e.GroupId, "IX_Budgets_GroupId");

            entity.HasIndex(e => e.WalletId, "IX_Budgets_WalletId");

            entity.Property(e => e.BudgetId).ValueGeneratedNever();
            entity.Property(e => e.AmountLimit).HasPrecision(19, 4);

            entity.HasOne(d => d.Category).WithMany(p => p.Budgets).HasForeignKey(d => d.CategoryId);

            entity.HasOne(d => d.Group).WithMany(p => p.Budgets).HasForeignKey(d => d.GroupId);

            entity.HasOne(d => d.Wallet).WithMany(p => p.Budgets).HasForeignKey(d => d.WalletId);
        });

        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasIndex(e => e.GroupId, "IX_Categories_GroupId");

            entity.HasIndex(e => e.ParentId, "IX_Categories_ParentId");

            entity.Property(e => e.CategoryId).ValueGeneratedNever();
            entity.Property(e => e.Name).HasMaxLength(100);

            entity.HasOne(d => d.Group).WithMany(p => p.Categories).HasForeignKey(d => d.GroupId);

            entity.HasOne(d => d.Parent).WithMany(p => p.InverseParent)
                .HasForeignKey(d => d.ParentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Goal>(entity =>
        {
            entity.HasIndex(e => e.GroupId, "IX_Goals_GroupId");

            entity.Property(e => e.GoalId).ValueGeneratedNever();
            entity.Property(e => e.CurrentAmount).HasPrecision(19, 4);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.TargetAmount).HasPrecision(19, 4);

            entity.HasOne(d => d.Group).WithMany(p => p.Goals).HasForeignKey(d => d.GroupId);
        });

        modelBuilder.Entity<Group>(entity =>
        {
            entity.HasIndex(e => e.OwnerId, "IX_Groups_OwnerId");

            entity.Property(e => e.GroupId).ValueGeneratedNever();
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.ThemeColor).HasMaxLength(20);

            entity.HasOne(d => d.Owner).WithMany(p => p.Groups).HasForeignKey(d => d.OwnerId);
        });

        modelBuilder.Entity<GroupMember>(entity =>
        {
            entity.HasKey(e => e.MemberId);

            entity.HasIndex(e => e.GroupId, "IX_GroupMembers_GroupId");

            entity.HasIndex(e => e.UserId, "IX_GroupMembers_UserId");

            entity.Property(e => e.MemberId).ValueGeneratedNever();
            entity.Property(e => e.Role).HasMaxLength(50);

            entity.HasOne(d => d.Group).WithMany(p => p.GroupMembers).HasForeignKey(d => d.GroupId);

            entity.HasOne(d => d.User).WithMany(p => p.GroupMembers).HasForeignKey(d => d.UserId);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasIndex(e => e.RecipientUserId, "IX_Notifications_RecipientUserId");

            entity.HasIndex(e => e.SenderUserId, "IX_Notifications_SenderUserId");

            entity.Property(e => e.NotificationId).ValueGeneratedNever();
            entity.Property(e => e.EntityType).HasMaxLength(50);
            entity.Property(e => e.Status).HasMaxLength(20);
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.RecipientUser).WithMany(p => p.NotificationRecipientUsers).HasForeignKey(d => d.RecipientUserId);

            entity.HasOne(d => d.SenderUser).WithMany(p => p.NotificationSenderUsers)
                .HasForeignKey(d => d.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<RecurringTransaction>(entity =>
        {
            entity.HasKey(e => e.RecurringId);

            entity.HasIndex(e => e.CategoryId, "IX_RecurringTransactions_CategoryId");

            entity.HasIndex(e => e.UserId, "IX_RecurringTransactions_UserId");

            entity.HasIndex(e => e.WalletId, "IX_RecurringTransactions_WalletId");

            entity.Property(e => e.RecurringId).ValueGeneratedNever();
            entity.Property(e => e.Amount).HasPrecision(19, 4);

            entity.HasOne(d => d.Category).WithMany(p => p.RecurringTransactions).HasForeignKey(d => d.CategoryId);

            entity.HasOne(d => d.User).WithMany(p => p.RecurringTransactions).HasForeignKey(d => d.UserId);

            entity.HasOne(d => d.Wallet).WithMany(p => p.RecurringTransactions).HasForeignKey(d => d.WalletId);
        });

        modelBuilder.Entity<Transaction>(entity =>
        {
            entity.HasIndex(e => e.ApprovedBy, "IX_Transactions_ApprovedBy");

            entity.HasIndex(e => e.CategoryId, "IX_Transactions_CategoryId");

            entity.HasIndex(e => e.RelatedTransactionId, "IX_Transactions_RelatedTransactionId");

            entity.HasIndex(e => e.UserId, "IX_Transactions_UserId");

            entity.HasIndex(e => e.WalletId, "IX_Transactions_WalletId");

            entity.Property(e => e.TransactionId).ValueGeneratedNever();
            entity.Property(e => e.Amount).HasPrecision(19, 4);
            entity.Property(e => e.Note).HasMaxLength(500);
            entity.Property(e => e.Status).HasDefaultValueSql("'Pending'::text");

            entity.HasOne(d => d.ApprovedByNavigation).WithMany(p => p.TransactionApprovedByNavigations)
                .HasForeignKey(d => d.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Category).WithMany(p => p.Transactions).HasForeignKey(d => d.CategoryId);

            entity.HasOne(d => d.RelatedTransaction).WithMany(p => p.InverseRelatedTransaction)
                .HasForeignKey(d => d.RelatedTransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.User).WithMany(p => p.TransactionUsers).HasForeignKey(d => d.UserId);

            entity.HasOne(d => d.Wallet).WithMany(p => p.Transactions).HasForeignKey(d => d.WalletId);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.Property(e => e.UserId).ValueGeneratedNever();
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.Nickname).HasMaxLength(50);
        });

        modelBuilder.Entity<Wallet>(entity =>
        {
            entity.HasIndex(e => e.GroupId, "IX_Wallets_GroupId");

            entity.HasIndex(e => e.OwnerUserId, "IX_Wallets_OwnerUserId");

            entity.Property(e => e.WalletId).ValueGeneratedNever();
            entity.Property(e => e.Currency).HasMaxLength(10);
            entity.Property(e => e.CurrentBalance)
                      .HasConversion(balanceConverter);
            entity.Property(e => e.InitialBalance)
                    .HasConversion(balanceConverter);
            entity.Property(e => e.IsDefaultAccount).HasDefaultValue(false);
            entity.Property(e => e.Name).HasMaxLength(100);
            entity.Property(e => e.Type).HasMaxLength(50);

            entity.HasOne(d => d.Group).WithMany(p => p.Wallets)
                .HasForeignKey(d => d.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.OwnerUser).WithMany(p => p.Wallets)
                .HasForeignKey(d => d.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<WalletBalanceHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId);

            entity.HasIndex(e => e.TransactionId, "IX_WalletBalanceHistories_TransactionId");

            entity.HasIndex(e => e.WalletId, "IX_WalletBalanceHistories_WalletId");

            entity.Property(e => e.HistoryId).ValueGeneratedNever();
            entity.Property(e => e.ChangeAmount).HasPrecision(19, 4);
            entity.Property(e => e.NewBalance).HasPrecision(19, 4);
            entity.Property(e => e.PreviousBalance).HasPrecision(19, 4);

            entity.HasOne(d => d.Transaction).WithMany(p => p.WalletBalanceHistories).HasForeignKey(d => d.TransactionId);

            entity.HasOne(d => d.Wallet).WithMany(p => p.WalletBalanceHistories).HasForeignKey(d => d.WalletId);
        });

        modelBuilder.Entity<WalletMember>(entity =>
        {
            entity.ToTable("WalletMember");

            entity.HasIndex(e => e.UserId, "IX_WalletMember_UserId");

            entity.HasIndex(e => e.WalletId, "IX_WalletMember_WalletId");

            entity.Property(e => e.WalletMemberId).ValueGeneratedNever();

            entity.HasOne(d => d.User).WithMany(p => p.WalletMembers).HasForeignKey(d => d.UserId);

            entity.HasOne(d => d.Wallet).WithMany(p => p.WalletMembers).HasForeignKey(d => d.WalletId);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
