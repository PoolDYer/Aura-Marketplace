import { Injectable, Inject } from '@nestjs/common';
import { IPaymentGateway } from '../../l04-domain/ports/payment-gateway.interface';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('IPaymentGateway') private readonly gateway: IPaymentGateway,
  ) {}

  createCheckoutPreference(userId: string, orderId: string) {
    return this.gateway.createCheckoutPreference(userId, orderId);
  }

  createBrickInitialization(userId: string, orderId: string) {
    return this.gateway.createBrickInitialization(userId, orderId);
  }

  processBrickPayment(userId: string, orderId: string, body: any) {
    return this.gateway.processBrickPayment(userId, orderId, body);
  }

  handleWebhook(xSignature: string, xRequestId: string, dataId: string, body: any) {
    return this.gateway.handleWebhook(xSignature, xRequestId, dataId, body);
  }

  verifyPayment(paymentId: string, orderId: string) {
    return this.gateway.verifyPayment(paymentId, orderId);
  }

  getPaymentStatus(userId: string, orderId: string) {
    return this.gateway.getPaymentStatus(userId, orderId);
  }
}
