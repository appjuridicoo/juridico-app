"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Adicionado importação do Label
import { Search, Gavel, Calendar, Tag, Eye, Link, Download } from 'lucide-react';
import { toast } from 'sonner';

const ResearchPage: React.FC = () => {
  const jurisSearchUrlMap: { [key: string]: string } = {
    stf: 'https://jurisprudencia.stf.jus.br/pages/search?base=acordaos&sinonimo=true&plural=true&page=1&sort=_score&direction=desc&classe=all&q=',
    stj: 'https://scon.stj.jus.br/SCON/pesquisar.jsp?livre=',
    tst: 'https://jurisprudencia.tst.jus.br/#',
    default: 'https://scholar.google.com.br/scholar?hl=pt-BR&as_sdt=6&q=jurisprudencia+'
  };

  const handleJurisSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchTerm = (document.getElementById('research-term-input') as HTMLInputElement).value.trim();
    const tribunalValue = (document.getElementById('research-tribunal-select') as HTMLSelectElement).value;

    if (!searchTerm) {
      toast.error('Por favor, digite um termo para a pesquisa.');
      return;
    }

    const encodedSearchTerm = encodeURIComponent(searchTerm);
    let targetUrl;

    if (tribunalValue && jurisSearchUrlMap[tribunalValue]) {
      if (tribunalValue === 'tst') {
        toast.info('A busca no TST deve ser feita diretamente no site. Copie o termo e cole na página que será aberta.');
        targetUrl = jurisSearchUrlMap.tst;
      } else {
        targetUrl = `${jurisSearchUrlMap[tribunalValue]}${encodedSearchTerm}`;
      }
    } else {
      targetUrl = `${jurisSearchUrlMap.default}${encodedSearchTerm}`;
    }
    window.open(targetUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Pesquisa de Jurisprudência</h2>
      <p className="text-muted-foreground">Pesquise por decisões judiciais e jurisprudência em todos os tribunais.</p>

      <form onSubmit={handleJurisSearch} className="space-y-4 bg-card p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="research-term-input"
              placeholder="Digite os termos para pesquisa..."
              className="pl-9"
              required
            />
          </div>
          <Select defaultValue="" name="research-tribunal-select">
            <SelectTrigger id="research-tribunal-select" className="w-full md:w-[200px]">
              <SelectValue placeholder="Todos os Tribunais" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Todos os Tribunais</SelectItem>
              <SelectItem value="stf">Supremo Tribunal Federal</SelectItem>
              <SelectItem value="stj">Superior Tribunal de Justiça</SelectItem>
              <SelectItem value="tst">Tribunal Superior do Trabalho</SelectItem>
              <SelectItem value="tse">Tribunal Superior Eleitoral</SelectItem>
              <SelectItem value="stm">Superior Tribunal Militar</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" className="w-full md:w-auto">Pesquisar</Button>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <Checkbox id="filterDecisions" />
            <label htmlFor="filterDecisions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Decisões Monocráticas
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filterAcordaos" />
            <label htmlFor="filterAcordaos" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Acórdãos
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filterSumulas" defaultChecked />
            <label htmlFor="filterSumulas" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Súmulas
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="filterRecent" />
            <label htmlFor="filterRecent" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Últimos 5 anos
            </label>
          </div>
        </div>
      </form>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Resultados da pesquisa aparecerão aqui.</span>
          <div className="flex items-center gap-2">
            <Label>Ordenar por:</Label>
            <Select defaultValue="date">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Data (mais recente)</SelectItem>
                <SelectItem value="relevance">Relevância</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-4">
          {/* Exemplo de item de resultado */}
          <div className="bg-card p-4 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-2">Título da Jurisprudência de Exemplo</h3>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground mb-3">
              <span className="flex items-center"><Gavel className="h-4 w-4 mr-1" /> Tribunal de Exemplo</span>
              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> 01/01/2023</span>
              <span className="flex items-center"><Tag className="h-4 w-4 mr-1" /> Acórdão</span>
            </div>
            <p className="mb-3 text-sm">
              Este é um trecho do resultado da pesquisa de jurisprudência, mostrando a relevância do caso para os termos buscados...
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info("Visualizar jurisprudência em desenvolvimento!")}>
                <Eye className="h-4 w-4 mr-2" /> Visualizar
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Vincular ao processo em desenvolvimento!")}>
                <Link className="h-4 w-4 mr-2" /> Vincular ao Processo
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info("Baixar documento em desenvolvimento!")}>
                <Download className="h-4 w-4 mr-2" /> Baixar
              </Button>
            </div>
          </div>
          {/* Mais itens de resultado aqui */}
        </div>
      </div>
    </div>
  );
};

export default ResearchPage;