import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions.js";

const config: PostgresConnectionOptions = {
    type: "postgres",
    host: "localhost",
    port: 5433,
    username: "devuser",
    password: "1234",
    database: "blog",
    entities: [__dirname+"/**/*.entity.{.ts,.js}"],
    synchronize: true,
    logging: true,
    // migrations: ["dist/migration/**/*.js"],
    // subscribers: ["dist/subscriber/**/*.js"],
    // cli: {
    //     entitiesDir: "src/entity",
    //     migrationsDir: "src/migration",
    //     subscribersDir: "src/subscriber"
    // }
}

export default config;