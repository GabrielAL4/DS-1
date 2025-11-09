import { httpClient } from "./httpClient";

export class TurmaService {
  static async createTurma(payload) {
    const response = await httpClient.post('/Turma', payload);

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
}