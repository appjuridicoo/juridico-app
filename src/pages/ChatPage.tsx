"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Phone, Video, Info, Paperclip, Smile, Send, User } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@/components/SessionContextProvider';
import { User as SupabaseUser } from '@supabase/supabase-js'; // Importar o tipo User do Supabase

// Definindo tipos para os dados do chat
interface ChatUserProfile {
  id: string; // Supabase user ID
  display_name: string;
  avatar_url: string | null;
  email: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  // Adicionaremos informações do remetente para exibição
  sender_profile?: ChatUserProfile;
}

// Função auxiliar para obter detalhes do perfil de forma consistente
const getProfileDetails = (profile: ChatUserProfile | SupabaseUser | null | undefined) => {
  if (!profile) {
    return {
      displayName: 'Usuário',
      avatarUrl: "https://i.pravatar.cc/150?img=11", // Avatar padrão
    };
  }

  if ('display_name' in profile) { // É um ChatUserProfile
    return {
      displayName: profile.display_name,
      avatarUrl: profile.avatar_url || "https://i.pravatar.cc/150?img=11",
    };
  } else { // É um SupabaseUser
    return {
      displayName: profile.user_metadata?.full_name || profile.user_metadata?.display_name || 'Usuário',
      avatarUrl: profile.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=11",
    };
  }
};


const ChatPage: React.FC = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const [contacts, setContacts] = useState<ChatUserProfile[]>([]);
  const [selectedContact, setSelectedContact] = useState<ChatUserProfile | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id;

  // Função para rolar para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efeito para buscar contatos (outros usuários com perfis)
  useEffect(() => {
    if (!currentUserId) return;

    const fetchContacts = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email')
        .neq('id', currentUserId); // Exclui o próprio usuário

      if (error) {
        console.error('Erro ao buscar contatos:', error);
        toast.error('Erro ao carregar contatos.');
      } else {
        setContacts(data as ChatUserProfile[]);
      }
    };

    fetchContacts();
  }, [currentUserId]);

  // Efeito para buscar mensagens e configurar a escuta em tempo real
  useEffect(() => {
    if (!currentUserId || !selectedContact) {
      setMessages([]); // Limpa as mensagens se não houver contato selecionado
      return;
    }

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender_profile:profiles!messages_sender_id_fkey(display_name, avatar_url)
        `)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${selectedContact.id}),and(sender_id.eq.${selectedContact.id},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Erro ao buscar mensagens:', error);
        toast.error('Erro ao carregar mensagens.');
      } else {
        setMessages(data.map(msg => ({
          ...msg,
          sender_profile: msg.sender_profile ? (msg.sender_profile as ChatUserProfile) : undefined
        })) as ChatMessage[]);
        scrollToBottom();
      }
    };

    fetchMessages();

    // Configura a escuta em tempo real para novas mensagens
    const subscription = supabase
      .channel(`chat_${currentUserId}_${selectedContact.id}`) // Canal específico para a conversa
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `(sender_id=eq.${currentUserId}&receiver_id=eq.${selectedContact.id})| (sender_id=eq.${selectedContact.id}&receiver_id=eq.${currentUserId})`,
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          // Busca o perfil do remetente para a nova mensagem
          supabase.from('profiles').select('display_name, avatar_url').eq('id', newMsg.sender_id).single()
            .then(({ data: profileData, error: profileError }) => {
              if (!profileError && profileData) {
                newMsg.sender_profile = profileData as ChatUserProfile;
              }
              setMessages((prevMessages) => [...prevMessages, newMsg]);
              scrollToBottom();
            });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUserId, selectedContact]);

  // Efeito para rolar para o final quando as mensagens são carregadas/atualizadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessageContent.trim() || !currentUserId || !selectedContact) return;

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedContact.id,
      content: newMessageContent.trim(),
    });

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem.');
    } else {
      setNewMessageContent('');
      // A mensagem será adicionada via real-time subscription, então não precisamos adicionar aqui
      // toast.success('Mensagem enviada!'); // Removido para evitar toast duplicado com real-time
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isSessionLoading) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Carregando chat...</div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-full text-muted-foreground">Faça login para acessar o chat.</div>;
  }

  return (
    <div className="space-y-6 h-[calc(100vh-150px)] flex flex-col">
      <h2 className="text-3xl font-bold">Chat Interno</h2>

      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 flex-1">
        {/* Chat Sidebar */}
        <aside className="bg-card p-4 rounded-lg shadow-sm flex flex-col">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar contatos..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1">
            {filteredContacts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Nenhum contato encontrado.</p>
            ) : (
              filteredContacts.map(contact => {
                const contactDetails = getProfileDetails(contact);
                return (
                  <div
                    key={contact.id}
                    className={cn(
                      "flex items-center p-3 rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
                      selectedContact?.id === contact.id && "bg-accent text-accent-foreground"
                    )}
                    onClick={() => setSelectedContact(contact)}
                  >
                    <div className="relative mr-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={contactDetails.avatarUrl} alt={contactDetails.displayName} />
                        <AvatarFallback><User /></AvatarFallback>
                      </Avatar>
                      {/* Status online/offline mockado por enquanto */}
                      <span className={cn("absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background", "bg-green-500")} />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{contactDetails.displayName}</div>
                      <div className="text-sm text-muted-foreground truncate">{contact.email}</div>
                    </div>
                    {/* <div className="text-xs text-muted-foreground">{contact.time}</div> */}
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Chat Main */}
        <div className="bg-card rounded-lg shadow-sm flex flex-col">
          {!selectedContact ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              Selecione um contato para iniciar a conversa.
            </div>
          ) : (
            <>
              <div className="flex items-center p-4 border-b">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={getProfileDetails(selectedContact).avatarUrl} alt={getProfileDetails(selectedContact).displayName} />
                  <AvatarFallback><User /></AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="font-semibold">{getProfileDetails(selectedContact).displayName}</div>
                  <div className="text-sm text-muted-foreground">Online</div> {/* Status mockado */}
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
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10">Nenhuma mensagem nesta conversa.</div>
                ) : (
                  messages.map(message => {
                    const isSentByCurrentUser = message.sender_id === currentUserId;
                    const senderProfile = isSentByCurrentUser ? user : selectedContact;
                    const senderDetails = getProfileDetails(senderProfile); // Usar a função auxiliar aqui
                    const displayTime = new Date(message.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

                    return (
                      <div key={message.id} className={cn("flex items-start gap-3", isSentByCurrentUser && "justify-end")}>
                        {!isSentByCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={senderDetails.avatarUrl} alt={senderDetails.displayName} />
                            <AvatarFallback><User /></AvatarFallback>
                          </Avatar>
                        )}
                        <div className={cn("flex flex-col max-w-[70%]", isSentByCurrentUser && "items-end")}>
                          <div className={cn(
                            "p-3 rounded-lg",
                            isSentByCurrentUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted text-foreground rounded-bl-sm"
                          )}>
                            {message.content}
                          </div>
                          <span className={cn("text-xs mt-1", isSentByCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                            {displayTime}
                          </span>
                        </div>
                        {isSentByCurrentUser && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={senderDetails.avatarUrl} alt={senderDetails.displayName} />
                            <AvatarFallback><User /></AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} /> {/* Para rolar para o final */}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex items-center gap-2 bg-muted rounded-full px-4 py-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    className="flex-1 border-none bg-transparent focus-visible:ring-0"
                    value={newMessageContent}
                    onChange={(e) => setNewMessageContent(e.target.value)}
                    disabled={!selectedContact}
                  />
                  <Button variant="ghost" size="icon" type="button" onClick={() => toast.info("Anexar arquivo em desenvolvimento!")}>
                    <Paperclip className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button variant="ghost" size="icon" type="button" onClick={() => toast.info("Emoji em desenvolvimento!")}>
                    <Smile className="h-5 w-5 text-muted-foreground" />
                  </Button>
                  <Button size="icon" className="rounded-full" type="submit" disabled={!selectedContact || !newMessageContent.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;