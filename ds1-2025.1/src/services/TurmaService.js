import { httpClient } from "./httpClient";

export class TurmaService {
  static async createTurma(payload) {
    console.log("TurmaService.createTurma - Payload:", payload);
    const response = await httpClient.post('/Turma', payload);
    console.log("TurmaService.createTurma - Response:", response);

    return response;
  }

  static async createAlocacaoTurma(payload) {
    const response = httpClient.post('/Turma/alocar-turma', payload);

    return response;
  }

  static async getAllTurmas() {
    const response = httpClient.get('/Turma');

    return response;
  }

  static async getTurmaById(id) {
    const response = httpClient.get(`/Turma/${id}`);

    return response;
  }

  static async getDisciplinasTurma(id) {
    const response = httpClient.get(`/Turma/disciplina/${id}`);

    return response;
  }

  static async editTurma(id, payload) {
    const response = httpClient.put(`/Turma/${id}`, payload);

    return response;
  }

  static async deleteTurma(id) {
    const response = httpClient.delete(`/Turma/${id}`);

    return response;
  }

  static async deleteAlocacaoTurma(id) {
    const response = httpClient.delete(`/Turma/deletar-alocacao/${id}`);

    return response;
  }

  static async importarTurmasExcel(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Enviando arquivo:', file.name, 'Tamanho:', file.size);
    
    // Não definir Content-Type manualmente - o axios detecta automaticamente FormData
    const response = await httpClient.post('/Turma/importar-excel', formData);

    return response;
  }
}