import { del, post, get } from "./request";

export function createOrder(data: any) {
  return post("/pay/create-order", data);
}

export function getAllOrders() {
  return get("/pay/all");
}

export function refundOrder(data: object) {
  return post("/pay/apply-refund", data);
}

export function getPaymentDetail(paymentId: string) {
  return get(`/pay/payment-detail?paymentId=${paymentId}`);
}

export function getRefundDetail(refundId: string) {
  return get(`/pay/refund-detail?refundId=${refundId}`);
}

export function failPayment(paymentId: number) {
  return del(`/pay/fail-payment?paymentId=${paymentId}`);
}

export function getAllCoupons() {
  return get("/user/coupons");
}

export function queryOrderInterval(outTradeNo: string) {
  return get(`/hooks/query/payment/notify?outTradeNo=${outTradeNo}`);
}

export function confirmRefund(data: object) {
  return post(`/pay/apply-refund`, data);
}

export function payUnpaidOrder(paymentId: number) {
  return get(`/pay/pay-unpaid?paymentId=${paymentId}`);
}

export function withdraw(amount: string) {
  return post(`/pay/withdraw?amount=${amount}`);
}

export function cancelWithdraw(outBillNo: string) {
  return post(`/pay/cancel-withdraw?outBillNo=${outBillNo}`);
}

export function queryWithdraw(transferBillNo: string) {
  return get(`/hooks/query/withdraw/notify?transferBillNo=${transferBillNo}`);
}

export function reApplyRefund(data: object) {
  return post(`/pay/re-apply-refund`, data);
}
