const { Pool } = require("pg");

class PostgresTaskRepository {
  constructor({ connectionString, ssl }) {
    this.pool = new Pool({
      connectionString,
      ssl: ssl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
  }

  async initialize() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS tareas (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(120) NOT NULL CHECK (char_length(trim(titulo)) > 0),
        descripcion TEXT NOT NULL DEFAULT '',
        completada BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
  }

  async ping() {
    await this.pool.query("SELECT 1");
    return true;
  }

  async findAll() {
    const result = await this.pool.query(
      "SELECT * FROM tareas ORDER BY id ASC",
    );
    return result.rows;
  }

  async findById(id) {
    const result = await this.pool.query(
      "SELECT * FROM tareas WHERE id = $1",
      [id],
    );
    return result.rows[0] || null;
  }

  async create(input) {
    const result = await this.pool.query(
      `INSERT INTO tareas (titulo, descripcion, completada)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [input.titulo, input.descripcion, input.completada],
    );
    return result.rows[0];
  }

  async update(id, input) {
    const fields = Object.keys(input);
    const assignments = fields.map((field, index) => `${field} = $${index + 1}`);
    const values = fields.map((field) => input[field]);

    const result = await this.pool.query(
      `UPDATE tareas
       SET ${assignments.join(", ")}, updated_at = NOW()
       WHERE id = $${fields.length + 1}
       RETURNING *`,
      [...values, id],
    );
    return result.rows[0] || null;
  }

  async remove(id) {
    const result = await this.pool.query(
      "DELETE FROM tareas WHERE id = $1",
      [id],
    );
    return result.rowCount > 0;
  }

  async close() {
    await this.pool.end();
  }
}

module.exports = { PostgresTaskRepository };
