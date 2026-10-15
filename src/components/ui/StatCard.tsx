import React from 'react'

interface StatCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  hint?: string
}

export function StatCard({ icon, title, value, color = 'primary', hint }: StatCardProps) {
  const colorClass = `ds-stat-icon ds-stat-icon--${color}`

  return (
    <div className="ds-stat-card">
      <div className={colorClass}>{icon}</div>
      <div>
        <p className="ds-stat-label">{title}</p>
        <p className="ds-stat-value">{value}</p>
        {hint && <p className="ds-stat-hint">{hint}</p>}
      </div>
    </div>
  )
}

export default StatCard
