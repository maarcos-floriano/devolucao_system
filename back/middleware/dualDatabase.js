const database = require('../config/database');

/**
 * Middleware para executar operações em ambos os bancos
 */
class DualDatabase {
  /**
   * Executa query em ambos os bancos (principal e backup)
   */
  static async executeOnBothPools(sql, params = []) {
    try {
      // Executa no banco principal
      const resultMain = await database.mainPool.query(sql, params);
      
      console.log("✅ Atualização realizada com sucesso:", sql, params);

      // Executa no backup de forma assíncrona (não bloqueia)
      database.backupPool.query(sql, params).catch(err => {
        console.error("⚠️ Falha ao salvar no banco de backup:", err.message);
      });

      return resultMain;
    } catch (err) {
      console.error("❌ Erro no banco principal:", err.message);
      throw err;
    }
  }

  /**
   * Executa apenas no banco principal (para consultas)
   */
  static async executeOnMainPool(sql, params = []) {
    try {
      const result = await database.mainPool.query(sql, params);
      return result;
    } catch (err) {
      console.error("❌ Erro no banco principal:", err.message);
      throw err;
    }
  }

  /**
   * Transação em ambos os bancos
   */
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
}

module.exports = DualDatabase;