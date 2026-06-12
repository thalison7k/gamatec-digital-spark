import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useTheme } from "@/hooks/useTheme";
import { useSounds } from "@/components/SoundProvider";
import { useVoice } from "@/components/VoiceProvider";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Sun, Moon, Volume2, VolumeX, Mic, MicOff, User, LogOut,
  Palette, Bell, Shield, Sparkles, Gauge, Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePerformance, ResolutionScale, FpsCap } from "@/hooks/usePerformance";

const Configuracoes = () => {
  const { theme, toggleTheme } = useTheme();
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSounds();
  const { enabled: voiceEnabled, setEnabled: setVoiceEnabled, vozTipo, setVozTipo } = useVoice();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    resolution, setResolution,
    fpsCap, setFpsCap,
    showFpsCounter, setShowFpsCounter,
    currentFps,
    performanceModeManual, setPerformanceModeManual, performanceMode,
  } = usePerformance();
  const [notifications, setNotifications] = useState(
    () => localStorage.getItem("gamatec_notifications") !== "false"
  );

  const toggleNotifications = (v: boolean) => {
    setNotifications(v);
    localStorage.setItem("gamatec_notifications", String(v));
    toast({ title: v ? "Notificações ativadas" : "Notificações desativadas" });
  };

  const handleLogout = async () => {
    await signOut();
    toast({ title: "Sessão encerrada", description: "Até logo!" });
    navigate("/auth");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent p-6 md:p-8">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
          <div className="relative flex items-center gap-4">
            <div className="h-12 w-12 md:h-14 md:w-14 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-[0_0_25px_hsl(var(--primary)/0.4)]">
              <Sparkles className="h-6 w-6 md:h-7 md:w-7 text-white" />
            </div>
            <div>
              <h1 className="font-orbitron text-xl md:text-3xl font-bold text-foreground">
                Configurações
              </h1>
              <p className="text-sm md:text-base text-muted-foreground mt-1">
                Personalize sua experiência na GamaTec
              </p>
            </div>
          </div>
        </div>

        {/* Conta */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              Conta
            </CardTitle>
            <CardDescription>Suas informações de acesso</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-muted/30">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Nome</span>
              <span className="text-sm font-medium text-foreground truncate">
                {profile?.full_name || "—"}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg bg-muted/30">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Email</span>
              <span className="text-sm font-medium text-foreground truncate">{user?.email}</span>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-purple-400" />
              Aparência
            </CardTitle>
            <CardDescription>Tema e estilo visual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {theme === "dark"
                  ? <Moon className="h-5 w-5 text-blue-300" />
                  : <Sun className="h-5 w-5 text-yellow-400" />}
                <div>
                  <Label className="text-sm font-medium">Tema</Label>
                  <p className="text-xs text-muted-foreground">
                    {theme === "dark" ? "Modo Escuro ativo" : "Modo Claro ativo"}
                  </p>
                </div>
              </div>
              <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
          </CardContent>
        </Card>

        {/* Som */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Volume2 className="h-5 w-5 text-green-400" />
              Sons & Áudio
            </CardTitle>
            <CardDescription>Efeitos sonoros e ambiente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {soundEnabled
                  ? <Volume2 className="h-5 w-5 text-green-400" />
                  : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <Label className="text-sm font-medium">Efeitos Sonoros</Label>
                  <p className="text-xs text-muted-foreground">
                    Cliques, hovers e som ambiente
                  </p>
                </div>
              </div>
              <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
            </div>
          </CardContent>
        </Card>

        {/* Acessibilidade / Voz */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Mic className="h-5 w-5 text-cyan-400" />
              Acessibilidade & Voz
            </CardTitle>
            <CardDescription>Narração ao passar o mouse (TTS)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                {voiceEnabled
                  ? <Mic className="h-5 w-5 text-cyan-400" />
                  : <MicOff className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <Label className="text-sm font-medium">Voz no Hover</Label>
                  <p className="text-xs text-muted-foreground">
                    Lê elementos ao passar o mouse
                  </p>
                </div>
              </div>
              <Switch checked={voiceEnabled} onCheckedChange={setVoiceEnabled} />
            </div>

            <div className="p-4 rounded-lg bg-muted/30">
              <Label className="text-sm font-medium mb-2 block">Tipo de Voz</Label>
              <Select value={vozTipo} onValueChange={(v) => setVozTipo(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masculina">JARVIS (Masculina)</SelectItem>
                  <SelectItem value="feminina">FRIDAY (Feminina)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Gauge className="h-5 w-5 text-orange-400" />
              Performance
            </CardTitle>
            <CardDescription>
              Ajustes opcionais para reduzir lentidões na navegação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {/* Modo Performance */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20">
              <div className="flex items-center gap-3">
                <Gauge className="h-5 w-5 text-orange-400" />
                <div>
                  <Label className="text-sm font-medium">Modo Performance</Label>
                  <p className="text-xs text-muted-foreground">
                    Desliga WebGL, blurs e animações pesadas
                    {performanceMode && !performanceModeManual && (
                      <span className="ml-1 text-orange-400">
                        (ativo automaticamente pelas opções abaixo)
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Switch
                checked={performanceModeManual}
                onCheckedChange={setPerformanceModeManual}
              />
            </div>

            {/* Resolução */}
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <Gauge className="h-5 w-5 text-orange-400" />
                <div className="flex-1">
                  <Label className="text-sm font-medium">Resolução do App</Label>
                  <p className="text-xs text-muted-foreground">
                    Diminua para ganhar performance, aumente para mais detalhes
                  </p>
                </div>
              </div>
              <Select
                value={String(resolution)}
                onValueChange={(v) => setResolution(parseFloat(v) as ResolutionScale)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">50% — Máxima performance</SelectItem>
                  <SelectItem value="0.75">75% — Performance</SelectItem>
                  <SelectItem value="1">100% — Padrão (recomendado)</SelectItem>
                  <SelectItem value="1.1">110% — Maior</SelectItem>
                  <SelectItem value="1.25">125% — Acessibilidade</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Limite de FPS */}
            <div className="p-4 rounded-lg bg-muted/30">
              <div className="flex items-center gap-3 mb-2">
                <Activity className="h-5 w-5 text-orange-400" />
                <div className="flex-1">
                  <Label className="text-sm font-medium">Limite de FPS</Label>
                  <p className="text-xs text-muted-foreground">
                    Limitar a taxa de quadros economiza bateria e reduz aquecimento
                  </p>
                </div>
              </div>
              <Select
                value={String(fpsCap)}
                onValueChange={(v) => setFpsCap(parseInt(v, 10) as FpsCap)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 FPS — Economia</SelectItem>
                  <SelectItem value="45">45 FPS — Equilibrado</SelectItem>
                  <SelectItem value="60">60 FPS — Suave</SelectItem>
                  <SelectItem value="0">Ilimitado — Padrão do dispositivo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Contador de FPS */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-orange-400" />
                <div>
                  <Label className="text-sm font-medium">Contador de FPS</Label>
                  <p className="text-xs text-muted-foreground">
                    Exibe um medidor no canto superior esquerdo
                    {showFpsCounter && currentFps > 0 && (
                      <span className="ml-1 font-mono text-foreground">
                        — atual: {currentFps} FPS
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <Switch checked={showFpsCounter} onCheckedChange={setShowFpsCounter} />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-yellow-400" />
              Notificações
            </CardTitle>
            <CardDescription>Alertas do painel</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-yellow-400" />
                <div>
                  <Label className="text-sm font-medium">Notificações no painel</Label>
                  <p className="text-xs text-muted-foreground">
                    Atualizações de projetos e tickets
                  </p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={toggleNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Sessão */}
        <Card className="border-red-500/20 bg-card/60 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="h-5 w-5 text-red-400" />
              Sessão
            </CardTitle>
            <CardDescription>Encerre sua sessão neste dispositivo</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              onClick={handleLogout}
              className="w-full sm:w-auto gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sair da Conta
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Configuracoes;
