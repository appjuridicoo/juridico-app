"use client";

import React from 'react';
import { Scale, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDataStorage } from '@/hooks/use-data-storage';
import { useSession } from '@/components/SessionContextProvider'; // Import useSession

// Função auxiliar para obter detalhes do usuário para o cabeçalho
const getHeaderUserDetails = (supabaseUser: any, localProfile: any) => {
  if (supabaseUser) {
    return {
      displayName: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.display_name || 'Usuário',
      avatarUrl: supabaseUser.user_metadata?.avatar_url || "https://i.pravatar.cc/150?img=12",
    };
  }
  if (localProfile) {
    return {
      displayName: localProfile.displayName || 'Usuário',
      avatarUrl: localProfile.avatarUrl || "https://i.pravatar.cc/150?img=12",
    };
  }
  return {
    displayName: 'Usuário',
    avatarUrl: "https://i.pravatar.cc/150?img=12",
  };
};

const Header: React.FC = () => {
  const { data } = useDataStorage(); // Para fallback do perfil local
  const { user: supabaseUser } = useSession(); // Obtém o usuário do Supabase

  const userDetails = getHeaderUserDetails(supabaseUser, data.userProfile);

  return (
    <header className="flex justify-between items-center p-4 md:pl-72 border-b bg-background shadow-sm">
      <div className="flex items-center">
        <Scale className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-semibold text-foreground">Controle Jurídico</h1>
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-medium text-foreground hidden sm:block">{userDetails.displayName}</span>
        <Avatar>
          <AvatarImage src={userDetails.avatarUrl} alt="User Avatar" />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;