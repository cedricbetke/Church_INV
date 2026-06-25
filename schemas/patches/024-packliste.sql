SET @packliste_column_exists := (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'geraet'
      AND COLUMN_NAME = 'packliste'
);

SET @packliste_ddl := IF(
    @packliste_column_exists = 0,
    'ALTER TABLE geraet ADD COLUMN packliste TEXT NULL AFTER zustandshinweis',
    'SELECT 1'
);

PREPARE packliste_stmt FROM @packliste_ddl;
EXECUTE packliste_stmt;
DEALLOCATE PREPARE packliste_stmt;
