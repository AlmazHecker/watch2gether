import { Prisma } from "@prisma/client";
import { Types, OperationPayload } from "@prisma/client/runtime/library";

type PayloadToModel<T> = T extends OperationPayload
  ? Types.Result.DefaultSelection<T>
  : T extends OperationPayload[]
    ? Types.Result.DefaultSelection<T[number]>[]
    : never;

export type WithRelation<
  T extends keyof Prisma.TypeMap["model"],
  R extends keyof Prisma.TypeMap["model"][T]["payload"]["objects"],
> = PayloadToModel<Prisma.TypeMap["model"][T]["payload"]> & {
  [K in R]: PayloadToModel<Prisma.TypeMap["model"][T]["payload"]["objects"][K]>;
};
