import { Hook } from "./types";
export type MethodIndexes = 'updateBefore' | 'updateAfter' | 'deleteBefore' | 'deleteAfter' | 'createAfter';
export async function runHooks(
  prisma: any, // TODO: change from any
  hooks: Hook[],
  modelName: string,
  modelNameFnEnding: string,
  variables: any, // TODO: change from any
  resolve: () => Promise<any>,
  {
    method,
    many
  }: {
    method: "update" | "delete";
    many: boolean;
  }
) {
  let fnName = modelNameFnEnding.charAt(0).toLowerCase() + modelNameFnEnding.slice(1);
  let hookWithCtx = hooks.map(hook => ({ hook, ctx: { modelName, modelNameFnEnding } }));
  // TODO: improve performance by only getting id
  let beforeIndexString: MethodIndexes = `${method}Before` as MethodIndexes;
  let afterIndexString: MethodIndexes = `${method}After` as MethodIndexes;
  let deleted = await prisma[fnName](variables.where);
  await Promise.all(
    hookWithCtx.map(
      ({ hook, ctx }) => hook[beforeIndexString] && hook[beforeIndexString]([deleted.id], ctx)
    )
  );
  let result = await resolve();
  await Promise.all(
    hookWithCtx.map(
      ({ hook, ctx }) => hook[afterIndexString] && hook[afterIndexString]([deleted.id], ctx)
    )
  );
  return result;
}
