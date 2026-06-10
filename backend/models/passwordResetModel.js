const sqlite3 = require('sqlite3').verbose();
const db = require('../database');

function closeWithResult(connection, callback, error, result) {
  connection.close((closeError) => {
    callback(error || closeError || null, result);
  });
}

function rollback(connection, callback, error, result = false) {
  connection.run('ROLLBACK', (rollbackError) => {
    closeWithResult(connection, callback, error || rollbackError, result);
  });
}

function commit(connection, callback, result = true) {
  connection.run('COMMIT', (commitError) => {
    if (commitError) {
      rollback(connection, callback, commitError);
      return;
    }

    closeWithResult(connection, callback, null, result);
  });
}

function createPasswordResetModel(databasePath) {
  function openConnection(callback) {
    const connection = new sqlite3.Database(databasePath, (openError) => {
      if (openError) {
        callback(openError);
        return;
      }

      connection.configure('busyTimeout', 5000);
      connection.run('PRAGMA foreign_keys = ON', (pragmaError) => {
        if (pragmaError) {
          closeWithResult(connection, callback, pragmaError);
          return;
        }

        callback(null, connection);
      });
    });
  }

  return {
    replaceForUser(userId, tokenHash, expiresAt, callback) {
      openConnection((openError, connection) => {
        if (openError) {
          callback(openError);
          return;
        }

        connection.run('BEGIN IMMEDIATE TRANSACTION', (beginError) => {
          if (beginError) {
            closeWithResult(connection, callback, beginError);
            return;
          }

          connection.run(
            `UPDATE password_reset_tokens
             SET used_at = datetime('now')
             WHERE user_id = ? AND used_at IS NULL`,
            [userId],
            (invalidateError) => {
              if (invalidateError) {
                rollback(connection, callback, invalidateError);
                return;
              }

              connection.run(
                `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
                 VALUES (?, ?, ?)`,
                [userId, tokenHash, expiresAt],
                (insertError) => {
                  if (insertError) {
                    rollback(connection, callback, insertError);
                    return;
                  }

                  commit(connection, callback);
                }
              );
            }
          );
        });
      });
    },

    consumeAndUpdatePassword(tokenHash, passwordHash, now, callback) {
      openConnection((openError, connection) => {
        if (openError) {
          callback(openError);
          return;
        }

        connection.run('BEGIN IMMEDIATE TRANSACTION', (beginError) => {
          if (beginError) {
            closeWithResult(connection, callback, beginError);
            return;
          }

          connection.get(
            `SELECT id, user_id
             FROM password_reset_tokens
             WHERE token_hash = ?
               AND used_at IS NULL
               AND expires_at > ?`,
            [tokenHash, now],
            (findError, resetToken) => {
              if (findError) {
                rollback(connection, callback, findError);
                return;
              }

              if (!resetToken) {
                rollback(connection, callback, null, false);
                return;
              }

              connection.run(
                'UPDATE users SET password = ? WHERE id = ?',
                [passwordHash, resetToken.user_id],
                function (passwordError) {
                  if (passwordError || this.changes !== 1) {
                    rollback(
                      connection,
                      callback,
                      passwordError || new Error('Utente associato al token non trovato')
                    );
                    return;
                  }

                  connection.run(
                    `UPDATE password_reset_tokens
                     SET used_at = datetime('now')
                     WHERE id = ? AND used_at IS NULL`,
                    [resetToken.id],
                    function (consumeError) {
                      if (consumeError || this.changes !== 1) {
                        rollback(
                          connection,
                          callback,
                          consumeError || new Error('Token di recupero già utilizzato')
                        );
                        return;
                      }

                      commit(connection, callback);
                    }
                  );
                }
              );
            }
          );
        });
      });
    }
  };
}

module.exports = createPasswordResetModel(db.databasePath);
module.exports.createPasswordResetModel = createPasswordResetModel;
