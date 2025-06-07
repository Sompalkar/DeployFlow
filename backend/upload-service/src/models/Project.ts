import mongoose, { type Document, Schema } from "mongoose"

export interface IProject extends Document {
  name: string
  repoUrl: string
  buildCommand: string
  outputDir: string
  ownerId: mongoose.Types.ObjectId
  status: "idle" | "building" | "deployed" | "failed"
  deploymentUrl?: string
  lastDeployment?: Date
  buildSettings: Record<string, any>
  deploymentSettings: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const ProjectSchema = new Schema<IProject>(
  {
    name: {
      type: String,
      required: true,
    },
    repoUrl: {
      type: String,
      required: true,
    },
    buildCommand: {
      type: String,
      default: "npm run build",
    },
    outputDir: {
      type: String,
      default: "dist",
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["idle", "building", "deployed", "failed"],
      default: "idle",
    },
    deploymentUrl: {
      type: String,
    },
    lastDeployment: {
      type: Date,
    },
    buildSettings: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deploymentSettings: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model<IProject>("Project", ProjectSchema)
