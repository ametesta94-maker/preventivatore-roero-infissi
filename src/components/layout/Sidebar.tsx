'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Sidebar.module.css'

type UserRole = 'admin' | 'operatore'

interface SidebarProps {
    userRole: UserRole
    logoUrl?: string | null
}

interface SubItem {
    label: string
    href: string
    roles?: UserRole[]
}

interface NavItem {
    label: string
    href: string
    icon: React.ReactNode
    roles?: UserRole[]
    children?: SubItem[]
}

// Statistiche rimossa: le statistiche sono nel CRM
const navItems: NavItem[] = [
    {
        label: 'Dashboard',
        href: '/dashboard',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
            </svg>
        )
    },
    {
        label: 'Preventivi',
        href: '/preventivi',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
            </svg>
        )
    },
    {
        label: 'Clienti',
        href: '/clienti',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        )
    },
    {
        label: 'Prodotti',
        href: '/categorie',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
        ),
        children: [
            { label: 'Opzioni Prodotti', href: '/opzioni-prodotti' },
        ],
    },
    {
        label: 'Ordini',
        href: '/ordini',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
        )
    },
    {
        label: 'Servizi',
        href: '/servizi',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v6m0 6v6m8.66-7H14m-4 0H1.34M16.24 16.24l-4.95-4.95m-2.58-2.58-4.95-4.95M16.24 7.76l-4.95 4.95m-2.58 2.58l-4.95 4.95" />
            </svg>
        )
    },
    {
        label: 'Utenti',
        href: '/utenti',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
        roles: ['admin']
    },
    {
        label: 'Impostazioni',
        href: '/impostazioni',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
        roles: ['admin']
    },
]

export default function Sidebar({ userRole, logoUrl }: SidebarProps) {
    const pathname = usePathname()
    const [openMenu, setOpenMenu] = useState<string | null>(null)
    const filteredItems = navItems.filter(
        (item) => !item.roles || item.roles.includes(userRole)
    )

    const isActive = (href: string) => {
        if (href === '/dashboard') {
            return pathname === '/dashboard'
        }
        return pathname.startsWith(href)
    }

    const isChildActive = (children?: SubItem[]) => {
        if (!children) return false
        return children.some(child => pathname.startsWith(child.href))
    }

    const toggleMenu = (href: string) => {
        setOpenMenu(openMenu === href ? null : href)
    }

    const goToCRM = () => {
        window.location.href = '/api/sso/to-crm?after=%2F'
    }

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <Link href="/dashboard" className={styles.logoLink}>
                    <div className={styles.logoIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect x="3" y="3" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="13" y="3" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="3" y="13" width="8" height="8" rx="2" fill="currentColor" />
                            <rect x="13" y="13" width="8" height="8" rx="2" fill="currentColor" />
                        </svg>
                    </div>
                    <span className={styles.logoText}>Roero Infissi</span>
                </Link>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {filteredItems.map((item) => {
                        const hasChildren = item.children && item.children.length > 0
                        const isOpen = openMenu === item.href || isChildActive(item.children)
                        const active = isActive(item.href) || isChildActive(item.children)

                        return (
                            <li key={item.href} className={hasChildren ? styles.hasSubmenu : ''}>
                                {hasChildren ? (
                                    <>
                                        <div className={`${styles.navLink} ${active ? styles.active : ''}`}>
                                            <Link href={item.href} className={styles.linkContent}>
                                                <span className={styles.navIcon}>{item.icon}</span>
                                                <span className={styles.navLabel}>{item.label}</span>
                                            </Link>
                                            <button
                                                onClick={() => toggleMenu(item.href)}
                                                className={styles.toggleBtn}
                                                aria-label="Espandi menu"
                                            >
                                                <svg
                                                    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </button>
                                        </div>
                                        {isOpen && (
                                            <ul className={styles.submenu}>
                                                {item.children?.map((child) => (
                                                    <li key={child.href}>
                                                        <Link
                                                            href={child.href}
                                                            className={`${styles.submenuLink} ${isActive(child.href) ? styles.active : ''}`}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </>
                                ) : (
                                    <Link
                                        href={item.href}
                                        className={`${styles.navLink} ${active ? styles.active : ''}`}
                                    >
                                        <span className={styles.navIcon}>{item.icon}</span>
                                        <span className={styles.navLabel}>{item.label}</span>
                                    </Link>
                                )}
                            </li>
                        )
                    })}
                </ul>

                {/* Separatore e link CRM — al di fuori del filtro per ruolo */}
                <div className={styles.navSeparator} />
                <ul className={styles.navList}>
                    <li>
                        <button
                            onClick={goToCRM}
                            className={`${styles.navLink} ${styles.crmLink}`}
                            title="Apri il CRM in una nuova tab"
                        >
                            <span className={styles.navIcon}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <ellipse cx="12" cy="5" rx="9" ry="3" />
                                    <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                                    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                                </svg>
                            </span>
                            <span className={styles.navLabel}>
                                CRM
                            </span>
                        </button>
                    </li>
                </ul>
            </nav>

            <div className={styles.footer}>
                <div className={styles.userAvatar}>
                    <span>R</span>
                </div>
                <span className={styles.version}>v2.0.0</span>
            </div>
        </aside>
    )
}
