// backend/models/Testimonial.js
const mongoose = require('mongoose');
const { Schema } = mongoose;


const imageSchema = new Schema(
{
url: { type: String, required: true },
public_id: { type: String }
},
{ _id: false }
);


const testimonialSchema = new Schema(
{
user: { type: Schema.Types.ObjectId, ref: 'User', required: false }, // optional: linked user
product: { type: Schema.Types.ObjectId, ref: 'Product', required: false }, // optional: product-specific testimonials
name: { type: String, required: true },
email: { type: String },
rating: { type: Number, required: true, min: 1, max: 5 },
title: { type: String },
comment: { type: String, required: true },
images: { type: [imageSchema], default: [] },
approved: { type: Boolean, default: true }, // admin must approve before showing publicly
visible: { type: Boolean, default: true }, // soft-delete / hide
helpfulCount: { type: Number, default: 0 },
flagged: { type: Boolean, default: false }
},
{ timestamps: true }
);


module.exports = mongoose.model('Testimonial', testimonialSchema);