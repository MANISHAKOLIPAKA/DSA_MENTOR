import { Schema, model, Document } from "mongoose";

export interface ICPAccounts {
  leetcode?: string;
  codeforces?: string;
  codechef?: string;
  hackerrank?: string;
  hackerearth?: string;
  gfg?: string;
  interviewbit?: string;
}

export interface IUser extends Document {
  uid: string;           // Firebase UID — primary link between Firebase Auth and MongoDB
  name: string;
  email: string;
  photoURL?: string;
  preferredLanguage: "java" | "python" | "cpp" | "javascript" | "go" | "rust";
  cpAccounts: ICPAccounts;
  googleSheetId?: string; // User's own sheet for progress sync
  createdAt: Date;
  updatedAt: Date;
}

const CPAccountsSchema = new Schema<ICPAccounts>(
  {
    leetcode: String,
    codeforces: String,
    codechef: String,
    hackerrank: String,
    hackerearth: String,
    gfg: String,
    interviewbit: String,
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    uid: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    photoURL: String,
    preferredLanguage: {
      type: String,
      enum: ["java", "python", "cpp", "javascript", "go", "rust"],
      default: "python",
    },
    cpAccounts: { type: CPAccountsSchema, default: {} },
    googleSheetId: String,
  },
  { timestamps: true }
);

export const User = model<IUser>("User", UserSchema);
