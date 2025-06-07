import mongoose, { type Document, Schema } from "mongoose"

export interface IUploadHistory extends Document {
  userId: mongoose.Types.ObjectId
  deploymentId: string
  fileName: string
  fileUrl: string
  fileSize: number
  createdAt: Date
}

const UploadHistorySchema = new Schema<IUploadHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    deploymentId: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IUploadHistory>("UploadHistory", UploadHistorySchema)
