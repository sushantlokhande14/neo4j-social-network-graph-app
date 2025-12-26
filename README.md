# Neo4j Social Network Graph Application

A **graph-based social network application** built using **Neo4j**, **FastAPI**, and **React**.  
This project demonstrates how **NoSQL graph databases** can be used to efficiently model
social relationships, perform multi-hop traversals, and generate recommendations.

Developed as part of **CS 157C – NoSQL Database Systems** at **San Jose State University**.

---

## 📌 What Does This Project Do?

This application simulates a real-world social networking platform where users can:

- Register and log in securely
- Create and manage user profiles
- Follow and unfollow other users
- View followers and following lists
- Discover **mutual connections**
- Receive **friend recommendations** based on graph traversal
- Search for users
- Explore popular users based on follower count

All social relationships are stored and queried using a **Neo4j property graph**, making
operations like mutual connections and recommendations efficient and intuitive.

---

## 🧠 Why Neo4j / Graph Databases?

Social networks are naturally modeled as graphs:

- Users → nodes
- Follows → directed relationships

Using Neo4j allows:
- Fast traversal-based queries (1-hop, 2-hop, N-hop)
- Simple expression of complex relationships in **Cypher**
- Better performance for recommendation-style queries than relational databases

---

## 🗂 Graph Data Model

### Node Labels

#### `User`
- `id` (unique)
- `name`
- `username`
- `email`
- `bio`
- `avatar`

#### `Post`
- `id`
- `content`
- `createdAt`

---

### Relationship Types

- `(:User)-[:FOLLOWS]->(:User)`
- `(:User)-[:POSTED]->(:Post)`

This creates a **directed follower graph** similar to real social platforms.

---

## 📊 Dataset

This project is based on the **SNAP Twitter Social Circles (ego-Twitter)** dataset.

- Source: https://snap.stanford.edu/data/ego-Twitter.html
- Directed follower relationships
- A dense subgraph was extracted containing:
  - ~1200 users
  - < 50,000 FOLLOWS edges

⚠️ **Raw dataset files are NOT included** due to licensing restrictions.

Synthetic user profiles and posts were generated to simulate a real application.

---

## ⚙️ Technology Stack

### Backend
- Python
- FastAPI
- Neo4j (Aura)
- Cypher Query Language
- Clerk (Authentication & User Management)

### Frontend
- React
- TypeScript
- Tailwind CSS
- Vite

---

## 🔍 Core Features & Graph Queries

- **User Registration & Authentication**
- **Follow / Unfollow Users**
- **View Followers & Following**
- **Mutual Connections**
  - Users followed by both User A and User B
- **Friend Recommendations**
  - 2-hop traversal (friends-of-friends)
- **Search Users**
  - Full-text index on name, username, email
- **Explore Popular Users**
  - Ranked by follower count

All queries are implemented in **Cypher** and leverage Neo4j’s graph traversal capabilities.

---

## 📁 Project Structure

```text
.
├── backend/            # FastAPI backend and Neo4j queries
├── frontend/           # React + TypeScript UI
├── cypher/             # Cypher scripts (schema, loading, queries)
├── data/
│   └── README.md       # Dataset description (no raw data)
├── paper/
│   └── CS157C_Team_Report.pdf
├── README.md
├── .gitignore
└── requirements.txt
