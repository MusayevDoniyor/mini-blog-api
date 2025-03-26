import express, { Request, Response } from "express";
const router = express.Router();

router.get("/", (_: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Mini Blog API</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f4f4f9;
          color: #333;
        }
        header {
          background-color: #4CAF50;
          color: white;
          padding: 1.5rem 0;
          text-align: center;
          font-size: 2rem;
        }
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 2rem auto;
          max-width: 800px;
          padding: 1rem;
        }
        .routes {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 2rem;
        }
        .route {
          background-color: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 1rem 2rem;
          text-align: center;
          border-radius: 8px;
          transition: transform 0.3s;
        }
        .route a {
          text-decoration: none;
          color: #4CAF50;
          font-weight: bold;
        }
        .route:hover {
          transform: scale(1.05);
        }
        footer {
          margin-top: 3rem;
          text-align: center;
          font-size: 0.9rem;
          color: #666;
        }
      </style>
    </head>
    <body>
      <header>Welcome to Mini Blog API</header>
      <main>
        <p>Explore the available routes below to interact with the API:</p>
        <div class="routes">
          <div class="route"><a href="/api/auth/register">Register</a> - Create a new user</div>
          <div class="route"><a href="/api/auth/login">Login</a> - Log in as a user</div>
          <div class="route"><a href="/api/posts">Posts</a> - View all blog posts</div>
          <div class="route"><a href="/api-docs">Swagger Docs</a> - API documentation</div>
        </div>
      </main>
      <footer>&copy; 2025 Mini Blog API. All rights reserved.</footer>
    </body>
    </html>
  `);
});

export default router;
