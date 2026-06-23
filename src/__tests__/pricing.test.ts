const getQuoteMock = jest.fn();
const fromJsonMock = jest.fn();
const toJsonMock = jest.fn(() => ({ totalCost: 99, currency: 'USD' }));

jest.mock('merchi_sdk_ts', () => ({
  Merchi: jest.fn().mockImplementation(() => ({
    Job: jest.fn().mockImplementation(() => ({
      fromJson: fromJsonMock,
      getQuote: getQuoteMock,
    })),
  })),
}));

import { createPricing } from '../runtime/pricing';

describe('createPricing.getQuote', () => {
  beforeEach(() => {
    getQuoteMock.mockReset();
    fromJsonMock.mockReset();
    getQuoteMock.mockResolvedValue({ toJson: toJsonMock });
  });

  it('loads the job json and returns the quoted job json', async () => {
    const pricing = createPricing('https://api.example/v6/');
    const result = await pricing.getQuote({
      product: { id: 5 },
      variations: [],
      variationsGroups: [{ quantity: 2, variations: [] }],
    });
    expect(fromJsonMock).toHaveBeenCalled();
    expect(getQuoteMock).toHaveBeenCalled();
    expect(result).toEqual({ totalCost: 99, currency: 'USD' });
  });
});
