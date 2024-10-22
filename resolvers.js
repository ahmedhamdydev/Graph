import { User } from "./models/User.js";
import { Todo } from "./models/Todo.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const resolvers = {
  Query: {
    users: async () => {
      try {
        const users = await User.find();
        return users;
      } catch (error) {
        throw new Error("Failed to fetch users");
      }
    },

    user: async (_, { id }) => {
      try {
        const user = await User.findById(id);
        if (!user) {
          throw new Error("User not found");
        }
        return user;
      } catch (error) {
        throw new Error("Error fetching user");
      }
    },

    todos: async () => {
      try {
        const todos = await Todo.find();
        return todos;
      } catch (error) {
        throw new Error("Failed to fetch todos");
      }
    },

    todo: async (_, { id }) => {
      try {
        const todo = await Todo.findById(id);
        if (!todo) {
          throw new Error("Todo not found");
        }
        return todo;
      } catch (error) {
        throw new Error("Error fetching todo");
      }
    },

    todosByUser: async (_, { userId }, context) => {
      if (!context.user) {
        throw new Error("User not authenticated");
      }
      try {
        const todos = await Todo.find({ userId });
        return todos;
      } catch (error) {
        throw new Error("Failed to fetch todos for user");
      }
    },
  },

  Mutation: {
    registerUser: async (_, { input }) => {
      const { email, username, password, role } = input;

      if (!email || !username || !password) {
        throw new Error("All fields are required");
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error("User with this email already exists");
      }

      const hashedPassword = await bcrypt.hash(password, 12);
      const newUser = new User({
        email,
        username,
        password: hashedPassword,
        role,
      });

      try {
        await newUser.save();
        return newUser;
      } catch (error) {
        throw new Error("Failed to register user");
      }
    },

    loginUser: async (_, { email, password }) => {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const user = await User.findOne({ email });
      if (!user) {
        throw new Error("User not found");
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error("Invalid password");
      }

      const token = jwt.sign(
        { userId: user._id, role: user.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "3h" }
      );

      return { token };
    },

    updateUser: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      try {
        const updatedUser = await User.findByIdAndUpdate(id, input, { new: true });
        if (!updatedUser) {
          throw new Error("User not found");
        }
        return updatedUser;
      } catch (error) {
        throw new Error("Error updating user");
      }
    },

    deleteUser: async (_, { id }, context) => {
      if (!context.user || context.user.role !== "admin") {
        throw new Error("Unauthorized");
      }

      try {
        await User.findByIdAndDelete(id);
        return "User deleted successfully";
      } catch (error) {
        throw new Error("Error deleting user");
      }
    },

    createTodo: async (_, { input }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      const { title, description, userId } = input;

      try {
        const newTodo = await Todo.create({
          title,
          description,
          userId,
        });
        return newTodo;
      } catch (error) {
        throw new Error("Failed to create todo");
      }
    },

    updateTodo: async (_, { id, input }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      try {
        const updatedTodo = await Todo.findByIdAndUpdate(id, input, { new: true });
        if (!updatedTodo) {
          throw new Error("Todo not found");
        }
        return updatedTodo;
      } catch (error) {
        throw new Error("Error updating todo");
      }
    },

    deleteTodo: async (_, { id }, context) => {
      if (!context.user) {
        throw new Error("Unauthorized");
      }

      try {
        const deletedTodo = await Todo.findByIdAndDelete(id);
        if (!deletedTodo) {
          throw new Error("Todo not found");
        }
        return deletedTodo;
      } catch (error) {
        throw new Error("Error deleting todo");
      }
    },
  },
};
