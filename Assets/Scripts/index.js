const firebaseConfig = {
    apiKey: "AIzaSyDbxQzbE-oSgGacOpxHV8_u2TriYuO3S_8",
    authDomain: "cowclicker-29d15.firebaseapp.com",
    projectId: "cowclicker-29d15",
    storageBucket: "cowclicker-29d15.appspot.com",
    messagingSenderId: "354895804573",
    appId: "1:354895804573:web:099246aa7761791ed3bc74"
};

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

let user;
let clicks = 0;
let username;

document.getElementById('login-button').onclick = function () {
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
        user = result.user;
        toggleUI(true);
        document.getElementById('user-name').innerText = `${user.displayName}`;
        initGame();
    }).catch((error) => {
        console.error("Error during sign in: ", error);
    });
};

auth.onAuthStateChanged((u) => {
    if (u) {
        user = u;
        toggleUI(true);
        document.getElementById('user-name').innerText = `${user.displayName}`;
        initGame();
    } else {
        toggleUI(false);
    }
});

function toggleUI(isLoggedIn) {
    document.getElementById('login-container').style.display = isLoggedIn ? 'none' : 'flex';
    document.getElementById('app-container').style.display = isLoggedIn ? 'flex' : 'none';
}

function initGame() {
    db.collection('users').doc(user.uid).get().then(doc => {
        if (doc.exists) {
            clicks = doc.data().clicks || 0;
            username = doc.data().username || user.displayName;
            updateScore();
        }
    }).catch(error => {
        console.error("Error fetching user data: ", error);
    });
    loadLeaderboard();
}

document.getElementById('cow').onclick = function () {
    clicks++;
    updateScore();
    db.collection('users').doc(user.uid).set({
        username: username,
        clicks: clicks
    }).catch(error => {
        console.error("Error updating clicks: ", error);
    });
    loadLeaderboard();
};

function updateScore() {
    document.getElementById('score').innerText = `${clicks}`;
}

function loadLeaderboard() {
    db.collection('users').orderBy('clicks', 'desc').limit(10).get().then(snapshot => {
        const leaderboardList = document.getElementById('leaderboard-list');
        leaderboardList.innerHTML = '';
        let place = 1;
        snapshot.forEach(doc => {
            const data = doc.data();
            const listItem = document.createElement('li');
            listItem.innerText = `${place}. ${data.username}: ${data.clicks}`;
            leaderboardList.appendChild(listItem);
            place++;
        });
    }).catch(error => {
        console.error("Error loading leaderboard: ", error);
    });
}

function updateUsername() {
    const newUsername = document.getElementById('username').value;
    const statusText = document.getElementById('username-status');

    if (newUsername.length < 1 || newUsername.length > 30) {
        statusText.innerText = 'Username must be between 1 and 30 characters.';
        statusText.style.color = '#FF0000';
        return;
    }

    db.collection('users').where('username', '==', newUsername).get().then(snapshot => {
        if (!snapshot.empty) {
            statusText.innerText = 'Username already taken.';
            statusText.style.color = '#FF0000';
            return;
        } else {
            db.collection('users').doc(user.uid).update({
                username: newUsername
            }).then(() => {
                username = newUsername;
                statusText.innerText = 'Username updated successfully!';
                statusText.style.color = '#00FF00';
                loadLeaderboard();
            }).catch(error => {
                console.error("Error updating username: ", error);
                statusText.innerText = 'Error updating username.';
                statusText.style.color = '#FF0000';
            });
        }
    }).catch(error => {
        console.error("Error checking username: ", error);
        statusText.innerText = 'Error checking username availability.';
        statusText.style.color = '#FF0000';
    });
}

function logout() {
    auth.signOut().then(() => {
        toggleUI(false);
    }).catch((error) => {
        console.error("Error during sign out: ", error);
    });
}