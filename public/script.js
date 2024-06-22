let timer;
let timeLeft = 600; // 10 minutes in seconds

function startQuiz() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!name || !phone || !email) {
        alert('Please enter your name, phone number, and email.');
        return;
    }

    localStorage.setItem('userName', name);
    localStorage.setItem('userPhone', phone);
    localStorage.setItem('userEmail', email);

    window.location.href = 'quiz.html';
}

function startTimer() {
    const timerElement = document.getElementById('timer');
    timer = setInterval(() => {
        timeLeft--;
        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;
        timerElement.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            submitQuiz();
        }
    }, 1000);
}

function submitQuiz() {
    clearInterval(timer);

    const form = document.getElementById('quizForm');
    const formData = new FormData(form);
    let score = 0;

    for (let [key, value] of formData.entries()) {
        if (value === 'correct') {
            score += 1;
        } else if (value === 'wrong') {
            score -= 0.25;
        }
    }

    const timeTaken = 600 - timeLeft;
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');

    fetch('/submit-quiz', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: userName,
            phone: localStorage.getItem('userPhone'),
            email: userEmail,
            score,
            timeTaken,
        }),
    })
    .then(response => response.text())
    .then(message => {
        if (message === 'Quiz submitted successfully') {
            window.location.href = 'results.html';
        } else {
            alert(message);
        }
    })
    .catch(error => {
        console.error('Error submitting quiz:', error);
    });
}

function loadResults() {
    fetch('/leaderboard')
        .then(response => response.json())
        .then(leaderboard => {
            const leaderboardTable = document.getElementById('leaderboard').querySelector('tbody');
            const userResultTable = document.getElementById('userResult').querySelector('tbody');
            const userName = localStorage.getItem('userName');
            let userRank, userEntry;

            leaderboardTable.innerHTML = '';
            userResultTable.innerHTML = '';

            leaderboard.forEach((entry, index) => {
                const row = document.createElement('tr');
                const minutes = Math.floor(entry.time / 60);
                const seconds = entry.time % 60;
                const timeFinal = `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;

                row.innerHTML = `<td>${entry.rank}</td><td>${entry.name}</td><td>${entry.points}</td><td>${timeFinal}</td><td>${entry.email}</td>`;

                if (entry.rank <= 3) {
                    row.classList.add('top3');
                }

                leaderboardTable.appendChild(row);

                if (entry.name === userName) {
                    userRank = entry.rank;
                    userEntry = entry;
                }
            });

            if (userEntry) {
                const minutes = Math.floor(userEntry.time / 60);
                const seconds = userEntry.time % 60;
                const timeFinal = `${minutes} min ${seconds < 10 ? '0' : ''}${seconds} sec`;
                const row = document.createElement('tr');

                row.innerHTML = `<td>${userRank}</td><td>${userEntry.name}</td><td>${userEntry.points}</td><td>${timeFinal}</td><td>${userEntry.email}</td>`;
                userResultTable.appendChild(row);
            }

            document.getElementById('thankYouMessage').textContent = `Thank you, ${userName}, for participating!`;
        })
        .catch(error => {
            console.error('Error loading results:', error);
        });
}

if (window.location.pathname.endsWith('quiz.html')) {
    startTimer();
} else if (window.location.pathname.endsWith('results.html')) {
    loadResults();
}
