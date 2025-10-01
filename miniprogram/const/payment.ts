export const PaymentStatusPending = 0;
export const PaymentStatusSuccess = 1;
export const PaymentStatusFailed = 2;

export const RefundStatusPending = 0;
export const RefundStatusSuccess = 1;
export const RefundStatusFailed = 2;

export const RefundReviewStatusPending = 0;
export const RefundReviewStatusApproved = 1;
export const RefundReviewStatusRejected = 2;

export const RefundTagRefundDiscounts = 0;
export const RefundTagCancelActivity = 1;


// 定义交易类型常量
const MoneyRecordTypeActivityProfit = 1; // 活动收益
const MoneyRecordTypeManagerReward = 2;  // 主理人奖励
const MoneyRecordTypeInviteReward = 3;   // 邀请人奖励
const MoneyRecordTypeWithdraw = 11;      // 提现
const MoneyRecordTypeAdminDeduction = 12; // 管理员扣款

// 交易类型映射表
export const TYPE_MAP: Record<number, string> = {
  [MoneyRecordTypeActivityProfit]: '活动收益',
  [MoneyRecordTypeManagerReward]: '主理人奖励',
  [MoneyRecordTypeInviteReward]: '邀请人奖励',
  [MoneyRecordTypeWithdraw]: '提现',
  [MoneyRecordTypeAdminDeduction]: '管理员扣款'
};