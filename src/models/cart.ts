import mongoose from "mongoose";

const quantityBySizeSub = new mongoose.Schema(
    {
        size: {
            type: String,
            require: true,
        },
        quantity: {
            type: Number,
            require: true
        }
    }
)

const cartSchema = new mongoose.Schema(
    {
        user_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            require: true
        },
        items: [
            {
                shirtId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Shirt',
                    require: true
                },
                designId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Design',
                    require: true
                },
                basePricePerShirt: {
                    type: Number,
                    require: true
                },
                designCost: {
                    type: Number,
                    require: true
                },
                quantityBySize: {
                    type: [quantityBySizeSub],
                    default: [],
                    require: true
                },
                totalItemPrice: {
                    type: Number,
                    require: true,
                },
                addedAt: {
                    type: Date,
                    require: true
                },
                previewImage: {
                    type: String,
                    require: true
                },
            }
        ]
    }
)