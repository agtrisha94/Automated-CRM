/**
 * NavLink Component
 * Helper for consistent active link styling
 */
import { NavLink, type NavLinkProps } from 'react-router-dom'

export default function NavLinkButton(props: NavLinkProps) {
  return (
    <NavLink
      {...props}
      className={({ isActive }) => {
        const baseClasses =
          'px-3 py-2 rounded-md text-sm font-medium transition-colors'
        const activeClasses = 'bg-slate-700 text-white'
        const inactiveClasses = 'text-slate-400 hover:text-white hover:bg-slate-800'
        return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
      }}
    />
  )
}
