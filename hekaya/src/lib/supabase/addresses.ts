import type { Db } from "@/lib/supabase/types";

/** An address book entry (camelCase app shape). `emirate` holds an EmirateKey. */
export type Address = {
  id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  emirate: string;
  postalCode?: string;
  isDefault: boolean;
};

/** The editable fields (everything except the DB-managed id). */
export type AddressInput = Omit<Address, "id" | "isDefault"> & {
  isDefault?: boolean;
};

type AddressRow = {
  id: string;
  full_name: string;
  phone: string;
  address_line: string;
  city: string;
  emirate: string;
  postal_code: string | null;
  is_default: boolean;
};

function mapAddress(row: AddressRow): Address {
  return {
    id: row.id,
    fullName: row.full_name,
    phone: row.phone,
    addressLine: row.address_line,
    city: row.city,
    emirate: row.emirate,
    postalCode: row.postal_code ?? undefined,
    isDefault: row.is_default,
  };
}

function toRow(input: AddressInput) {
  return {
    full_name: input.fullName,
    phone: input.phone,
    address_line: input.addressLine,
    city: input.city,
    emirate: input.emirate,
    postal_code: input.postalCode || null,
    is_default: input.isDefault ?? false,
  };
}

/** The signed-in user's address book (RLS scopes it to them). Newest first. */
export async function fetchAddresses(
  supabase: Db,
): Promise<Address[]> {
  const { data, error } = await supabase
    .from("addresses")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as AddressRow[]).map(mapAddress);
}

/** Insert a new address for the given user. */
export async function createAddress(
  supabase: Db,
  userId: string,
  input: AddressInput,
): Promise<void> {
  const { error } = await supabase
    .from("addresses")
    .insert({ ...toRow(input), user_id: userId });
  if (error) throw error;
}

/** Update an existing address by id (RLS still applies). */
export async function updateAddress(
  supabase: Db,
  id: string,
  input: AddressInput,
): Promise<void> {
  const { error } = await supabase
    .from("addresses")
    .update(toRow(input))
    .eq("id", id);
  if (error) throw error;
}

/** Delete an address by id. */
export async function deleteAddress(
  supabase: Db,
  id: string,
): Promise<void> {
  const { error } = await supabase.from("addresses").delete().eq("id", id);
  if (error) throw error;
}
