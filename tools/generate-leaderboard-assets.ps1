param(
  [string]$OutDir = "public/assets/leaderboard"
)

Add-Type -AssemblyName System.Drawing

$source = @"
using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.IO;

public static class LeaderboardAssetGenerator
{
    public static void Generate(string outDir)
    {
        Directory.CreateDirectory(outDir);
        TrophyBadge(Path.Combine(outDir, "trophy-badge.png"));
        Medal(Path.Combine(outDir, "medal-gold.png"), "#ef6f8f", "#ffd86b", "#ffb838", "#c98813", "#fff4b8", 1);
        Medal(Path.Combine(outDir, "medal-silver.png"), "#a8b0c8", "#f0f0f6", "#b8b8c8", "#8d90a0", "#ffffff", 2);
        Medal(Path.Combine(outDir, "medal-bronze.png"), "#c88566", "#ffcfa3", "#d18b5a", "#9a5c3a", "#ffe0c4", 3);
        PawStamp(Path.Combine(outDir, "paw-stamp.png"));
        CrownTag(Path.Combine(outDir, "crown-tag.png"));
        Sparkle(Path.Combine(outDir, "sparkle-a.png"), 32, -10f);
        Sparkle(Path.Combine(outDir, "sparkle-b.png"), 44, 13f);
        PaperWatermark(Path.Combine(outDir, "bg-paper-watermark.png"));
    }

    static Bitmap Canvas(int w, int h)
    {
        Bitmap bmp = new Bitmap(w, h, PixelFormat.Format32bppArgb);
        bmp.SetResolution(144, 144);
        return bmp;
    }

    static Graphics GraphicsFor(Bitmap bmp)
    {
        Graphics g = Graphics.FromImage(bmp);
        g.SmoothingMode = SmoothingMode.AntiAlias;
        g.InterpolationMode = InterpolationMode.HighQualityBicubic;
        g.PixelOffsetMode = PixelOffsetMode.HighQuality;
        g.Clear(Color.Transparent);
        return g;
    }

    static Color C(string hex, int alpha = 255)
    {
        hex = hex.TrimStart('#');
        return Color.FromArgb(alpha,
            Convert.ToInt32(hex.Substring(0, 2), 16),
            Convert.ToInt32(hex.Substring(2, 2), 16),
            Convert.ToInt32(hex.Substring(4, 2), 16));
    }

    static GraphicsPath RoundedRect(RectangleF r, float radius)
    {
        float d = radius * 2f;
        GraphicsPath p = new GraphicsPath();
        p.AddArc(r.X, r.Y, d, d, 180, 90);
        p.AddArc(r.Right - d, r.Y, d, d, 270, 90);
        p.AddArc(r.Right - d, r.Bottom - d, d, d, 0, 90);
        p.AddArc(r.X, r.Bottom - d, d, d, 90, 90);
        p.CloseFigure();
        return p;
    }

    static GraphicsPath Star(float cx, float cy, float outer, float inner, int points, float rotationDeg)
    {
        GraphicsPath p = new GraphicsPath();
        PointF[] pts = new PointF[points * 2];
        double rot = (rotationDeg - 90) * Math.PI / 180.0;
        for (int i = 0; i < pts.Length; i++)
        {
            double a = rot + i * Math.PI / points;
            float r = (i % 2 == 0) ? outer : inner;
            pts[i] = new PointF(cx + (float)Math.Cos(a) * r, cy + (float)Math.Sin(a) * r);
        }
        p.AddPolygon(pts);
        return p;
    }

    static GraphicsPath SparklePath(float cx, float cy, float r, float rotationDeg)
    {
        GraphicsPath p = new GraphicsPath();
        double rot = rotationDeg * Math.PI / 180.0;
        PointF[] pts = new PointF[8];
        float[] rs = new float[] { r, r * .22f, r * .48f, r * .2f, r, r * .22f, r * .48f, r * .2f };
        for (int i = 0; i < 8; i++)
        {
            double a = rot + (Math.PI * 2 * i / 8.0) - Math.PI / 2;
            pts[i] = new PointF(cx + (float)Math.Cos(a) * rs[i], cy + (float)Math.Sin(a) * rs[i]);
        }
        p.AddPolygon(pts);
        return p;
    }

