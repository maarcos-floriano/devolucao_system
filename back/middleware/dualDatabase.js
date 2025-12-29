// utils/DualDatabase.js (CORRIGIDO)
const database = require('../config/database');

class DualDatabase {
  static async executeOnBothPools(sql, params = []) {
    try {
      // Executa no banco principal
      const [result] = await database.mainPool.query(sql, params);
      
      console.log("✅ Atualização realizada com sucesso:", sql, params);

      // Executa no backup de forma assíncrona (não bloqueia)
      database.backupPool.query(sql, params).catch(err => {
        console.error("⚠️ Falha ao salvar no banco de backup:", err.message);
      });

      return result;
    } catch (err) {
      console.error("❌ Erro no banco principal:", err.message);
      throw err;
    }
  }

  static async executeOnMainPool(sql, params = []) {
    try {
      const [rows] = await database.mainPool.query(sql, params);
      return rows;
    } catch (err) {
      console.error("❌ Erro no banco principal:", err.message);
      throw err;
    }
  }

  static async insertOnBothPools(sql, params = []) {
    try {
      // Executa no banco principal
      const [result] = await database.mainPool.query(sql, params);
      
      console.log("✅ INSERT realizado com sucesso:", sql, params);

      // Executa no backup de forma assíncrona (não bloqueia)
      database.backupPool.query(sql, params).catch(err => {
        console.error("⚠️ Falha ao salvar no banco de backup:", err.message);
      });

      return result;
    } catch (err) {
      console.error("❌ Erro no banco principal:", err.message);
      throw err;
    }
  }

  static async transaction(callback) {
    let connMain, connBackup;
    
    try {
      // Inicia transação no banco principal
      connMain = await database.mainPool.getConnection();
      await connMain.beginTransaction();

      // Executa callback com conexão principal
      const result = await callback(connMain);

      // Commit no principal
      await connMain.commit();
      connMain.release();

      // Tenta replicar no backup
      if (result?.replicate !== false) {
        try {
          connBackup = await database.backupPool.getConnection();
          await connBackup.beginTransaction();
          
          // Aqui você replicaria as operações
          await connBackup.commit();
          connBackup.release();
        } catch (backupError) {
          console.error("⚠️ Erro no backup (não crítico):", backupError.message);
          if (connBackup) {
            await connBackup.rollback();
            connBackup.release();
          }
        }
      }

      return result;
    } catch (err) {
      // Rollback em caso de erro
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

  /**
   * Método para contar registros
   */
  static async count(sql, params = []) {
    try {
      const [rows] = await database.mainPool.query(sql, params);
      return rows[0] ? rows[0] : { count: 0 };
    } catch (err) {
      console.error("❌ Erro ao contar registros:", err.message);
      throw err;
    }
  }
}

module.exports = DualDatabase;