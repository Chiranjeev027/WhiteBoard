//call aput api to update the canvas on URL /canvas/:canvasId

const API_BASE_URL = 'http://localhost:5001/canvas';

export const  updateCanvas = async (canvasId, elements) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('User not authenticated');
  }

  const response = await fetch(`${API_BASE_URL}/${canvasId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ elements }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to update canvas');
  }

  return await response.json();
}