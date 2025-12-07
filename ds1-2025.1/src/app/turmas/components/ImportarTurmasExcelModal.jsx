import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TurmaService } from "@/services/TurmaService";
import { useState } from "react";
import * as XLSX from 'xlsx';

export default function ImportarTurmasExcelModal() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [excelTurma, setExcelTurma] = useState("");
  const [dialogImportarExcel, setDialogImportarExcel] = useState(false);

  const handleFileUpload = (e) => {
    setSelectedFile(e.target.files[0]);

    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      const mappedExcelTurma = parsedData
        .map((tabela) => ({
          codigoturma: tabela.codigoturma,
          professor: tabela.professor,
          disciplina: tabela.disciplina,
          quantidade: tabela.quantidade,
          codigohorario: tabela.codigohorario == null || tabela.codigohorario == "" ? 0 : tabela.codigohorario
        }));

      setExcelTurma(mappedExcelTurma);
    };
  }

  const handleUploadExcel = async () => {
    try {
      if (!selectedFile) {
        alert("Por favor, selecione um arquivo.");
        return;
      }

      const response = await TurmaService.importarExcelTurma(excelTurma);
      console.log("response", response);
      setDialogImportarExcel(false);
      setSelectedFile(null);
    } catch (error) {
      console.error("Erro ao enviar o arquivo:", error);
    }
  };

  return (
    <Dialog open={dialogImportarExcel} onOpenChange={setDialogImportarExcel}>
      <DialogTrigger asChild>
        <Button onClick={() => setDialogImportarExcel(true)} className="rounded-md bg-blue-600 text-white p-2 min-w-[200px] h-[60px] text-center">
          Importar Turmas (Excel)
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Importar Turmas</DialogTitle>
          <DialogDescription>
            Selecione o arquivo Excel com os dados das turmas
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="border p-2 rounded"
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">
              Cancelar
            </Button>
          </DialogClose>

          <Button
            onClick={handleUploadExcel}
            disabled={!selectedFile}
          >
            Confirmar Importação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
