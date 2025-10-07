import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthenticationInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const authenticationKey = request.headers['x-authentication'] as
      | string
      | undefined;

    if (!authenticationKey)
      throw new Error(
        'x-authentication header is not set, it is required for authentication requests',
      );

    const configuredAuthenticationKey =
      this.configService.get<string>('AUTHENTICATION_KEY');

    if (configuredAuthenticationKey !== authenticationKey)
      throw new UnauthorizedException(
        'Invalid or missing x-authentication key',
      );

    return next.handle();
  }
}
