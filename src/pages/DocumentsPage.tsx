"use client";

import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Folder, FileText, Upload, Plus, FileEdit, Trash, File, Pencil } from 'lucide-react';
import { useDataStorage, DocumentItem } from '@/hooks/use-data-storage';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Importar Card components

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getFileIcon = (fileName: string) => {
  const extension = (fileName || '').split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return FileText; // Usando FileText como genérico para PDF
    case 'doc':
    case 'docx': return FileText; // Usando FileText como genérico para DOCX
    case 'xls':
    case 'xlsx': return FileText; // Usando FileText como genérico para XLSX
    case 'txt': return FileText;
    default: return File;
  }
};

const getFileIconColorClass = (fileName: string) => {
  const extension = (fileName || '').split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'pdf': return 'text-red-500';
    case 'doc':
    case 'docx': return 'text-blue-500';
    case 'xls':
    case 'xlsx': return 'text-green-500';
    case 'txt': return 'text-gray-500';
    default: return 'text-muted-foreground';
  }
};

const DocumentsPage: React.FC = () => {
  const { data, setData, saveData, directoryHandle } = useDataStorage();
  const fileUploaderRef = useRef<HTMLInputElement>(null);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editingFileContent, setEditingFileContent] = useState<DocumentItem | null>(null);
  const [currentFileContent, setCurrentFileContent] = useState('');
  const [isRenaming, setIsRenaming] = useState<DocumentItem | null>(null);
  const [newFileName, setNewFileName] = useState('');

  const handleUploadClick = () => {
    fileUploaderRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const newFile: DocumentItem = {
        id: Date.now() + Math.random(),
        type: 'file',
        name: file.name,
        date: new Date().toISOString().split('T')[0],
        size: file.size,
      };

      if (directoryHandle) {
        try {
          const fileHandle = await directoryHandle.getFileHandle(file.name, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(file);
          await writable.close();
          toast.success(`Arquivo "${file.name}" enviado e salvo no diretório!`);
        } catch (error) {
          console.error('Erro ao salvar arquivo no diretório:', error);
          toast.error(`Erro ao salvar "${file.name}" no diretório.`, { description: "Verifique as permissões ou se o diretório está selecionado." });
          continue;
        }
      } else {
        toast.warning(`"${file.name}" enviado. Não foi salvo no disco: Diretório não selecionado.`, { description: "Selecione um diretório no Dashboard para salvar arquivos." });
      }

      setData(prev => ({
        ...prev,
        documents: [newFile, ...prev.documents]
      }));
    }
    saveData();
    if (fileUploaderRef.current) fileUploaderRef.current.value = '';
  };

  const handleNewFolder = () => {
    const folderName = prompt("Digite o nome da nova pasta:");
    if (folderName && folderName.trim() !== "") {
      const newFolder: DocumentItem = {
        id: Date.now(),
        type: 'folder',
        name: folderName.trim(),
        count: 0,
      };
      setData(prev => ({
        ...prev,
        documents: [newFolder, ...prev.documents]
      }));
      saveData();
      toast.success(`Pasta "${folderName}" criada com sucesso!`);
    }
  };

  const handleDeleteItem = async (id: number, name: string, type: 'folder' | 'file') => {
    if (confirm(`Tem certeza que deseja excluir "${name}"?`)) {
      if (type === 'file' && directoryHandle) {
        try {
          await directoryHandle.removeEntry(name);
          toast.success(`Arquivo "${name}" excluído do diretório.`);
        } catch (error) {
          console.warn('Não foi possível excluir o arquivo do diretório. Removendo apenas o metadado.', error);
          toast.warning(`Aviso: O arquivo "${name}" não pôde ser excluído do diretório. Removendo apenas o metadado.`, { description: "Verifique as permissões ou se o arquivo existe." });
        }
      }
      setData(prev => ({
        ...prev,
        documents: prev.documents.filter(item => item.id !== id)
      }));
      saveData();
      toast.success(`Item "${name}" removido da lista.`);
    }
  };

  const handleRenameClick = (item: DocumentItem) => {
    setIsRenaming(item);
    setNewFileName(item.name);
  };

  const handleRenameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isRenaming || newFileName.trim() === '') return;

    const oldName = isRenaming.name;
    const updatedName = newFileName.trim();

    if (oldName === updatedName) {
      setIsRenaming(null);
      return;
    }

    if (isRenaming.type === 'file' && directoryHandle) {
      try {
        // Para renomear um arquivo no File System Access API, é preciso copiar e depois deletar o original
        const oldFileHandle = await directoryHandle.getFileHandle(oldName);
        const oldFile = await oldFileHandle.getFile();

        const newFileHandle = await directoryHandle.getFileHandle(updatedName, { create: true });
        const writable = await newFileHandle.createWritable();
        await writable.write(oldFile);
        await writable.close();

        await directoryHandle.removeEntry(oldName);
        toast.success(`Arquivo "${oldName}" renomeado para "${updatedName}" no diretório.`);
      } catch (error) {
        console.error('Erro ao renomear arquivo no diretório:', error);
        toast.error(`Erro ao renomear "${oldName}" no diretório.`, { description: "Verifique as permissões ou se o novo nome já existe." });
        return; // Aborta se a renomeação do arquivo físico falhar
      }
    }

    setData(prev => ({
      ...prev,
      documents: prev.documents.map(item =>
        item.id === isRenaming.id ? { ...item, name: updatedName } : item
      )
    }));
    saveData();
    setIsRenaming(null);
    toast.success(`Item renomeado para "${updatedName}"!`);
  };

  const handleEditContent = async (file: DocumentItem) => {
    if (file.type !== 'file') {
      toast.error('A edição de conteúdo é apenas para arquivos.');
      return;
    }
    if (!directoryHandle) {
      toast.error("Por favor, selecione um diretório no Dashboard primeiro para habilitar a edição do conteúdo do arquivo.", { description: "A edição de conteúdo requer acesso ao sistema de arquivos." });
      return;
    }

    const fileExtension = file.name.toLowerCase().split('.').pop();
    const binaryExtensions = ['pdf', 'docx', 'xlsx', 'jpg', 'png', 'zip', 'rar'];

    if (fileExtension && binaryExtensions.includes(fileExtension)) {
      toast.warning(`O arquivo ${file.name} é de formato binário (${fileExtension.toUpperCase()}). A edição do conteúdo só está disponível para arquivos de texto simples.`, { duration: 5000 });
      return;
    }

    setEditingFileContent(file);
    setIsEditorModalOpen(true);
    setCurrentFileContent('Carregando conteúdo...');

    try {
      const fileHandle = await directoryHandle.getFileHandle(file.name, { create: false });
      const fileBlob = await fileHandle.getFile();
      const content = await fileBlob.text();
      setCurrentFileContent(content);
    } catch (error) {
      console.error('Erro ao ler o arquivo para edição:', error);
      setCurrentFileContent(`Erro: O arquivo não foi encontrado no diretório selecionado ou não pôde ser lido. Certifique-se de que o nome é exato. Se for um novo arquivo, apenas digite o conteúdo e salve.`);
    }
  };

  const handleSaveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFileContent || !directoryHandle) return;

    try {
      const fileHandle = await directoryHandle.getFileHandle(editingFileContent.name, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(currentFileContent);
      await writable.close();

      setData(prev => ({
        ...prev,
        documents: prev.documents.map(doc =>
          doc.id === editingFileContent.id
            ? { ...doc, date: new Date().toISOString().split('T')[0], size: currentFileContent.length }
            : doc
        )
      }));
      saveData();
      toast.success(`Conteúdo de "${editingFileContent.name}" salvo com sucesso!`);
      setIsEditorModalOpen(false);
    } catch (error) {
      console.error('Erro ao salvar o conteúdo do arquivo:', error);
      toast.error(`Erro ao salvar o conteúdo de "${editingFileContent.name}". Verifique as permissões.`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Documentos</h2>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <Button onClick={handleUploadClick} className="w-1/2 sm:w-auto">
            <Upload className="mr-2 h-4 w-4" /> Upload
          </Button>
          <Button onClick={handleNewFolder} variant="outline" className="w-1/2 sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Nova Pasta
          </Button>
        </div>
        <Button onClick={() => toast.info("Funcionalidade de usar modelo em desenvolvimento!")} variant="outline" className="w-full sm:w-auto">
          <FileText className="mr-2 h-4 w-4" /> Usar Modelo
        </Button>
      </div>

      <input
        type="file"
        ref={fileUploaderRef}
        style={{ display: 'none' }}
        multiple
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> {/* Ajustado para 3 colunas em telas grandes */}
        {data.documents.map(item => (
          <Card
            key={item.id}
            className="relative flex flex-col items-center text-center group hover:bg-accent/50 transition-colors p-4"
          >
            <CardHeader className="p-0 pb-2 flex flex-col items-center">
              {item.type === 'folder' ? (
                <Folder className="h-12 w-12 text-yellow-500 mb-2" />
              ) : (
                React.createElement(getFileIcon(item.name), { className: cn("h-12 w-12 mb-2", getFileIconColorClass(item.name)) })
              )}
              {isRenaming?.id === item.id ? (
                <form onSubmit={handleRenameSubmit} className="w-full mt-2">
                  <Input
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onBlur={handleRenameSubmit}
                    autoFocus
                    className="text-center text-sm"
                  />
                </form>
              ) : (
                <CardTitle className="font-medium text-sm truncate w-full px-2">{item.name}</CardTitle>
              )}
            </CardHeader>
            <CardContent className="p-0 text-xs text-muted-foreground mt-1">
              {item.type === 'folder' ? `${item.count} documentos` : `${item.date ? new Date(item.date).toLocaleDateString('pt-BR') : ''} • ${formatFileSize(item.size || 0)}`}
            </CardContent>

            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleRenameClick(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              {item.type === 'file' && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditContent(item)}>
                  <FileEdit className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => handleDeleteItem(item.id, item.name, item.type)}>
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isEditorModalOpen} onOpenChange={setIsEditorModalOpen}>
        <DialogContent className="sm:max-w-3xl h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Editar Documento: {editingFileContent?.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveContent} className="flex flex-col flex-1 gap-4 py-4">
            <Label htmlFor="documentContent" className="sr-only">Conteúdo do Documento</Label>
            <Textarea
              id="documentContent"
              value={currentFileContent}
              onChange={(e) => setCurrentFileContent(e.target.value)}
              className="flex-1 font-mono text-sm resize-none"
              placeholder="Digite o conteúdo do documento aqui..."
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditorModalOpen(false)}>Cancelar</Button>
              <Button type="submit">Salvar Conteúdo</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentsPage;