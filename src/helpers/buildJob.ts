import { JobJson } from '../types/job';
import { ProductJson } from '../types/product';
import { VariationJson } from '../types/variation';
import { FieldSelection } from '../components/context';
import {
  groupFieldsOf,
  independentFieldsOf,
  isOptionQuantityGridProduct,
  productHasGroups,
} from './product';

export interface GroupRow {
  quantity: number;
  selections: Record<number, FieldSelection>;
}

export interface ProductFormJobState {
  product: ProductJson;
  quantity: number;
  /** Independent (whole-order) field selections. */
  selections: Record<number, FieldSelection>;
  /** Multi-batch group rows when the product has 2+ group fields or non-grid group UX. */
  groups?: GroupRow[];
  /** Per-option quantities for single group-field grid products. */
  optionQuantities?: Record<number, number>;
}

export function selectionsToVariations(
  selections: Record<number, FieldSelection>,
): VariationJson[] {
  return Object.entries(selections).map(([fieldId, sel]) => ({
    variationField: { id: Number(fieldId) },
    value: sel.value,
  }));
}

/** Build the job JSON the API expects from provider/form state. */
export function buildProductFormJob(state: ProductFormJobState): JobJson {
  const { product, quantity, selections, groups, optionQuantities } = state;
  const independentVariations = selectionsToVariations(
    pickSelections(selections, independentFieldsOf(product)),
  );

  const job: JobJson = {
    product: { id: (product as { id?: number })?.id },
    variations: independentVariations,
  };

  if (!productHasGroups(product)) {
    return { ...job, quantity };
  }

  if (isOptionQuantityGridProduct(product) && optionQuantities) {
    const groupField = groupFieldsOf(product)[0];
    job.variationsGroups = (groupField.options || [])
      .filter((opt) => opt?.id !== undefined)
      .map((opt) => ({
        quantity: optionQuantities[opt.id as number] ?? 0,
        variations: [
          {
            variationField: { id: groupField.id as number },
            value: String(opt.id),
          },
        ],
      }))
      .filter((group) => group.quantity > 0);
    return job;
  }

  if (groups?.length) {
    job.variationsGroups = groups
      .filter((row) => row.quantity > 0)
      .map((row) => ({
        quantity: row.quantity,
        variations: selectionsToVariations(
          pickSelections(row.selections, groupFieldsOf(product)),
        ),
      }));
  }

  return job;
}

function pickSelections(
  selections: Record<number, FieldSelection>,
  fields: { id?: number }[],
): Record<number, FieldSelection> {
  const ids = new Set(
    fields.map((f) => f.id).filter((id): id is number => id !== undefined),
  );
  const out: Record<number, FieldSelection> = {};
  for (const [key, sel] of Object.entries(selections)) {
    const id = Number(key);
    if (ids.has(id)) out[id] = sel;
  }
  return out;
}
