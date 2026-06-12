import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabaseUser = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabaseUser.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    const { subject, description, priority, userName } = await req.json();

    // Get profile info
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("full_name, phone")
      .eq("user_id", userId)
      .single();

    const clientName = userName || profile?.full_name || "Cliente";
    const clientPhone = profile?.phone || "Não informado";

    // Escape user-controlled values to prevent HTML injection in email
    const escapeHtml = (str: unknown) =>
      String(str ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const safeSubject = escapeHtml(subject);
    const safeDescription = escapeHtml(description);
    const safeClientName = escapeHtml(clientName);
    const safeUserEmail = escapeHtml(userEmail);
    const safeClientPhone = escapeHtml(clientPhone);
    const priorityLabel = priority === "high" ? "🔴 Alta" : priority === "medium" ? "🟡 Média" : "🟢 Baixa";

    // Build email HTML
    const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#e0e0e0;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#111;border-radius:12px;padding:32px;border:1px solid #222;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#00bfff;font-size:24px;margin:0;">GamaTec.IA</h1>
      <p style="color:#888;font-size:13px;margin-top:4px;">Nova Solicitação Recebida</p>
    </div>
    <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
    <h2 style="color:#fff;font-size:18px;">${safeSubject}</h2>
    <div style="background:#0a0a0a;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;white-space:pre-line;line-height:1.6;font-size:14px;color:#ccc;">${safeDescription}</p>
    </div>
    <table style="width:100%;font-size:13px;color:#aaa;margin-top:16px;">
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">Cliente:</strong></td><td>${safeClientName}</td></tr>
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">E-mail:</strong></td><td>${safeUserEmail}</td></tr>
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">Telefone:</strong></td><td>${safeClientPhone}</td></tr>
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">Prioridade:</strong></td><td>${priorityLabel}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #222;margin:24px 0 16px;">
    <p style="font-size:11px;color:#555;text-align:center;">Este e-mail foi enviado automaticamente pela plataforma GamaTec.IA</p>
  </div>
</body>
</html>`;
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#0a0a0a;color:#e0e0e0;padding:32px;">
  <div style="max-width:600px;margin:0 auto;background:#111;border-radius:12px;padding:32px;border:1px solid #222;">
    <div style="text-align:center;margin-bottom:24px;">
      <h1 style="color:#00bfff;font-size:24px;margin:0;">GamaTec.IA</h1>
      <p style="color:#888;font-size:13px;margin-top:4px;">Nova Solicitação Recebida</p>
    </div>
    <hr style="border:none;border-top:1px solid #222;margin:16px 0;">
    <h2 style="color:#fff;font-size:18px;">${subject}</h2>
    <div style="background:#0a0a0a;border-radius:8px;padding:16px;margin:16px 0;">
      <p style="margin:0;white-space:pre-line;line-height:1.6;font-size:14px;color:#ccc;">${description}</p>
    </div>
    <table style="width:100%;font-size:13px;color:#aaa;margin-top:16px;">
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">Cliente:</strong></td><td>${clientName}</td></tr>
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">E-mail:</strong></td><td>${userEmail}</td></tr>
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">Telefone:</strong></td><td>${clientPhone}</td></tr>
      <tr><td style="padding:6px 0;"><strong style="color:#fff;">Prioridade:</strong></td><td>${priority === "high" ? "🔴 Alta" : priority === "medium" ? "🟡 Média" : "🟢 Baixa"}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #222;margin:24px 0 16px;">
    <p style="font-size:11px;color:#555;text-align:center;">Este e-mail foi enviado automaticamente pela plataforma GamaTec.IA</p>
  </div>
</body>
</html>`;

    // Send email via Supabase's built-in email (using auth.admin)
    // For now, log the notification and store it
    await supabaseAdmin.from("notifications").insert({
      user_id: userId,
      title: `Solicitação criada: ${subject}`,
      message: description.substring(0, 500),
    });

    console.log(`Ticket notification for ${userEmail}: ${subject}`);
    console.log(`Email HTML prepared for gamatec350@gmail.com`);

    return new Response(
      JSON.stringify({ success: true, message: "Notification sent" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
