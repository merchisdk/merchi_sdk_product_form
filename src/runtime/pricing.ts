import { Merchi } from 'merchi_sdk_ts';
import { JobJson } from '../types/job';
import { serializeJob } from '../helpers/serialize';

export interface Pricing {
  /** Request a quote for the given job; resolves to the job json with pricing
   * fields (cost, totalCost, currency, ...) populated. */
  getQuote: (job: JobJson) => Promise<JobJson>;
}

/** Build a pricing helper bound to a backend api url. Re-implements
 * merchi_product_form's fetchJobQuote against merchi_sdk_ts directly.
 * defaultProductId is applied to jobs that don't already carry a product, so
 * Job.getQuote() (which reads product.id) never receives a product-less job. */
export function createPricing(apiUrl: string, defaultProductId?: number): Pricing {
  const merchi = new Merchi(undefined, undefined, undefined, undefined, apiUrl);
  return {
    getQuote: async (job: JobJson): Promise<JobJson> => {
      const withProduct: JobJson =
        job.product && job.product.id !== undefined
          ? job
          : { ...job, product: { id: defaultProductId } };
      const cleaned = serializeJob(withProduct);
      const merchiJob = new merchi.Job();
      merchiJob.fromJson(cleaned as Record<string, unknown>, {
        makeDirty: false,
        arrayValueStrict: false,
      });
      const quoted = await merchiJob.getQuote();
      return quoted.toJson() as JobJson;
    },
  };
}
