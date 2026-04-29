import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirestoreModule } from './shared/firestore/firestore.module';
import { KycModule } from './kyc/kyc.module';
import { BankingModule } from './banking/banking.module';
import { OtpModule } from './otp/otp.module';
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { RaspModule } from './rasp/rasp.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    FirestoreModule,
    AuthModule,
    UsersModule,
    KycModule,
    BankingModule,
    OtpModule,
    NotificacionesModule,
    RaspModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
