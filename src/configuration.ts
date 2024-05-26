import type MigrationData from "./migration/migrationData";

export default interface DatabaseConfiguration {
  dbName: string;
  serverUri?: string;
  migrations: MigrationData[];
}
