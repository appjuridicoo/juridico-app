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
import { useDataStorage } from '@/hooks/use-data-storage'; // Importar useDataStorage

// Definindo tipos para os dados do chat
interface SupabaseProfile {
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
  sender_profile?: SupabaseProfile;
}

// Novo tipo para um contato unificado (Supabase Profile, Local Client, Local Lawyer)
interface UnifiedContact {
  id: string; // Supabase user ID (for profiles) or a generated string (for local data)
  type: 'profile' | 'client' | 'lawyer';
  displayName: string;
  email: string;
  avatarUrl: string | null;
  originalLocalId?: number; // Para referenciar o ID original da mock data
}

// Função auxiliar para obter detalhes do perfil de forma consistente
const getProfileDetails = (contact: UnifiedContact | SupabaseUser | null | undefined) => {
  if (!contact) {
    return {
      displayName: 'Usuário',
      avatarUrl: "https://i.pravatar.cc/150?img=11", // Avatar padrão
    };
  }

  if ('type' in contact) { // É um UnifiedContact
    return {
      displayName: contact.displayName,
      avatarUrl: contact.avatarUrl || "https://i.pravatar.cc/150?img=11",
    };
  } else { // É um SupabaseUser
    return {
      displayName: contact.user_metadata?.full_name || contact.user_metadata?.display_name || 'Usuário',
      avatarUrl: contact.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=11",
    };
  }
};


const ChatPage: React.FC = () => {
  const { user, isLoading: isSessionLoading } = useSession();
  const { data: localData } = useDataStorage(); // Usar dados locais
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [selectedContact, setSelectedContact] = useState<UnifiedContact | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessageContent, setNewMessageContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id;

  // Função para rolar para o final das mensagens
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Efeito para buscar todos os contatos (perfis Supabase, clientes locais, advogados locais)
  useEffect(() => {
    if (!currentUserId) return;

    const fetchAllContacts = async () => {
      // 1. Buscar perfis Supabase (outros usuários do sistema)
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url, email')
        .neq('id', currentUserId); // Exclui o próprio usuário

      if (profilesError) {
        console.error('Erro ao buscar perfis:', profilesError);
        toast.error('Erro ao carregar perfis.');
        return;
      }

      const supabaseContacts: UnifiedContact[] = (profilesData || []).map(p => ({
        id: p.id,
        type: 'profile',
        displayName: p.display_name,
        email: p.email,
        avatarUrl: p.avatar_url,
      }));

      // 2. Buscar clientes da mock data local
      const localClients: UnifiedContact[] = localData.clients.map(c => ({
        id: `client-${c.id}`, // ID gerado para contatos locais
        type: 'client',
        displayName: c.name,
        email: c.email,
        avatarUrl: null, // Clientes não têm avatar na mock data
        originalLocalId: c.id,
      }));

      // 3. Buscar advogados da mock data local
      const localLawyers: UnifiedContact[] = localData.lawyers.map(l => ({
        id: `lawyer-${l.id}`, // ID gerado para contatos locais
        type: 'lawyer',
        displayName: l.name,
        email: l.email,
        avatarUrl: null, // Advogados não têm avatar na mock data
        originalLocalId: l.id,
      }));

      // Combinar e filtrar duplicatas (ex: se um advogado local também for um perfil Supabase)
      const combinedContactsMap = new Map<string, UnifiedContact>();

      // Adicionar perfis Supabase primeiro
      supabaseContacts.forEach(contact => combinedContactsMap.set(contact.id, contact));

      // Adicionar clientes locais, garantindo que não haja duplicatas de e-mail com perfis existentes
      localClients.forEach(localClient => {
        if (!Array.from(combinedContactsMap.values()).some(c => c.email === localClient.email)) {
          combinedContactsMap.set(localClient.id, localClient);
        }
      });

      // Adicionar advogados locais, garantindo que não haja duplicatas de e-mail com perfis existentes
      localLawyers.forEach(localLawyer => {
        if (!Array.from(combinedContactsMap.values()).some(c => c.email === localLawyer.email)) {
          combinedContactsMap.set(localLawyer.id, localLawyer);
        }
      });

      setContacts(Array.from(combinedContactsMap.values()));
    };

    fetchAllContacts();
  }, [currentUserId, localData.clients, localData.lawyers]); // Depende dos dados locais

  // Efeito para buscar mensagens e configurar a escuta em tempo real
  useEffect(() => {
    if (!currentUserId || !selectedContact) {
      setMessages([]); // Limpa as mensagens se não houver contato selecionado
      return;
    }

    // Apenas busca/escuta mensagens se o contato selecionado for um perfil Supabase real
    if (selectedContact.type !== 'profile') {
      setMessages([]); // Nenhuma mensagem para contatos que não são perfis Supabase
      toast.info(`O chat com ${selectedContact.displayName} é apenas para demonstração, pois não é um usuário registrado no sistema.`, { duration: 5000 });
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
          sender_profile: msg.sender_profile ? (msg.sender_profile as SupabaseProfile) : undefined
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
                newMsg.sender_profile = profileData as SupabaseProfile;
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

    // Verifica se o contato selecionado é um perfil Supabase real antes de enviar
    if (selectedContact.type !== 'profile') {
      toast.error(`Não é possível enviar mensagens para ${selectedContact.displayName}. O chat é funcional apenas para usuários registrados no sistema (perfis).`);
      setNewMessageContent('');
      return;
    }

    const { error } = await supabase.from('messages').insert({
      sender_id: currentUserId,
      receiver_id: selectedContact.id, // Este deve ser um UUID de auth.users
      content: newMessageContent.trim(),
    });

    if (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem.');
    } else {
      setNewMessageContent('');
      // A mensagem será adicionada via real-time subscription
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
                {messages.length === 0 && selectedContact.type === 'profile' ? (
                  <div className="text-center text-muted-foreground py-10">Nenhuma mensagem nesta conversa.</div>
                ) : messages.length === 0 && selectedContact.type !== 'profile' ? (
                  <div className="text-center text-muted-foreground py-10">
                    Este é um contato da sua base de dados local. O chat é apenas para demonstração.
                  </div>
                ) : (
                  messages.map(message => {
                    const isSentByCurrentUser = message.sender_id === currentUserId;
                    const senderProfile = isSentByCurrentUser ? user : selectedContact;
                    const senderDetails = getProfileDetails(senderProfile);
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