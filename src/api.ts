const API_BASE = import.meta.env.PROD 
  ? '/.netlify/functions/api'
  : 'http://localhost:3000/api';

export const fetchAssignments = async () => {
  const response = await fetch(`${API_BASE}/assignments`);
  if (!response.ok) {
    throw new Error('Failed to fetch assignments');
  }
  return response.json();
};

export const fetchAssignment = async (id: string) => {
  const response = await fetch(`${API_BASE}/assignments/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch assignment');
  }
  return response.json();
};

export const submitAssignment = async (id: string, answers: any[]) => {
  const response = await fetch(`${API_BASE}/assignments/${id}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ answers }),
  });
  if (!response.ok) {
    throw new Error('Failed to submit assignment');
  }
  return response.json();
}; 