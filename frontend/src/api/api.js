import axios from 'axios';

const API_BASE = 'http://localhost:8000';

export async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
}

export async function askQuestion(question) {
  const response = await axios.post(`${API_BASE}/ask`, { question });
  return response.data;
}
