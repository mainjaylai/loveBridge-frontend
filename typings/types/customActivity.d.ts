interface CustomActivity {
  id: number;
  userId: number;
  user: User;
  title: string;
  content: string;
  startDate: string;
  endDate: string;
  deadline: string;
  maxPeople: number;
  price: string;
  images: string[];
  place: Location;
  groupCodeImage: string;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members: User[];
}
