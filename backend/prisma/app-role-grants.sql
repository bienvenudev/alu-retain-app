-- Run once as the migration role (the owner of the tables) so the API's
-- runtime role can read and write data but cannot change the schema.
GRANT USAGE ON SCHEMA public TO retain_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO retain_app;
ALTER DEFAULT PRIVILEGES FOR ROLE retain_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO retain_app;
