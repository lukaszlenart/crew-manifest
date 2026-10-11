/** Seeded pseudo-random number generator returning floats in [0, 1). */
export type Rng = () => number

/** mulberry32 — small, fast, deterministic 32-bit PRNG. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomSeed(): number {
  return Math.floor(Math.random() * 4294967296)
}

/** Integer in [min, max] inclusive. */
export function randomInt(rng: Rng, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1))
}

export function pick<T>(rng: Rng, items: readonly T[]): T {
  if (items.length === 0) throw new Error('pick from empty list')
  return items[Math.floor(rng() * items.length)] as T
}

/** Picks an index with probability proportional to its weight. Weights must not all be zero. */
export function weightedIndex(rng: Rng, weights: readonly number[]): number {
  const total = weights.reduce((a, b) => a + b, 0)
  if (total <= 0) throw new Error('weights must have a positive sum')
  let r = rng() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i] as number
    if (r < 0) return i
  }
  return weights.length - 1
}

/** Returns `count` distinct items in random order (fewer if the list is shorter). */
export function sample<T>(rng: Rng, items: readonly T[], count: number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy.slice(0, count)
}
