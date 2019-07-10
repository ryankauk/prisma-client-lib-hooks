import { Hook } from "./types";
export async function runHooks(
  prisma,
  hooks: Hook[],
  modelName: string,
  modelNameFnEnding: string,
  variables,
  resolve,
  {
    method,
    many
  }: {
    method: "create" | "update" | "delete";
    many: boolean;
  }
) {
  let fnName = modelNameFnEnding.charAt(0).toLowerCase() + modelNameFnEnding.slice(1);
  let hookWithCtx = hooks.map(hook => ({ hook, ctx: { modelName, modelNameFnEnding } }));
  // TODO: improve performance by only getting id

  let deleted = await prisma[fnName](variables.where);
  await Promise.all(
    hookWithCtx.map(
      ({ hook, ctx }) => hook[`${method}Before`] && hook[`${method}Before`]([deleted.id], ctx)
    )
  );
  let result = await resolve();
  await Promise.all(
    hookWithCtx.map(
      ({ hook, ctx }) => hook[`${method}After`] && hook[`${method}After`]([deleted.id], ctx)
    )
  );
  return result;
}
