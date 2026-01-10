using Finhub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Finhub.Infrastructure.Data
{
    public class FinhubDbContext : DbContext
    {
        public FinhubDbContext(DbContextOptions<FinhubDbContext> options) : base(options)
        {
        }

        // DB Sets
        public DbSet<User> Users { get; set; }
        public DbSet<Group> Groups { get; set; }
        public DbSet<GroupMember> GroupMembers { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<AccountPermission> AccountPermissions { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<RecurringTransaction> RecurringTransactions { get; set; }
        public DbSet<Goal> Goals { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<WalletBalanceHistory> WalletBalanceHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ================================================
            // 1. ENUM → STRING
            // ================================================
            modelBuilder.Entity<Group>()
                .Property(x => x.Type)
                .HasConversion<string>();

            modelBuilder.Entity<Transaction>(entity =>
            {
                entity.Property(x => x.Type).HasConversion<string>();
                entity.Property(x => x.Status).HasConversion<string>();
            });

            modelBuilder.Entity<Budget>()
                .Property(x => x.BudgetType)
                .HasConversion<string>();

            modelBuilder.Entity<AccountPermission>()
                .Property(x => x.AccessLevel)
                .HasConversion<string>();

            modelBuilder.Entity<Category>()
                .Property(x => x.Type)
                .HasConversion<string>();

            modelBuilder.Entity<RecurringTransaction>()
                .Property(x => x.Frequency)
                .HasConversion<string>();

            // ================================================
            // 2. GROUP MEMBER RELATION
            // ================================================
            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.User)
                .WithMany(u => u.GroupMembers)
                .HasForeignKey(gm => gm.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<GroupMember>()
                .HasOne(gm => gm.Group)
                .WithMany(g => g.Members)
                .HasForeignKey(gm => gm.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            // ================================================
            // 3. WALLET → GROUP (MISSING BEFORE)
            // ================================================
            modelBuilder.Entity<Wallet>()
                .HasOne(w => w.Group)
                .WithMany(g => g.Wallets)
                .HasForeignKey(w => w.GroupId)
                .OnDelete(DeleteBehavior.Cascade);

            // OwnerUserId (nullable)
            modelBuilder.Entity<Wallet>()
                .HasOne(w => w.Owner)
                .WithMany(u => u.OwnedWallets)
                .HasForeignKey(w => w.OwnerUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ================================================
            // 4. TRANSACTION → WALLET (MISSING BEFORE)
            // ================================================
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Wallet)
                .WithMany(w => w.Transactions)
                .HasForeignKey(t => t.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            // Approver
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.Approver)
                .WithMany()
                .HasForeignKey(t => t.ApprovedBy)
                .OnDelete(DeleteBehavior.Restrict);

            // 2-way transfer
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.RelatedTransaction)
                .WithMany()
                .HasForeignKey(t => t.RelatedTransactionId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Transaction>()
                .Property(t => t.Status)
                .HasDefaultValue(Domain.Enums.TransactionStatus.Pending);

            // ================================================
            // 5. CATEGORY RECURSION
            // ================================================
            modelBuilder.Entity<Category>()
                .HasOne(c => c.ParentCategory)
                .WithMany(c => c.SubCategories)
                .HasForeignKey(c => c.ParentId)
                .OnDelete(DeleteBehavior.Restrict);

            // ================================================
            // 6. BUDGET CHECK CONSTRAINT
            // ================================================
            modelBuilder.Entity<Budget>()
                .ToTable(t =>
                    t.HasCheckConstraint(
                        "CHK_Budget_Scope",
                        "\"CategoryId\" IS NOT NULL OR \"WalletId\" IS NOT NULL"
                    )
                );

            // ================================================
            // 7. NOTIFICATION
            // ================================================
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Sender)
                .WithMany() // Sender không cần list notifications đã gửi (optional)
                .HasForeignKey(n => n.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Notification>()
                .HasOne(n => n.Recipient)   // SỬA: Receiver -> Recipient
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.RecipientUserId) // SỬA: ReceiverUserId -> RecipientUserId
                .OnDelete(DeleteBehavior.Cascade);

            // ================================================
            // 8. WALLET BALANCE HISTORY
            // ================================================
            modelBuilder.Entity<WalletBalanceHistory>()
                .HasOne(wbh => wbh.Wallet)
                .WithMany(w => w.BalanceHistories)
                .HasForeignKey(wbh => wbh.WalletId)
                .OnDelete(DeleteBehavior.Cascade);

            // ================================================
            // 9. RECURRING TRANSACTION
            // ================================================
            modelBuilder.Entity<RecurringTransaction>()
                .HasOne(rt => rt.Wallet)
                .WithMany(w => w.RecurringTransactions)
                .HasForeignKey(rt => rt.WalletId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
