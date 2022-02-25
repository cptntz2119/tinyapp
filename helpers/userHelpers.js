const fetchUserInfo = (userDatabase, email) => {
  let userInfo = undefined;

  if (userDatabase[email]) {
    userInfo = userDatabase[email];
  } else {
    userInfo = {};
  }

  return userInfo;
  // for (let data in database) {
  //   if (email === database[data]["email"]) {
  //     return database[data];
  //   }
  //   return undefined;
  // }
};

const authenticateUser = (users, email) => {
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



module.exports = {
  fetchUserInfo,
  authenticateUser,
  generateRandomString,
};
