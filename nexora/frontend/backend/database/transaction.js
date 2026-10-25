const logger = require('../config/logger');

async function withTransaction(pool, operation) {
  const connection = await pool.getConnection();
  let transactionStarted = false;

  try {
    await connection.beginTransaction();
    transactionStarted = true;
    const result = await operation(connection);
    await connection.commit();
    transactionStarted = false;
    return result;
  } catch (error) {
    if (transactionStarted) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        logger.error('Database transaction rollback failed.', {
          message: rollbackError.message,
        });
      }
    }
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { withTransaction };