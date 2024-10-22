import { gql } from "apollo-server";

export const Schema = gql`

# User type represents an application user
type User {
  id: ID!
  username: String! 
  email: String! 
  password: String! 
  role: String 
  todos: [Todo!]! # List of todos associated with the user
}

# Represents a to-do item
type Todo {
  id: ID! 
  title: String! 
  description: String! 
  status: TodoStatus # Status of the to-do (e.g., 'pending', 'completed')
  user: User! # The user who owns this to-do
}

# Response type after a successful login
type LoginResponse {
  token: String # JWT token returned after login
}

# Enum to define the status of a to-do item
enum TodoStatus {
  PENDING
  COMPLETED
  IN_PROGRESS
}

# Query type to fetch users and todos
type Query {
  # Fetches all users
  users: [User!]!

  # Fetch a single user by ID
  user(id: ID!): User

  # Fetches all todos
  todos: [Todo!]!

  # Fetch a single to-do item by ID
  todo(id: ID!): Todo

  # Fetches todos for a specific user by user ID
  todosByUser(userId: ID!): [Todo!]!
}

# Mutation type for modifying users and todos
type Mutation {
  # Registers a new user
  registerUser(input: NewUserInput!): User!

  # Logs in a user and returns a token
  loginUser(email: String!, password: String!): LoginResponse!

  # Updates an existing user by ID
  updateUser(id: ID!, input: UpdateUserInput!): User

  # Deletes a user by ID
  deleteUser(id: ID!): String

  # Creates a new to-do item
  createTodo(input: NewTodoInput!): Todo!

  # Updates an existing to-do item by ID
  updateTodo(id: ID!, input: UpdateTodoInput!): Todo

  # Deletes a to-do item by ID
  deleteTodo(id: ID!): Todo
}

# Input type for creating a new user
input NewUserInput {
  username: String! # User's username
  email: String! # User's email
  password: String! # User's password
  role: String # Optional role field (e.g., 'admin', 'user')
  todos: [NewTodoInput] # Optional: Initial todos for the user
}

# Input type for updating an existing user
input UpdateUserInput {
  username: String # Optional: New username
  email: String # Optional: New email
  password: String # Optional: New password (hashed on server-side)
}

# Input type for creating a new to-do item
input NewTodoInput {
  title: String! # Title of the to-do
  description: String! # Description of the to-do
  userId: ID! # The ID of the user who owns this to-do
}

# Input type for updating an existing to-do
input UpdateTodoInput {
  title: String # Optional: New title for the to-do
  description: String # Optional: New description for the to-do
  status: TodoStatus # Optional: New status for the to-do (PENDING, COMPLETED, IN_PROGRESS)
}

`;
