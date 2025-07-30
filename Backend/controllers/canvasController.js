const Canvas = require('../models/canvasModel');


const getAllCanvases = async (req, res) => {
  const email = req.email ;

  try {
    const canvases = await Canvas.getAllCanvases(email);
    res.status(200).json({ canvases });
  } catch (error) {
    res.status(400).json({ message: 'Failed to fetch canvases', error: error.message });
  }
}

const createCanvas = async (req, res) => {
  const { name } = req.body;
  const email = req.email;

  try {
    const newCanvas = await Canvas.createCanvas(email, name);
    res.status(201).json({ message: 'Canvas created successfully', canvas: newCanvas });
  } catch (error) {
    res.status(400).json({ message: 'Failed to create canvas', error: error.message });
  }
}

const loadCanvas = async (req, res) => {
  console.log("Loading canvas with ID:", req.params.canvasId);
  console.log("User email:", req.email);
  const canvasId = req.params.canvasId;
  const email = req.email;

  try {
    const canvas = await Canvas.loadCanvas(email, canvasId);

    if (!canvas) {
      return res.status(404).json({ message: 'Canvas not found' });
    }
    res.status(200).json({ canvas });
  } catch (error) {
    res.status(400).json({ message: 'Failed to load canvas', error: error.message });
  }

  
}

const updateCanvas = async (req, res) => {
  const { elements } = req.body;
  const canvasId = req.params.canvasId;
  const email = req.email;

  console.log("🔍 Saving elements:", JSON.stringify(elements, null, 2));

  const safeElements = elements.map(({ path, roughEle, ...rest }) => rest);
  try {

    const updatedCanvas = await Canvas.updateCanvas(email, canvasId, safeElements);
    if (!updatedCanvas) {
      return res.status(404).json({ message: 'Canvas not found' });
    }
    res.status(200).json({ message: 'Canvas updated successfully', canvas: updatedCanvas });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update canvas', error: error.message });
  }
}

const shareCanvas = async (req, res) => {
  const canvasId = req.params.canvasId;
  const email = req.email;
  const { shared_with } = req.body;

  try {
    const updatedCanvas = await Canvas.shareCanvas(email, canvasId, shared_with);
    if (!updatedCanvas) {
      return res.status(404).json({ message: 'Canvas not found' });
    }
    res.status(200).json({ message: 'Canvas shared successfully', canvas: updatedCanvas });
  } catch (error) {
    res.status(400).json({ message: 'Failed to share canvas', error: error.message });
  }
} 

module.exports ={
    getAllCanvases,
    createCanvas,
    loadCanvas,
    updateCanvas,
    shareCanvas
}