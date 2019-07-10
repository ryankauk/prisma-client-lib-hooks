import { ExampleHook } from './hook'
import { Prisma, models, ClientConstructor } from "../generated/prisma-client/index";
import { typeDefs } from "../generated/prisma-client/prisma-schema";

import { makePrismaClientClass } from "../../../";


export const HookedPrisma = makePrismaClientClass<ClientConstructor<Prisma>>({
    typeDefs,
    models,
    endpoint: `${process.env["PRISMA_ENDPOINT"]}`,
    hooks: [new ExampleHook()]
});
export const hookedPrisma = new HookedPrisma();
