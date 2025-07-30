// Backend/models/canvasModel.js
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const CanvasSchema = new Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,   
            ref: 'User',
            required: true,
        },   
        name: {
            type: String,
            required: true,
            trim: true,
        },
        elements: {
            type: [{type: mongoose.Schema.Types.Mixed}],
        },
        sharedWith: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }
        ], 
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// get all canvases for a user(both owned and shared with)
CanvasSchema.statics.getAllCanvases = async function (email) {
    const user = await mongoose.model('User').findOne({email});
    try{
        if (!user) {
            return Error('User not found');
        }

        const canvases = await this.find({
            $or: [{ owner: user._id }, { sharedWith: user._id }]  
        });
        
        return canvases;  
    }catch (error) {
        return Error('Fetching canvases failed: ' + error.message);
    }
};

//create a canvas for a user with given email
CanvasSchema.statics.createCanvas = async function (email,name) {
    const user = await mongoose.model('User').findOne({email});
    if (!user) {
        return Error('User not found');
    }

    const newCanvas = new this({
        owner: user._id,
        name: name,
        elements: [],
        sharedWith: [], 
    }); 
    try {
        const savedCanvas = await newCanvas.save();
        return savedCanvas;
    } catch (error) {
        return Error('Creating canvas failed: ' + error.message);
    }
}  

CanvasSchema.statics.loadCanvas = async function (email, canvasId) {
    const user = await mongoose.model('User').findOne({email});
    if (!user) {
        return Error('User not found');
    }

    const canvas = await this.findOne({
        _id: canvasId,
        $or: [{ owner: user._id }, { sharedWith: user._id }]  
    });

    if (!canvas) {
        return Error('Canvas not found');
    }

    return canvas;
} 

CanvasSchema.statics.updateCanvas = async function (email, canvasId, elements) {
    
    console.log("📥 Received canvasId:", canvasId);
    console.log("📥 From user email:", email);
    const user = await mongoose.model('User').findOne({email});
    if (!user) {
        return Error('User not found');
    }

    //check if the canvas belongs to the user or is shared to the user
    const canvas = await this.findOne({
        _id: canvasId,
        $or: [{ owner: user._id }, { sharedWith: user._id }]  
    });

    if (!canvas) {
        return Error('Canvas not found');
    }

    canvas.elements = elements;

    try {
        const updatedCanvas = await canvas.save();
        console.log("✅ Canvas updated in DB");
        return updatedCanvas;
    } catch (error) {
        return Error('Updating canvas failed: ' + error.message);
    }
} 

//add email to sharedWith array of the canvas with try and catch block
CanvasSchema.statics.shareCanvas = async function (email, canvasId, sharedWithEmail) {
    const user = await mongoose.model('User').findOne({email});
    const sharedWithUser = await mongoose.model('User').findOne({email: sharedWithEmail});
    try{
        if(!user || !sharedWithUser) {
            return Error('User not found');
        }

        const canvas = await this.findOne({
            _id: canvasId,
            owner: user._id  
        });
        if (!canvas) {
            return Error('Canvas not found or you do not own this canvas');
        }

        canvas.sharedWith.push(sharedWithUser._id);
        const updatedCanvas = await canvas.save();
        console.log("✅ Canvas shared with user:", sharedWithEmail);
        return updatedCanvas;
    }
    catch (error) {
        return Error('Sharing canvas failed: ' + error.message);
    }
}       

const Canvas = mongoose.model('Canvas', CanvasSchema);
console.log(Canvas.collection.name);  
module.exports = Canvas;  
