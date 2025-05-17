const API_BASE = import.meta.env.PROD 
  ? '/.netlify/functions/api'
  : 'http://localhost:3000/api';

export async function fetchAssignments() {
  const res = await fetch(`${API_BASE}/assignments`);
  if (!res.ok) throw new Error('Failed to fetch assignments');
  return res.json();
}

export async function fetchAssignment(id: string) {
  const res = await fetch(`${API_BASE}/assignments/${id}`);
  if (!res.ok) throw new Error('Failed to fetch assignment');
  return res.json();
}

export async function submitAssignment(id: string, answers: any) {
  const res = await fetch(`${API_BASE}/assignments/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error('Failed to submit assignment');
  return res.json();
} 