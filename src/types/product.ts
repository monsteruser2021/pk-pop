export type ProductData = {
  name: string;
  description: string;
  category: string;
  imageUrls: string[];
  priceUnit: number;
  priceDozen: number;
  price100: number;
  price1000: number;
  isActive: boolean;
  isDeleted: boolean;
};

export type Product = ProductData & { id: string };

function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function productFromData(
  id: string,
  data: Record<string, unknown>,
): Product {
  const legacyPrice = data.price;
  const priceUnit = data.priceUnit ?? legacyPrice;
  const priceDozen = data.priceDozen ?? legacyPrice;
  const price100 = data.price100 ?? legacyPrice;
  const price1000 = data.price1000 ?? legacyPrice;
  const imageUrls =
    Array.isArray(data.imageUrls) &&
    data.imageUrls.every(
      (imageUrl): imageUrl is string => typeof imageUrl === "string",
    )
      ? data.imageUrls
      : typeof data.imageUrl === "string"
        ? [data.imageUrl]
        : null;

  if (
    typeof data.name !== "string" ||
    typeof data.description !== "string" ||
    typeof data.category !== "string" ||
    imageUrls === null ||
    !isValidPrice(priceUnit) ||
    !isValidPrice(priceDozen) ||
    !isValidPrice(price100) ||
    !isValidPrice(price1000) ||
    (data.isActive !== undefined && typeof data.isActive !== "boolean") ||
    (data.isDeleted !== undefined && typeof data.isDeleted !== "boolean")
  ) {
    throw new Error(`El producto ${id} tiene datos inválidos en Firestore.`);
  }

  return {
    id,
    name: data.name,
    description: data.description,
    category: data.category,
    imageUrls,
    priceUnit,
    priceDozen,
    price100,
    price1000,
    isActive: data.isActive ?? true,
    isDeleted: data.isDeleted ?? false,
  };
}

export function productData(product: Product): ProductData {
  return {
    name: product.name,
    description: product.description,
    category: product.category,
    imageUrls: product.imageUrls,
    priceUnit: product.priceUnit,
    priceDozen: product.priceDozen,
    price100: product.price100,
    price1000: product.price1000,
    isActive: product.isActive,
    isDeleted: product.isDeleted,
  };
}
