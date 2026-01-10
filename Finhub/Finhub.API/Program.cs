using Finhub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL; // 1. C?N THÊM USING NPGSQL

var builder = WebApplication.CreateBuilder(args);

// --- [THAY ??I B?T ??U] ---
// 2. ??ng ký DbContext s? d?ng UseNpgsql
builder.Services.AddDbContext<FinhubDbContext>(options =>
    options.UseNpgsql(
        // L?y chu?i k?t n?i t? appsettings.json
        builder.Configuration.GetConnectionString("DefaultConnection"),
        // Ch? ??nh project ch?a Migration
        b => b.MigrationsAssembly("Finhub.Infrastructure")
    )
);
// --- [THAY ??I K?T THÚC] ---


// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();