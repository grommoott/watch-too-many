import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { ValidationPipe } from "@nestjs/common"
import * as cookieParser from "cookie-parser"
import { WsAdapter } from "@nestjs/platform-ws"

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    app.use(cookieParser())
    app.useGlobalPipes(new ValidationPipe())
    app.useWebSocketAdapter(new WsAdapter(app))
    await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
