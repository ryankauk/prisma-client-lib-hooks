# Prisma Client Lib Hooks

This package is to add hook functionality to prisma-client-lib package. 

IMPORTANT: Prisma Photon will have these capabilities built in, but until it's a full release I ended up creating this for myself.

I built this package mainly for synchronization. I prefer to keep any validations, permission or query variable changes specific to a graphql resolver. This allows me to see the uni-direction of the data. The main purpose was if a model is used throughout the app and the CUD operation might come from multiple places. Primary use case is synchronization with other datasources.

## Installation

```bash	
$ npm install prisma-client-lib prisma-client-lib-hooks
```

## Context 

Context that gets passed has the model name, and the parsed ending of the crud operation so that you can concatenate it with another method if needed

```typescript
export interface BaseCtx<T extends string> {
  modelName: T;
  modelNameFnEnding: string;
}
```

## Other Info

The create method didn't have a before because I cannot get the id prior to the operation.

## Examples

Take a look at ./examples/src/hooks

Example of hook:

```typescript
// hook.ts
import { prisma } from "../generated/prisma-client";
import { Hook, BaseCtx } from "../../../";

interface Ctx extends BaseCtx<string> {
    addToContext: boolean;
}

export class ExampleHook extends Hook {
    models: { [k: string]: boolean } = {
        Post: true,
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
        if (ctx.modelName === 'User') {
            await prisma.deleteManyPosts({})
        }
    };
    updateBefore = async (ids: string[], ctx: Ctx) => {
        // do something here
    };
}
}
```

Example of initiating prisma with hooks:

```typescript
// index.ts
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

```
