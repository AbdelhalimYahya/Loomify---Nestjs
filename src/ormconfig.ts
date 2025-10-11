import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";
import { DataSource } from "typeorm";

const config: PostgresConnectionOptions = {
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "devuser",
    password: "1234",
    database: "blog",
    entities: [__dirname+"/**/*.entity.{.ts,.js}"],
    // synchronize: true,
    migrationsTableName: "migrations",
    migrations: [__dirname+"/migration/**/*.{.ts,.js}"],
    logging: true,
    // migrations: ["dist/migration/**/*.js"],
    // subscribers: ["dist/subscriber/**/*.js"],
    // cli: {
    //     entitiesDir: "src/entity",
    //     migrationsDir: "src/migration",
    //     subscribersDir: "src/subscriber"
    // }
}

const AppDataSource = new DataSource(config);
export {AppDataSource};

export default config;