    static void Save(Bitmap bmp, string path)
    {
        bmp.Save(path, ImageFormat.Png);
        bmp.Dispose();
    }

    static void TrophyBadge(string path)
    {
        using (Bitmap bmp = Canvas(112, 112))
        using (Graphics g = GraphicsFor(bmp))
        {
            g.TranslateTransform(56, 56);
            g.RotateTransform(-5);
            g.TranslateTransform(-56, -56);

            using (GraphicsPath shadow = RoundedRect(new RectangleF(19, 20, 76, 76), 18))
            using (SolidBrush sb = new SolidBrush(Color.FromArgb(42, 120, 60, 45)))
                g.FillPath(sb, shadow);

            using (GraphicsPath card = RoundedRect(new RectangleF(16, 14, 76, 76), 18))
            using (LinearGradientBrush fill = new LinearGradientBrush(new RectangleF(16, 14, 76, 76), C("#ffe28a"), C("#ffb838"), 90))
            using (Pen border = new Pen(Color.White, 6) { LineJoin = LineJoin.Round })
            {
                g.FillPath(fill, card);
                g.DrawPath(border, card);
            }

            using (Pen outline = new Pen(C("#9b650d"), 4) { LineJoin = LineJoin.Round, StartCap = LineCap.Round, EndCap = LineCap.Round })
            using (SolidBrush gold = new SolidBrush(C("#ffd260")))
            using (SolidBrush dark = new SolidBrush(C("#c98a16")))
            using (SolidBrush hi = new SolidBrush(Color.FromArgb(120, 255, 255, 220)))
            {
                GraphicsPath cup = new GraphicsPath();
                cup.AddBezier(37, 38, 39, 57, 44, 63, 56, 64);
                cup.AddBezier(68, 63, 73, 57, 75, 38, 37, 38);
                cup.CloseFigure();
                g.FillPath(gold, cup);
                g.DrawPath(outline, cup);

                g.DrawArc(outline, 25, 39, 24, 24, 95, 170);
                g.DrawArc(outline, 63, 39, 24, 24, -85, 170);
                g.FillRectangle(dark, 51, 64, 10, 12);
                g.DrawLine(outline, 56, 63, 56, 77);
                g.FillEllipse(gold, 43, 74, 26, 8);
                g.DrawEllipse(outline, 43, 74, 26, 8);
                g.FillPath(dark, RoundedRect(new RectangleF(35, 80, 42, 10), 5));
                g.DrawPath(outline, RoundedRect(new RectangleF(35, 80, 42, 10), 5));
                g.FillEllipse(hi, 46, 43, 10, 16);
            }

            Save((Bitmap)bmp.Clone(), path);
        }
    }

