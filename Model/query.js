const { Pool } = require('pg');
const credentials = require('../Config/db');


async function CreateAndInsertUsers(
  
  email
  
) {
  const pool = new Pool(credentials);
  const newUser = await pool.query(
    'INSERT INTO users (email) VALUES ($1) RETURNING *',
    [email]
  );
  console.log(newUser);
  await pool.end();

  return;
}



async function FindUser(email) {
  const pool = new Pool(credentials);
  const findUserInfo = await pool.query('SELECT * FROM users WHERE email=$1', [
    email,
  ]);
  if (findUserInfo.rowCount != 0) {
    console.log('external query finduser', findUserInfo);

    await pool.end();
    const res = JSON.parse(JSON.stringify(findUserInfo.rows[0]));
    console.log('res :', res);
    //console.log('db hashed password', res.password);
    return res;
  } 
}

async function FindUserSubscription(email) {
  const pool = new Pool(credentials);
  const findUserInfo = await pool.query(
    'SELECT suggestion FROM users WHERE email=$1',
    [email]
  );
  console.log(
    'external query findusersubscription',
    findUserInfo.rows[0].suggestion
  );

  await pool.end();

  return findUserInfo.rows[0].suggestion;
}

async function FindUserPassword(email) {
  const pool = new Pool(credentials);
  const findUserPassword = await pool.query(
    'SELECT password FROM users WHERE email=$1',
    [email]
  );
  console.log(findUserPassword);
  await pool.end();

  return findUserPassword;
}

async function UpdateUserPassword(userEmail, userPass) {
  const pool = new Pool(credentials);
  const updateUserPassword = await pool.query(
    'UPDATE users SET password = $1 WHERE email= $2',
    [userPass, userEmail]
  );
  //console.log(updateUserPassword);
  await pool.end();

  return;
}

async function UpdateUserSubscription(sublistArr, userEmail) {
  const pool = new Pool(credentials);
  const updateUserSubscription = await pool.query(
    'UPDATE users SET suggestion = $1 WHERE email= $2',
    [sublistArr, userEmail]
  );
  //console.log(updateUserPassword);
  await pool.end();

  return;
}


async function GetAllInfo() {
  const pool = new Pool(credentials);
  const getAllInfo = await pool.query('SELECT * FROM users');
  // console.log(
  //   'All info',
  //   getAllInfo.rows
  // );
  
  await pool.end();

  return getAllInfo.rows;
}



module.exports = {
  CreateAndInsertUsers,
  FindUser,
  FindUserPassword,
  UpdateUserPassword,
  FindUserSubscription,
  UpdateUserSubscription,
  GetAllInfo,
};