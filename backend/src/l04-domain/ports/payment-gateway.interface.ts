export interface IPaymentGateway {
  createCheckoutPreference(userId: string, orderId: string): Promise<any>;
  createBrickInitialization(userId: string, orderId: string): Promise<any>;
  processBrickPayment(userId: string, orderId: string, body: any): Promise<any>;
  handleWebhook(xSignature: string, xRequestId: string, dataId: string, body: any): Promise<any>;
  verifyPayment(paymentId: string, orderId: string): Promise<any>;
  getPaymentStatus(userId: string, orderId: string): Promise<any>;
}