    static void Medal(string path, string ribbonHex, string medalA, string medalB, string edgeHex, string shineHex, int number)
    {
        using (Bitmap bmp = Canvas(84, 84))
        using (Graphics g = GraphicsFor(bmp))
        {
            using (SolidBrush ribbon = new SolidBrush(C(ribbonHex)))
            using (Pen ribbonLine = new Pen(C(edgeHex, 165), 3) { LineJoin = LineJoin.Round })
            {
                PointF[] left = { new PointF(29, 7), new PointF(42, 7), new PointF(42, 34), new PointF(34, 27), new PointF(27, 34) };
                PointF[] right = { new PointF(42, 7), new PointF(55, 7), new PointF(57, 34), new PointF(50, 27), new PointF(42, 34) };
                g.FillPolygon(ribbon, left);
                g.FillPolygon(ribbon, right);
                g.DrawPolygon(ribbonLine, left);
                g.DrawPolygon(ribbonLine, right);
            }

            using (SolidBrush shadow = new SolidBrush(Color.FromArgb(32, 90, 55, 45)))
                g.FillEllipse(shadow, 19, 29, 48, 48);

            using (LinearGradientBrush medal = new LinearGradientBrush(new RectangleF(17, 25, 50, 50), C(medalA), C(medalB), 90))
            using (Pen edge = new Pen(C(edgeHex), 4))
            using (Pen inner = new Pen(C(shineHex, 130), 2))
            {
                g.FillEllipse(medal, 17, 24, 50, 50);
                g.DrawEllipse(edge, 17, 24, 50, 50);
                g.DrawEllipse(inner, 24, 31, 36, 36);
            }

            using (GraphicsPath star = Star(42, 49, 11, 5, 5, 0))
            using (SolidBrush emboss = new SolidBrush(C(shineHex, 155)))
            using (Pen starLine = new Pen(C(edgeHex, 95), 1.5f) { LineJoin = LineJoin.Round })
            {
                g.FillPath(emboss, star);
                g.DrawPath(starLine, star);
            }

            Save((Bitmap)bmp.Clone(), path);
        }
    }

    static void PawStamp(string path)
    {
        using (Bitmap bmp = Canvas(48, 48))
        using (Graphics g = GraphicsFor(bmp))
        using (SolidBrush ink = new SolidBrush(C("#df6374", 205)))
        using (SolidBrush dry = new SolidBrush(C("#df6374", 52)))
        {
            g.FillEllipse(ink, 15, 23, 18, 14);
            g.FillEllipse(ink, 7, 15, 9, 11);
            g.FillEllipse(ink, 17, 8, 9, 12);
            g.FillEllipse(ink, 29, 9, 9, 12);
            g.FillEllipse(ink, 35, 17, 8, 11);
            g.FillEllipse(dry, 13, 24, 22, 15);
            g.FillEllipse(dry, 8, 16, 11, 11);
            g.FillEllipse(dry, 28, 10, 12, 12);
            Save((Bitmap)bmp.Clone(), path);
        }
    }

    static void CrownTag(string path)
    {
        using (Bitmap bmp = Canvas(64, 48))
        using (Graphics g = GraphicsFor(bmp))
        using (SolidBrush shadow = new SolidBrush(Color.FromArgb(30, 100, 55, 45)))
        using (SolidBrush fill = new SolidBrush(C("#ffb838")))
        using (Pen line = new Pen(C("#a86a12"), 3) { LineJoin = LineJoin.Round, StartCap = LineCap.Round, EndCap = LineCap.Round })
        using (SolidBrush gem = new SolidBrush(C("#ef6f8f")))
        {
            PointF[] pts = {
                new PointF(8, 35), new PointF(13, 14), new PointF(25, 28),
                new PointF(32, 8), new PointF(39, 28), new PointF(51, 14),
                new PointF(56, 35)
            };
            PointF[] sh = {
                new PointF(10, 37), new PointF(15, 16), new PointF(27, 30),
                new PointF(34, 10), new PointF(41, 30), new PointF(53, 16),
                new PointF(58, 37)
            };
            g.FillPolygon(shadow, sh);
            g.FillPolygon(fill, pts);
            g.DrawPolygon(line, pts);
            g.DrawLine(line, 10, 35, 54, 35);
            g.FillEllipse(gem, 29, 26, 7, 7);
            Save((Bitmap)bmp.Clone(), path);
        }
    }

    static void Sparkle(string path, int size, float angle)
    {
        using (Bitmap bmp = Canvas(size, size))
        using (Graphics g = GraphicsFor(bmp))
        using (GraphicsPath halo = SparklePath(size / 2f, size / 2f, size * .42f, angle))
        using (GraphicsPath star = SparklePath(size / 2f, size / 2f, size * .33f, angle))
        using (SolidBrush haloBrush = new SolidBrush(C("#fffaf2", 150)))
        using (SolidBrush fill = new SolidBrush(C("#ffd86b")))
        using (Pen line = new Pen(C("#d99a1d", 1 == 1 ? 190 : 255), Math.Max(1.2f, size / 18f)) { LineJoin = LineJoin.Round })
        {
            g.FillPath(haloBrush, halo);
            g.FillPath(fill, star);
            g.DrawPath(line, star);
            Save((Bitmap)bmp.Clone(), path);
        }
    }

