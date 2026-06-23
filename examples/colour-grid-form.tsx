import React, { useState } from 'react';
import type { ProductFormComponent, JobJson, VariationsGroupJson } from '../src';
import { nonEmptyGroups } from '../src';

const ColourGridForm: ProductFormComponent = ({ product, actions, helpers }) => {
  const colours = product.groupVariationFields?.[0]?.options ?? [];
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const buildJob = (): JobJson => {
    const groups: VariationsGroupJson[] = colours.map((opt) => ({
      quantity: quantities[opt.id ?? -1] ?? 0,
      variations: [{ variationField: product.groupVariationFields?.[0]?.id, value: String(opt.id) }],
    }));
    return { product: { id: product.id }, variationsGroups: nonEmptyGroups(groups) };
  };

  return (
    <div>
      {colours.map((opt) => (
        <label key={opt.id}>
          {opt.value}
          <input
            type="number"
            min={0}
            value={quantities[opt.id ?? -1] ?? 0}
            onChange={(e) =>
              setQuantities((q) => ({ ...q, [opt.id ?? -1]: Number(e.target.value) }))
            }
          />
        </label>
      ))}
      <button onClick={() => actions.buyNow?.(helpers.serializeJob(buildJob()))}>
        Buy now
      </button>
    </div>
  );
};

export default ColourGridForm;
