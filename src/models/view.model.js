import mongoose, { Schema } from "mongoose";

const viewSchema = new Schema(
    {
        video: {
            type: Schema.Types.ObjectId,
            ref: "Video",
            required: true,
            index: true
        },
        viewer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        }
    },
    { timestamps: true }
);

// Compound index so that we can easily find or update unique (video, viewer) pairs
viewSchema.index({ video: 1, viewer: 1 });

export const View = mongoose.model("View", viewSchema);
