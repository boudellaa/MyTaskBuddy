const client = require("./connection.js");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const app = express();
const nodemailer = require("nodemailer");
const generatePassword = require("generate-password");
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const { insertDailyTasks, insertWeeklyTasks, insertMonthlyTasks, deleteRecurringTasks } = require("./backendHelper/backendHelper.js");

// app.use(bodyParser.json());
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// );
// app.use(cors());

// // Set up multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, 'uploads');
//     cb(null, uploadDir); // Set the destination folder for file uploads
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`); // Set the filename
//   }
// });

// const upload = multer({ storage: storage });

// require("dotenv").config();

// // Serve static files from the build directory
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// app.use(express.static(path.join(__dirname, "public")));

// // Fallback route
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    cb(null, uploadDir); // Set the destination folder for file uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Set the filename
  }
});

const upload = multer({ storage: storage });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Fallback route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post("/oauth-login", async (req, res) => {
  const { email, googleId, firstname, lastname } = req.body;

  // Query to find a user with the provided Google ID or email
  const findUserQuery = `
    SELECT id, firstname, lastname FROM parents
    WHERE google_id = $1 OR email = $2
    LIMIT 1;
  `;

  const values = [googleId, email];

  try {
    const { rows } = await client.query(findUserQuery, values);

    let parentId;

    if (rows.length === 1) {
      // User found, use their existing ID
      parentId = rows[0].id;

      // Optionally update firstname and lastname if they are null or empty
      const updateUserQuery = `
        UPDATE parents
        SET firstname = COALESCE($1, firstname), lastname = COALESCE($2, lastname)
        WHERE id = $3
        RETURNING id;
      `;
      const updateValues = [firstname || rows[0].firstname, lastname || rows[0].lastname, parentId];
      await client.query(updateUserQuery, updateValues);
    } else {
      // No user found, create a new user
      const createUserQuery = `
        INSERT INTO parents (email, google_id, firstname, lastname)
        VALUES ($1, $2, $3, $4)
        RETURNING id;
      `;

      const createUserValues = [email, googleId, firstname, lastname];
      const createUserResult = await client.query(createUserQuery, createUserValues);
      parentId = createUserResult.rows[0].id;
    }

    // Return the user ID as part of the response
    res.status(200).json({ message: "Uspješno ste prijavljeni!", parentId: parentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});


app.post("/login", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const query = `
      SELECT * FROM parents
      WHERE email = $1 AND password = $2
      LIMIT 1;
    `;

  const values = [email, password];

  try {
    const { rows } = await client.query(query, values);

    if (rows.length === 1) {
      const query2 = `
         SELECT id FROM parents
          WHERE email = $1 AND password = $2;
        `;

      const result = await client.query(query2, values);
      const parentId = result.rows[0].id;
      res
        .status(200)
        .json({ message: "Uspješno ste prijavljeni!", parentId: parentId });
    } else {
      res.status(401).json({ message: "Nevalidan email ili password" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

app.post("/register", async (req, res) => {
  const firstname = req.body.firstname;
  const lastname = req.body.lastname;
  const password = req.body.password;
  const email = req.body.email;

  const query = `
  INSERT INTO parents (firstname,lastname,password, email)
  VALUES ($1, $2, $3, $4)
    RETURNING id;
  `;

  const values = [firstname, lastname, password, email];

  try {
    const result = await client.query(query, values);
    const parentId = result.rows[0].id;
    res
      .status(200)
      .json({ message: "Uspješna registracija!", parentId: parentId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error" });
  }
});

app.post("/tasks", upload.fields([{ name: 'videoFile', maxCount: 1 }, { name: 'audioFile', maxCount: 1 }]), async (req, res) => {
  const {
    activity,
    date,
    startTime,
    endTime,
    location,
    priority,
    username,
    parentId,
    event_id,
    category,
    routine
  } = req.body;

  const videoFile = req.files['videoFile'] ? req.files['videoFile'][0].filename : null;
  const audioFile = req.files['audioFile'] ? req.files['audioFile'][0].filename : null;

  try {
    // Search for userId based on the provided username
    const userQuery = "SELECT id FROM users WHERE username = $1";
    const userValues = [username];
    const userResult = await client.query(userQuery, userValues);

    // Check if the user with the given username exists
    if (userResult.rowCount === 0) {
      res.status(404).send("Korisnik nije pronađen!");
      return;
    }

    const userId = userResult.rows[0].id;
    const seriesId = uuidv4();

    const query = `INSERT INTO tasks (activity, date, "startTime", "endTime", location, priority, progress, status, "userId", "parentId", "help", "event_id", "videoFile", "audioFile", category, routine, series_id)
VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8, 0, $9, $10, $11, $12, $13, $14);`
    const values = [
      activity,
      date,
      startTime,
      endTime,
      location,
      priority,
      userId,
      parentId,
      event_id,
      videoFile,
      audioFile,
      category,
      routine,
      seriesId
    ];

    switch (routine) {
      case 'Standardna':
        await client.query(query, values);
        break;
      case 'Dnevna':
        insertDailyTasks(query, values)
        break;
      case 'Sedmična':
        insertWeeklyTasks(query, values)
        break;
      case 'Mjesečna':
        insertMonthlyTasks(query, values)
        break;
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

// Define the endpoint for deleting a task
app.delete("/tasks", async (req, res) => {

  const { id, routine } = req.query;

  const deleteQuery = 'DELETE FROM tasks WHERE id = $1'
  const values = [id]

  switch (routine) {
    case 'Dnevna':
    case 'Sedmična':
    case 'Mjesečna':
      await deleteRecurringTasks(id)
      break;
    default:
      await client.query(deleteQuery, values);
  }

  res.status(200).send("Zadatak je uspješno obrisan!");
})

// PUT request to update a specific task
app.put("/tasks/update", upload.fields([{ name: 'videoFile', maxCount: 1 }, { name: 'audioFile', maxCount: 1 }]), async (req, res) => {
  const {
    id,
    activity,
    date,
    startTime,
    endTime,
    location,
    priority,
    username,
    event_id,
    category,
    routine
  } = req.body;

  const videoFile = req.files['videoFile'] ? req.files['videoFile'][0].filename : null;
  const audioFile = req.files['audioFile'] ? req.files['audioFile'][0].filename : null;

  // Search for userId based on the provided username
  const userQuery = "SELECT id FROM users WHERE username = $1";
  const userValues = [username];
  const userResult = await client.query(userQuery, userValues);

  // Check if the user with the given username exists
  if (userResult.rowCount === 0) {
    res.status(404).send("Korisnik nije pronađen!");
    return;
  }

  const userId = userResult.rows[0].id;

  try {
    await client.query(
      `
    UPDATE tasks
    SET activity = $1, date = $2, "startTime" = $3, "endTime" = $4, location = $5, priority = $6, "userId" = $7, event_id = $8, "videoFile" = $9, "audioFile" = $10, category = $11, routine = $13
    WHERE id = $12
  `,
      [activity, date, startTime, endTime, location, priority, userId, event_id, videoFile, audioFile, category, id, routine]
    );

    return res.json({ message: "Zadatak uspješno ažuriran" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Greška pri ažuriranju zadatka!" });
  }
});

app.post("/tasks/getId", async (req, res) => {
  const { activity, date, startTime, endTime, location, priority, username } =
    req.body;

  // Search for userId based on the provided username
  const userQuery = "SELECT id FROM users WHERE username = $1";
  const userValues = [username];
  const userResult = await client.query(userQuery, userValues);

  // Check if the user with the given username exists
  if (userResult.rowCount === 0) {
    res.status(404).send("Korisnik nije pronađen!");
    return;
  }

  const userId = userResult.rows[0].id;
  // Get the id from the tasks table based on the provided criteria
  const taskIdQuery = `SELECT id
 FROM tasks
 WHERE activity = $1
   AND date = $2
   AND "startTime" = $3
   AND "endTime" = $4
   AND location = $5
   AND priority = $6
   AND "userId" = $7`;
  const taskIdValues = [
    activity,
    date,
    startTime,
    endTime,
    location,
    priority,
    userId,
  ];
  try {
    const taskIdResult = await client.query(taskIdQuery, taskIdValues);

    if (taskIdResult.rows.length === 0) {
      res.status(404).send("Zadatak nije pronađen!");
      return;
    }

    const taskId = taskIdResult.rows[0].id;
    return res.json({ taskId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Failed to get task ID" });
  }
});

app.post("/substeps", async (req, res) => {
  const { subtasks } = req.body;

  if (!Array.isArray(subtasks) || subtasks.length === 0) {
    return res.status(400).json({ message: "Subtasks should be a non-empty array." });
  }

  try {
    // Construct the query for inserting multiple rows at once
    const query = `
      INSERT INTO substeps ("stepName", description, "taskId", status)
      VALUES ${subtasks.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}, 0)`).join(', ')};
    `;

    // Flatten the array of objects into a single array of values
    const values = subtasks.flatMap(subtask => [subtask.stepName, subtask.description, subtask.taskId]);

    await client.query(query, values);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error inserting subtasks:", error);
    res.sendStatus(500);
  }
});

