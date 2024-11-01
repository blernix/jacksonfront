import mongoose from 'mongoose';

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
}, { collection: 'categories' });

// Vérifiez si le modèle existe déjà avant de le compiler
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

export default Category;