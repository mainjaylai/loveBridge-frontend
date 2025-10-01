// export enum RefundStatus {
//   Pending = 0,
//   Processing = 1,
//   Success = 2,
//   Failed = 3
// }

interface PaymentBase {
  id: number;
  activity: Activity;
  activityId: number;
  tourSchedule: TourSchedule;
  tourScheduleId: number;
  user: User;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

interface Payment extends PaymentBase {
  coupon?: Coupon;
  couponId?: number;
  amount: number; // 原价
  finalAmount: number; // 实际支付的价格
  description: string;
  status: number; // 订单状态：未付款（0），已付款（1），退款中（2），成功（3），失败（4）,待评价（暂无）
  transactionId: string; // 微信支付订单号
  outTradeNo: string; // 用户可见的订单号
  meetingPoint: string;
  orderTypeId?: number;  // 前端用来分类订单
}

interface Refund extends PaymentBase {
  // 核心
  refundNo: string;
  reason: string; // 用户写的退款原因
  reviewComment: string;  // 管理员审批的备注
  tag: number;
  reviewStatus: number;
  reviewTime: string;
  status: number;
  amount: number; // 对应订单的finalAmount
  // 其他
  payment: Payment;
  paymentId: number;
}

interface Coupon {
  id: number;
  type: number; // 发给不同用户的同一种优惠券应该有同一个type id
  title: string; // 哪种优惠券
  description: string; // 描述
  satisfiedAmount: number; // 最少可使用额度
  amount: number; // 金额，分为单位
  deadline: string;
  paymentId: number | null;
  payment: Payment | null;
  status: number; // 可用（0），已使用（1）
  userId: number;
  user: User;
  createdAt: string;
  updatedAt: string;
  deadlineLabel?: string; // 前端渲染用
}


interface MoneyRecord {
  id: number;
  userId: number;
  amount: number;
  balance: number;
  type: number;
  transfer_bill_no: string | null;
  description: string;
  createdAt: string;
  formattedAmount?: string;
  formattedBalance?: string;
  formattedDate?: string;
  typeText?: string;
  typeClass?: string;
}
