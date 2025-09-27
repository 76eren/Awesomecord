namespace API.Services;

public static class CookieWriter
{
    public static void SetAccessToken(HttpResponse res, string token, TimeSpan lifetime)
    {
        res.Cookies.Append("access_token", token, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/",
            Expires = DateTimeOffset.UtcNow.Add(lifetime)
        });
    }

    public static void SetRefreshToken(HttpResponse res, string opaque, DateTime expiresAtUtc)
    {
        res.Cookies.Append("refresh_token", opaque, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Strict,
            Path = "/api/v1/auth",
            Expires = new DateTimeOffset(expiresAtUtc)
        });
    }

    public static void Clear(HttpResponse res)
    {
        res.Cookies.Delete("access_token", new CookieOptions { Path = "/" });
        res.Cookies.Delete("refresh_token", new CookieOptions { Path = "/api/v1/auth" });
    }
}