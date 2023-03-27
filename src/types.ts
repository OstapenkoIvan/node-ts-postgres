export interface IGetQuery {
  role: string;
}

export interface IDelQuery {
  email: string;
}

export interface IQuery extends IGetQuery {
  firstname: string;
  lastname: string;
  state: string;
  username: string;
  email: string;
}
