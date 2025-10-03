export type leadType = {
  id: number;
  name: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadsData = {
  leads: {
    id: number;
    name: string;
    phone: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};
