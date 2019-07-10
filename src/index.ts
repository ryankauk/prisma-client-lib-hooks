import { Hook, } from "./types";

// elasticHook.runChecks();
import {
  OperationTypeNode,
  DocumentNode,
  DefinitionNode,
  ExecutableDefinitionNode,
  FieldNode,
  SelectionNode
} from "graphql";
import { runHooks, MethodIndexes } from "./utils";
export function isExecutable(object: DefinitionNode): object is ExecutableDefinitionNode {
  return (object as any).selectionSet;
} // user defined type guard

function isField(object: SelectionNode): object is FieldNode {
  return object.kind === "Field";
}
interface Prisma {
  hooks: Hook[];
}
export async function provoke(
  prisma: Prisma,
  resolve: () => Promise<any>,
  operation: OperationTypeNode,
  document: DocumentNode,
  variables: any
) {
  // TODO: configure Type to fragment to connector, check name against pluralization of prisma,
  // TODO: result is dependant on input

  // TODO: make fragment object
  // TODO: check if hooked prisma is used within itself
  // TODO: might not grab proper model name becuase of pluralization
  // !IMPORTANT! this function is specifally for synchronization with other datasources only,
  // !IMPORTANT! you should never call a prisma mutation from within the hook, could lead to recursive untrackable changes

  let def = document.definitions[0];
  if (operation !== "mutation" || !isExecutable(def)) return resolve();
  // !IMPORTANT! this might break

  let mutation = def.selectionSet.selections[0];

  if (!isField(mutation)) return resolve();

  let idSelection: FieldNode = {
    kind: "Field",
    name: { kind: "Name", value: "id" }
  };

  function checkForId() {
    if (
      isField(mutation) &&
      (!mutation.selectionSet ||
        !mutation.selectionSet.selections.find(sel => sel.kind === "Field" && sel.name.value === "id"))
    ) {
      throw Error("Sync hook requires id in selection set.");
    }
  }

  let getResultId = async function (): Promise<{
    original: any;
    ids: string[];
  }> {
    let OG = await resolve();
    let original = OG[name.value];
    let ids;
    if (!Array.isArray(original)) {
      ids = [original.id];
    } else {
      ids = original.map(x => x.id);
    }
    return {
      original: OG,
      ids
    };
  };

  let name = mutation.name;
  let match = name.value.match(/(update|delete|create)(Many)?(.*)/);
  if (!match) return resolve();
  let [_, method, many, modelNameFnEnding] = match;

  let modelName = modelNameFnEnding.replace(/(ses|s)$/g, "s");

  // let prismaQueryKey = modelName.

  let hooks = prisma.hooks.filter(hook => {

    // TODO: hook[hookAction[0]] &&
    return (
      !(!hook[`${method}Before` as MethodIndexes] && !hook[`${method}After` as MethodIndexes]) &&
      hook.models &&
      hook.models[modelName] === true
    );
  });

  if (hooks.length === 0) return await resolve();

  if (name.value.startsWith("create")) {
    checkForId();
    // only singleton
    let result = await getResultId();
    await Promise.all(
      hooks.map(hook => hook.createAfter(result.ids, { modelName, modelNameFnEnding }))
    );

    return result.original;
  } else {
    return runHooks(prisma, hooks, modelName, modelNameFnEnding, variables, resolve, {
      method: method as "update" | "delete",
      many: !!many
    });
  }
}
