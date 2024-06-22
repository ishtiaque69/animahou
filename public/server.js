const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/submit-quiz', (req, res) => {
  const { name, phone, email, score, timeTaken } = req.body;

  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data file');
      return;
    }

    const parsedData = JSON.parse(data);
    const submissions = parsedData.submissions;
    const leaderboard = parsedData.leaderboard;

    const emailExists = submissions.some(submission => submission.email === email);

    if (emailExists) {
      res.status(400).send('This email ID has already been used to take the quiz.');
      return;
    }

    submissions.push({ name, phone, email });

    leaderboard.push({ name, email, points: score, time: timeTaken });
    leaderboard.sort((a, b) => b.points - a.points || a.time - b.time);
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    fs.writeFile('data.json', JSON.stringify({ submissions, leaderboard }), 'utf8', (err) => {
      if (err) {
        res.status(500).send('Error saving data');
        return;
      }
      res.status(200).send('Quiz submitted successfully');
    });
  });
});

app.get('/leaderboard', (req, res) => {
  fs.readFile('data.json', 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading data file');
      return;
    }
    const parsedData = JSON.parse(data);
    res.json(parsedData.leaderboard);
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
