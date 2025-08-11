const pool = require("../config/db");

const getAll = (callback) => {
  pool.query("SELECT * FROM personnel", callback);
};

const getAvailableByRole = (role, callback) => {
  pool.query(
    "SELECT * FROM personnel WHERE role = $1 AND available = TRUE",
    [role],
    callback
  );
};

const assignPersonnel = (id, callback) => {
  pool.query(
    "UPDATE personnel SET available = FALSE WHERE id = $1",
    [id],
    callback
  );
};

const releasePersonnel = (id, callback) => {
  pool.query(
    "UPDATE personnel SET available = TRUE WHERE id = $1",
    [id],
    callback
  );
};

const addPersonnel = (person, callback) => {
  const sql = `INSERT INTO personnel (name, contact, role, available) VALUES ($1, $2, $3, TRUE)`;
  pool.query(
    sql,
    [person.name, person.contact, person.role],
    callback
  );
};

module.exports = {
  getAll,
  getAvailableByRole,
  assignPersonnel,
  releasePersonnel,
  addPersonnel
};
