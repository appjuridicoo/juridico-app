"use client";

import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Phone, MapPin, BookOpen, Lightbulb, LifeBuoy, Info } from 'lucide-react';

const HelpPage: React.FC = () => {
  return (
    <div className="space-y-8 p-4 md:p-6">
      <h2 className="text-4xl font-bold text-foreground mb-6">Central de Ajuda</h2>
      <p className="text-lg text-muted-foreground">Encontre respostas para suas dúvidas e guias para usar o Controle Jurídico.</p>

      {/* Guia de Primeiros Passos */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <BookOpen className="h-6 w-6 text-primary" /> Guia de Primeiros Passos
          </CardTitle>
          <CardDescription>Comece a usar o sistema de forma rápida e eficiente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Bem-vindo(a) ao Controle Jurídico! Para começar, siga estes passos:</p>
          <ol className="list-decimal list-inside space-y-2 pl-4">
            <li><strong>Configure seu Perfil:</strong> Vá em <span className="font-semibold text-foreground">Configurações &gt; Meu Perfil</span> para atualizar suas informações, OAB e foto.</li>
            <li><strong>Selecione um Diretório de Salvamento:</strong> Na <span className="font-semibold text-foreground">Dashboard</span>, clique em "Selecionar Diretório" para escolher onde seus dados serão salvos localmente.</li>
            <li><strong>Adicione Clientes:</strong> Acesse <span className="font-semibold text-foreground">Clientes</span> e use o botão "Novo Cliente" para cadastrar seus primeiros clientes.</li>
            <li><strong>Crie Processos:</strong> Em <span className="font-semibold text-foreground">Processos</span>, adicione os casos jurídicos, vinculando-os aos clientes e advogados responsáveis.</li>
            <li><strong>Gerencie sua Agenda:</strong> Utilize a página <span className="font-semibold text-foreground">Agenda</span> para adicionar compromissos, prazos e audiências.</li>
          </ol>
          <p>Lembre-se de clicar em "Salvar Dados" na Dashboard regularmente para garantir que suas informações estejam seguras no diretório escolhido.</p>
        </CardContent>
      </Card>

      {/* Perguntas Frequentes */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Info className="h-6 w-6 text-primary" /> Perguntas Frequentes (FAQ)
          </CardTitle>
          <CardDescription>Encontre respostas rápidas para as dúvidas mais comuns.</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Onde meus dados são salvos?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Seus dados são salvos localmente no seu navegador por padrão. Se você selecionar um diretório na Dashboard, eles serão salvos diretamente nesse diretório no seu computador, utilizando a API File System Access.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Como faço backup dos meus dados?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Se você selecionou um diretório, seus dados já estão sendo salvos diretamente lá. Você pode simplesmente copiar a pasta do diretório para fazer um backup. Se estiver usando o armazenamento local do navegador, você pode clicar em "Salvar Dados" na Dashboard para forçar um salvamento e, em seguida, copiar os arquivos gerados no diretório.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Posso acessar meus dados de outro computador?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Atualmente, o sistema é projetado para funcionar localmente. Para acessar de outro computador, você precisaria transferir o diretório de dados salvo manualmente. Não há sincronização em nuvem integrada neste momento.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Como adiciono um novo advogado?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Vá para <span className="font-semibold text-foreground">Configurações &gt; Gestão de Advogados</span> e clique no botão "Novo Advogado".
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>O que é o Portal do Cliente?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                O Portal do Cliente permite que você gere acessos individuais para seus clientes, para que eles possam acompanhar o andamento dos processos vinculados a eles de forma autônoma.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Dicas e Melhores Práticas */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Lightbulb className="h-6 w-6 text-primary" /> Dicas e Melhores Práticas
          </CardTitle>
          <CardDescription>Otimize seu uso do sistema com estas sugestões.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li><strong>Organize seus Documentos:</strong> Crie pastas lógicas na seção de Documentos para manter seus arquivos bem organizados por cliente, processo ou tipo.</li>
            <li><strong>Use os Filtros:</strong> Aproveite os filtros de pesquisa em Clientes, Processos e Financeiro para encontrar rapidamente as informações que você precisa.</li>
            <li><strong>Mantenha a Agenda Atualizada:</strong> Registre todos os prazos, audiências e reuniões na Agenda para não perder nenhum compromisso importante.</li>
            <li><strong>Revise Lançamentos Financeiros:</strong> Verifique regularmente seus lançamentos financeiros para garantir que todas as receitas e despesas estejam corretas e atualizadas.</li>
          </ul>
        </CardContent>
      </Card>

      {/* Suporte e Contato */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <LifeBuoy className="h-6 w-6 text-primary" /> Suporte e Contato
          </CardTitle>
          <CardDescription>Precisa de mais ajuda? Entre em contato conosco.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-muted-foreground">
          <p>Se você não encontrou a resposta para sua pergunta, por favor, entre em contato com nossa equipe de suporte:</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <span>Email: <a href="mailto:suporte@controlejuridico.com" className="text-blue-600 hover:underline dark:text-blue-400">suporte@controlejuridico.com</a></span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <span>Telefone: (XX) XXXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <span>Endereço: Rua Exemplo, 123, Cidade, Estado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HelpPage;