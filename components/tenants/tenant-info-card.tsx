'use client'
// components/tenants/tenant-info-card.tsx
// Tenant details card — all fields in a grid + password field that opens a reset dialog
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { BuildingIcon, PencilIcon, EyeIcon, EyeOffIcon, KeyRoundIcon, CheckCircle2Icon, LogInIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { TenantFormSheet } from '@/components/tenants/tenant-form-sheet'
import { resetPassword, createTenantAccount } from '@/actions/tenants'
import type { Tenant } from '@/types/database'

const MIN_PASSWORD_LENGTH = 10

interface TenantInfoCardProps {
    tenant: Tenant
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {label}
            </span>
            <span className="text-sm font-semibold">{value}</span>
        </div>
    )
}

function PasswordField({ onClick }: { onClick: () => void }) {
    return (
        <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Slaptažodis
            </span>
            <button
                type="button"
                onClick={onClick}
                className="flex items-center gap-1.5 text-sm font-semibold font-mono hover:text-primary transition-colors text-left"
                title="Keisti slaptažodį"
            >
                {'•'.repeat(10)}
                <PencilIcon className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
        </div>
    )
}

function PasswordDialog({
    tenantId,
    open,
    onOpenChange,
}: {
    tenantId: string
    open: boolean
    onOpenChange: (v: boolean) => void
}) {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [showNew, setShowNew] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [isPending, startTransition] = useTransition()

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError(null)
        setSuccess(false)

        if (password.length < MIN_PASSWORD_LENGTH) {
            setError(`Slaptažodis turi būti bent ${MIN_PASSWORD_LENGTH} simbolių`)
            return
        }
        if (password !== confirm) {
            setError('Slaptažodžiai nesutampa')
            return
        }

        startTransition(async () => {
            const result = await resetPassword(tenantId, password)
            if ('error' in result) {
                setError(result.error)
            } else {
                setSuccess(true)
                setPassword('')
                setConfirm('')
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-2 mb-1">
                        <KeyRoundIcon className="h-4 w-4 text-muted-foreground" />
                        <DialogTitle>Prisijungimo slaptažodis</DialogTitle>
                    </div>
                    <DialogDescription>
                        Pakeiskite nuomininko slaptažodį
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="new-password">Naujas slaptažodis</Label>
                        <div className="relative">
                            <Input
                                id="new-password"
                                type={showNew ? 'text' : 'password'}
                                placeholder="••••••••••"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); setError(null); setSuccess(false) }}
                                className="pr-10"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                                onClick={() => setShowNew((v) => !v)}
                                tabIndex={-1}
                            >
                                {showNew ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <Label htmlFor="confirm-password">Pakartokite slaptažodį</Label>
                        <Input
                            id="confirm-password"
                            type={showNew ? 'text' : 'password'}
                            placeholder="••••••••••"
                            value={confirm}
                            onChange={(e) => { setConfirm(e.target.value); setError(null); setSuccess(false) }}
                            autoComplete="new-password"
                        />
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}

                    {success && (
                        <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-500">
                            <CheckCircle2Icon className="h-4 w-4 shrink-0" />
                            Slaptažodis sėkmingai pakeistas
                        </div>
                    )}

                    <Button type="submit" disabled={isPending || !password || !confirm} className="w-full">
                        {isPending ? 'Keičiama...' : 'Pakeisti slaptažodį'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function TenantInfoCard({ tenant }: TenantInfoCardProps) {
    const router = useRouter()
    const [editOpen, setEditOpen] = useState(false)
    const [passwordOpen, setPasswordOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [enterError, setEnterError] = useState<string | null>(null)

    function handleEnter() {
        setEnterError(null)
        if (tenant.user_id) {
            router.push(`/api/admin/impersonate?tenantId=${tenant.id}`)
            return
        }
        startTransition(async () => {
            const result = await createTenantAccount(tenant.id)
            if ('error' in result) {
                setEnterError(result.error)
            } else {
                router.push(`/api/admin/impersonate?tenantId=${tenant.id}`)
            }
        })
    }

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                            <BuildingIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-lg">{tenant.store_name}</CardTitle>
                            {tenant.category && (
                                <Badge variant="secondary" className="mt-1 text-xs">
                                    {tenant.category}
                                </Badge>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {enterError && (
                            <span className="text-xs text-destructive">{enterError}</span>
                        )}
                        <Button
                            variant="default"
                            size="sm"
                            onClick={handleEnter}
                            disabled={isPending}
                        >
                            <LogInIcon className="h-4 w-4 mr-1.5" />
                            {isPending ? 'Kuriama...' : 'Įeiti'}
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditOpen(true)}
                        >
                            <PencilIcon className="h-4 w-4 mr-1.5" />
                            Redaguoti
                        </Button>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
                        <Field label="Parduotuvė" value={tenant.store_name} />
                        <Field label="Operatorius" value={tenant.operator ?? '—'} />
                        <Field label="Įm. kodas" value={tenant.company_code ?? '—'} />
                        <Field label="Kategorija" value={tenant.category ?? '—'} />
                        <Field
                            label="Plotas"
                            value={tenant.space_m2 != null ? `${tenant.space_m2} m²` : '—'}
                        />
                        <Field
                            label="Nuomos kaina"
                            value={
                                tenant.rent_eur != null
                                    ? `${tenant.rent_eur.toFixed(2)} €/mėn.`
                                    : '—'
                            }
                        />
                        <PasswordField onClick={() => setPasswordOpen(true)} />
                    </div>
                </CardContent>
            </Card>

            <TenantFormSheet
                open={editOpen}
                onOpenChange={setEditOpen}
                tenant={tenant}
            />

            <PasswordDialog
                tenantId={tenant.id}
                open={passwordOpen}
                onOpenChange={setPasswordOpen}
            />
        </>
    )
}
