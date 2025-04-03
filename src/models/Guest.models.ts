import mongoose, { Schema, type Document } from "mongoose"

export interface Guest extends Document {
  guestId: string
  predictionsCount: number
  previousProfessions: string[] // Add this property
  previousIQs: number[] // Add this property
  createdAt: Date
  lastActive: Date
}
const GuestSchema = new Schema({
  guestId: { type: String, required: true },
  predictionsCount: { type: Number, default: 0 },
  previousProfessions: { type: [String], default: [] },
  previousIQs: { type: [Number], default: [] },
  createdAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
});

const GuestModel = (mongoose.models.Guest as mongoose.Model<Guest>) || mongoose.model<Guest>("Guest", GuestSchema)
export default GuestModel

