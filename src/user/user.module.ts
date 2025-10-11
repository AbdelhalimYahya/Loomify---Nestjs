import { Module, NestModule, RequestMethod } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { MiddlewareConsumer } from "@nestjs/common";
import { AuthMiddleware } from "./middleware/auth.middleware";

@Module({
    imports: [TypeOrmModule.forFeature([UserEntity])],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
}) 

export class UserModule implements NestModule {
    configure(consumer : MiddlewareConsumer) {
        consumer
            .apply(AuthMiddleware)
            .forRoutes({path : '*', method : RequestMethod.ALL});
    }
}