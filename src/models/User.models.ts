import mongoose, { Schema, Document } from 'mongoose';

export interface Message extends Document {
    content: string;
    createdAt: Date;
    _id: string;
}
export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpires: Date;
    isVerified: boolean;
    isAcceptingMessages: boolean;
    messages: Message[];
}

const MessageSchema: Schema<Message> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, required: true }
})

const UserSchema: Schema<User> = new Schema({
    username: {
        type: String, required: true, trim: true, unique: true
    },
    email: { type: String, required: true, unique: true, match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, 'Please fill a valid email address'] },
    password: { type: String, required: true, match: [/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm,"Please fill a Valid Password"] },
    verifyCode: { type: String, required: true },
    verifyCodeExpires: { type: Date, required: true },
    isVerified: { type: Boolean, default: false },
    isAcceptingMessages: { type: Boolean, default: true, required: true },
    messages: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>('User', UserSchema);
export default UserModel;