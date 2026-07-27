import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { ThemeLogo } from "@/components/ThemeLogo";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Backgrounds pesados (GIFs ~10MB cada) são carregados de forma adiada
  // após o primeiro paint e ignorados em telas pequenas / conexões lentas.
  const [bgUrls, setBgUrls] = useState<{ login?: string; form?: string }>({});
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const conn = (navigator as any).connection;
    const saveData = conn?.saveData === true;
    const slowNet = conn && ["slow-2g", "2g", "3g"].includes(conn.effectiveType);
    if (isMobile || saveData || slowNet) return;

    const idle = (cb: () => void) =>
      (window as any).requestIdleCallback
        ? (window as any).requestIdleCallback(cb, { timeout: 2000 })
        : setTimeout(cb, 600);

    idle(async () => {
      const [login, form] = await Promise.all([
        import("@/assets/login-background.gif"),
        import("@/assets/form-background.gif"),
      ]);
      setBgUrls({ login: login.default, form: form.default });
    });
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Login realizado com sucesso!", description: "Bem-vindo de volta à GamaTec.IA" });
        navigate("/site");
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: name } },
        });
        if (error) throw error;
        // Se não há sessão, o projeto exige confirmação por email — não redireciona.
        if (!data.session) {
          toast({
            title: "Confirme seu email",
            description: "Enviamos um link de confirmação para " + email + ". Abra sua caixa de entrada (e o spam) para ativar a conta.",
          });
          setIsLogin(true);
          setPassword("");
        } else {
          toast({ title: "Conta criada com sucesso!", description: "Você já pode acessar o conteúdo exclusivo." });
          navigate("/site");
        }
      }
    } catch (error: any) {
      const raw = (error?.message || "").toString();
      const code = (error?.code || error?.error_code || "").toString();
      let errorMessage = "Ocorreu um erro. Tente novamente.";
      if (code === "invalid_credentials" || raw.includes("Invalid login credentials")) {
        errorMessage = "Email ou senha incorretos.";
      } else if (code === "email_not_confirmed" || raw.includes("Email not confirmed")) {
        errorMessage = "Confirme seu email antes de entrar. Verifique sua caixa de entrada e o spam.";
      } else if (code === "user_already_exists" || raw.includes("User already registered") || raw.includes("already registered")) {
        errorMessage = "Este email já está cadastrado. Faça login ou recupere sua senha.";
      } else if (code === "weak_password" || raw.toLowerCase().includes("weak") || raw.toLowerCase().includes("pwned")) {
        errorMessage = "Essa senha é muito comum ou já foi vazada. Use uma senha mais forte (mistura de letras, números e símbolos, com pelo menos 8 caracteres).";
      } else if (raw.includes("Password should be at least")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (code === "over_email_send_rate_limit" || raw.includes("rate limit")) {
        errorMessage = "Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente novamente.";
      } else if (code === "signup_disabled") {
        errorMessage = "Novos cadastros estão temporariamente desativados.";
      } else if (raw.includes("Invalid email") || raw.includes("valid email")) {
        errorMessage = "Email inválido. Verifique e tente novamente.";
      } else if (raw) {
        errorMessage = raw;
      }
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({ title: "Informe seu email", description: "Digite o email da sua conta antes de solicitar a recuperação.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;
      toast({ title: "Email enviado", description: "Se este email estiver cadastrado, você receberá um link para redefinir a senha." });
    } catch (error: any) {
      toast({ title: "Erro", description: error?.message || "Não foi possível enviar o email.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background — gradient inicial; GIF é injetado depois do paint */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-700"
        style={
          bgUrls.login
            ? { backgroundImage: `url(${bgUrls.login})`, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }
            : { background: "radial-gradient(circle at 50% 30%, hsl(var(--primary) / 0.18), hsl(var(--background)) 70%)" }
        } />
      <div className="absolute inset-0 bg-background/30 z-0" />
      
      {/* Floating particles (memoizado para não recriar a cada render) */}
      <Particles />


      <div className="relative w-full max-w-sm z-10 opacity-0 animate-hero-entrance" style={{ animationDelay: "0.2s" }}>
        <div className="relative rounded-xl p-6 shadow-2xl border border-border/30 overflow-hidden shimmer"
          style={bgUrls.form ? { backgroundImage: `url(${bgUrls.form})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}>
          <div className="absolute inset-0 bg-card/85 backdrop-blur-sm" />
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <ThemeLogo alt="GamaTec.IA" className="h-14 w-auto animate-float-gentle" />
            </div>

            <h1 className="text-lg font-bold text-center mb-1 font-orbitron text-foreground">
              {isLogin ? "Bem-vindo" : "Crie sua conta"}
            </h1>
            <p className="text-muted-foreground text-center mb-4 text-sm">
              {isLogin ? "Entre para acessar o conteúdo" : "Cadastre-se para ter acesso"}
            </p>

            <form onSubmit={handleAuth} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-foreground text-sm">Nome</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="name" type="text" placeholder="Seu nome" value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 h-9 text-sm bg-background/50 border-border/50 focus:border-primary transition-all duration-300 focus:shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                      required={!isLogin} />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label htmlFor="email" className="text-foreground text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="seu@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-sm bg-background/50 border-border/50 focus:border-primary transition-all duration-300 focus:shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                    required />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="password" className="text-foreground text-sm">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-9 text-sm bg-background/50 border-border/50 focus:border-primary transition-all duration-300 focus:shadow-[0_0_15px_hsl(var(--primary)/0.2)]"
                    required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 hover:shadow-[0_0_25px_hsl(var(--primary)/0.4)] transition-all duration-300"
                disabled={loading}>
                {loading ? "..." : isLogin ? "Entrar" : "Criar conta"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-muted-foreground text-xs">
                {isLogin ? "Não tem conta?" : "Já tem conta?"}
                <button type="button" onClick={() => setIsLogin(!isLogin)}
                  className="ml-1 text-primary hover:underline font-semibold transition-colors">
                  {isLogin ? "Cadastre-se" : "Login"}
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate("/")}
            className="text-muted-foreground hover:text-foreground transition-all duration-300 text-xs hover:translate-x-[-4px] inline-block">
            ← Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

// Partículas geradas uma única vez (fora do componente Auth) para que a
// digitação no formulário não cause re-render com novos Math.random.
const PARTICLES = Array.from({ length: 8 }).map(() => ({
  width: Math.random() * 3 + 2,
  height: Math.random() * 3 + 2,
  left: Math.random() * 100,
  duration: Math.random() * 10 + 8,
  delay: Math.random() * 5,
}));
const Particles = () => (
  <>
    {PARTICLES.map((p, i) => (
      <div
        key={i}
        className="particle bg-primary/20"
        style={{
          width: `${p.width}px`,
          height: `${p.height}px`,
          left: `${p.left}%`,
          bottom: "-10px",
          animationDuration: `${p.duration}s`,
          animationDelay: `${p.delay}s`,
          willChange: "transform",
        }}
      />
    ))}
  </>
);

export default Auth;
