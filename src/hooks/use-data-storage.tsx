"use client";

import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { toast } from 'sonner';

// --- Tipos de Dados ---
export interface Client {
  id: number;
  type: 'person' | 'company';
  name: string;
  contact?: string;
  document: string;
  email: string;
  phone: string;
  status: 'ativo' | 'inativo' | 'pendente';
  address?: string;
  notes?: string;
}

export interface Process {
  id: number;
  number: string;
  client: string; // Nome do cliente
  opposingParty: string;
  type: string;
  status: 'active' | 'suspended' | 'archived' | 'extinct';
  responsible: string; // Nome do advogado
  lastUpdate: string; // YYYY-MM-DD
}

export interface Lawyer {
  id: number;
  name: string;
  oab: string;
  email: string;
  phone: string;
  status: 'ativo' | 'inativo';
}

export interface UserProfile {
  displayName: string;
  fullName: string;
  email: string;
  phone: string;
  oab: string;
  oabState: string;
  bio: string;
  avatarUrl: string | null;
}

export interface FinancialItem {
  id: number;
  type: 'revenue' | 'expense';
  clientId: number | null; // ID do cliente, null para despesas internas
  description: string;
  value: number;
  dueDate: string; // YYYY-MM-DD
  paymentDate: string | null; // YYYY-MM-DD
  status: 'paid' | 'pending' | 'overdue';
  installment: { current: number; total: number };
  installmentGroupId: number;
  notes?: string;
}

export interface DocumentItem {
  id: number;
  type: 'folder' | 'file';
  name: string;
  date?: string; // YYYY-MM-DD
  size?: number; // Em bytes
  count?: number; // Para pastas
}

export interface AppData {
  clients: Client[];
  processes: Process[];
  lawyers: Lawyer[];
  userProfile: UserProfile;
  financials: FinancialItem[];
  documents: DocumentItem[];
}

// --- Dados Iniciais ---
const getInitialClientsData = (): Client[] => [
  { id: 1, type: 'company', name: 'Empresa XYZ Ltda.', contact: 'Carlos Pereira', document: '12.345.678/0001-99', email: 'contato@xyz.com', phone: '(11) 98765-4321', status: 'ativo' },
  { id: 2, type: 'company', name: 'Silva & Santos Advogados', contact: 'Dra. Ana Silva', document: '98.765.432/0001-11', email: 'ana.silva@ssadv.com', phone: '(21) 91234-5678', status: 'ativo' },
  { id: 3, type: 'person', name: 'Mariana Costa', contact: 'Mariana Costa', document: '123.456.789-00', email: 'mariana.costa@email.com', phone: '(31) 95555-4444', status: 'inativo' },
  { id: 4, type: 'company', name: 'Comércio LTDA', contact: 'Ricardo Mendes', document: '45.678.912/0001-33', email: 'ricardo@comercio.com', phone: '(41) 93333-2222', status: 'pendente' }
];

const getInitialProcessesData = (): Process[] => [
  { id: 1, number: '12345/2023', client: 'Empresa XYZ Ltda.', opposingParty: 'Empresa ABC Ltda.', type: 'Cível', status: 'active', responsible: 'Dr. João Silva', lastUpdate: '2023-10-25' },
  { id: 2, number: '67890/2023', client: 'Silva & Santos Advogados', opposingParty: 'João das Neves', type: 'Trabalhista', status: 'active', responsible: 'Dra. Maria Santos', lastUpdate: '2023-10-24' },
  { id: 3, number: '54321/2023', client: 'Mariana Costa', opposingParty: 'Estado de São Paulo', type: 'Criminal', status: 'suspended', responsible: 'Dr. Pedro Oliveira', lastUpdate: '2023-10-20' },
  { id: 4, number: '98765/2023', client: 'Comércio LTDA', opposingParty: 'Fisco Municipal', type: 'Tributário', status: 'archived', responsible: 'Dr. João Silva', lastUpdate: '2023-10-15' }
];

