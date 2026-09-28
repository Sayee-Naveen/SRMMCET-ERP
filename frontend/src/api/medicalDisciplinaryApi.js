import API from './axios';

export const getMedicalRecords = async (studentId) => {
  const response = await API.get(`/medical-disciplinary/students/${studentId}/medical`);
  return response.data;
};

export const createMedicalRecord = async (studentId, recordData) => {
  const response = await API.post(`/medical-disciplinary/students/${studentId}/medical`, recordData);
  return response.data;
};

export const deleteMedicalRecord = async (recordId) => {
  const response = await API.delete(`/medical-disciplinary/medical/${recordId}`);
  return response.data;
};

export const getDisciplinaryActions = async (studentId) => {
  const response = await API.get(`/medical-disciplinary/students/${studentId}/disciplinary`);
  return response.data;
};

export const createDisciplinaryAction = async (studentId, actionData) => {
  const response = await API.post(`/medical-disciplinary/students/${studentId}/disciplinary`, actionData);
  return response.data;
};

export const updateDisciplinaryStatus = async (actionId, status) => {
  const response = await API.patch(`/medical-disciplinary/disciplinary/${actionId}/status`, { status });
  return response.data;
};

export const deleteDisciplinaryAction = async (actionId) => {
  const response = await API.delete(`/medical-disciplinary/disciplinary/${actionId}`);
  return response.data;
};

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await API.post('/medical-disciplinary/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
