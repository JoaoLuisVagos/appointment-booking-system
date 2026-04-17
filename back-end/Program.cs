using System.Text;
using MySqlConnector;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using back_end.Data;

var builder = WebApplication.CreateBuilder(args);

var renderPort = Environment.GetEnvironmentVariable("PORT");
var aspnetcoreUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
if (!string.IsNullOrWhiteSpace(renderPort))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{renderPort}");
}
else if (string.IsNullOrWhiteSpace(aspnetcoreUrls))
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

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

var connectionString =
    builder.Configuration.GetConnectionString("DefaultConnection")
    ?? Environment.GetEnvironmentVariable("ConnectionStrings__DefaultConnection")
    ?? "server=localhost;user=root;password=;database=booking_system;SslMode=None;AllowPublicKeyRetrieval=True";

builder.Services.AddDbContext<BookingContext>(options =>
    options.UseMySql(
        connectionString,
        ServerVersion.AutoDetect(connectionString),
        mysql => mysql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(10), null)));

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

var shouldInitializeDatabase =
    !app.Environment.IsProduction()
    || string.Equals(
        Environment.GetEnvironmentVariable("RUN_DB_INIT"),
        "true",
        StringComparison.OrdinalIgnoreCase);

if (shouldInitializeDatabase)
{
    try
    {
        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BookingContext>();

        db.Database.ExecuteSqlRaw(@"
        CREATE TABLE IF NOT EXISTS lojas (
            id INT PRIMARY KEY,
            nome VARCHAR(100) NOT NULL,
            telefone VARCHAR(30) NULL,
            endereco VARCHAR(200) NULL,
            cor_primaria VARCHAR(7) NOT NULL DEFAULT '#0e7490',
            cor_secundaria_fonte VARCHAR(7) NOT NULL DEFAULT '#5f6f82',
            logo_url TEXT NULL,
            usuario_admin_id INT NULL
        )");

        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE lojas ADD COLUMN cor_secundaria_fonte VARCHAR(7) NOT NULL DEFAULT '#5f6f82'");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE lojas MODIFY COLUMN logo_url TEXT NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE usuarios ADD COLUMN loja_id INT NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE usuarios ADD COLUMN telefone VARCHAR(30) NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE usuarios ADD COLUMN endereco VARCHAR(200) NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE usuarios ADD COLUMN cidade VARCHAR(80) NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE usuarios ADD COLUMN estado VARCHAR(40) NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE usuarios ADD COLUMN cep VARCHAR(20) NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE usuarios ADD COLUMN complemento VARCHAR(120) NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE produtos ADD COLUMN loja_id INT NULL");
        ExecuteSqlIgnoringKnownErrors(db, "ALTER TABLE horarios ADD COLUMN loja_id INT NULL");

        ExecuteSqlIgnoringKnownErrors(db, "UPDATE usuarios SET loja_id = id WHERE role = 'loja' AND (loja_id IS NULL OR loja_id = 0)");

        ExecuteSqlIgnoringKnownErrors(db, @"
        INSERT INTO lojas (id, nome, cor_primaria, usuario_admin_id)
        SELECT u.id, COALESCE(NULLIF(u.nome, ''), 'BookingApp'), '#0e7490', u.id
        FROM usuarios u
        LEFT JOIN lojas l ON l.id = u.loja_id
        WHERE u.role = 'loja' AND u.loja_id IS NOT NULL AND l.id IS NULL");
    }
    catch (Exception ex)
    {
        app.Logger.LogWarning(ex, "Falha ao inicializar schema do banco. API continuara em execucao.");
    }
}

app.MapControllers();

app.Run();

static void ExecuteSqlIgnoringKnownErrors(BookingContext db, string sql)
{
    try
    {
        db.Database.ExecuteSqlRaw(sql);
    }
    catch (MySqlException ex) when (
        ex.Message.Contains("Duplicate column name", StringComparison.OrdinalIgnoreCase)
        || ex.Message.Contains("already exists", StringComparison.OrdinalIgnoreCase)
        || ex.Message.Contains("doesn't exist", StringComparison.OrdinalIgnoreCase)
        || ex.Message.Contains("Unknown column", StringComparison.OrdinalIgnoreCase))
    {
        // Idempotent bootstrap: ignore schema drift errors already covered by previous runs.
    }
}
