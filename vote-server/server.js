const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require("bcrypt")
const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Connect to database
const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

//Swagger setup
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('swagger-jsdoc');
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Voting API',
      version: '1.0.0',
      description: 'Voting API for yes or no questions',
    },
    basePath: '/',
  },
  apis: ['./server.js'],
};
const swaggerSpec = swaggerDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Create users table
db.run('CREATE TABLE IF NOT EXISTS users (email TEXT PRIMARY KEY, name TEXT, password TEXT, answered INTEGER)', (err) => {
  if (err) {
    console.error(`Error creating table users: ${err.message}`);
  } else {
    console.log(`Table users created successfully.`);
  }
});

// Create questions table
db.run('CREATE TABLE IF NOT EXISTS questions (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, creator_email TEXT, FOREIGN KEY(creator_email) REFERENCES users(email))', (err) => {
  if (err) {
    console.error(`Error creating table questions: ${err.message}`);
  } else {
    console.log(`Table questions created successfully.`);
  }
});

// Create votes table
db.run('CREATE TABLE IF NOT EXISTS votes (id INTEGER PRIMARY KEY AUTOINCREMENT, up BOOLEAN, user_email TEXT, question_id INTEGER, FOREIGN KEY(user_email) REFERENCES users(email), FOREIGN KEY(question_id) REFERENCES questions(id))', (err) => {
  if (err) {
    console.error(`Error creating table votes: ${err.message}`);
  } else {
    console.log(`Table votes created successfully.`);
  }
});

// Routes
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Check if a user with password exists in the database
 *     tags: [Users]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: user
 *         description: The user to check
 *         schema:
 *           type: object
 *           required:
 *             - email
 *             - password
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *     responses:
 *       200:
 *         description: Bool if user with this password exists
 *       500:
 *         description: Server error
 */
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.get(`SELECT password FROM users WHERE email = ?`, [email], (err, result) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Failed to retrieve user.');
    } else {
      bcrypt.compare(password, result.password, function(err, resultOfCompare) {
        if (resultOfCompare) {
          console.log(resultOfCompare);
          res.json({ "exists": true});
        } else {
          res.json({ "exists": false});
        }
      });
      
    }
  });
});

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with an email and password.
 *     tags: [Users]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: user
 *         description: The user to register.
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *             password:
 *               type: string
 *             name:
 *               type: string
 *           required:
 *             - email
 *             - password
 *     responses:
 *       200:
 *         description: OK
 *         schema:
 *           type: object
 *           properties:
 *             email:
 *               type: string
 *       400:
 *         description: Bad Request
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  const sql = 'INSERT INTO users (email, password, name, answered) VALUES (?, ?, ?, 0)';
  db.run(sql, [email, password, name], function(err) {
    if (err) {
      res.status(500).json({ message: err.message });
      return;
    }
    res.json({ email });
  });
});

/**
 * @swagger
 * /allusers:
 *   get:
 *     summary: Get all user emails
 *     description: Get a list of all user emails from the database.
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       500:
 *         description: Internal Server Error
 */
app.get('/allusers', (req, res) => {
  db.all('SELECT * FROM users', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Internal Server Error' });
    } else {
      const emails = rows.map(row => row.email);
      res.json(emails);
    }
  });
});

/**
 * @swagger
 * /user:
 *   get:
 *     summary: Get all questions created by a user
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         description: The email address of the user to retrieve questions for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: OK
 *       400:
 *         description: Bad Request
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *       500:
 *         description: Internal Server Error
 *         schema:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 */
app.get('/user', (req, res) => {
  const email = req.query.email;
  if (!email) {
    res.status(400).json({ message: 'Email is required.' });
    return;
  }
  db.all(`SELECT * FROM questions WHERE creator_email = ?`, [email], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).send('Failed to retrieve questions.');
    } else {
      res.json(rows);
    }
  });
});

/**
 * @swagger
 * /create:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     consumes:
 *       - application/json
 *     parameters:
 *       - in: body
 *         name: question
 *         description: The question to create
 *         schema:
 *           type: object
 *           required:
 *             - text
 *             - creator
 *           properties:
 *             text:
 *               type: string
 *             creator:
 *               type: string
 *     responses:
 *       201:
 *         description: Question created
 *       400:
 *         description: Invalid request body
 *       500:
 *         description: Server error
 */
