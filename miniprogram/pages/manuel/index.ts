
import { PROTOCOL_KEY_TO_LABEL, CANCEL_POLICY, BOOKING_TIPS, SAFETY_TIPS } from "../../utils/const";

Page({
  data: {
    policyId: "",
    content: "",
    PROTOCOL_KEY_TO_LABEL: PROTOCOL_KEY_TO_LABEL
  },
  onLoad(options: any) {
    const policyId = options.policyId;
    this.setData({ policyId })
    if (policyId === 'cancelPolicy') {
      this.setData({ content: CANCEL_POLICY })
    } else if (policyId === 'contractTemplate') {
      this.setData({ content: 'zanwu' })
    } else if (policyId === 'bookingTips') {
      this.setData({ content: BOOKING_TIPS })
    } else if (policyId === 'safetyTips') {
      this.setData({ content: SAFETY_TIPS })
    }
  },
});
