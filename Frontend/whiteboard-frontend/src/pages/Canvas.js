// src/pages/Canvas.js
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rehydrateElements } from '../utils/rehydrateElements';
import { createNewSocket } from '../utils/socket';
import BoardProvider from '../store/BoardProvider';
import ToolboxProvider from '../store/ToolboxProvider';
import Toolbar from '../components/Toolbar';
import Board from '../components/Board';
import Toolbox from '../components/Toolbox';

function CanvasPage() {
  const { canvasId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [canvas, setCanvas] = useState(null);
  const navigate = useNavigate();
  const socketRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Initialize socket connection
    socketRef.current = createNewSocket();
    const socket = socketRef.current;

    // Event Handlers
    const handleLoadCanvas = (canvasData) => {
      console.log('Received canvas data:', canvasData);
      if (!canvasData) {
        setError('No canvas data received');
        setLoading(false);
        return;
      }
      setCanvas(canvasData);
      setLoading(false);
    };

    const handleCanvasUpdate = (updatedCanvas) => {
      console.log('Received canvas update:', updatedCanvas);
      setCanvas(updatedCanvas);
    };

    const handleError = (err) => {
      console.error('Canvas error:', err);
      setError(err.message || 'Failed to load canvas');
      setLoading(false);
    };

    // Set up listeners
    socket.on('connect', () => {
      console.log('Socket connected, authenticating...');
      socket.emit('authenticate', token);
    });

    socket.on('authenticationSuccess', () => {
      console.log('Auth success, joining canvas...');
      socket.emit('joinCanvas', { canvasId });
    });

    socket.on('loadCanvas', handleLoadCanvas);
    socket.on('canvasUpdate', handleCanvasUpdate);
    socket.on('canvasError', handleError);
    socket.on('authenticationError', handleError);

    // Connect socket
    socket.connect();

    // Cleanup
    return () => {
      socket.off('loadCanvas', handleLoadCanvas);
      socket.off('canvasUpdate', handleCanvasUpdate);
      socket.off('canvasError', handleError);
      socket.off('authenticationError', handleError);
      socket.disconnect();
    };
  }, [canvasId, navigate]);

  if (loading) return <div>Loading canvas...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!canvas) return <div>No canvas data</div>;

  return (
    <div>
      <BoardProvider initialCanvas={canvas}>
        <ToolboxProvider>
          <Toolbar />
          <Board socket={socketRef.current} />
          <Toolbox />
        </ToolboxProvider>
      </BoardProvider>
    </div>
  );
}

export default CanvasPage;