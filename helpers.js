// helpers.js

// searches usersDB for a user with a given email
function getUser(searchEmail, usersDB) {
  for (const userId in usersDB) {
    const user = usersDB[userId];
    if (user.email === searchEmail) {
      return user;
    }
  };
}

// generates a random string of a given length
function generateRandomString(length) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomString = '';
  for (let i = 0; i < length; i++) {
    randomString += charset[Math.floor(Math.random() * charset.length)];
  }
  return randomString;
}

// searches urlDatabase for urls belonging to a user
function urlsForUser(userID, urlDB) {
  const userURLs = {};
  for (const shortURL in urlDB) {
    if (urlDB[shortURL].userID === userID) {
      userURLs[shortURL] = urlDB[shortURL].longURL;
    }
  }
  return userURLs;
}


module.exports = {getUser, generateRandomString, urlsForUser};