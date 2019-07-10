# PrismaClientHooks

This package is to add hook functionality to prisma-client-lib package. Prisma Photon will have these capabilities built in, but until it's a full release I ended up creating this for myself.

Example of hook:

```typescript
// hook.ts
import { prisma } from "@generated/prisma-client-ts";
import { Hook, BaseCtx } from "prisma-client-lib-hooks";

interface Ctx extends BaseCtx<EntityNames> {
  addToContext: boolean;
}

export class ExampleHook extends Hook {
  models: { [k: string]: boolean } = {
    Moment: true,
    View: true,
    Comment: true,
    User: true,
    Message: true,
    Like: true
  };
  createAfter = async (ids: string[], ctx: Ctx) => {
    // do something here
  };
  deleteBefore = async (ids: string[], ctx: Ctx) => {
    // do something here
    ctx.addToContext = true;
  };

  deleteAfter = async (ids: string[], ctx: Ctx) => {
    // do something here
    console.log(ctx.addToContext);
    // result: true;
    // ctx state is passed per hook, per CUD
  };
  updateAfter = async (ids: string[], ctx: Ctx) => {
    /*
	you should use the original initiated prisma that 
	was generated for doing CRUD actions inside of hooks, 
	this will prevent circular function calls and keep 
	it unidirectional
	*/
    prisma.deletePosts({})
  };
  updateBefore = async (ids: string[], ctx: Ctx) => {
    // do something here
  };
}
```

Example of initiating prisma with hooks:

```typescript

import { ExampleHook } from './hook.ts';
import { Prisma, models, ClientConstructor } from '../../generated/prisma-client-ts/index';
import { typeDefs } from '@generated/prisma-client-ts/prisma-schema';

import { makePrismaClientClass } from 'prisma-client-lib-hooks';


export const HookedPrisma = makePrismaClientClass<ClientConstructor<Prisma>>({
  typeDefs,
  models,
  endpoint: `${process.env['PRISMA_ENDPOINT']}`,
  hooks: [new ExampleHook()]
});
export const hookedPrisma = new HookedPrisma();
```