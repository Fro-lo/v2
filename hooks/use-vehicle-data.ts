"use client"

/**
 * useVehicleData — подбор года / марки / модели автомобиля через бесплатный
 * публичный NHTSA vPIC API (ключ не нужен).
 *
 * Возвращает:
 *  - years        : string[]      — список годов (1981..текущий)
 *  - makes        : string[]      — имена марок для отображения
 *  - makeOptions  : MakeOption[]  — { name, id } (id нужен для запроса моделей)
 *  - models       : string[]      — модели выбранной марки/года
 *  - loadingMakes : boolean
 *  - loadingModels: boolean
 */

import { useEffect, useRef, useState } from "react"

export interface MakeOption {
  /** Имя марки в верхнем регистре, напр. "MERCEDES-BENZ" */
  name: string
  /** Числовой NHTSA MakeId, напр. "474" */
  id: string
}

const NHTSA_BASE = "https://vpic.nhtsa.dot.gov/api/vehicles"

/** Типы кузова, которые объединяем, чтобы не терять бренды и SUV/кроссоверы */
const VEHICLE_TYPES = ["car", "mpv", "truck"] as const

export function useVehicleData(year: string, make: string, makeId: string) {
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: currentYear - 1980 }, (_, i) => String(currentYear - i))

  const [makeOptions, setMakeOptions] = useState<MakeOption[]>([])
  const [models, setModels] = useState<string[]>([])
  const [loadingMakes, setLoadingMakes] = useState(false)
  const [loadingModels, setLoadingModels] = useState(false)

  // Кэши, чтобы не дёргать API повторно
  const makesCache = useRef<MakeOption[] | null>(null)
  const modelsCache = useRef<Record<string, string[]>>({})

  // ---- Загрузка марок (один раз) ------------------------------------------
  useEffect(() => {
    if (makesCache.current) {
      setMakeOptions(makesCache.current)
      return
    }
    let cancelled = false
    setLoadingMakes(true)
    Promise.all(
      VEHICLE_TYPES.map((vt) =>
        fetch(`${NHTSA_BASE}/GetMakesForVehicleType/${vt}?format=json`)
          .then((r) => r.json())
          .catch(() => ({ Results: [] })),
      ),
    )
      .then((responses) => {
        if (cancelled) return
        const map = new Map<string, MakeOption>()
        for (const res of responses) {
          for (const row of res.Results ?? []) {
            // Разные эндпоинты используют разные имена полей
            const id = String(row.MakeId ?? row.Make_ID ?? "")
            const name = String(row.MakeName ?? row.Make_Name ?? "").toUpperCase()
            if (name && !map.has(name)) map.set(name, { name, id })
          }
        }
        const sorted = Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
        makesCache.current = sorted
        setMakeOptions(sorted)
      })
      .finally(() => {
        if (!cancelled) setLoadingMakes(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // makeId может отсутствовать при предзаполнении из URL (есть только имя
  // марки). В этом случае резолвим id по имени из загруженного списка марок.
  const effectiveMakeId =
    makeId || (make ? (makeOptions.find((m) => m.name === make.toUpperCase())?.id ?? "") : "")

  // ---- Загрузка моделей (по makeId + year) --------------------------------
  useEffect(() => {
    if (!effectiveMakeId) {
      setModels([])
      return
    }
    const makeId = effectiveMakeId
    const cacheKey = `${makeId}-${year}`
    if (modelsCache.current[cacheKey]) {
      setModels(modelsCache.current[cacheKey])
      return
    }

    let cancelled = false
    setLoadingModels(true)

    // 1) Все модели марки (без привязки к году) — базовый список
    const requests: Promise<any>[] = [
      fetch(`${NHTSA_BASE}/GetModelsForMakeId/${makeId}?format=json`)
        .then((r) => r.json())
        .catch(() => ({ Results: [] })),
    ]

    // 2) Модели по конкретному году и типу кузова (уточняет SUV/кроссоверы)
    if (year && Number(year) > 1995) {
      for (const vt of VEHICLE_TYPES) {
        requests.push(
          fetch(
            `${NHTSA_BASE}/GetModelsForMakeIdYear/makeId/${makeId}/modelyear/${year}/vehicletype/${vt}?format=json`,
          )
            .then((r) => r.json())
            .catch(() => ({ Results: [] })),
        )
      }
    }

    Promise.all(requests)
      .then((responses) => {
        if (cancelled) return
        const set = new Set<string>()
        for (const res of responses) {
          for (const row of res.Results ?? []) {
            const name = String(row.Model_Name ?? "").trim()
            if (name) set.add(name)
          }
        }
        const sorted = Array.from(set).sort((a, b) => a.localeCompare(b))
        modelsCache.current[cacheKey] = sorted
        setModels(sorted)
      })
      .finally(() => {
        if (!cancelled) setLoadingModels(false)
      })

    return () => {
      cancelled = true
    }
  }, [effectiveMakeId, year])

  const makes = makeOptions.map((m) => m.name)

  return { years, makes, makeOptions, models, loadingMakes, loadingModels }
}