const getInitialLawyersData = (): Lawyer[] => [
  { id: 1, name: 'Dr. João Silva', oab: '123.456', email: 'joao.silva@adv.com', phone: '(11) 99999-0001', status: 'ativo' },
  { id: 2, name: 'Dra. Maria Santos', oab: '789.012', email: 'maria.santos@adv.com', phone: '(11) 99999-0002', status: 'ativo' },
  { id: 3, name: 'Dr. Pedro Oliveira', oab: '345.678', email: 'pedro.oliveira@adv.com', phone: '(11) 99999-0003', status: 'ativo' }
];

const getInitialProfileData = (): UserProfile => ({
  displayName: "Dr. João Silva",
  fullName: "João Silva",
  email: "joao.silva@controlejuridico.com",
  phone: "(11) 99999-0001",
  oab: "123.456",
  oabState: "SP",
  bio: "Advogado com 15 anos de experiência nas áreas do Direito Civil e Empresarial.",
  avatarUrl: "https://i.pravatar.cc/150?img=12"
});

const getInitialFinancialsData = (): FinancialItem[] => {
  const today = new Date();
  const currentMonth = today.toISOString().slice(0, 7); // 'AAAA-MM'
  return [
    { id: 1, type: 'revenue', clientId: 1, description: 'Honorários Iniciais - Processo 12345/2023', value: 5000, dueDate: `${currentMonth}-15`, paymentDate: `${currentMonth}-14`, status: 'paid', installment: { current: 1, total: 1 }, installmentGroupId: 1 },
    { id: 2, type: 'expense', clientId: null, description: 'Custas judiciais', value: 350.50, dueDate: `${currentMonth}-10`, paymentDate: `${currentMonth}-10`, status: 'paid', installment: { current: 1, total: 1 }, installmentGroupId: 2 },
    { id: 3, type: 'revenue', clientId: 2, description: 'Contrato de Êxito - Parcela 1', value: 1200, dueDate: `${currentMonth}-20`, paymentDate: null, status: 'pending', installment: { current: 1, total: 3 }, installmentGroupId: 3 },
    { id: 4, type: 'revenue', clientId: 2, description: 'Contrato de Êxito - Parcela 2', value: 1200, dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().slice(0, 10), paymentDate: null, status: 'pending', installment: { current: 2, total: 3 }, installmentGroupId: 3 },
    { id: 5, type: 'revenue', clientId: 2, description: 'Contrato de Êxito - Parcela 3', value: 1200, dueDate: new Date(new Date().setMonth(new Date().getMonth() + 2)).toISOString().slice(0, 10), paymentDate: null, status: 'pending', installment: { current: 3, total: 3 }, installmentGroupId: 3 },
    { id: 6, type: 'expense', clientId: null, description: 'Aluguel do escritório', value: 2500, dueDate: `${currentMonth}-05`, paymentDate: null, status: 'pending', installment: { current: 1, total: 1 }, installmentGroupId: 6 }
  ];
};

