
const getUserByEmail = (users, email) => {
  for (let user in users) {
    if (users[user]["email"] === email) {
      return users[user];
    }
  }
  return undefined;
};

const  generateRandomString=() =>{
  return Math.random().toString(36).replace("0.", "").substring(0, 6);
}

const urlsForUser = (id, urlDatabase) => {
  const userURLs = {};
  for (obj in urlDatabase) {
    if (urlDatabase[obj].userID === id) {
      userURLs[obj] = urlDatabase[obj];
    }
  }
  return userURLs;
};


module.exports = {
  urlsForUser,
  getUserByEmail,
  generateRandomString,
};
