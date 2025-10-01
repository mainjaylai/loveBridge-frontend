import { submitFeedback } from "../../api/user";

Page({
  data: {
    question: {
      title: "",
      content: "",
      contact: "",
    },
  },
  submit() {
    submitFeedback(this.data.question).then((res) => {
      wx.showToast({
        title: "提交成功",
        icon: "success",
      });
    });
  },

  handleInput(event: any) {
    const curProperty = event.currentTarget.dataset.id;
    this.setData({
      [`question.${curProperty}`]: event.detail,
    });
  },
});