const getInitialDocumentsData = (): DocumentItem[] => [
  { id: 1, type: 'folder', name: 'Processos Ativos', count: 24 },
  { id: 2, type: 'folder', name: 'Processos Arquivados', count: 56 },
  { id: 3, type: 'folder', name: 'Modelos', count: 12 },
  { id: 4, type: 'folder', name: 'Contratos', count: 8 },
  { id: 5, type: 'file', name: 'Petição Inicial - Processo 12345-2023.pdf', date: '2023-10-25', size: 2400000 },
  { id: 6, type: 'file', name: 'Contrato de Prestação de Serviços.docx', date: '2023-10-20', size: 1200000 },
  { id: 7, type: 'file', name: 'Planilha de Honorários.xlsx', date: '2023-10-15', size: 856000 },
  { id: 8, type: 'file', name: 'Sentença - Processo 67890-2023.pdf', date: '2023-10-10', size: 3100000 },
  { id: 9, type: 'file', name: 'Notas.txt', date: '2023-10-25', size: 1024 },
  { id: 10, type: 'file', name: 'Parecer Jurídico.docx', date: '2023-10-26', size: 1500000 },
  { id: 11, type: 'file', name: 'Procuração.pdf', date: '2023-10-27', size: 500000 },
  { id: 12, type: 'folder', name: 'Documentos Fiscais', count: 5 },
  { id: 13, type: 'file', name: 'Recibo de Pagamento.pdf', date: '2023-10-28', size: 300000 },
  { id: 14, type: 'file', name: 'Relatório Mensal.pdf', date: '2023-10-29', size: 1800000 },
  { id: 15, type: 'file', name: 'Ata de Reunião.docx', date: '2023-10-30', size: 700000 },
  { id: 16, type: 'file', name: 'Certidão Negativa.pdf', date: '2023-10-31', size: 450000 },
  { id: 17, type: 'file', name: 'Contrato Social.pdf', date: '2023-11-01', size: 2100000 },
  { id: 18, type: 'file', name: 'Declaração de Hipossuficiência.docx', date: '2023-11-02', size: 300000 },
];

const initialData: AppData = {
  clients: getInitialClientsData(),
  processes: getInitialProcessesData(),
  lawyers: getInitialLawyersData(),
  userProfile: getInitialProfileData(),
  financials: getInitialFinancialsData(),
  documents: getInitialDocumentsData(),
};

interface DataStorageContextType {
  data: AppData;
  setData: React.Dispatch<React.SetStateAction<AppData>>;
  directoryHandle: FileSystemDirectoryHandle | null;
  setDirectoryHandle: React.Dispatch<React.SetStateAction<FileSystemDirectoryHandle | null>>;
  selectDirectory: () => Promise<void>;
  saveData: () => Promise<void>;
  storagePath: string;
}

const DataStorageContext = createContext<DataStorageContextType | undefined>(undefined);