app.post('/create', (req, res) => {
  console.log(req.query)
  const text = req.body.text;
  const creator_email = req.body.creator;
  console.log(creator_email);
  // Check if user exists in the users table
  db.get(`SELECT * FROM users WHERE email = ?`, [creator_email], function(err, user) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Failed to create question.');
    } else if (!user) {
      console.error(`User with email ${creator_email} does not exist.`);
      res.status(400).send(`User with email ${creator_email} does not exist.`);
    } else {
      // Insert question data into table
      db.run(`INSERT INTO questions (text, creator_email) VALUES (?, ?)`, [text, creator_email], function(err) {
        if (err) {
          console.error(err.message);
          res.status(500).send('Failed to create question.');
        } else {
          console.log(`Question created by ${creator_email}: ${text}`);
          res.send(`Question created by ${creator_email}: ${text}`);
        }
      });
    }
  });
});

/**
 * @swagger
 * /question/all:
 *   get:
 *     summary: Retrieve all questions
 *     description: Retrieve all questions from the questions table
 *     responses:
 *       200:
 *         description: Array of questions
 *       500:
 *         description: Failed to retrieve questions
 *     tags:
 *       - Questions
 */
app.get('/question/all', (req, res) => {
  // Run the SELECT query to retrieve all questions
  db.all('SELECT * FROM questions', (err, rows) => {
    if (err) {
      console.error(`Error retrieving questions: ${err.message}`);
      res.status(500).json({ error: 'Failed to retrieve questions' });
    } else {
      console.log(`Retrieved ${rows.length} questions:`);
      res.json(rows); // Send the retrieved rows as response
    }
  });
});

/**
 * @swagger
 * /question/{id}:
 *   get:
 *     summary: Get a question by ID with votes
 *     tags: [Questions]
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: path
 *         name: id
 *         description: The ID of the question to retrieve
 *         required: true
 *         type: integer
 *     responses:
 *       200:
 *         description: Successful response
 *       404:
 *         description: Question not found
 *       500:
 *         description: Server error
 */
app.get('/question/:id', (req, res) => {
  const questionId = req.params.id;
  // Get question with given ID
  db.get(`SELECT * FROM questions WHERE id = ?`, [questionId], function(err, question) {
    if (err) {
      console.error(err.message);
      res.status(500).send('Failed to retrieve question.');
    } else if (!question) {
      res.status(404).send(`Question with ID ${questionId} not found.`);
    } else {
      // Get votes for question with given ID
      db.all(`SELECT * FROM votes WHERE question_id = ?`, [questionId], function(err, votes) {
        if (err) {
          console.error(err.message);
          res.status(500).send('Failed to retrieve votes for question.');
        } else {
          // Add votes to question object
          question.votes = votes;
          res.json(question);
        }
      });
    }
  });
});

/**
 * @swagger
 * /question/{id}/vote:
 *   put:
 *     summary: Vote on a question
 *     description: Adds or updates a vote for a specific question by a user with the given email
 *     tags: [Votes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the question to vote on
 *       - in: body
 *         name: vote
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             vote:
 *               type: boolean
 *             email:
 *               type: string
 *         description: The vote value (true for upvote, false for downvote) and the email of the user who voted
 *     responses:
 *       200:
 *         description: Success message with vote status
 *       400:
 *         description: Invalid vote value
 *       404:
 *         description: Question not found
 *       500:
 *         description: Failed to update vote
 */

app.put('/question/:id/vote', (req, res) => {
  const questionId = req.params.id;
  const vote = req.body.vote === true;
  const email = req.body.email;

  // Check if question exists
  db.get('SELECT * FROM questions WHERE id = ?', [questionId], (err, question) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ message: 'Failed to retrieve question.' });
    } else if (!question) {
      res.status(404).json({ message: 'Question not found.' });
    } else {
      // Check if user already voted for this question
      db.get('SELECT * FROM votes WHERE user_email = ? AND question_id = ?', [email, questionId], (err, existingVote) => {
        if (err) {
          console.error(err.message);
          res.status(500).json({ message: 'Failed to retrieve vote.' });
        } else {
          if (existingVote) {
            // If the user already voted, update the existing vote
            db.run('UPDATE votes SET up = ? WHERE user_email = ? AND question_id = ?', [vote, email, questionId], (err) => {
              if (err) {
                console.error(err.message);
                res.status(500).json({ message: 'Failed to update vote.' });
              } else {
                res.json({ message: 'Vote updated successfully' });
              }
            });
          } else {
            // If the user hasn't voted yet, add a new vote
            db.run('INSERT INTO votes (user_email, question_id, up) VALUES (?, ?, ?)', [email, questionId, vote], (err) => {
              if (err) {
                console.error(err.message);
                res.status(500).json({ message: 'Failed to create vote.' });
              } else {
                res.json({ message: 'Vote added successfully' });
              }
            });
          }
        }
      });
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

// Close database connection when the app is terminated
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit();
  });
});