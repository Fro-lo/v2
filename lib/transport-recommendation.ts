export interface TransportRecommendation {
  recommended: "open" | "enclosed"
  reason: string
}

// Марки, для которых по умолчанию рекомендуем закрытую перевозку
// (люкс / премиум / экзотика / суперкары).
const ENCLOSED_MAKES = new Set([
  "ACURA", // премиум-линейки
  "ALFA ROMEO",
  "ASTON MARTIN",
  "AUDI",
  "BENTLEY",
  "BMW",
  "BUGATTI",
  "CADILLAC",
  "FERRARI",
  "GENESIS",
  "INFINITI",
  "JAGUAR",
  "KOENIGSEGG",
  "LAMBORGHINI",
  "LAND ROVER",
  "LEXUS",
  "LINCOLN",
  "LOTUS",
  "MASERATI",
  "MCLAREN",
  "MERCEDES-BENZ",
  "MERCEDES",
  "PORSCHE",
  "ROLLS-ROYCE",
  "TESLA",
])

// Возраст (в годах), начиная с которого авто считается классикой/винтажем
// и по умолчанию рекомендуется закрытая перевозка.
const CLASSIC_AGE_THRESHOLD = 20

/**
 * Определяет рекомендуемый тип перевозки (открытая/закрытая) по году и марке.
 * Эвристика заменяет прежнее поле transportRecommendation из Google Sheets:
 * - люксовые / экзотические марки -> enclosed
 * - классика (старше порога по возрасту) -> enclosed
 * - остальное -> open
 */
export function getTransportRecommendation(
  year: string,
  make: string,
): TransportRecommendation {
  const normalizedMake = (make || "").trim().toUpperCase()
  const parsedYear = Number.parseInt(year, 10)
  const currentYear = new Date().getFullYear()

  const isClassic =
    Number.isFinite(parsedYear) && currentYear - parsedYear >= CLASSIC_AGE_THRESHOLD

  if (isClassic) {
    return {
      recommended: "enclosed",
      reason: "Enclosed transport is recommended to protect this classic vehicle",
    }
  }

  if (normalizedMake && ENCLOSED_MAKES.has(normalizedMake)) {
    return {
      recommended: "enclosed",
      reason: "Recommended for protection of this high-value vehicle",
    }
  }

  return {
    recommended: "open",
    reason: "Standard open transport is suitable for this vehicle",
  }
}
