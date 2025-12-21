import { httpClient } from "./httpClient";

export class SalaService {
  static async createSala(payload) {
    const response = httpClient.post('/Sala', payload);

    return response;
  }

  static async createRelatorioFinal(pdfDay) {
    const response = await httpClient.get(`/Sala/relatorio/${pdfDay}`, {
      responseType: 'blob',
    });

    return response;
  }

  static async createIndisponibilidadeSala(id, payload) {
    const response = httpClient.post(`/Sala/${id}/indisponibilidade`, payload);

    return response;
  }

  static async getSalaComIndisponibilidades(id) {
    const response = httpClient.get(`/Sala/${id}/com-indisponibilidades`);

    return response;
  }

  static async getAllSalas() {
    const response = httpClient.get('/Sala');

    return response;
  }

  static async getSalaById(id) {
    const response = httpClient.get(`/Sala/${id}`);

    return response;
  }

  static async getAllSalasDisponiveis(diaSemana, tempo) {
    const response = httpClient.get('/Sala/obter-salas-disponiveis', {
      params: { diaSemana, tempo }
    });
    return response;
  }

  static async editSala(id, payload) {
    const response = httpClient.put(`/Sala/${id}`, payload);

    return response;
  }

  static async deleteSala(id) {
    const response = await httpClient.delete(`/Sala/${id}`);

    return response;
  }

  static async deleteIndisponibilidadeSala(id, indisponibilidadeId) {
    const response = httpClient.delete(`/Sala/${id}/indisponibilidade/${indisponibilidadeId}`);

    return response;
  }
}