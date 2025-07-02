import { httpClient } from "./httpClient";

export class DisciplinaService {
  static async createDisciplina(payload) {
    console.log("DisciplinaService.createDisciplina - Payload:", payload);
    const response = httpClient.post('/Disciplina', payload);
    console.log("DisciplinaService.createDisciplina - Response:", response);

    return response;
  }

  static async getAllDisciplinas() {
    const response = httpClient.get('/Disciplina');

    return response;
  }

  static async getDisciplinaById(id) {
    const response = httpClient.get(`/Disciplina/${id}`);

    return response;
  }

  static async editDisciplina(id, payload) {
    const response = httpClient.put(`/Disciplina/${id}`, payload);

    return response;
  }

  static async deleteDisciplina(id) {
    const response = httpClient.delete(`/Disciplina/${id}`);

    return response;
  }
}