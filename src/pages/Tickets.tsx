import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, Plus, Send, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  low: { label: "Baixa", color: "bg-green-500/20 text-green-400" },
  medium: { label: "Média", color: "bg-yellow-500/20 text-yellow-400" },
  high: { label: "Alta", color: "bg-red-500/20 text-red-400" },
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: "Aberto", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  in_progress: { label: "Em atendimento", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
  awaiting_client: { label: "Aguardando cliente", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  completed: { label: "Concluído", color: "bg-green-500/20 text-green-400 border-green-500/30" },
};

interface Ticket {
  id: string;
  project_id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: string;
  message: string;
  sender_id: string;
  created_at: string;
}

const Tickets = () => {
  const { user } = useAuth();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get("project");

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(!!projectFilter);
  const [newMessage, setNewMessage] = useState("");

  // New ticket form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(projectFilter || "");

  useEffect(() => {
    if (!user) return;
    fetchTickets();
    fetchProjects();
  }, [user]);

  const fetchTickets = async () => {
    const { data } = await supabase
      .from("tickets")
      .select("*")
      .order("updated_at", { ascending: false });
    setTickets((data as Ticket[]) || []);
    setLoading(false);
  };

  const fetchProjects = async () => {
    const { data } = await supabase.from("projects").select("id, title");
    setProjects((data as { id: string; title: string }[]) || []);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("ticket_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });
    setMessages((data as TicketMessage[]) || []);
  };

  const handleCreateTicket = async () => {
    if (!user || !selectedProjectId || !subject || !description) return;

    const { error } = await supabase.from("tickets").insert([{
      project_id: selectedProjectId,
      created_by: user.id,
      subject,
      description,
      priority: priority as any,
    }]);

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Solicitação criada!" });
    setShowForm(false);
    setSubject("");
    setDescription("");
    setPriority("medium");
    fetchTickets();
  };

  const handleSendMessage = async () => {
    if (!user || !selectedTicket || !newMessage.trim()) return;

    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      sender_id: user.id,
      message: newMessage.trim(),
    });

    if (error) {
      toast({ title: "Erro", description: error.message, variant: "destructive" });
      return;
    }

    setNewMessage("");
    fetchMessages(selectedTicket.id);
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    await supabase.from("tickets").update({ status: newStatus as any }).eq("id", ticketId);
    fetchTickets();
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket({ ...selectedTicket, status: newStatus });
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchMessages(ticket.id);
  };

  // Chat view
  if (selectedTicket) {
    const statusConfig = STATUS_LABELS[selectedTicket.status] || STATUS_LABELS.open;
    return (
      <DashboardLayout>
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setSelectedTicket(null)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h3 className="font-orbitron text-lg font-bold">{selectedTicket.subject}</h3>
              <p className="text-xs text-muted-foreground">{selectedTicket.description}</p>
            </div>
            <Badge variant="outline" className={statusConfig.color + " border text-xs"}>
              {statusConfig.label}
            </Badge>
          </div>

          {isAdmin && (
            <div className="flex gap-2 flex-wrap">
              {Object.entries(STATUS_LABELS).map(([key, val]) => (
                <Button
                  key={key}
                  size="sm"
                  variant={selectedTicket.status === key ? "default" : "outline"}
                  className="text-xs h-7"
                  onClick={() => handleUpdateTicketStatus(selectedTicket.id, key)}
                >
                  {val.label}
                </Button>
              ))}
            </div>
          )}

          {/* Messages */}
          <Card className="min-h-[300px] flex flex-col">
            <CardContent className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma mensagem ainda.</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.sender_id === user?.id
                          ? "bg-primary/20 text-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p>{msg.message}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(msg.created_at), "dd/MM HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <div className="border-t border-border p-3 flex gap-2">
              <Input
                placeholder="Digite sua mensagem..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="bg-background/50 text-sm"
              />
              <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-orbitron font-bold">Minhas Solicitações</h2>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2" size="sm">
            <Plus className="h-4 w-4" /> Nova Solicitação
          </Button>
        </div>

        {/* New ticket form */}
        {showForm && (
          <Card>
            <CardHeader><CardTitle className="text-base font-orbitron">Abrir Solicitação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Projeto</Label>
                <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                  <SelectTrigger className="bg-background/50"><SelectValue placeholder="Selecione o projeto" /></SelectTrigger>
                  <SelectContent>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Assunto</Label>
                <Input value={subject} onChange={(e) => setSubject(e.target.value)} className="bg-background/50 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background/50 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Prioridade</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateTicket} disabled={!selectedProjectId || !subject || !description}>
                Criar Solicitação
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tickets list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />)}
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Nenhuma solicitação encontrada.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => {
              const sc = STATUS_LABELS[ticket.status] || STATUS_LABELS.open;
              const pc = PRIORITY_LABELS[ticket.priority] || PRIORITY_LABELS.medium;
              return (
                <Card
                  key={ticket.id}
                  className="cursor-pointer hover:border-primary/30 transition-all"
                  onClick={() => openTicket(ticket)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <MessageSquare className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(ticket.updated_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge variant="outline" className={pc.color + " text-[10px] border-transparent"}>{pc.label}</Badge>
                    <Badge variant="outline" className={sc.color + " text-[10px] border"}>{sc.label}</Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Tickets;
