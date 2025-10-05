"use client";

import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Scale } from 'lucide-react';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <Scale className="h-12 w-12 text-primary mb-4" />
          <h2 className="text-3xl font-bold text-center text-foreground">
            Bem-vindo ao Controle Jurídico
          </h2>
          <p className="text-muted-foreground text-center mt-2">
            Faça login para acessar sua plataforma.
          </p>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-lg border">
          <Auth
            supabaseClient={supabase}
            providers={[]} // Removido provedores de terceiros para simplificar
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: 'hsl(var(--primary))',
                    brandAccent: 'hsl(var(--primary-foreground))',
                    inputBackground: 'hsl(var(--input))',
                    inputBorder: 'hsl(var(--border))',
                    inputBorderHover: 'hsl(var(--ring))',
                    inputBorderFocus: 'hsl(var(--ring))',
                    inputText: 'hsl(var(--foreground))',
                    messageText: 'hsl(var(--foreground))',
                    messageBackground: 'hsl(var(--muted))',
                    anchorTextColor: 'hsl(var(--primary))',
                    anchorTextHoverColor: 'hsl(var(--primary-foreground))',
                  },
                },
              },
            }}
            theme="light" // Usando tema claro, pode ser ajustado para 'dark' ou dinâmico
            redirectTo={window.location.origin + '/'} // Redireciona para a raiz após o login
            localization={{
              variables: {
                sign_in: {
                  email_label: 'Endereço de e-mail',
                  password_label: 'Sua senha',
                  email_input_placeholder: 'Seu endereço de e-mail',
                  password_input_placeholder: 'Sua senha',
                  button_label: 'Entrar',
                  link_text: 'Já tem uma conta? Entrar',
                },
                forgotten_password: {
                  link_text: 'Esqueceu sua senha?',
                },
                sign_up: {
                  email_label: 'Endereço de e-mail',
                  password_label: 'Criar uma senha',
                  email_input_placeholder: 'Seu endereço de e-mail',
                  password_input_placeholder: 'Crie sua senha',
                  button_label: 'Cadastrar',
                  link_text: 'Não tem uma conta? Cadastre-se',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Login;