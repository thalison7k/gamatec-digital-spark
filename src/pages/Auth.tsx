import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import gamatecLogo from "@/assets/gamatec-logo.png";
import loginBackground from "@/assets/login-background.gif";
import formBackground from "@/assets/form-background.gif";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Login realizado com sucesso!", description: "Bem-vindo de volta à GamaTec.IA" });
        navigate("/");
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { full_name: name } },
        });
        if (error) throw error;
        toast({ title: "Conta criada com sucesso!", description: "Você já pode acessar o conteúdo exclusivo." });
        navigate("/");
      }
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro. Tente novamente.";
      if (error.message.includes("Invalid login credentials")) errorMessage = "Email ou senha incorretos.";
      else if (error.message.includes("User already registered")) errorMessage = "Este email já está cadastrado.";
      else if (error.message.includes("Password should be at least")) errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      toast({ title: "Erro", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0"
        style={{ backgroundImage: `url(${loginBackground})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }} />
      <div className="absolute inset-0 bg-background/30 z-0" />
      
      {/* Floating particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="particle bg-primary/20"
          style={{
            width: `${Math.random() * 3 + 2}px`, height: `${Math.random() * 3 + 2}px`,
            left: `${Math.random() * 100}%`, bottom: '-10px',
            animationDuration: `${Math.random() * 10 + 8}s`, animationDelay: `${Math.random() * 5}s`,
          }} />
      ))}

      <div className="relative w-full max-w-sm z-10 opacity-0 animate-hero-entrance" style={{ animationDelay: "0.2s" }}>
        <div className="relative rounded-xl p-6 shadow-2xl border border-border/30 overflow-hidden shimmer"
          style={{ backgroundImage: `url(${formBackground})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
          <div className="absolute inset-0 bg-card/85 backdrop-blur-sm" />
          
          <div className="relative z-10">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <img src={gamatecLogo} alt="GamaTec.IA" className="h-14 w-auto animate-float-gentle" />
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

export default Auth;
