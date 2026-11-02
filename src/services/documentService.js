import { apiClient } from './api/client';

export const documentService = {
  async uploadDocument(formData) {
    const res = await apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  },

  async verifyDocument(id, data) {
    const res = await apiClient.patch(`/documents/${id}/verify`, data);
    return res;
  },

  async getDocumentById(id) {
    const res = await apiClient.get(`/documents/${id}`);
    return res;
  },

  async getMyDocuments() {
    const res = await apiClient.get('/documents/my-documents');
    return res;
  },

  getFileDownloadUrl(fileKey, expires, signature) {
    return `/api/v1/documents/files/${fileKey}?expires=${expires}&signature=${signature}`;
  },
};
