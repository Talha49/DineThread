import mongoose from 'mongoose';

const menuImageSchema = new mongoose.Schema({
    pathname: { type: String, required: true, unique: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', default: null },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

export default mongoose.models.MenuImage || mongoose.model('MenuImage', menuImageSchema);
