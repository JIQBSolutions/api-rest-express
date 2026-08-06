class MemoryTaskRepository {
  constructor() {
    this.tasks = new Map();
    this.nextId = 1;
  }

  async initialize() {}

  async ping() {
    return true;
  }

  async findAll() {
    return [...this.tasks.values()].sort((a, b) => a.id - b.id);
  }

  async findById(id) {
    return this.tasks.get(id) || null;
  }

  async create(input) {
    const now = new Date().toISOString();
    const task = {
      id: this.nextId++,
      ...input,
      created_at: now,
      updated_at: now,
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async update(id, input) {
    const current = this.tasks.get(id);
    if (!current) return null;

    const updated = {
      ...current,
      ...input,
      updated_at: new Date().toISOString(),
    };
    this.tasks.set(id, updated);
    return updated;
  }

  async remove(id) {
    return this.tasks.delete(id);
  }

  async close() {
    this.tasks.clear();
  }
}

module.exports = { MemoryTaskRepository };
