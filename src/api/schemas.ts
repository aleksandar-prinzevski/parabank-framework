import { z } from 'zod';

export const customerSchema = z.object({
  id: z.number(),
  firstName: z.string(),
  lastName: z.string(),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  phoneNumber: z.string(),
  ssn: z.string(),
});

export type Customer = z.infer<typeof customerSchema>;