import { useState, useCallback } from 'react'
import { GameRecord } from '../types'

const STORAGE_KEY = 'darts_history_v1'

function loadRecords(): GameRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GameRecord[]) : []
  } catch {
    return []
  }
}

function saveRecords(records: GameRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Storage might be full — silently ignore
  }
}

export type PeriodFilter = 'today' | 'week' | 'all'

export function filterByPeriod(records: GameRecord[], period: PeriodFilter): GameRecord[] {
  if (period === 'all') return records
  const start = new Date()
  if (period === 'today') {
    start.setHours(0, 0, 0, 0)
  } else {
    // 'week' = last 7 days
    start.setDate(start.getDate() - 6)
    start.setHours(0, 0, 0, 0)
  }
  return records.filter((r) => new Date(r.timestamp) >= start)
}

export function useGameHistory() {
  const [records, setRecords] = useState<GameRecord[]>(loadRecords)

  const addRecord = useCallback((record: GameRecord) => {
    setRecords((prev) => {
      const next = [record, ...prev]
      saveRecords(next)
      return next
    })
  }, [])

  const clearRecords = useCallback(() => {
    setRecords([])
    saveRecords([])
  }, [])

  return { records, addRecord, clearRecords }
}