export const DataStorageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<AppData>(initialData);
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [storagePath, setStoragePath] = useState<string>('Não selecionado (usando armazenamento local do navegador)');

  const loadDataFromLocalStorage = useCallback(() => {
    const loadItem = <T,>(key: string, fallbackData: () => T): T => {
      try {
        const item = localStorage.getItem(key);
        console.log(`[DataStorage] Loading ${key} from localStorage:`, item ? 'Found' : 'Not found', item);
        return item ? JSON.parse(item) : fallbackData();
      } catch (error) {
        console.error(`[DataStorage] Erro ao carregar ${key} do localStorage:`, error);
        return fallbackData();
      }
    };

    setData({
      clients: loadItem('juridico_clients', getInitialClientsData),
      processes: loadItem('juridico_processes', getInitialProcessesData),
      lawyers: loadItem('juridico_lawyers', getInitialLawyersData),
      userProfile: loadItem('juridico_userProfile', getInitialProfileData),
      financials: loadItem('juridico_financials', getInitialFinancialsData),
      documents: loadItem('juridico_documents', getInitialDocumentsData),
    });
    setStoragePath('Armazenamento local do navegador');
  }, []);

  const loadDataFromDirectory = useCallback(async () => {
    if (!directoryHandle) {
      loadDataFromLocalStorage();
      return;
    }

    const loadFile = async <T,>(fileName: string, fallbackData: () => T): Promise<T> => {
      try {
        const fileHandle = await directoryHandle.getFileHandle(fileName);
        const file = await fileHandle.getFile();
        const content = await file.text();
        console.log(`[DataStorage] Loading ${fileName} from directory:`, content ? 'Found' : 'Not found');
        return JSON.parse(content);
      } catch (e) {
        console.warn(`[DataStorage] Arquivo ${fileName} não encontrado no diretório. Usando dados iniciais.`);
        return fallbackData();
      }
    };

    try {
      const loadedData: AppData = {
        clients: await loadFile('clients.json', getInitialClientsData),
        processes: await loadFile('processes.json', getInitialProcessesData),
        lawyers: await loadFile('lawyers.json', getInitialLawyersData),
        userProfile: await loadFile('userProfile.json', getInitialProfileData),
        financials: await loadFile('financials.json', getInitialFinancialsData),
        documents: await loadFile('documents.json', getInitialDocumentsData),
      };
      setData(loadedData);
      setStoragePath(directoryHandle.name);
      toast.success('Dados carregados do diretório com sucesso!');
    } catch (error) {
      console.error('[DataStorage] Erro ao carregar dados do diretório:', error);
      toast.error('Erro ao carregar dados do diretório. Usando armazenamento local.');
      loadDataFromLocalStorage();
    }
  }, [directoryHandle, loadDataFromLocalStorage]);

  const selectDirectory = useCallback(async () => {
    try {
      if ('showDirectoryPicker' in window) {
        const handle = await (window as any).showDirectoryPicker();
        setDirectoryHandle(handle);
        setStoragePath(handle.name);
        toast.success('Diretório selecionado com sucesso!');
      } else {
        toast.warning('Seu navegador não suporta o salvamento em diretório. Usando armazenamento local.');
        loadDataFromLocalStorage();
      }
    } catch (error: any) {
      console.error('[DataStorage] Erro ao selecionar diretório:', error);
      if (error.name !== 'AbortError') {
        toast.error('A seleção de diretório foi cancelada ou falhou.');
      }
      loadDataFromLocalStorage(); // Fallback to local storage on error/abort
    }
  }, [loadDataFromLocalStorage]);

  const saveData = useCallback(async () => {
    try {
      if (directoryHandle) {
        const dataFiles = {
          'clients.json': data.clients,
          'processes.json': data.processes,
          'lawyers.json': data.lawyers,
          'userProfile.json': data.userProfile,
          'financials.json': data.financials,
          'documents.json': data.documents,
        };

        for (const [fileName, content] of Object.entries(dataFiles)) {
          const fileHandle = await directoryHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(content, null, 2));
          await writable.close();
          console.log(`[DataStorage] Saved ${fileName} to directory.`);
        }
        toast.success('Dados salvos no diretório com sucesso!');
      } else {
        localStorage.setItem('juridico_clients', JSON.stringify(data.clients));
        localStorage.setItem('juridico_processes', JSON.stringify(data.processes));
        localStorage.setItem('juridico_lawyers', JSON.stringify(data.lawyers));
        localStorage.setItem('juridico_userProfile', JSON.stringify(data.userProfile));
        localStorage.setItem('juridico_financials', JSON.stringify(data.financials));
        localStorage.setItem('juridico_documents', JSON.stringify(data.documents));
        console.log('[DataStorage] Saved all data to localStorage.');
        console.log('[DataStorage] Saved userProfile:', data.userProfile);
        toast.success('Dados salvos no armazenamento local do navegador.');
      }
    } catch (error) {
      console.error('[DataStorage] Erro ao salvar dados:', error);
      toast.error('Erro ao salvar os dados.');
    }
  }, [data, directoryHandle]);

  // Load data on component mount
  useEffect(() => {
    if (directoryHandle) {
      loadDataFromDirectory();
    } else {
      loadDataFromLocalStorage();
    }
  }, [directoryHandle, loadDataFromDirectory, loadDataFromLocalStorage]);

  return (
    <DataStorageContext.Provider value={{ data, setData, directoryHandle, setDirectoryHandle, selectDirectory, saveData, storagePath }}>
      {children}
    </DataStorageContext.Provider>
  );
};

export const useDataStorage = () => {
  const context = useContext(DataStorageContext);
  if (context === undefined) {
    throw new Error('useDataStorage must be used within a DataStorageProvider');
  }
  return context;
};