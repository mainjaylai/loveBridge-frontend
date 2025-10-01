/// <reference path="./user.d.ts" />

// NOTE: 一期image直接用URL吧，content后面再加
interface ActivityImage {
  url: string;
  content?: string; // 可选
}

interface TxLocation {
  address: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  name: string;
  province: string;
}

interface ActivityLocation extends TxLocation {
  meetingTime: string;
}

interface ActivityComment {
  avatarUrl: string;
  nickName: string;
  time: number;
  tourSchedule: number;
  starRating: number;
  content: string;
  images: string[];
}

interface ActivityHighlight {
  title: string;
  content: string;
  images: ActivityImage[];
}

interface ActivityJourney {
  title: string;
  // "images"?: string[];    // 先不做
  items: Array<{
    type: "base" | "transportation" | "stay" | "food" | "hiking" | "remark";
    content: string;
    title?: string; // base可选全天/早晨+上午+下午+晚上，remark可自定义
  }>;
}

interface TourSchedule {
  id: number;
  startDate: string;
  endDate: string;
  price: number;
  deadline: string;
  maxPeople: number;
  minPeople?: number; // 官方活动才有
  leaders?: User[]; // 官方活动才有
  members: User[];
  groupCodeImage: string;
  tourScheduleLabel?: string; // 前端用来渲染团期
  valid?: boolean; // 前端标记该团是否过期
  hasMe?: boolean; // 前端标记该期是否包含当前用户
}

interface ActivityCore {
  isPublic: boolean;
  id: number;
  title: string;
  cover: string;
  images: string[];
  meetingPoint: ActivityLocation[];
  duration: number; // 浮点数，可能存在.5
  tourSchedules: TourSchedule[];
  publisherId: number | null;
  publisher: User | null;
  createdAt: string;
  updatedAt: string;
  valid?: boolean; // 前端标记该活动是否过期
  needIdCard: boolean
}

interface Activity extends ActivityCore {
  content: string;
  lowestPrice: string; // 100/100起
  place: string;
  comments: ActivityComment[];
  highlights: ActivityHighlight[];
  journey: ActivityJourney[];
  feeExclude: string;
  feeInclude: string;
  favorablePolicy: string;
  closestTourDDL?: string; // 前端提取活动最近DDL用于排序
  priority: number; // 前端提取活动优先级用于排序
}

interface TourScheduleMember {
  id: number;
  tourScheduleId: number;
  userId: number;
  user: User;
  payment: Payment;
  paymentId: number;
  activityId: number;
  activity: Activity;
  tourSchedule: TourSchedule;
  status: number;
  createdAt: string;
  updatedAt: string;
  leaderName: string; // 团长名字
  discountImage: string; // 集赞截图url
  remark: string; // 备注
}
