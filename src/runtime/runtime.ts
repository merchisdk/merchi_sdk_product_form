import { ProductJson } from '../types/product';
import { JobJson } from '../types/job';
import { Pricing, createPricing } from './pricing';
import { serializeJob, nonEmptyGroups } from '../helpers/serialize';
import { formatCurrency, urlFor } from '../helpers/format';

export interface Actions {
  addToCart?: (job: JobJson) => void;
  buyNow?: (job: JobJson) => void;
  getQuote?: (job: JobJson) => void;
}

export interface Helpers {
  serializeJob: typeof serializeJob;
  nonEmptyGroups: typeof nonEmptyGroups;
  formatCurrency: typeof formatCurrency;
  urlFor: typeof urlFor;
}

export interface ProductFormRuntimeConfig {
  apiUrl: string;
  product: ProductJson;
  onAddToCart?: (job: JobJson) => void;
  onBuyNow?: (job: JobJson) => void;
  onGetQuote?: (job: JobJson) => void;
}

export interface ProductFormRuntime {
  pricing: Pricing;
  actions: Actions;
  helpers: Helpers;
}

/** Build the runtime (pricing + actions + helpers) the embed passes into a
 * custom form. Each action quotes the job first, then invokes the host callback
 * (matching merchi_product_form's provider behaviour). An action is omitted when
 * its callback is not supplied. */
export function createProductFormRuntime(
  config: ProductFormRuntimeConfig,
): ProductFormRuntime {
  const pricing = createPricing(config.apiUrl, config.product.id);
  const helpers: Helpers = { serializeJob, nonEmptyGroups, formatCurrency, urlFor };

  const quoteThen = (cb?: (job: JobJson) => void) =>
    cb
      ? async (job: JobJson) => {
          const quoted = await pricing.getQuote(job);
          if (!quoted.product) {
            quoted.product = { id: config.product.id };
          }
          cb(quoted);
        }
      : undefined;

  const actions: Actions = {
    addToCart: quoteThen(config.onAddToCart),
    buyNow: quoteThen(config.onBuyNow),
    getQuote: quoteThen(config.onGetQuote),
  };

  return { pricing, actions, helpers };
}
