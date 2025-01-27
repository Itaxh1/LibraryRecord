const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for token fields
const tokenFieldsSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Create a model based on the schema
const TokenFieldsModel = mongoose.model('TokenFields', tokenFieldsSchema);

// Export the model for use in other parts of your application
module.exports = TokenFieldsModel;
