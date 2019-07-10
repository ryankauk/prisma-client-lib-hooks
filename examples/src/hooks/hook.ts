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