app.put("/substeps", async (req, res) => {
  const { subtasks } = req.body;

  // Filter out existing subtasks (those with an id)
  const newSubtasks = subtasks.filter(subtask => !subtask.id);

  if (!Array.isArray(newSubtasks) || newSubtasks.length === 0) {
    return res.status(400).json({ message: 'No new subtasks to insert' });
  }

  try {
    const insertQuery = `
      INSERT INTO substeps ("stepName", description, "taskId", status)
      VALUES ${newSubtasks.map((_, index) => `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}, 0)`).join(', ')}
    `;

    const values = newSubtasks.flatMap(subtask => [subtask.stepName, subtask.description, subtask.taskId]);

    await client.query(insertQuery, values);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error inserting new subtasks:", error);
    res.sendStatus(500);
  }
});


app.delete("/substeps", async (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: "Substep Id is required" });
  }

  try {
    const deleteQuery = `
      DELETE FROM substeps
      WHERE "id" = $1;
    `;
    const values = [id];

    const result = await client.query(deleteQuery, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Subtask not found." });
    }

    res.status(200).json({ message: "Subtask deleted successfully." });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    res.sendStatus(500);
  }
});


app.get("/get-tasks", (req, res) => {
  // Query the tasks table
  client.query("SELECT * FROM tasks", (error, result) => {
    if (error) {
      console.error("Error executing query", error);
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      const tasks = result.rows;
      res.json(tasks);
    }
  });
});

