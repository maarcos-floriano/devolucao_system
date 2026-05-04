const database = require('../config/database');

function replicateToBackup(sql, params) {
  if (!database.backupPool) {
    return;
  }

  database.backupPool.query(sql, params).catch((err) => {
    console.error('Falha ao salvar no banco de backup:', err.message);
  });
}

class DualDatabase {
  static async executeOnBothPools(sql, params = []) {
    try {
      const [result] = await database.mainPool.query(sql, params);
      replicateToBackup(sql, params);
      return result;
    } catch (err) {
      console.error('Erro no banco principal:', err.message);
      throw err;
    }
  }

  static async executeOnMainPool(sql, params = []) {
    try {
      const [rows] = await database.mainPool.query(sql, params);
      return rows;
    } catch (err) {
      console.error('Erro no banco principal:', err.message);
      throw err;
    }
  }

  static async insertOnBothPools(sql, params = []) {
    try {
      const [result] = await database.mainPool.query(sql, params);
      replicateToBackup(sql, params);
      return result;
    } catch (err) {
      console.error('Erro no banco principal:', err.message);
      throw err;
    }
  }

  static async transaction(callback) {
    let connMain;
    let connBackup;

    try {
      connMain = await database.mainPool.getConnection();
      await connMain.beginTransaction();

      const result = await callback(connMain);

      await connMain.commit();
      connMain.release();

      if (result?.replicate !== false && database.backupPool) {
        try {
          connBackup = await database.backupPool.getConnection();
          await connBackup.beginTransaction();
          await connBackup.commit();
          connBackup.release();
        } catch (backupError) {
          console.error('Erro no backup nao critico:', backupError.message);
          if (connBackup) {
            await connBackup.rollback();
            connBackup.release();
          }
        }
      }

      return result;
    } catch (err) {
      if (connMain) {
        await connMain.rollback();
        connMain.release();
      }

      if (connBackup) {
        await connBackup.rollback();
        connBackup.release();
      }

      throw err;
    }
  }

  static async count(sql, params = []) {
    try {
      const [rows] = await database.mainPool.query(sql, params);
      return rows[0] ? rows[0] : { count: 0 };
    } catch (err) {
      console.error('Erro ao contar registros:', err.message);
      throw err;
    }
  }
}

module.exports = DualDatabase;