    static void DrawTinyPaw(Graphics g, float x, float y, float s, float rot, Brush b)
    {
        GraphicsState st = g.Save();
        g.TranslateTransform(x, y);
        g.RotateTransform(rot);
        g.ScaleTransform(s, s);
        g.FillEllipse(b, -8, 2, 16, 12);
        g.FillEllipse(b, -16, -8, 8, 10);
        g.FillEllipse(b, -6, -16, 8, 10);
        g.FillEllipse(b, 5, -16, 8, 10);
        g.FillEllipse(b, 12, -7, 8, 10);
        g.Restore(st);
    }

    static void DrawTinyMedal(Graphics g, float x, float y, float s, float rot, Pen p, Brush b)
    {
        GraphicsState st = g.Save();
        g.TranslateTransform(x, y);
        g.RotateTransform(rot);
        g.ScaleTransform(s, s);
        g.DrawLine(p, -5, -16, 0, -6);
        g.DrawLine(p, 5, -16, 0, -6);
        g.FillEllipse(b, -11, -7, 22, 22);
        g.DrawEllipse(p, -11, -7, 22, 22);
        using (GraphicsPath sp = Star(0, 4, 5, 2, 5, 0))
            g.FillPath(b, sp);
        g.Restore(st);
    }

    static void DrawTinySparkle(Graphics g, float x, float y, float s, float rot, Brush b)
    {
        using (GraphicsPath sp = SparklePath(x, y, s, rot))
            g.FillPath(b, sp);
    }

    static void PaperWatermark(string path)
    {
        using (Bitmap bmp = Canvas(1600, 1200))
        using (Graphics g = GraphicsFor(bmp))
        using (SolidBrush ink = new SolidBrush(C("#df6374", 31)))
        using (Pen pen = new Pen(C("#df6374", 31), 7) { LineJoin = LineJoin.Round, StartCap = LineCap.Round, EndCap = LineCap.Round })
        {
            DrawTinyPaw(g, 350, 280, 2.7f, -18, ink);
            DrawTinyPaw(g, 760, 210, 2.1f, 24, ink);
            DrawTinyPaw(g, 1130, 345, 2.5f, -34, ink);
            DrawTinyPaw(g, 520, 780, 2.4f, 12, ink);
            DrawTinyPaw(g, 980, 890, 2.8f, -8, ink);
            DrawTinyPaw(g, 1270, 720, 1.9f, 28, ink);
            DrawTinyMedal(g, 420, 520, 2.4f, 18, pen, ink);
            DrawTinyMedal(g, 890, 470, 2.2f, -22, pen, ink);
            DrawTinyMedal(g, 1180, 955, 2.1f, 10, pen, ink);
            DrawTinySparkle(g, 610, 350, 38, 8, ink);
            DrawTinySparkle(g, 1030, 250, 26, -15, ink);
            DrawTinySparkle(g, 300, 920, 30, 20, ink);
            DrawTinySparkle(g, 760, 650, 34, -30, ink);
            DrawTinySparkle(g, 1320, 480, 29, 12, ink);
            DrawTinySparkle(g, 1080, 700, 22, 34, ink);
            Save((Bitmap)bmp.Clone(), path);
        }
    }
}
"@

Add-Type -TypeDefinition $source -ReferencedAssemblies System.Drawing

$resolvedOutDir = Join-Path (Get-Location) $OutDir
[LeaderboardAssetGenerator]::Generate($resolvedOutDir)
Get-ChildItem -LiteralPath $resolvedOutDir | Sort-Object Name | Select-Object Name, Length