app.get("/parents/:parentId", async (req, res) => {
  const parentId = req.params.parentId;
  try {
    const query =
      "SELECT firstname, lastname, email FROM parents WHERE id = $1";
    const values = [parentId];
    const result = await client.query(query, values);
    const userData = result.rows[0];

    res.json(userData);
  } catch (error) {
    console.error("Error retrieving user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
// PUT route to update parent's email and password
app.put("/parents/:parentId", async (req, res) => {
  const parentId = req.params.parentId;
  const { email, password } = req.body;
  let query = "";
  let values = [];

  if (!email && password) {
    query = `
    UPDATE parents
    SET  password = $1
    WHERE id = $2
  `;
    values = [password, parentId];
  } else if (!password && email) {
    query = `
    UPDATE parents
    SET  email = $1
    WHERE id = $2
  `;

    values = [password, parentId];
  } else {
    query = `
    UPDATE parents
    SET email =$1, password = $2
    WHERE id = $3
  `;
    values = [email, password, parentId];
  }
  try {
    await client.query(query, values);
    res.status(200).json({ message: "Uspješno ažuriran profil!" });
  } catch (error) {
    console.error("Error pri ažuriranju profila", error);
    res.status(500).json({ error: "Greška prilikom ažuriranja profila!" });
  }
});
app.get("/tasks", async (req, res) => {
  const { parentId } = req.query;

  try {
    const query = 'SELECT * FROM tasks WHERE "parentId" = $1';
    const values = [parentId];

    const result = await client.query(query, values);
    const tasks = result.rows;

    res.json(tasks);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/completed-tasks", async (req, res) => {
  const { parentId } = req.query;

  try {
    const query = 'SELECT * FROM tasks WHERE "parentId" = $1 AND "status" = $2';
    const values = [parentId, 1]; // Fetch only tasks with status = 1

    const result = await client.query(query, values);
    const tasks = result.rows;

    res.json(tasks);
  } catch (error) {
    console.error("Error executing query", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/users/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Execute a PostgreSQL query to retrieve user information
    const query = "SELECT * FROM users WHERE id = $1";
    const result = await client.query(query, [userId]);

    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    // Return the user informations
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while processing the request." });
  }
});

app.get("/substeps", async (req, res) => {
  const { taskId } = req.query;

  try {
    const substeps = await client.query(
      'SELECT * FROM substeps WHERE "taskId" = $1',
      [taskId]
    );
    res.json(substeps.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/send-email", async (req, res) => {
  const { to } = req.body;

  // Create a transporter using the SMTP details or email service provider configuration
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "mytaskbuddy0711@gmail.com",
    },
  });

  // Create the email message
  const password = generatePassword.generate({
    length: 12,
    numbers: true,
    symbols: true,
    uppercase: true,
    lowercase: true,
  });

  const subject = "VAŠA NOVA LOZINKA";
  const text = "Vaša nova lozinka za aplikaciju je: " + password;

  const mailOptions = {
    from: "your-email@example.com", // Sender's email address
    to, // Recipient's email address (received from request body)
    subject, // Email subject (received from request body)
    text, // Email body (received from request body)
  };

  const userQuery = "SELECT id FROM parents WHERE email = $1";
  const userValues = [to];
  const userResult = await client.query(userQuery, userValues);

  // Check if the user with the given username exists
  if (userResult.rowCount === 0) {
    res.status(404).send("Korisnik nije pronađen!");
    return;
  }

  const userId = userResult.rows[0].id;
  const userQuery2 = "UPDATE parents SET password = $1 WHERE id = $2 ";
  const userValues2 = [password, userId];
  const userResult2 = await client.query(userQuery2, userValues2);

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).json({ error: "Greška pri slanju emaila" });
    } else {
      console.log("Email je poslan:", info.response);
      res.json({ message: "Email je uspješno isporučen" });
    }
  });
});

app.get('/notifications', async (req, res) => {
  try {
    const query = `SELECT * FROM tasks 
    WHERE "task_completed" = true
    OR "help_requested" = true;`

    const result = await client.query(query)

    res.status(200).json(result)
  } catch (error) {
    res.status(500).json({ error: 'Could not retrieve notifications!' })
  }
})
app.put('/notifications', async (req, res) => {
  const { taskType, taskId } = req.body

  const updateQuery = `UPDATE tasks
  SET ${taskType} = true
  WHERE "id" = $1;`
  const values = [taskId]

  try {
    if (!['task_completed', 'help_requested', 'task_started'].includes(taskType)) {
      return res.status(400).json({ message: 'Invalid task type' });
    }
    await client.query(updateQuery, values);
    res.status(200).json({ message: 'Notification created successfully!' });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Error updating task' });
  }
})

app.put('/notifications/dismiss', async (req, res) => {
  const { id, taskType } = req.query;

  let query = `
    UPDATE tasks
    SET help_requested = NULL, 
    "help" = 0
  `;

  if (taskType === "task_completed") {
    query += `, "${taskType}" = NULL`;
  }

  query += ` WHERE "id" = $1`;

  const values = [id];

  try {
    await client.query(query, values);
    res.status(200).json({ message: 'Notification dismissed successfully!' });
  } catch (error) {
    console.error('Error dismissing notification', error);
    res.status(500).json({ message: 'Error dismissing task' });
  }
});


app.listen(8000, () => {
  console.log("Sever is now listening at port 8000");
});

client.connect();
