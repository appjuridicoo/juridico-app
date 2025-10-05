"use client";

import React from 'react';
import { Scale, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDataStorage } from '@/hooks/use-data-storage'; // Importar o hook de armazenamento

const Header: React.FC = () => {
  const { data } = useDataStorage();
  const userProfile = data.userProfile;

  return (
    <header className="flex justify-between items-center p-4 md:pl-72 border-b bg-background shadow-sm">
      <div className="flex items-center">
        <Scale className="h-8 w-8 text-primary mr-2" />
        <h1 className="text-2xl font-semibold text-foreground">Controle Jurídico</h1>
      </div>
      <div className="flex items-center space-x-3">
        <span className="font-medium text-foreground hidden sm:block">{userProfile?.displayName || 'Usuário'}</span>
        <Avatar>
          <AvatarImage src={userProfile?.avatarUrl || "https://i.pravatar.cc/150?img=12"} alt="User Avatar" />
          <AvatarFallback><User /></AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default Header;