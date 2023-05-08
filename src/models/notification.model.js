import mongoose from 'mongoose';

const { Schema } = mongoose;
const Notification = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
        },
    title:{
        type:String,
        default:null
    },
    body:{
        type:String,
        default:null
    },
    type:{
        type:String,
        default:null
    },
    deviceToken:{
        type:String,
        default:null
    },
    statusBit:{
        type: Boolean,
        default: true
    },
    delBit: {
        type: Boolean,
        default: false,
        }
        },
    { timestamps: true }
        );

export default mongoose.model('Notification', Notification);
