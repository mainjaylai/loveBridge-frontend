import { getMyTrip } from "../../api/activity";

Page({
  data: {
    tourScheduleMembers: [] as TourScheduleMember[],
  },
  onLoad() {
    getMyTrip().then((res: any) => {
    });
  },
});
