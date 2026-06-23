import { SDK_VERSION } from '../version';
import type { ProductFormComponent, ProductFormProps } from '../types/form';

describe('contract', () => {
  it('SDK_VERSION matches the merchi_api ProductForms default', () => {
    expect(SDK_VERSION).toBe('1.0.0');
  });

  it('a form component can be typed against ProductFormProps', () => {
    const form: ProductFormComponent = (props: ProductFormProps) => {
      void props.product.id;
      void props.pricing.getQuote;
      void props.actions.buyNow;
      void props.helpers.serializeJob;
      return null;
    };
    expect(typeof form).toBe('function');
  });
});
