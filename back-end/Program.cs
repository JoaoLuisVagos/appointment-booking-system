using System.Text;
using MySqlConnector;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using back_end.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddProblemDetails();

const string CorsPolicyName = "AllowAll";
builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicyName, policy =>
    {
        policy
            .AllowAnyOrigin()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var jwtKey = builder.Configuration["Jwt:Key"] ?? "change_this_secret_in_production";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "appointment-booking-system";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "appointment-booking-system";

builder.Services.AddDbContext<BookingContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection") ?? "server=localhost;user=root;password=;database=booking_system;", new MySqlServerVersion(new Version(8, 0, 21))));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtIssuer,
        ValidAudience = jwtAudience,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
        var exception = exceptionFeature?.Error;

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/json";

        var message = "Ocorreu um erro interno no servidor.";

        if (exception is MySqlException)
        {
            message = "Falha ao acessar o banco de dados. Tente novamente em instantes.";
        }
        else if (exception is InvalidOperationException)
        {
            message = "Falha de configuracao interna da aplicacao.";
        }

        await context.Response.WriteAsJsonAsync(new
        {
            message,
            traceId = context.TraceIdentifier
        });
    });
});

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseCors(CorsPolicyName);
app.UseAuthentication();
app.UseAuthorization();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookingContext>();

    db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS lojas (
            id INT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            telefone VARCHAR(30) NULL,
            endereco VARCHAR(200) NULL,
            cor_primaria VARCHAR(7) NOT NULL DEFAULT '#0e7490',
            logo_url VARCHAR(500) NULL,
            usuario_admin_id INT NULL
        )");

    db.Database.ExecuteSqlRaw("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS loja_id INT NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefone VARCHAR(30) NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS endereco VARCHAR(200) NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cidade VARCHAR(80) NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado VARCHAR(40) NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cep VARCHAR(20) NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS complemento VARCHAR(120) NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE produtos ADD COLUMN IF NOT EXISTS loja_id INT NULL");
    db.Database.ExecuteSqlRaw("ALTER TABLE horarios ADD COLUMN IF NOT EXISTS loja_id INT NULL");

    db.Database.ExecuteSqlRaw("UPDATE usuarios SET loja_id = id WHERE role = 'loja' AND (loja_id IS NULL OR loja_id = 0)");

    db.Database.ExecuteSqlRaw(@"
        INSERT INTO lojas (id, nome, cor_primaria, usuario_admin_id)
        SELECT u.id, COALESCE(NULLIF(u.nome, ''), 'BookingApp'), '#0e7490', u.id
        FROM usuarios u
        LEFT JOIN lojas l ON l.id = u.loja_id
        WHERE u.role = 'loja' AND u.loja_id IS NOT NULL AND l.id IS NULL");
}

app.MapControllers();

app.Run();
