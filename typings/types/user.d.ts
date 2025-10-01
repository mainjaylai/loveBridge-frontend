interface User {
  id: number;
  nickname: string;
  avatar: string;
  gender: number;
  education: string;
  profession: string;
  university: string;
  realName: string;
  phone: string;
  idCard: string;
  inviterId: number; // 邀请人的id
  managerId: number; // 主理人的id
  isFirstCompleteInformation: boolean; // 第一次完善信息之后设置为true
  createdAt: string;
  updatedAt: string;
  visibilitySettings: string;
  role: number; //  0普通,1领队
  totalProfit: number; // 累计收益
  money: number; // 账户余额
  birthday: string; // 生日
  starSign: string; // 星座
  mbti: string; // mbti
  tags: string; // 标签
  signature: string; // 个性签名
  relationType: number; // 关系类型
  mpOpenId: string; // 公众号openId
}

interface CPInfo {
  //
  avatar: string;
  realName: string;
  gender: number;
  height: string;
  weight: string;
  birthday: string; // 生日
  phone: string;
  wechat: string;
  university: string;
  education: string;
  graduationYear: string;
  nickname: string;
  tags: string[];
  //
  starSign: string; // 星座
  mbti: string; // mbti
  profession: string;
  hometown: string;
  liveIn: string;
  //
  birthYearCP: string;
  heightCP: string;
  universityCP: string;
  educationCP: string;
  studyStatusCP: string;
}


interface SingleUserInfo {
  id: string;
  nickName: string;
  wechat: string;
  gender: number;
  birthday?: number;
  height?: number;
  weight?: number;
  education?: string;
  university?: string;
  major?: string;
  jobTitle?: string;
  jobType?: string;
  annualIncome?: string;
  aboutMe?: string;
  partnerRequirements?: string;
  hometown?: string;
  preferredCity?: string;
  relationshipView?: string;
  maritalStatus?: string;
  currentStatus?: string;
  isVerified?: boolean;
  photos?: string[];
}
