"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Phone, Video, Info, Paperclip, Smile, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const ChatPage: React.FC = () => {
  const contacts = [
    { id: 1, name: 'Dr. João Silva', avatar: 'https://i.pravatar.cc/150?img=12', status: 'online', preview: 'Sim, já enviei a petição...', time: '10:30' },
    { id: 2, name: 'Dra. Maria Santos', avatar: 'https://i.pravatar.cc/150?img=5', status: 'away', preview: 'Podemos marcar uma reunião...', time: '09:15' },
    { id: 3, name: 'Dr. Pedro Oliveira', avatar: 'https://i.pravatar.cc/150?img=8', status: 'offline', preview: 'Obrigado pelo envio do documento', time: 'Ontem' },
    { id: 4, name: 'Ana Paula', avatar: 'https://i.pravatar.cc/150?img=3', status: 'online', preview: 'Já está agendada a audiência', time: 'Ontem' },
  ];

  const messages = [
    { id: 1, sender: 'Dr. João Silva', avatar: 'https://i.pravatar.cc/150?img=12', content: 'Bom dia! Você já conseguiu analisar o contrato que enviei ontem?', time: '09:15', type: 'received' },
    { id: 2, sender: 'Eu', avatar: 'https://i.pravatar.cc/150?img=11', content: 'Bom dia! Sim, já analisei o contrato. Há algumas cláusulas que precisam ser revisadas.', time: '09:30', type: 'sent' },
    { id: 3, sender: 'Dr. João Silva', avatar: 'https://i.pravatar.cc/150?img=12', content: 'Quais cláusulas você sugere alterar?', time: '09:32', type: 'received' },
    { id: 4, sender: 'Eu', avatar: 'https://i.pravatar.cc/150?img=11', content: 'Principalmente as cláusulas 5 e 8, que tratam sobre multa rescisória e confidencialidade. Vou preparar uma versão revisada e te envio ainda esta manhã.', time: '09:45', type: 'sent' },
    { id: 5, sender: 'Dr. João Silva', avatar: 'https://i.pravatar.cc/150?img=12', content: 'Perfeito! Fico no aguardo. O cliente precisa urgentemente deste documento.', time: '09:50', type: 'received' },
    { id: 6, sender: 'Eu', avatar: 'https://i.pravatar.cc/150?img=11', content: 'Sim, já enviei a petição para o cliente. Ele já assinou e devolveu.', time: '10:30', type: 'sent' },
  ];

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'offline': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-6 h-[calc(100vh-150px)] flex flex-col">
      <h2 className="text-3xl font-bold">Chat Interno</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 flex-1">
        {/* Chat Sidebar */}
        <aside className="bg-card p-4 rounded-lg shadow-sm flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar contatos..." className="pl-9" />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {contacts.map(contact => (
              <div
                key={contact.id}
                className={cn(
                  "flex items-center p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                  contact.id === 1 && "bg-accent text-accent-foreground" // Active contact example
                )}
                onClick={() => toast.info(`Abrindo chat com ${contact.name}`)}
              >
                <div className="relative mr-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={contact.avatar} alt={contact.name} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                  <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background", getStatusClass(contact.status))} />
                </div>
                <div className="flex-1">
                  <div className="font-medium">{contact.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{contact.preview}</div>
                </div>
                <div className="text-xs text-muted-foreground">{contact.time}</div>
              </div>
            ))}
          </div>
        </aside>

        {/* Chat Main */}
        <div className="bg-card rounded-lg shadow-sm flex flex-col">
          <div className="flex items-center p-4 border-b">
            <Avatar className="h-10 w-10 mr-4">
              <AvatarImage src="https://i.pravatar.cc/150?img=12" alt="Dr. João Silva" />
              <AvatarFallback><User /></AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-semibold">Dr. João Silva</div>
              <div className="text-sm text-muted-foreground">Online</div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" onClick={() => toast.info("Chamada de voz em desenvolvimento!")}>
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast.info("Chamada de vídeo em desenvolvimento!")}>
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast.info("Informações do contato em desenvolvimento!")}>
                <Info className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            <div className="relative text-center my-4">
              <span className="relative z-10 bg-card px-3 text-sm text-muted-foreground">Hoje</span>
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
            </div>

            {messages.map(message => (
              <div key={message.id} className={cn("flex items-start gap-3", message.type === 'sent' && "justify-end")}>
                {message.type === 'received' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.avatar} alt={message.sender} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex flex-col max-w-[70%]", message.type === 'sent' && "items-end")}>
                  <div className={cn(
                    "p-3 rounded-lg",
                    message.type === 'received' ? "bg-muted text-foreground rounded-bl-sm" : "bg-primary text-primary-foreground rounded-br-sm"
                  )}>
                    {message.content}
                  </div>
                  <span className={cn("text-xs mt-1", message.type === 'received' ? "text-muted-foreground" : "text-primary-foreground/70")}>
                    {message.time}
                  </span>
                </div>
                {message.type === 'sent' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={message.avatar} alt={message.sender} />
                    <AvatarFallback><User /></AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
          </div>

          <div className="p-4 border-t">
            <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
              <Input placeholder="Digite sua mensagem..." className="flex-1 border-none bg-transparent focus-visible:ring-0" />
              <Button variant="ghost" size="icon" onClick={() => toast.info("Anexar arquivo em desenvolvimento!")}>
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => toast.info("Emoji em desenvolvimento!")}>
                <Smile className="h-5 w-5 text-muted-foreground" />
              </Button>
              <Button size="icon" className="rounded-full" onClick={() => toast.success("Mensagem enviada!")}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;