import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { Schema } from "./Schema.js";
import { resolvers } from "./resolvers.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { promisify } from "util";

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/Graphical-apiDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Successfully connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1); 
  }
};

const server = new ApolloServer({
  typeDefs: Schema,
  resolvers,
  formatError: (error) => ({
    message: error.message || "An unknown error occurred",
  }),
});

const startServer = async () => {
  await connectDB();

  startStandaloneServer(server, {
    listen: { port: process.env.PORT || 5000 },
    context: async ({ req }) => {
      const token = req.headers.authorization || "";
      if (!token) return { user: null };

      try {
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY);
        return { user: decoded };
      } catch (error) {
        console.warn("Invalid token:", error.message);
        return { user: null };
      }
    },
  })
    .then(() => {
      console.log(`Server is running at http://localhost:${process.env.PORT || 5000}`);
    })
    .catch((err) => {
      console.error("Server startup error:", err);
    });
};

startServer();
