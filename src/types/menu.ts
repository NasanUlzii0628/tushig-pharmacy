export type Menu = {
  id: number;
  value?: number;
  name: string;
  route: string;
  webRoute: string;
  enable: boolean;
};

export type MenuCreate = {
  name: string;
  route: string;
  webRoute: string;
  enable: boolean;
};
