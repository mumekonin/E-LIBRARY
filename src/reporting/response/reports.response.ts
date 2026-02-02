import { IsDate, IsString } from "class-validator";

export class ReportResponse{
  userId:string
  action:string
  date:Date
}